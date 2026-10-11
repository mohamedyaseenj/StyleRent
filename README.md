# STYLERENT

A premium, frontend-only luxury clothing rental platform. Browse an editorial
catalogue, check live availability, book a rental, pay, and manage everything
from customer, owner, and admin dashboards.

The app runs today entirely on bundled mock data and is wired to talk to a
future **Spring Boot 3 / JPA** REST API without any UI changes.

---

## Tech Stack

| Layer      | Choice |
|------------|--------|
| UI         | React 19 |
| Build      | Vite 8 |
| Routing    | React Router 7 (`BrowserRouter`) |
| Styling    | Bootstrap 5 + hand-written design system (`src/index.css`) |
| Icons      | lucide-react |
| HTTP       | Axios (with graceful mock fallback) |
| Language   | JavaScript (ESM) — **no TypeScript** |

---

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

### Scripts

| Command           | Purpose |
|-------------------|---------|
| `npm run dev`     | Start the Vite dev server |
| `npm run build`   | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Lint with oxlint |

---

## Demo Accounts

Passwords live only in `src/data/users.js` (never in `localStorage`).

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Customer | `customer@stylerent.com`  | `customer123` |
| Owner    | `owner@stylerent.com`     | `owner123`    |
| Admin    | `admin@stylerent.com`     | `admin123`    |

The login screen also offers one-click demo sign-in buttons.

---

## Features

**Customer**
- Editorial home page (hero, categories, trending, style edits, lookbook, how-it-works)
- Catalogue with search, filters (category, size, colour, price), and sorting
- Product detail with gallery, size/colour selectors, and an availability checker
- Wishlist, booking, payment (Card / UPI / Cash on delivery), and rental success
- My Rentals, rental details, profile editing, and review submission

**Owner**
- Dashboard stats, clothing inventory management (create/edit/delete),rentals, and revenue

**Admin**
- Platform dashboard, product approvals, categories, rentals, customers, and review moderation

**Platform**
- Role-based route guards (`USER` / `OWNER` / `ADMIN`)
- Toast notifications, loading/empty/error states, and skeleton loaders
- Session persistence and protected navigation with redirect-back

---

## Project Structure

```
src/
  components/
    common/      Button, Modal, FormInput, States, StatusBadge, StarRating,
                 SmartImage, SearchBar, SectionHeading
    layout/      Navbar, Footer, Layout
    clothing/    ProductCard, ProductGrid, ProductFilters, ProductGallery,
                 Selectors, AvailabilityChecker
    review/      ReviewItem, RatingSummary, ReviewFormModal
    dashboard/   DashboardShell, StatCard/DataTable, ClothingManager, RentalsManager
  context/       Toast, Auth, Wishlist, Rental
  data/          Mock data: products, categories, users, rentals, payments,
                 reviews, trends, images
  pages/         Customer pages + owner/ + admin/ + auth/
  services/      api.js — Axios layer with mock fallback
  utils/         dateUtils, priceUtils, validation, productUtils
```

---

## Mock Mode & the Future Backend

`src/services/api.js` exposes `authAPI`, `userAPI`, `categoryAPI`, `clothingAPI`,
`rentalAPI`, `paymentAPI`, and `reviewAPI`. Every call tries the real endpoint
first and silently falls back to bundled mock data, so the UI never breaks while
the backend is offline.

Configure via `.env` (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_MOCK=true
```

Set `VITE_API_MOCK=false` to hit the real Spring Boot API.

### Data model

Exactly two core entities, per the spec: **`CLOTHING`** and **`CATEGORY`**.
Rentals, payments, and reviews are modelled as supporting records around them.

---

## Rental Pricing Rule

`days = endDate - startDate` (exclusive, minimum 1 day), and

```
total = pricePerDay × days × quantity
```

Dates use ISO `YYYY-MM-DD`; currency is formatted with Indian grouping (`₹`).
