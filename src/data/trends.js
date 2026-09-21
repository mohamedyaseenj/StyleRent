import { IMAGES } from './images'

// Editorial trend data used by the Home style-edit and lookbook sections,
// plus the curated "trending" product list. Product tag management lives in
// products.js (tags: TRENDING | NEW | BEST RENTAL | LIMITED | ...).

export const styleEdits = [
  { id: 1, num: '01', name: 'Minimal Ivory', description: 'Quiet luxury in cream, silk and clean lines.', image: IMAGES.styleEdit.minimal, tag: 'MODERN ETHNIC' },
  { id: 2, num: '02', name: 'Statement Color', description: 'Bold hues that own the room.', image: IMAGES.styleEdit.statement, tag: 'PARTY WEAR' },
  { id: 3, num: '03', name: 'Lace & Texture', description: 'Handcrafted layers and tactile finishes.', image: IMAGES.styleEdit.lace, tag: 'EVENING WEAR' },
  { id: 4, num: '04', name: 'Vintage Revival', description: 'Heritage silhouettes, reimagined.', image: IMAGES.styleEdit.vintage, tag: 'HERITAGE' },
  { id: 5, num: '05', name: 'Tailored Elegance', description: 'Sharp cuts for the modern wardrobe.', image: IMAGES.styleEdit.tailored, tag: 'FORMAL' },
  { id: 6, num: '06', name: 'Modern Ethnic', description: 'Contemporary takes on timeless craft.', image: IMAGES.styleEdit.ethnic, tag: 'WEDDING WEAR' },
]

export const lookbookCollections = [
  {
    id: 'wedding',
    title: 'THE WEDDING EDIT',
    description: 'Bridal lehengas, regal sherwanis and guest looks curated for the big day.',
    image: IMAGES.lookbook.wedding,
    categoryId: 9,
  },
  {
    id: 'evening',
    title: 'THE EVENING EDIT',
    description: 'Gowns and sequins for galas, parties and nights that go long.',
    image: IMAGES.lookbook.evening,
    categoryId: 3,
  },
  {
    id: 'minimal',
    title: 'THE MINIMAL EDIT',
    description: 'Refined silhouettes in ivory, navy and clean tailoring.',
    image: IMAGES.lookbook.minimal,
    categoryId: 6,
  },
  {
    id: 'ethnic',
    title: 'THE MODERN ETHNIC EDIT',
    description: 'Classic Indian craft with a contemporary point of view.',
    image: IMAGES.lookbook.ethnic,
    categoryId: 10,
  },
]

export const howItWorks = [
  {
    step: '01',
    title: 'Discover',
    description:
      'Browse the collection — lehengas, gowns, sherwanis and suits for every occasion.',
  },
  {
    step: '02',
    title: 'Choose Your Dates',
    description:
      'Pick your size, colour and rental window. We show live availability before you book.',
  },
  {
    step: '03',
    title: 'Book Your Look',
    description:
      'Pay securely or on pickup. Your outfit is steamed, pressed and delivered on time.',
  },
  {
    step: '04',
    title: 'Wear & Return',
    description:
      'Live the moment, then send it back with the prepaid label. That\u2019s it.',
  },
]