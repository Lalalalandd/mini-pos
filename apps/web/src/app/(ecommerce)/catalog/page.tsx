'use client';

import { useState } from 'react';
import { ShoppingBag, Search, Sparkles, Plus, Check } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
}

const SAMPLE_CATALOG: CatalogItem[] = [
  {
    id: '1',
    name: 'Single Origin Ethiopian Yirgacheffe',
    category: 'Coffee',
    price: 32000,
    description: 'Floral aroma with bright citrus notes, stone fruit undertones, and honey finish.',
    stock: 40,
  },
  {
    id: '2',
    name: 'Iced Oat Caramel Macchiato',
    category: 'Coffee',
    price: 38000,
    description: 'Velvety oat milk infused with madagascar vanilla and double espresso shot.',
    stock: 85,
  },
  {
    id: '3',
    name: 'Butter Croissant Premium French Butter',
    category: 'Bakery',
    price: 24000,
    description: 'Traditional 72-layer laminated dough, baked fresh every morning for optimal flakiness.',
    stock: 25,
  },
  {
    id: '4',
    name: 'Smoked Beef Brioche Sandwich',
    category: 'Meals',
    price: 48000,
    description: '12-hour oak smoked beef brisket with aged cheddar and whole grain mustard aioli.',
    stock: 18,
  },
  {
    id: '5',
    name: 'Ceremonial Grade Uji Matcha Latte',
    category: 'Tea',
    price: 35000,
    description: 'Stone ground Japanese ceremonial grade matcha with perfectly textured microfoam.',
    stock: 50,
  },
];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const categories = ['All', 'Coffee', 'Bakery', 'Meals', 'Tea'];

  const filtered = SAMPLE_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdd = (id: string) => {
    setCartCount((c) => c + 1);
    setAddedItem(id);
    setTimeout(() => setAddedItem(null), 1200);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-10 space-y-8">
      {/* Header & Cart Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pos-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>GraphQL Accelerated Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Artisan Storefront
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-semibold text-white">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span>Cart Items:</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white font-mono">{cartCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-500 text-white shadow-glow-accent'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full bg-pos-surface border border-pos-border rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 border-pos-border hover:border-indigo-500/50"
          >
            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium">
                  {item.category}
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">{item.stock} in stock</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-pos-border">
              <span className="text-lg font-black text-white font-mono">
                Rp {item.price.toLocaleString('id-ID')}
              </span>
              <button
                onClick={() => handleAdd(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  addedItem === item.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {addedItem === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
