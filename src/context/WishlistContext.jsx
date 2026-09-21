import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WishlistContext = createContext(null)

const WISHLIST_KEY = 'sr_wishlist'

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist)

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
  }, [items])

  const toggle = (productId) => {
    setItems((prev) =>
      prev.includes(Number(productId))
        ? prev.filter((id) => id !== Number(productId))
        : [...prev, Number(productId)],
    )
  }

  const add = (productId) => {
    setItems((prev) =>
      prev.includes(Number(productId)) ? prev : [...prev, Number(productId)],
    )
  }

  const remove = (productId) => {
    setItems((prev) => prev.filter((id) => id !== Number(productId)))
  }

  const has = (productId) => items.includes(Number(productId))

  const value = useMemo(
    () => ({ items, count: items.length, toggle, add, remove, has }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}