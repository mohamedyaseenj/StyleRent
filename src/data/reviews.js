// REVIEW entity (ER alignment):
// review_id, user_id, clothing_id, rating, comment, created_at
// Rating is 1–5. Relationship: USER 1:M REVIEW, CLOTHING 1:M REVIEW
// reviewer_name is a frontend display convenience (joined from USER).

export const reviews = [
  {
    review_id: 1,
    user_id: 1,
    clothing_id: 1,
    rating: 5,
    comment:
      'Absolutely stunning lehenga. The zardozi work was even prettier in person and the fit was perfect. Returned it spotless — the process was so easy.',
    created_at: '2026-08-20T09:00:00.000Z',
    reviewer_name: 'Priya Sharma',
  },
  {
    review_id: 2,
    user_id: 4,
    clothing_id: 1,
    rating: 5,
    comment:
      'Wore it for my sister\u2019s wedding each night and got compliments constantly. Quality of the embroidery is unmatched for the price.',
    created_at: '2026-08-25T14:30:00.000Z',
    reviewer_name: 'Neha Verma',
  },
  {
    review_id: 3,
    user_id: 5,
    clothing_id: 5,
    rating: 5,
    comment:
      'The ivory sherwani was pure royalty. Tailoring was precise and the fabric felt like a million rupees. 10/10 for grooms.',
    created_at: '2026-09-01T18:00:00.000Z',
    reviewer_name: 'Karan Singh',
  },
  {
    review_id: 4,
    user_id: 1,
    clothing_id: 9,
    rating: 5,
    comment:
      'Champagne gown was breathtaking under the lights. Fitted like it was made for me and the return courier was on time.',
    created_at: '2026-09-06T11:20:00.000Z',
    reviewer_name: 'Priya Sharma',
  },
  {
    review_id: 5,
    user_id: 4,
    clothing_id: 3,
    rating: 4,
    comment:
      'Gorgeous emerald silk, the border is so rich. I would size up the blouse if between sizes. Otherwise flawless.',
    created_at: '2026-09-10T13:45:00.000Z',
    reviewer_name: 'Neha Verma',
  },
  {
    review_id: 6,
    user_id: 5,
    clothing_id: 4,
    rating: 5,
    comment:
      'Classic tuxedo, perfect for the corporate annual dinner. Nobody believed it was rented!',
    created_at: '2026-06-20T10:10:00.000Z',
    reviewer_name: 'Karan Singh',
  },
  {
    review_id: 7,
    user_id: 1,
    clothing_id: 15,
    rating: 5,
    comment:
      'The black & gold saree is straight up stunning. Draped at a sangeet and owned the night. Booking again for Diwali.',
    created_at: '2026-09-14T17:40:00.000Z',
    reviewer_name: 'Priya Sharma',
  },
  {
    review_id: 8,
    user_id: 4,
    clothing_id: 13,
    rating: 4,
    comment:
      'Lavender organza is dreamy and so light to dance in. Love that it was steamed and ready on day one.',
    created_at: '2026-09-22T12:05:00.000Z',
    reviewer_name: 'Neha Verma',
  },
  {
    review_id: 9,
    user_id: 5,
    clothing_id: 12,
    rating: 5,
    comment:
      'Wine velvet sherwani made me feel like a Nawab. The velvet is thick but breathable. Highly recommend.',
    created_at: '2026-08-18T19:30:00.000Z',
    reviewer_name: 'Karan Singh',
  },
  {
    review_id: 10,
    user_id: 4,
    clothing_id: 8,
    rating: 5,
    comment:
      'Pastel pink anarkali was perfect for the haldi. Soft fabric, beautiful gota detailing, and easy booking.',
    created_at: '2026-08-30T08:50:00.000Z',
    reviewer_name: 'Neha Verma',
  },
  {
    review_id: 11,
    user_id: 1,
    clothing_id: 2,
    rating: 4,
    comment:
      'The midnight gown is a work of art. Some may find the slit a little dramatic, but that\u2019s exactly why I rented it.',
    created_at: '2026-09-03T16:15:00.000Z',
    reviewer_name: 'Priya Sharma',
  },
  {
    review_id: 12,
    user_id: 5,
    clothing_id: 7,
    rating: 5,
    comment:
      'Burgundy suit photographed incredibly at the reception. Great stitching, great drape, zero hassle.',
    created_at: '2026-09-08T07:20:00.000Z',
    reviewer_name: 'Karan Singh',
  },
]

export const getReviewsByClothing = (clothingId) =>
  reviews.filter((r) => r.clothing_id === Number(clothingId))

export const getReviewsByUser = (userId) =>
  reviews.filter((r) => r.user_id === Number(userId))