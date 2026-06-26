import { useState } from 'react'
import MyBinder from './components/MyBinder.jsx'
import OpenPack from './components/OpenPack.jsx'
import CreateCard from './components/CreateCard.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import styles from './App.module.css'

const TABS = ['📚 My Binder', '🎴 Open a Pack', '✨ Create a Card']

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  // Binder is lifted here so all tabs can read/write it
  const [binder, setBinder] = useLocalStorage('cardex-binder', [])

  function addCardToBinder(card) {
    setBinder(prev => [...prev, { ...card, id: Date.now() + Math.random() }])
  }

  return (
    <>
      {/* Fixed glow layer lives outside .app so it has no stacking-context parent */}
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>CardDex Quest</h1>
        <p className={styles.tagline}>Your ultimate card collection!</p>
      </header>

      {/* Tab bar */}
      <nav className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className={styles.content}>
        {activeTab === 0 && <MyBinder binder={binder} setBinder={setBinder} />}
        {activeTab === 1 && <OpenPack onAddToBinder={addCardToBinder} />}
        {activeTab === 2 && <CreateCard onSaveToBinder={addCardToBinder} />}
      </main>
      </div>
    </>
  )
}
