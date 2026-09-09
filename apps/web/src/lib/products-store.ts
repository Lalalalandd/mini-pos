export interface StoredProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockAlert: number;
  categoryId?: string;
  categoryName: string;
  imageUrl?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export const DEFAULT_PRODUCTS: StoredProduct[] = [
  {
    id: 'p-1',
    name: 'Single Origin Espresso',
    sku: 'BEV-ESP-001',
    barcode: '89910010001',
    price: 28000,
    costPrice: 12000,
    stock: 120,
    minStockAlert: 15,
    categoryId: 'cat-1',
    categoryName: 'Kopi & Minuman',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    description: 'Double espresso ekstraksi sempurna dengan aroma nutty dan dark chocolate note.',
    status: 'ACTIVE',
  },
  {
    id: 'p-2',
    name: 'Iced Oat Caramel Macchiato',
    sku: 'BEV-MAC-002',
    barcode: '89910010002',
    price: 38000,
    costPrice: 16000,
    stock: 85,
    minStockAlert: 10,
    categoryId: 'cat-1',
    categoryName: 'Kopi & Minuman',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    description: 'Espresso dipadu susu oat gurih dan sirup caramel artisan buatan sendiri.',
    status: 'ACTIVE',
  },
  {
    id: 'p-3',
    name: 'Butter Croissant French AOP',
    sku: 'BAK-CRS-001',
    barcode: '89910010003',
    price: 24000,
    costPrice: 9000,
    stock: 8,
    minStockAlert: 10,
    categoryId: 'cat-2',
    categoryName: 'Pastry & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    description: 'Croissant renyah berlapis dengan mentega murni Prancis bersertifikasi AOP.',
    status: 'ACTIVE',
  },
  {
    id: 'p-4',
    name: 'Smoked Beef Brioche Sandwich',
    sku: 'MEA-SND-001',
    barcode: '89910010004',
    price: 48000,
    costPrice: 22000,
    stock: 4,
    minStockAlert: 8,
    categoryId: 'cat-3',
    categoryName: 'Makanan Berat',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
    description: 'Roti brioche empuk dipadu smoked beef lembut, keju cheddar leleh, dan saus rempah.',
    status: 'ACTIVE',
  },
  {
    id: 'p-5',
    name: 'Ceremonial Uji Matcha Latte',
    sku: 'BEV-MTC-003',
    barcode: '89910010005',
    price: 35000,
    costPrice: 15000,
    stock: 50,
    minStockAlert: 10,
    categoryId: 'cat-4',
    categoryName: 'Teh & Artisan',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80',
    description: 'Matcha ceremonial grade asli Uji Kyoto dipadukan susu segar lembut.',
    status: 'ACTIVE',
  },
  {
    id: 'p-6',
    name: 'Pain au Chocolat Belgian Dark',
    sku: 'BAK-CHO-002',
    barcode: '89910010006',
    price: 28000,
    costPrice: 11000,
    stock: 3,
    minStockAlert: 10,
    categoryId: 'cat-2',
    categoryName: 'Pastry & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&q=80',
    description: 'Pastry mentega renyah dengan isian batang cokelat hitam Belgia 70%.',
    status: 'ACTIVE',
  },
  {
    id: 'p-7',
    name: 'Chocochip Artisan Cookie',
    sku: 'SNK-CKI-001',
    barcode: '89910010007',
    price: 18000,
    costPrice: 7000,
    stock: 55,
    minStockAlert: 15,
    categoryId: 'cat-5',
    categoryName: 'Camilan & Snack',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
    description: 'Kue kering renyah di luar lumer di dalam dengan taburan dark choco chunks dan sea salt.',
    status: 'ACTIVE',
  },
  {
    id: 'p-8',
    name: 'Sparkling Lemon Cold Brew',
    sku: 'BEV-CLB-004',
    barcode: '89910010008',
    price: 32000,
    costPrice: 13000,
    stock: 2,
    minStockAlert: 6,
    categoryId: 'cat-1',
    categoryName: 'Kopi & Minuman',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80',
    description: 'Cold brew kopi robusta blend dengan sari lemon segar dan air soda berkarbonasi.',
    status: 'ACTIVE',
  },
];

const PRODUCTS_STORAGE_KEY = 'aurapos_products_store';

export function getStoredProducts(): StoredProduct[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveStoredProducts(products: StoredProduct[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage', err);
  }
}

export function addStoredProduct(product: Omit<StoredProduct, 'id' | 'createdAt'>): StoredProduct {
  const current = getStoredProducts();
  const newProd: StoredProduct = {
    ...product,
    id: `prod-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newProd, ...current];
  saveStoredProducts(updated);
  return newProd;
}

export function updateStoredProduct(id: string, updates: Partial<StoredProduct>): StoredProduct[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveStoredProducts(updated);
  return updated;
}

export function deleteStoredProduct(id: string): StoredProduct[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== id);
  saveStoredProducts(updated);
  return updated;
}
