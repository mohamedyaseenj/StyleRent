import { getCategoryById } from '../data/categories'

// Enrich raw CLOTHING rows with the display-format category name
// so components can render `${name}` without a join.
export function withCategoryName(product, categories = null) {
  const cat = categories
    ? categories.find((c) => c.category_id === Number(product.category_id))
    : getCategoryById(product.category_id)
  return { ...product, categoryName: cat?.category_name || 'StyleRent Edit' }
}

export function withCategoryNames(products, categories = null) {
  return products.map((p) => withCategoryName(p, categories))
}

// Client-side filter pipeline used by /clothing and /categories pages.
// Keeps UI state minimal even when the full list is local.
export function applyFilters(items, { query = '', categoryId, minPrice, maxPrice, sort = 'popular', gender }) {
  let list = items

  if (query) {
    const q = query.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
    )
  }

  if (categoryId) list = list.filter((p) => p.category_id === Number(categoryId))
  if (gender) list = list.filter((p) => p.gender === gender)
  if (minPrice) list = list.filter((p) => p.price_per_day >= Number(minPrice))
  if (maxPrice) list = list.filter((p) => p.price_per_day <= Number(maxPrice))

  switch (sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price_per_day - b.price_per_day)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price_per_day - a.price_per_day)
      break
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      list = [...list].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))
      break
    default:
      // "popular" — default catalog order is curator-picked.
      break
  }

  return list
}