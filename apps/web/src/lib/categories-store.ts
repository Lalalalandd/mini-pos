export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt?: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Kopi & Minuman',
    slug: 'kopi-minuman',
    description: 'Espresso, Latte, Cold Brew, dan aneka racikan kopi artisanal',
    color: 'amber',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Pastry & Bakery',
    slug: 'pastry-bakery',
    description: 'Croissant panggang mentega AOP, Danish pastry, dan cake',
    color: 'orange',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Makanan Berat',
    slug: 'makanan-berat',
    description: 'Brioche sandwich gurih, hidangan utama, dan menu santap siang',
    color: 'rose',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Teh & Artisan',
    slug: 'teh-artisan',
    description: 'Matcha Uji Jepang premium, chamomile, dan teh seduh herbal',
    color: 'emerald',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Camilan & Snack',
    slug: 'camilan-snack',
    description: 'Artisan soft cookies, keripik ringan, dan finger foods',
    color: 'blue',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const CATEGORIES_STORAGE_KEY = 'aurapos_categories_store';

export function getStoredCategories(): CategoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: CategoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage', err);
  }
}

export function addStoredCategory(category: Omit<CategoryItem, 'id' | 'createdAt'>): CategoryItem {
  const current = getStoredCategories();
  const newCat: CategoryItem = {
    ...category,
    id: `cat-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newCat, ...current];
  saveStoredCategories(updated);
  return newCat;
}

export function updateStoredCategory(id: string, updates: Partial<CategoryItem>): CategoryItem[] {
  const current = getStoredCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveStoredCategories(updated);
  return updated;
}

export function deleteStoredCategory(id: string): CategoryItem[] {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);
  return updated;
}
