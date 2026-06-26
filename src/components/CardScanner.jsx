import { useRef, useState, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import styles from './CardScanner.module.css'

const TYPES = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Rock', 'Ice', 'Dragon', 'Dark', 'Normal']
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Ultra Rare']
const CONDITIONS = ['Mint', 'Near Mint', 'Good', 'Played', 'Worn']

const EMPTY_FORM = {
  name: '', type: 'Normal', hp: '', rarity: 'Common',
  condition: 'Mint', quantity: 1, favorite: false,
  attackName: '', attackDamage: '', description: '',
}

// Try to pull card fields out of raw OCR text
function parseCardText(rawText) {
  const text = rawText.replace(/[|[\]{}\\]/g, '') // strip OCR noise chars
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1)

  // HP: "HP 80" or "80 HP"
  const hpMatch = text.match(/\bHP\s*[:\-]?\s*(\d+)/i) || text.match(/(\d+)\s*HP\b/i)
  const hp = hpMatch ? parseInt(hpMatch[1]) : ''

  // Name: first line that has 2+ letters and isn't just a number
  const name = lines.find(l => /[a-zA-Z]{2,}/.test(l) && !/^\d+$/.test(l)) || ''

  // Type: exact match against known list
  const type = TYPES.find(t => new RegExp(`\\b${t}\\b`, 'i').test(text)) || 'Normal'

  // Rarity: exact match (check longer ones first to avoid "Rare" matching "Ultra Rare")
  const rarity = [...RARITIES].reverse().find(r => new RegExp(r, 'i').test(text)) || 'Common'

  // Attack damage: a number that isn't the HP value, appearing near the bottom third of lines
  const hpStr = hp ? String(hp) : null
  const allNumbers = [...text.matchAll(/\b(\d{1,3})\b/g)].map(m => m[1])
  const dmgNum = allNumbers.find(n => n !== hpStr && parseInt(n) > 0 && parseInt(n) < 999)
  const attackDamage = dmgNum ? parseInt(dmgNum) : ''

  // Attack name: the line that contains the damage number (minus the number itself)
  const attackLine = dmgNum ? lines.find(l => l.includes(dmgNum)) : null
  const attackName = attackLine ? attackLine.replace(new RegExp(`\\b${dmgNum}\\b`), '').trim() : ''

  // Description: whatever's left in the middle — not name/type/rarity/attack lines
  const skipWords = new Set([...TYPES, ...RARITIES])
  const description = lines
    .filter(l => l !== name && l !== attackLine)
    .filter(l => !skipWords.has(l))
    .filter(l => !/^(HP\s*\d+|\d+\s*HP|\d+)$/i.test(l))
    .join(' ')
    .slice(0, 200)

  return { name, hp, type, rarity, attackName, attackDamage, description }
}

// Friendly labels for Tesseract's status strings
const STATUS_LABELS = {
  'loading tesseract core':       'Loading scanner engine…',
  'loading language traineddata': 'Downloading language data (first run only)…',
  'initializing api':             'Warming up…',
  'recognizing text':             'Reading card text…',
}

