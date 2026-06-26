import { useState } from 'react'
import CardTile from './CardTile.jsx'
import styles from './MyBinder.module.css'

const TYPES = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Rock', 'Ice', 'Dragon', 'Dark', 'Normal']
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Ultra Rare']
const CONDITIONS = ['Mint', 'Near Mint', 'Good', 'Played', 'Worn']

// Empty form state to reset with
const EMPTY_FORM = {
  name: '', type: 'Normal', hp: '', rarity: 'Common',
  condition: 'Mint', quantity: 1, favorite: false,
}

export default function MyBinder({ binder, setBinder }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterType, setFilterType] = useState('All')
  const [filterRarity, setFilterRarity] = useState('All')
  const [showForm, setShowForm] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setBinder(prev => [
      ...prev,
      { ...form, hp: Number(form.hp) || 0, quantity: Number(form.quantity) || 1, id: Date.now() }
    ])
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function removeCard(id) {
    setBinder(prev => prev.filter(c => c.id !== id))
  }

  function toggleFavorite(id) {
    setBinder(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c))
  }

  // Apply filters
  const filtered = binder.filter(c => {
    if (filterType !== 'All' && c.type !== filterType) return false
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false
    return true
  })

  return (
    <div className={styles.binder}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.counts}>
          <span className={styles.countBadge}>{binder.length} cards</span>
          <span className={styles.countBadge}>⭐ {binder.filter(c => c.favorite).length} faves</span>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Card'}
        </button>
      </div>

      {/* Add card form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleAdd}>
          <h3 className={styles.formTitle}>New Card</h3>
          <div className={styles.formGrid}>
            <div>
              <label>Card Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Flamewolf" required />
            </div>
            <div>
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>HP</label>
              <input name="hp" type="number" min="1" max="999" value={form.hp} onChange={handleChange} placeholder="60" />
            </div>
            <div>
              <label>Rarity</label>
              <select name="rarity" value={form.rarity} onChange={handleChange}>
                {RARITIES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label>Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Quantity</label>
              <input name="quantity" type="number" min="1" max="99" value={form.quantity} onChange={handleChange} />
            </div>
          </div>
          <label className={styles.favCheck}>
            <input name="favorite" type="checkbox" checked={form.favorite} onChange={handleChange} />
            ⭐ Mark as favorite
          </label>
          <button type="submit" className={styles.submitBtn}>Add to Binder</button>
        </form>
      )}

      {/* Filters */}
      {binder.length > 0 && (
        <div className={styles.filters}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option>All</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)}>
            <option>All</option>
            {RARITIES.map(r => <option key={r}>{r}</option>)}
          </select>
          {(filterType !== 'All' || filterRarity !== 'All') && (
            <span className={styles.filterCount}>{filtered.length} shown</span>
          )}
        </div>
      )}

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {binder.length === 0
            ? '📭 Your binder is empty. Add your first card!'
            : '🔍 No cards match this filter.'}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(card => (
            <CardTile
              key={card.id}
              card={card}
              onRemove={removeCard}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
