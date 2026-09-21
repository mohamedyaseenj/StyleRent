// RENTAL entity (ER alignment):
// rental_id, user_id, start_date, end_date, total_amount, status
// (+ created_at)
// RENTAL_ITEM: item_id, rental_id, clothing_id, size, quantity, price
// Relationships: USER 1:M RENTAL, RENTAL 1:M RENTAL_ITEM, RENTAL 1:M PAYMENT

export const rentals = [
  {
    rental_id: 1001,
    user_id: 1,
    start_date: '2026-08-15',
    end_date: '2026-08-18',
    total_amount: 14400,
    status: 'Returned',
    created_at: '2026-08-01T11:00:00.000Z',
    items: [
      {
        item_id: 5001,
        rental_id: 1001,
        clothing_id: 1,
        size: 'M',
        quantity: 1,
        price: 4800,
      },
    ],
  },
  {
    rental_id: 1002,
    user_id: 1,
    start_date: '2026-09-20',
    end_date: '2026-09-23',
    total_amount: 8700,
    status: 'Confirmed',
    created_at: '2026-09-05T10:20:00.000Z',
    items: [
      {
        item_id: 5002,
        rental_id: 1002,
        clothing_id: 9,
        size: 'S',
        quantity: 1,
        price: 3900,
      },
      {
        item_id: 5003,
        rental_id: 1002,
        clothing_id: 15,
        size: 'Free Size',
        quantity: 1,
        price: 3300,
      },
    ],
  },
  {
    rental_id: 1003,
    user_id: 4,
    start_date: '2026-10-02',
    end_date: '2026-10-05',
    total_amount: 6600,
    status: 'Active',
    created_at: '2026-09-18T09:00:00.000Z',
    items: [
      {
        item_id: 5004,
        rental_id: 1003,
        clothing_id: 3,
        size: 'Free Size',
        quantity: 1,
        price: 2200,
      },
    ],
  },
  {
    rental_id: 1004,
    user_id: 5,
    start_date: '2026-11-01',
    end_date: '2026-11-02',
    total_amount: 5500,
    status: 'Pending',
    created_at: '2026-09-28T15:40:00.000Z',
    items: [
      {
        item_id: 5005,
        rental_id: 1004,
        clothing_id: 5,
        size: 'L',
        quantity: 1,
        price: 5500,
      },
    ],
  },
  {
    rental_id: 1005,
    user_id: 1,
    start_date: '2026-07-05',
    end_date: '2026-07-07',
    total_amount: 3998,
    status: 'Cancelled',
    created_at: '2026-07-01T12:30:00.000Z',
    items: [
      {
        item_id: 5006,
        rental_id: 1005,
        clothing_id: 4,
        size: 'M',
        quantity: 1,
        price: 1999,
      },
    ],
  },
]

export const getRentalById = (id) =>
  rentals.find((r) => r.rental_id === Number(id))

export const getRentalsByUser = (userId) =>
  rentals.filter((r) => r.user_id === Number(userId))