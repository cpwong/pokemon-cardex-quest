// Auto-generate a fun, original picture for a card with NO external APIs — we
// build a small SVG and return it as a data URL. The picture is a big emoji
// that matches the card's type, sitting on a colorful type-themed backdrop.
// The art is seeded from the card name, so the same card always gets the same
// background, but each different card looks unique.

// Each type gets a palette: [dark background, bright background, light accent].
const TYPE_PALETTE = {
  Fire:    ['#7f1d1d', '#f97316', '#fde68a'],
  Water:   ['#1e3a5f', '#3b82f6', '#a5f3fc'],
  Grass:   ['#14532d', '#22c55e', '#d9f99d'],
  Electric:['#713f12', '#eab308', '#fef08a'],
  Psychic: ['#4a044e', '#d946ef', '#f5d0fe'],
  Rock:    ['#292524', '#78716c', '#e7e5e4'],
  Ice:     ['#164e63', '#22d3ee', '#cffafe'],
  Dragon:  ['#1e1b4b', '#6366f1', '#c7d2fe'],
  Dark:    ['#0c0a09', '#57534e', '#a8a29e'],
  Normal:  ['#1e293b', '#64748b', '#e2e8f0'],
}

// Emoji that closely matches each creature type.
const TYPE_EMOJI = {
  Fire: '🔥', Water: '💧', Grass: '🌿', Electric: '⚡', Psychic: '🔮',
  Rock: '🪨', Ice: '❄️', Dragon: '🐉', Dark: '🌑', Normal: '⭐',
}

// Tiny seeded random generator: turn a string into a repeatable stream of
// numbers between 0 and 1 (so the same name always draws the same creature).
function seededRandom(seed) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateCardImage(card) {
  const palette = TYPE_PALETTE[card.type] || TYPE_PALETTE.Normal
  const [dark, bright, light] = palette
  const rand = seededRandom((card.name || 'card') + card.type)

  // Helper: random number in [min, max), rounded to 1 decimal.
  const between = (min, max) => Math.round((min + rand() * (max - min)) * 10) / 10

  // Scatter a few translucent background blobs for a lively backdrop.
  let bg = ''
  const blobCount = 3 + Math.floor(rand() * 4)
  for (let i = 0; i < blobCount; i++) {
    bg += `<circle cx="${between(5, 95)}" cy="${between(5, 95)}" r="${between(6, 16)}" fill="${light}" opacity="0.18" />`
  }

  // The matching type emoji, drawn big in the center of the card.
  const emoji = TYPE_EMOJI[card.type] || TYPE_EMOJI.Normal

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${dark}" /><stop offset="1" stop-color="${bright}" />` +
    `</linearGradient></defs>` +
    `<rect width="100" height="100" fill="url(#g)" />` +
    bg +
    `<text x="50" y="52" font-size="52" text-anchor="middle" dominant-baseline="central">${emoji}</text>` +
    `</svg>`

  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}
