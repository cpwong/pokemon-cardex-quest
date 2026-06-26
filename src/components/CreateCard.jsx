import { useState } from 'react'
import styles from './CreateCard.module.css'

const TYPES = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Rock', 'Ice', 'Dragon', 'Dark', 'Normal']
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Ultra Rare']

const EMPTY = {
  name: '', type: 'Fire', hp: 60, attackName: '', attackDamage: 30,
  rarity: 'Common', description: '',
}

// Type → gradient for the live card preview
const TYPE_GRADIENTS = {
  Fire:    'linear-gradient(135deg, #7f1d1d, #b91c1c)',
  Water:   'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
  Grass:   'linear-gradient(135deg, #14532d, #15803d)',
  Electric:'linear-gradient(135deg, #713f12, #ca8a04)',
  Psychic: 'linear-gradient(135deg, #4a044e, #a21caf)',
  Rock:    'linear-gradient(135deg, #292524, #57534e)',
  Ice:     'linear-gradient(135deg, #164e63, #0e7490)',
  Dragon:  'linear-gradient(135deg, #1e1b4b, #4338ca)',
  Dark:    'linear-gradient(135deg, #1c1917, #292524)',
  Normal:  'linear-gradient(135deg, #1e293b, #334155)',
}

const RARITY_BORDER = {
  Common:     '2px solid #94a3b8',
  Uncommon:   '2px solid #4ade80',
  Rare:       '2px solid #7c3aed',
  'Ultra Rare':'2px solid #f59e0b',
}

export default function CreateCard({ onSaveToBinder }) {
  const [form, setForm] = useState(EMPTY)
  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setSaved(false)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    onSaveToBinder({
      ...form,
      hp: Number(form.hp) || 0,
      attackDamage: Number(form.attackDamage) || 0,
      condition: 'Mint',
      quantity: 1,
      favorite: false,
    })
    setSaved(true)
  }

  const isRare = form.rarity === 'Rare'
  const isUltra = form.rarity === 'Ultra Rare'

  return (
    <div className={styles.page}>
      {/* Left: Form */}
      <div className={styles.formSide}>
        <h2 className={styles.title}>✨ Design Your Card</h2>

        <div className={styles.fields}>
          <div>
            <label>Card Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Stormclaw" />
          </div>
          <div className={styles.row}>
            <div>
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>HP</label>
              <input name="hp" type="number" min="10" max="999" value={form.hp} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.row}>
            <div>
              <label>Attack Name</label>
              <input name="attackName" value={form.attackName} onChange={handleChange} placeholder="e.g. Thunder Strike" />
            </div>
            <div>
              <label>Attack Damage</label>
              <input name="attackDamage" type="number" min="0" max="999" value={form.attackDamage} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label>Rarity</label>
            <select name="rarity" value={form.rarity} onChange={handleChange}>
              {RARITIES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What makes this creature special?"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
          onClick={handleSave}
          disabled={!form.name.trim()}
        >
          {saved ? '✓ Saved to Binder!' : '💾 Save to Binder'}
        </button>
      </div>

      {/* Right: Live preview */}
      <div className={styles.previewSide}>
        <h2 className={styles.title}>Preview</h2>
        <div
          className={`${styles.cardPreview} ${isRare ? styles.rare : ''} ${isUltra ? styles.ultra : ''}`}
          style={{
            background: TYPE_GRADIENTS[form.type] || TYPE_GRADIENTS.Normal,
            border: RARITY_BORDER[form.rarity],
          }}
        >
          {/* Card header */}
          <div className={styles.cardHeader}>
            <span className={styles.cardName}>{form.name || 'Your Card'}</span>
            <span className={styles.cardHp}>HP {form.hp || '?'}</span>
          </div>

          {/* Art area */}
          <div className={styles.artArea}>
            <div className={styles.artPlaceholder}>
              {form.type === 'Fire' && '🔥'}
              {form.type === 'Water' && '💧'}
              {form.type === 'Grass' && '🌿'}
              {form.type === 'Electric' && '⚡'}
              {form.type === 'Psychic' && '🔮'}
              {form.type === 'Rock' && '🪨'}
              {form.type === 'Ice' && '❄️'}
              {form.type === 'Dragon' && '🐉'}
              {form.type === 'Dark' && '🌑'}
              {form.type === 'Normal' && '⭐'}
            </div>
            <span className={styles.typePill}>{form.type}</span>
          </div>

          {/* Description */}
          <p className={styles.cardDesc}>{form.description || 'A mysterious creature awaits...'}</p>

          {/* Attack */}
          <div className={styles.attackRow}>
            <span className={styles.attackName}>{form.attackName || 'Basic Attack'}</span>
            <span className={styles.attackDmg}>{form.attackDamage}</span>
          </div>

          {/* Rarity footer */}
          <div className={styles.cardFooter}>
            <span className={styles.rarityTag}>{form.rarity}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
