import { useState } from 'react'

// Keeps a piece of state synced with localStorage so it survives page refresh
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(value) {
    setStored(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // localStorage can be blocked in some browsers (private mode etc.)
      }
      return next
    })
  }

  return [stored, setValue]
}
