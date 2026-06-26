import styles from './CardTile.module.css'

// Color theme for each creature type
const TYPE_COLORS = {
  Fire:    { bg: '#7f1d1d', badge: '#ef4444' },
  Water:   { bg: '#1e3a5f', badge: '#3b82f6' },
  Grass:   { bg: '#14532d', badge: '#22c55e' },
  Electric:{ bg: '#713f12', badge: '#eab308' },
  Psychic: { bg: '#4a044e', badge: '#d946ef' },
  Rock:    { bg: '#292524', badge: '#78716c' },
  Ice:     { bg: '#164e63', badge: '#67e8f9' },
  Dragon:  { bg: '#1e1b4b', badge: '#818cf8' },
  Dark:    { bg: '#1c1917', badge: '#57534e' },
  Normal:  { bg: '#1e1e2e', badge: '#94a3b8' },
}

const RARITY_LABEL = {
  Common:     { icon: '⚪', color: '#94a3b8' },
  Uncommon:   { icon: '🟢', color: '#4ade80' },
  Rare:       { icon: '🔵', color: '#60a5fa' },
  'Ultra Rare':{ icon: '🌟', color: '#fbbf24' },
}

export default function CardTile({ card, onRemove, onToggleFavorite }) {
  const type = TYPE_COLORS[card.type] || TYPE_COLORS.Normal
  const rarity = RARITY_LABEL[card.rarity] || RARITY_LABEL.Common
  const isRare = card.rarity === 'Rare'
  const isUltra = card.rarity === 'Ultra Rare'

  return (
    <div
      className={`${styles.tile} ${isRare ? styles.rare : ''} ${isUltra ? styles.ultra : ''}`}
      style={{ '--type-bg': type.bg }}
    >
      {/* Favorite star */}
      {card.favorite && <span className={styles.favStar}>⭐</span>}

      {/* Card header area */}
      <div className={styles.header} style={{ background: type.bg }}>
        <span className={styles.name}>{card.name || 'Unnamed'}</span>
        <span className={styles.hp}>HP {card.hp || '?'}</span>
      </div>

      {/* Type badge */}
      <span className={styles.typeBadge} style={{ background: type.badge }}>
        {card.type || 'Normal'}
      </span>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Rarity</span>
          <span style={{ color: rarity.color }}>{rarity.icon} {card.rarity}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Condition</span>
          <span>{card.condition || '—'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Qty</span>
          <span className={styles.qty}>×{card.quantity || 1}</span>
        </div>
      </div>

      {/* Action buttons (only shown in binder) */}
      {(onRemove || onToggleFavorite) && (
        <div className={styles.actions}>
          {onToggleFavorite && (
            <button className={styles.favBtn} onClick={() => onToggleFavorite(card.id)}>
              {card.favorite ? '💛 Unfav' : '🤍 Fav'}
            </button>
          )}
          {onRemove && (
            <button className={styles.removeBtn} onClick={() => onRemove(card.id)}>
              🗑 Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}
