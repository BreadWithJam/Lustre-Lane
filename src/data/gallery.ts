import type { GalleryImage } from '@/types'
import womensHaircut from '@assets/images/Womens haircut.jpg'
import mensHaircut from '@assets/images/mens  haircut.jpg'
import kidsHaircut from '@assets/images/kids haircut.jpg'
import bangTrim from '@assets/images/bang trim.jpg'
import neckCleanup from '@assets/images/neck cleanup trim.jpg'
import keratinTreatment from '@assets/images/keratin treatment.jpg'

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
]
