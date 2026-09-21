// PAYMENT entity (ER alignment):
// payment_id, rental_id, amount, payment_method, payment_date, payment_status
// Methods: UPI | Card | Cash    Status: Pending | Paid | Failed | Refunded
// Relationship: RENTAL 1:M PAYMENT

export const payments = [
  {
    payment_id: 2001,
    rental_id: 1001,
    amount: 14400,
    payment_method: 'UPI',
    payment_date: '2026-08-01T11:05:00.000Z',
    payment_status: 'Paid',
  },
  {
    payment_id: 2002,
    rental_id: 1002,
    amount: 8700,
    payment_method: 'Card',
    payment_date: '2026-09-05T10:25:00.000Z',
    payment_status: 'Paid',
  },
  {
    payment_id: 2003,
    rental_id: 1003,
    amount: 6600,
    payment_method: 'UPI',
    payment_date: '2026-09-18T09:05:00.000Z',
    payment_status: 'Paid',
  },
  {
    payment_id: 2004,
    rental_id: 1004,
    amount: 5500,
    payment_method: 'Cash',
    payment_date: null,
    payment_status: 'Pending',
  },
  {
    payment_id: 2005,
    rental_id: 1005,
    amount: 3998,
    payment_method: 'Card',
    payment_date: '2026-07-02T08:40:00.000Z',
    payment_status: 'Refunded',
  },
]

export const getPaymentForRental = (rentalId) =>
  payments.find((p) => p.rental_id === Number(rentalId))