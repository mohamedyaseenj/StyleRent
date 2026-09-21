import { px } from './images'

// CATEGORY entity (ER alignment):
// category_id, category_name, description
// CLOTHING is the only other entity with these names — see products.js

export const categories = [
  {
    category_id: 1,
    category_name: 'Sarees',
    description: 'Six yards of pure drama — silk, heritage weaves and contemporary drapes for every occasion.',
    image_url: px(32718396),
    featured: true,
  },
  {
    category_id: 2,
    category_name: 'Lehenga',
    description: 'Bridal-ready skirts, cholis and dupattas in pastel and jewel tones with couture embroidery.',
    image_url: px(29251325),
    featured: true,
  },
  {
    category_id: 3,
    category_name: 'Gowns',
    description: 'Floor-sweeping evening gowns in champagne, emerald and midnight for galas and receptions.',
    image_url: px(33923432),
    featured: true,
  },
  {
    category_id: 4,
    category_name: 'Anarkali',
    description: 'Flowing silhouettes with intricate detailing — effortless grace from mehendi to reception.',
    image_url: px(29770293),
    featured: false,
  },
  {
    category_id: 5,
    category_name: 'Sherwani',
    description: 'Regal groom wear in ivory, wine and gold with hand-finished embroidery.',
    image_url: px(38141587),
    featured: true,
  },
  {
    category_id: 6,
    category_name: 'Suits',
    description: 'Tailored blazers and sharp suits in modern cuts — from boardroom to black-tie.',
    image_url: px(15442084),
    featured: false,
  },
  {
    category_id: 7,
    category_name: 'Tuxedo',
    description: 'Classic and contemporary tuxedos for the most formal of evenings.',
    image_url: px(27028693),
    featured: false,
  },
  {
    category_id: 8,
    category_name: 'Party Wear',
    description: 'Sequins, satin and statement silhouettes made for dancing till dawn.',
    image_url: px(33836119),
    featured: false,
  },
  {
    category_id: 9,
    category_name: 'Wedding Wear',
    description: 'The complete wedding wardrobe — bridal, groom and every guest in between.',
    image_url: px(35963151),
    featured: true,
  },
  {
    category_id: 10,
    category_name: 'Traditional Wear',
    description: 'Timeless ethnic pieces celebrating India\u2019s craft heritage.',
    image_url: px(38998852),
    featured: false,
  },
]

export const getCategoryById = (id) =>
  categories.find((c) => c.category_id === Number(id))