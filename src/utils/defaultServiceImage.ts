/**
 * Default placeholder images for services, staff, and salons.
 * Used on USER-FACING pages only (not admin/owner dashboards).
 *
 * - Services: regex-matched by name to curated local images
 * - Staff: professional barber/stylist stock photos
 * - Salons: salon interior/exterior stock photos
 */

// ─── Hash utility ────────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── SERVICE defaults ────────────────────────────────────────────────────────

interface ImageCategory {
  keywords: RegExp;
  images: string[];
}

const IMAGE_CATEGORIES: ImageCategory[] = [
  {
    keywords: /beard|bread|trim|shav(e|ing)|goatee/i,
    images: [
      '/default_services/beard_trim_1_icj3go.jpg',
      '/default_services/beard_trim_2_bruvew.jpg',
      '/default_services/beard_trim_3_ukl4fc.jpg',
      '/default_services/beard_trim_4_hg01gy.webp',
      '/default_services/beard_trim_5_p76xn9.jpg',
    ],
  },
  {
    keywords: /facial|face|clean(s|sing)|skin|glow/i,
    images: [
      '/default_services/facial_1_xtaiq6.jpg',
      '/default_services/facial_2_njkbmv.jpg',
      '/default_services/facial_3_mxaxfd.jpg',
      '/default_services/facial_4_a6vz8z.jpg',
    ],
  },
  {
    keywords: /hair\s?cut|cutting|style|styling|blow\s?dry|layer/i,
    images: [
      '/default_services/haircut_1_uardqa.jpg',
      '/default_services/haircut_2_e3fs4u.avif',
      '/default_services/haircut_3_ybzo1q.jpg',
      '/default_services/haircut_4_vxv4xo.jpg',
      '/default_services/haircut_5_yzggcs.jpg',
    ],
  },
  {
    keywords: /wash|shampoo|hair\s?wash|head\s?wash|rinse/i,
    images: [
      '/default_services/hairwash_1_jdzhqq.avif',
    ],
  },
  {
    keywords: /massage|spa|relax|therapy|body/i,
    images: [
      '/default_services/massage_1_v96uvo.jpg',
      '/default_services/massage_2_uxweae.webp',
    ],
  },
];

const ALL_SERVICE_IMAGES: string[] = IMAGE_CATEGORIES.flatMap((cat) => cat.images);

/**
 * Get a default service image based on the service name.
 * Matches keywords first, then falls back to the full pool.
 */
export function getDefaultServiceImage(serviceName: string): string {
  if (!serviceName) {
    return ALL_SERVICE_IMAGES[0];
  }

  const normalizedName = serviceName.trim().toLowerCase();

  for (const category of IMAGE_CATEGORIES) {
    if (category.keywords.test(normalizedName)) {
      const index = simpleHash(normalizedName) % category.images.length;
      return category.images[index];
    }
  }

  const index = simpleHash(normalizedName) % ALL_SERVICE_IMAGES.length;
  return ALL_SERVICE_IMAGES[index];
}

// ─── STAFF defaults ──────────────────────────────────────────────────────────

const DEFAULT_STAFF_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612257416648-ee7a6c5b4f9b?w=400&h=400&fit=crop&crop=face',
];

/**
 * Get a default staff/stylist image.
 * Deterministic based on staff name or ID so the same person always gets the same image.
 */
export function getDefaultStaffImage(identifier: string): string {
  if (!identifier) return DEFAULT_STAFF_IMAGES[0];
  const index = simpleHash(identifier) % DEFAULT_STAFF_IMAGES.length;
  return DEFAULT_STAFF_IMAGES[index];
}

// ─── SALON defaults ──────────────────────────────────────────────────────────

const DEFAULT_SALON_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585747860036-4cb4e2043213?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&h=400&fit=crop',
];

/**
 * Get a default salon image.
 * Deterministic based on salon name or ID.
 */
export function getDefaultSalonImage(identifier: string): string {
  if (!identifier) return DEFAULT_SALON_IMAGES[0];
  const index = simpleHash(identifier) % DEFAULT_SALON_IMAGES.length;
  return DEFAULT_SALON_IMAGES[index];
}
