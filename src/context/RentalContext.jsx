import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { rentalAPI } from '../services/api'

const RentalContext = createContext(null)

const DRAFT_KEY = 'sr_draft'
const BOOKINGS_KEY = 'sr_bookings'

export const useRental = () => {
  const ctx = useContext(RentalContext)
  if (!ctx) throw new Error('useRental must be used within RentalProvider')
  return ctx
}

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Default draft picks reasonable upcoming dates.
const defaultDraft = () => ({
  clothing_id: null,
  size: '',
  color: '',
  startDate: '',
  endDate: '',
  quantity: 1,
})

export function RentalProvider({ children }) {
  const [draft, setDraft] = useState(() => loadJSON(DRAFT_KEY, defaultDraft()))
  const [bookings, setBookings] = useState(() => loadJSON(BOOKINGS_KEY, []))

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft])

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  }, [bookings])

  const setRental = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const resetDraft = () => {
    setDraft(defaultDraft())
    localStorage.removeItem(DRAFT_KEY)
  }

  const confirmBooking = async (userId, totalAmount, itemPrice) => {
    const payload = {
      user_id: userId,
      start_date: draft.startDate,
      end_date: draft.endDate,
      total_amount: totalAmount,
      items: [
        {
          clothing_id: draft.clothing_id,
          size: draft.size,
          quantity: draft.quantity,
          price: itemPrice,
        },
      ],
    }
    const created = await rentalAPI.create(payload)
    setBookings((prev) => [created, ...prev])
    resetDraft()
    return created
  }

  const cancelLocalBooking = (rentalId) => {
    setBookings((prev) => prev.filter((b) => b.rental_id !== Number(rentalId)))
  }

  const value = useMemo(
    () => ({
      draft,
      setRental,
      resetDraft,
      confirmBooking,
      bookings,
      cancelLocalBooking,
      hasDraft: !!draft.clothing_id,
      bagCount: draft.clothing_id ? 1 : 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, bookings],
  )

  return <RentalContext.Provider value={value}>{children}</RentalContext.Provider>
}