export default function CardScanner({ onAddToBinder, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const [step, setStep] = useState('camera') // 'camera' | 'scanning' | 'review'
  const [cameraError, setCameraError] = useState(false)
  const [capturedUrl, setCapturedUrl] = useState(null)
  const [scanStatus, setScanStatus] = useState('')
  const [scanProgress, setScanProgress] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)

  // Start the rear-facing camera as soon as the modal opens
  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        if (!cancelled) setCameraError(true)
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Snap a frame from the live video and run OCR
  async function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCapturedUrl(dataUrl)
    await runOCR(dataUrl)
  }

  // User picks an image file instead of live camera
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const dataUrl = await new Promise(res => {
      const reader = new FileReader()
      reader.onload = ev => res(ev.target.result)
      reader.readAsDataURL(file)
    })
    setCapturedUrl(dataUrl)
    await runOCR(dataUrl)
  }

  async function runOCR(imageData) {
    setStep('scanning')
    setScanProgress(0)
    setScanStatus('Starting up…')
    let worker
    try {
      worker = await createWorker('eng', 1, {
        logger: ({ status, progress }) => {
          setScanStatus(STATUS_LABELS[status] || status)
          setScanProgress(Math.round((progress || 0) * 100))
        },
      })
      const { data: { text } } = await worker.recognize(imageData)
      setForm(prev => ({ ...prev, ...parseCardText(text) }))
    } catch {
      // OCR failed — let user fill in manually with blank form
    } finally {
      worker?.terminate()
    }
    setStep('review')
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    onAddToBinder({
      ...form,
      hp: Number(form.hp) || 0,
      quantity: Number(form.quantity) || 1,
      attackDamage: Number(form.attackDamage) || 0,
      id: Date.now(),
    })
    onClose()
  }

  function handleScanAgain() {
    setCapturedUrl(null)
    setScanProgress(0)
    setForm(EMPTY_FORM)
    setStep('camera')
    // Re-start the camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCameraError(true))
  }

  return (
    <div className={styles.overlay} onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close scanner">✕</button>

        {/* ── Step 1: Camera ── */}
        {step === 'camera' && (
          <div className={styles.cameraStep}>
            <h3 className={styles.stepTitle}>📷 Scan a Card</h3>
            <p className={styles.hint}>Position the card inside the frame, then tap Capture</p>

            {!cameraError ? (
              <div className={styles.viewfinderWrap}>
                <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
                {/* Scanning frame corners overlay */}
                <div className={styles.scanFrame}>
                  <span className={`${styles.corner} ${styles.tl}`} />
                  <span className={`${styles.corner} ${styles.tr}`} />
                  <span className={`${styles.corner} ${styles.bl}`} />
                  <span className={`${styles.corner} ${styles.br}`} />
                </div>
              </div>
            ) : (
              <div className={styles.noCamera}>
                <div className={styles.noCameraIcon}>📷</div>
                <p>Camera unavailable — upload a photo instead</p>
              </div>
            )}

            {/* Hidden canvas used for frame capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className={styles.cameraActions}>
              {!cameraError && (
                <button className={styles.captureBtn} onClick={handleCapture}>
                  <span className={styles.captureRing} />
                  Capture
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={cameraError ? 'environment' : undefined}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button className={styles.uploadBtn} onClick={() => fileInputRef.current.click()}>
                {cameraError ? '📁 Choose Photo' : '🖼 Upload Image'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Scanning ── */}
        {step === 'scanning' && (
          <div className={styles.scanningStep}>
            {capturedUrl && (
              <img src={capturedUrl} alt="Captured card" className={styles.capturedImg} />
            )}
            <div className={styles.scanningInfo}>
              <div className={styles.spinner} />
              <p className={styles.scanningStatus}>{scanStatus}</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${scanProgress}%` }} />
              </div>
              <p className={styles.scanningPct}>{scanProgress}%</p>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 'review' && (
          <div className={styles.reviewStep}>
            <div className={styles.reviewHeader}>
              {capturedUrl && (
                <img src={capturedUrl} alt="Scanned card" className={styles.reviewThumb} />
              )}
              <div>
                <h3 className={styles.stepTitle}>Review & Edit</h3>
                <p className={styles.hint}>Correct anything the scan got wrong</p>
              </div>
            </div>

            <div className={styles.reviewGrid}>
              <div className={styles.span2}>
                <label>Card Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Flamewolf" />
              </div>
              <div>
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleFormChange}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label>HP</label>
                <input name="hp" type="number" min="1" max="999" value={form.hp} onChange={handleFormChange} placeholder="60" />
              </div>
              <div>
                <label>Attack Name</label>
                <input name="attackName" value={form.attackName} onChange={handleFormChange} placeholder="e.g. Fire Slash" />
              </div>
              <div>
                <label>Attack Damage</label>
                <input name="attackDamage" type="number" min="0" max="999" value={form.attackDamage} onChange={handleFormChange} placeholder="30" />
              </div>
              <div>
                <label>Rarity</label>
                <select name="rarity" value={form.rarity} onChange={handleFormChange}>
                  {RARITIES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label>Condition</label>
                <select name="condition" value={form.condition} onChange={handleFormChange}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.span2}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                  style={{ resize: 'vertical' }}
                  placeholder="What makes this creature special?"
                />
              </div>
            </div>

            <div className={styles.reviewActions}>
              <button className={styles.rescanBtn} onClick={handleScanAgain}>
                🔄 Scan Again
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                + Add to Binder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
