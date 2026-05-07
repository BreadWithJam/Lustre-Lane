import type { GalleryImage } from '@/types'
import womensHaircut from '@assets/images/Womens haircut.jpg'
import mensHaircut from '@assets/images/mens  haircut.jpg'
import kidsHaircut from '@assets/images/kids haircut.jpg'
import bangTrim from '@assets/images/bang trim.jpg'
import neckCleanup from '@assets/images/neck cleanup trim.jpg'
import keratinTreatment from '@assets/images/keratin treatment.jpg'
import balayage from '@assets/images/balayage.png'
import brazilianBlowout from '@assets/images/brazzilian blowout.png'
import dandruffTreatment from '@assets/images/dandruff treatment.png'
import lowlights from '@assets/images/lowlights.png'

// Static gallery entries matching salon service categories
export const staticGalleryImages: GalleryImage[] = [
  // Cuts
  {
    id: 'womens-haircut',
    imageUrl: womensHaircut,
    thumbnailUrl: womensHaircut,
    title: "Women's Haircut",
    category: 'cuts',
    tags: ['cut', 'style', 'everyday'],
    isFeatured: true,
    createdAt: new Date(),
  },
  {
    id: 'mens-haircut',
    imageUrl: mensHaircut,
    thumbnailUrl: mensHaircut,
    title: "Men's Haircut",
    category: 'cuts',
    tags: ['cut', 'precision', 'modern'],
    isFeatured: false,
    createdAt: new Date(),
  },
  {
    id: 'kids-haircut',
    imageUrl: kidsHaircut,
    thumbnailUrl: kidsHaircut,
    title: "Kids Haircut",
    category: 'cuts',
    tags: ['cut', 'kids', 'gentle'],
    isFeatured: false,
    createdAt: new Date(),
  },
  {
    id: 'bang-trim',
    imageUrl: bangTrim,
    thumbnailUrl: bangTrim,
    title: 'Bang Trim',
    category: 'cuts',
    tags: ['trim', 'fringe', 'maintenance'],
    isFeatured: false,
    createdAt: new Date(),
  },
  {
    id: 'neck-cleanup',
    imageUrl: neckCleanup,
    thumbnailUrl: neckCleanup,
    title: 'Neck / Clean-up Trim',
    category: 'cuts',
    tags: ['trim', 'cleanup', 'maintenance'],
    isFeatured: false,
    createdAt: new Date(),
  },

  // Color
  {
    id: 'balayage',
    imageUrl: balayage,
    thumbnailUrl: balayage,
    title: 'Balayage',
    category: 'color',
    tags: ['color', 'balayage', 'hand-painted'],
    isFeatured: true,
    createdAt: new Date(),
  },
  {
    id: 'lowlights',
    imageUrl: lowlights,
    thumbnailUrl: lowlights,
    title: 'Lowlights',
    category: 'color',
    tags: ['color', 'lowlights', 'depth'],
    isFeatured: false,
    createdAt: new Date(),
  },

  // Treatments
  {
    id: 'keratin-treatment',
    imageUrl: keratinTreatment,
    thumbnailUrl: keratinTreatment,
    title: 'Keratin Treatment',
    category: 'treatments',
    tags: ['treatment', 'smoothing', 'frizz'],
    isFeatured: true,
    createdAt: new Date(),
  },
  {
    id: 'brazilian-blowout',
    imageUrl: brazilianBlowout,
    thumbnailUrl: brazilianBlowout,
    title: 'Brazilian Blowout',
    category: 'treatments',
    tags: ['treatment', 'blowout', 'glossy'],
    isFeatured: false,
    createdAt: new Date(),
  },
  {
    id: 'dandruff-treatment',
    imageUrl: dandruffTreatment,
    thumbnailUrl: dandruffTreatment,
    title: 'Dandruff Treatment',
    category: 'treatments',
    tags: ['treatment', 'scalp', 'dandruff'],
    isFeatured: false,
    createdAt: new Date(),
  },
]
