import { useState } from 'react'
import CardTile from './CardTile.jsx'
import styles from './OpenPack.module.css'

// Sample card pool with weighted rarities
const SAMPLE_CARDS = [
  { name: 'Flamewolf',    type: 'Fire',     hp: 80,  rarity: 'Rare',       attackName: 'Fire Slash',   attackDamage: 60,  description: 'A blazing wolf of the volcano.' },
  { name: 'Aquafish',     type: 'Water',    hp: 60,  rarity: 'Common',     attackName: 'Water Jet',    attackDamage: 30,  description: 'Glides silently through deep rivers.' },
  { name: 'Thornbush',    type: 'Grass',    hp: 70,  rarity: 'Common',     attackName: 'Vine Whip',    attackDamage: 30,  description: 'A tangle of thorns and leaves.' },
  { name: 'Boltdrake',    type: 'Electric', hp: 90,  rarity: 'Ultra Rare', attackName: 'Thunder Fang', attackDamage: 90,  description: 'Rumbles with the storm itself.' },
  { name: 'Frostbear',    type: 'Ice',      hp: 100, rarity: 'Uncommon',   attackName: 'Ice Crush',    attackDamage: 50,  description: 'Its fur never melts, even in summer.' },
  { name: 'Shadowcat',    type: 'Dark',     hp: 70,  rarity: 'Uncommon',   attackName: 'Night Claw',   attackDamage: 40,  description: 'Vanishes into any shadow.' },
  { name: 'Rockgolem',    type: 'Rock',     hp: 120, rarity: 'Rare',       attackName: 'Boulder Slam', attackDamage: 70,  description: 'Built like a small mountain.' },
  { name: 'Mindbat',      type: 'Psychic',  hp: 55,  rarity: 'Common',     attackName: 'Psybeam',      attackDamage: 35,  description: 'Reads thoughts from miles away.' },
  { name: 'Dragonwing',   type: 'Dragon',   hp: 110, rarity: 'Ultra Rare', attackName: 'Dragon Rage',  attackDamage: 100, description: 'Older than any mountain.' },
  { name: 'Pebblerat',    type: 'Normal',   hp: 40,  rarity: 'Common',     attackName: 'Scratch',      attackDamage: 20,  description: 'Found everywhere, feared by no one.' },
  { name: 'Lavalynx',     type: 'Fire',     hp: 85,  rarity: 'Uncommon',   attackName: 'Ember Dash',   attackDamage: 45,  description: 'Sprints so fast its paws glow.' },
  { name: 'Seadrake',     type: 'Water',    hp: 95,  rarity: 'Rare',       attackName: 'Tidal Wave',   attackDamage: 65,  description: 'Commands the tides at will.' },
  { name: 'Leafsprite',   type: 'Grass',    hp: 50,  rarity: 'Common',     attackName: 'Leaf Storm',   attackDamage: 25,  description: 'Dances in every breeze.' },
  { name: 'Gigaspark',    type: 'Electric', hp: 75,  rarity: 'Uncommon',   attackName: 'Volt Crash',   attackDamage: 55,  description: 'Absorbs lightning from storm clouds.' },
  { name: 'Cosmicstone',  type: 'Psychic',  hp: 80,  rarity: 'Ultra Rare', attackName: 'Galaxy Pulse',  attackDamage: 95,  description: 'A fragment of a fallen star.' },
]

// Rarity weights: higher number = more likely
const RARITY_WEIGHTS = { Common: 50, Uncommon: 30, Rare: 15, 'Ultra Rare': 5 }

function weightedRandom(pool) {
  const totalWeight = pool.reduce((sum, card) => sum + RARITY_WEIGHTS[card.rarity], 0)
  let rand = Math.random() * totalWeight
  for (const card of pool) {
    rand -= RARITY_WEIGHTS[card.rarity]
    if (rand <= 0) return card
  }
  return pool[pool.length - 1]
}

function drawPack() {
  // Guarantee at least one Uncommon or better in a pack of 5
  const pack = []
  for (let i = 0; i < 5; i++) {
    pack.push({ ...weightedRandom(SAMPLE_CARDS), id: Date.now() + i + Math.random() })
  }
  return pack
}

export default function OpenPack({ onAddToBinder }) {
  const [pack, setPack] = useState([])
  const [isOpening, setIsOpening] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())

  function handleOpen() {
    setIsOpening(true)
    setPack([])
    setAddedIds(new Set())
    // Short delay for dramatic effect before revealing
    setTimeout(() => {
      setPack(drawPack())
      setIsOpening(false)
    }, 600)
  }

  function handleAddCard(card) {
    onAddToBinder({ ...card, condition: 'Mint', quantity: 1, favorite: false })
    setAddedIds(prev => new Set([...prev, card.id]))
  }

  return (
    <div className={styles.packPage}>
      <div className={styles.hero}>
        <h2 className={styles.title}>🎴 Open a Pack!</h2>
        <p className={styles.subtitle}>5 random cards await — will you get an Ultra Rare?</p>
        <button
          className={`${styles.openBtn} ${isOpening ? styles.opening : ''}`}
          onClick={handleOpen}
          disabled={isOpening}
        >
          {isOpening ? '✨ Opening...' : '🎁 Open Pack!'}
        </button>
      </div>

      {/* Revealed cards */}
      {pack.length > 0 && (
        <div className={styles.revealSection}>
          <h3 className={styles.revealTitle}>Your cards!</h3>
          <div className={styles.packGrid}>
            {pack.map((card, i) => (
              <div
                key={card.id}
                className={styles.packCardWrap}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <CardTile card={card} />
                <button
                  className={`${styles.addBtn} ${addedIds.has(card.id) ? styles.added : ''}`}
                  onClick={() => handleAddCard(card)}
                  disabled={addedIds.has(card.id)}
                >
                  {addedIds.has(card.id) ? '✓ Added!' : '+ Add to Binder'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
