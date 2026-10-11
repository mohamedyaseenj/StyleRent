// USER entity (ER alignment): user_id, name, email, password, phone, address,
// role, created_at
// Role values: USER | HOST | ADMIN  ('OWNER' accepted as legacy alias of HOST)
//
// NOTE: `password` exists ONLY inside this demo dataset so mock login can work.
// It is never written to localStorage and must never be used in production —
// authentication belongs to the future Spring Boot + JWT backend.

export const users = [
  {
    user_id: 1,
    name: 'Priya Sharma',
    email: 'customer@stylerent.com',
    password: 'customer123',
    phone: '+91 98450 12345',
    address: '12 Lakeview Apartments, Indiranagar, Bengaluru, Karnataka 560038',
    role: 'USER',
    created_at: '2026-01-10T10:30:00.000Z',
  },
  {
    user_id: 2,
    name: 'Rohan Kapoor',
    email: 'owner@stylerent.com',
    password: 'owner123',
    phone: '+91 98100 45678',
    address: 'The Ivory Atelier, 5th Cross, Bandra West, Mumbai, Maharashtra 400050',
    role: 'HOST',
    created_at: '2026-01-12T09:00:00.000Z',
  },
  {
    user_id: 6,
    name: 'Rohan Kapoor (Host)',
    email: 'host@stylerent.com',
    password: 'host123',
    phone: '+91 98100 45678',
    address: 'The Ivory Atelier, 5th Cross, Bandra West, Mumbai, Maharashtra 400050',
    role: 'HOST',
    created_at: '2026-01-12T09:00:00.000Z',
  },
  {
    user_id: 3,
    name: 'Arjun Mehta',
    email: 'admin@stylerent.com',
    password: 'admin123',
    phone: '+91 99000 78901',
    address: 'StyleRent HQ, Cyber Hub, Gurugram, Haryana 122002',
    role: 'ADMIN',
    created_at: '2026-01-08T08:15:00.000Z',
  },
  {
    user_id: 4,
    name: 'Neha Verma',
    email: 'neha.verma@example.com',
    password: 'neha123',
    phone: '+91 97455 23456',
    address: '28 Palm Grove Road, Koramangala, Bengaluru, Karnataka 560034',
    role: 'USER',
    created_at: '2026-02-02T14:20:00.000Z',
  },
  {
    user_id: 5,
    name: 'Karan Singh',
    email: 'karan.singh@example.com',
    password: 'karan123',
    phone: '+91 96666 89012',
    address: '41 Rosewood Enclave, Defence Colony, New Delhi 110024',
    role: 'USER',
    created_at: '2026-02-15T16:45:00.000Z',
  },
]

export const getDemoUserByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())

// Sanitised copy used wherever a user record is rendered.
export const sanitizeUser = (user) => {
  const { password: _password, ...safe } = user
  return safe
}