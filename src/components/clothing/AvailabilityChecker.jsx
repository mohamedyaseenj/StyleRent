import { useState, useEffect } from 'react'
import { CalendarRange, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { clothingAPI } from '../../services/api'
import { formatINR, calcRentalTotal } from '../../utils/priceUtils'
import { daysBetween, parseISO, formatDate } from '../../utils/dateUtils'

// Live availability check for a specific date window.
// In mock mode this simulates the backend response with a short delay.
export default function AvailabilityChecker({ product, startDate, endDate }) {
  const [state, setState] = useState({ loading: false, available: null, unavailable: null })

  useEffect(() => {
    setState({ loading: false, available: null, unavailable: null })
  }, [startDate, endDate, product.clothing_id])

  const check = async () => {
    if (!startDate || !endDate) return
    setState({ loading: true, available: null, unavailable: null })
    try {
      const days = daysBetween(parseISO(startDate), parseISO(endDate))
      const res = await clothingAPI.checkAvailability(product.clothing_id, { startDate, endDate })
      setState({
        loading: false,
        available: res.available ? res : null,
        unavailable: res.available ? null : res,
      })
      if (res.available && days > 0) {
        const total = calcRentalTotal(product.price_per_day, days, 1)
        setState((s) => ({ ...s, totalDays: days, total }))
      }
    } catch {
      setState({ loading: false, available: null, unavailable: null })
    }
  }

  return (
    <div className="card-sr availability-card">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="d-flex align-items-center gap-2 mb-0">
          <CalendarRange size={16} aria-hidden="true" /> Availability Check
        </h6>
        <button
          type="button"
          className="btn btn-sr-ghost btn-sr-sm d-inline-flex align-items-center gap-1"
          onClick={check}
          disabled={!startDate || !endDate || state.loading}
        >
          <RefreshCcw size={13} className={state.loading ? 'spin' : ''} aria-hidden="true" />
          Check
        </button>
      </div>
      <p className="text-muted-sr small mb-0">
        {state.available
          ? `Available for ${state.totalDays} ${state.totalDays === 1 ? 'day' : 'days'} — ${formatINR(state.total)} total.`
          : state.unavailable
            ? `Not available ${
                state.unavailable.days ? state.unavailable.days.map((d) => formatDate(parseISO(d))).join(', ') : 'on those dates'
              }. Try shifting your window.`
            : 'Pick your dates above, then run the check.'}
      </p>
      {state.available ? (
        <div className="d-flex align-items-center gap-1 mt-2 text-success">
          <CheckCircle2 size={16} aria-hidden="true" /> Confirmed green lane for those dates.
        </div>
      ) : null}
    </div>
  )
}