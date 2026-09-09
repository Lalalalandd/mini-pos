export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  isActive: boolean;
  usageCount: number;
  validUntil: string;
}

export interface TaxSettings {
  ppnEnabled: boolean;
  ppnRate: number; // e.g. 11 for 11%
  ppnType: 'EXCLUSIVE' | 'INCLUSIVE';
  serviceChargeEnabled: boolean;
  serviceChargeRate: number; // e.g. 5 for 5%
  freeShippingMin: number; // e.g. 100000
  flatShippingFee: number; // e.g. 10000
}

export const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'AURAPOS',
    description: 'Diskon Spesial Pengguna Baru 15%',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minPurchase: 0,
    maxDiscount: 50000,
    isActive: true,
    usageCount: 48,
    validUntil: '2026-12-31',
  },
  {
    id: 'promo-2',
    code: 'HEMAT10',
    description: 'Kupon Hemat Belanja 10%',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchase: 50000,
    maxDiscount: 25000,
    isActive: true,
    usageCount: 112,
    validUntil: '2026-12-31',
  },
  {
    id: 'promo-3',
    code: 'SUPERDEAL',
    description: 'Promo Spesial Akhir Pekan 20%',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minPurchase: 100000,
    maxDiscount: 40000,
    isActive: true,
    usageCount: 29,
    validUntil: '2026-11-30',
  },
  {
    id: 'promo-4',
    code: 'DISKON50K',
    description: 'Potongan Langsung Rp 50.000',
    discountType: 'FIXED',
    discountValue: 50000,
    minPurchase: 200000,
    isActive: true,
    usageCount: 16,
    validUntil: '2026-12-31',
  },
];

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  ppnEnabled: true,
  ppnRate: 11,
  ppnType: 'EXCLUSIVE',
  serviceChargeEnabled: false,
  serviceChargeRate: 5,
  freeShippingMin: 100000,
  flatShippingFee: 10000,
};

export function getStoredPromos(): PromoCode[] {
  if (typeof window === 'undefined') return DEFAULT_PROMOS;
  try {
    const saved = localStorage.getItem('aurastore_promos');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PROMOS;
}

export function saveStoredPromos(promos: PromoCode[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aurastore_promos', JSON.stringify(promos));
  } catch {}
}

export function getStoredTaxSettings(): TaxSettings {
  if (typeof window === 'undefined') return DEFAULT_TAX_SETTINGS;
  try {
    const saved = localStorage.getItem('aurastore_tax_settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_TAX_SETTINGS;
}

export function saveStoredTaxSettings(settings: TaxSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aurastore_tax_settings', JSON.stringify(settings));
  } catch {}
}

export function validateAndApplyPromo(
  inputCode: string,
  subtotal: number,
): {
  valid: boolean;
  discountAmount: number;
  discountPercent: number;
  promo?: PromoCode;
  message: string;
} {
  const codeNormalized = inputCode.trim().toUpperCase();
  if (!codeNormalized) {
    return { valid: false, discountAmount: 0, discountPercent: 0, message: 'Masukkan kode promo.' };
  }

  const promos = getStoredPromos();
  const found = promos.find((p) => p.code.toUpperCase() === codeNormalized);

  if (!found) {
    return { valid: false, discountAmount: 0, discountPercent: 0, message: `Kode promo "${inputCode}" tidak ditemukan.` };
  }

  if (!found.isActive) {
    return { valid: false, discountAmount: 0, discountPercent: 0, message: `Kode promo "${found.code}" sudah tidak aktif.` };
  }

  if (subtotal < found.minPurchase) {
    return {
      valid: false,
      discountAmount: 0,
      discountPercent: 0,
      message: `Minimal belanja untuk promo ini adalah Rp ${found.minPurchase.toLocaleString('id-ID')}.`,
    };
  }

  let discountAmount = 0;
  let discountPercent = 0;

  if (found.discountType === 'PERCENTAGE') {
    discountPercent = found.discountValue;
    discountAmount = (subtotal * found.discountValue) / 100;
    if (found.maxDiscount && discountAmount > found.maxDiscount) {
      discountAmount = found.maxDiscount;
    }
  } else {
    discountAmount = Math.min(subtotal, found.discountValue);
    discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
  }

  return {
    valid: true,
    discountAmount,
    discountPercent,
    promo: found,
    message: `Kupon "${found.code}" berhasil diterapkan!`,
  };
}
