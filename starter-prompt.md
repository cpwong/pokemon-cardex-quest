Build a colorful beginner-friendly React web app called “CardDex Quest” for a 10-year-old trading card collector.

The app should feel playful, exciting, and collector-focused, but it should not copy the official Pokémon card design or use official Pokémon branding beyond user-entered card names.

Create three main tabs:

1. My Binder
- Let the user add a card with:
  - name
  - type
  - HP
  - rarity
  - condition
  - quantity
  - favorite checkbox
- Show all cards in a responsive grid.
- Each card tile should show the card name, type badge, HP, rarity, condition, quantity, and a star if it is a favorite.
- Add filters for type and rarity.
- Save the binder to localStorage so cards stay after refresh.

2. Open a Pack
- Add a big “Open Pack” button.
- When clicked, reveal 5 random sample cards.
- Cards should have rarities: Common, Uncommon, Rare, Ultra Rare.
- Rare and Ultra Rare cards should have a glow animation.
- Add an “Add to Binder” button for each revealed card.

3. Create a Card
- Show a form on the left with:
  - card name
  - creature type
  - HP
  - attack name
  - attack damage
  - rarity
  - description
- Show a live card preview on the right.
- The preview should look like a fun original trading card, not an official Pokémon card.
- Add a “Save to Binder” button.

Design requirements:
- Bright, energetic UI
- Large buttons
- Fun animations
- Mobile-friendly
- Beginner-readable code with comments
- Use only React state and localStorage for now
- No backend, no login, no payments