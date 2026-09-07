export interface Review {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  variant?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  stock: number;
  sku: string;
  rating: number;
  soldCount: number;
  location: string;
  tag?: string;
  images: { id: string; label: string; subLabel: string }[];
  specs: { label: string; value: string }[];
  reviews: Review[];
}

export const MARKETPLACE_DATA: CatalogProduct[] = [
  {
    id: 'c-1',
    name: 'Single Origin Ethiopian Yirgacheffe Arabica Coffee Beans 250g',
    category: 'Coffee',
    price: 32000,
    originalPrice: 38000,
    description: 'Biji kopi arabika pilihan dari dataran tinggi Yirgacheffe, Ethiopia. Menghadirkan profil rasa beraroma floral melati, keasaman buah ceri segar, dan sentuhan rasa madu hutan alami. Dipanggang dengan tingkat medium roast untuk menjaga keseimbangan rasa yang bersih (clean cup).',
    stock: 40,
    sku: 'KOP-ETH-01',
    rating: 4.9,
    soldCount: 142,
    location: 'Jakarta Selatan',
    tag: 'Terlaris',
    images: [
      { id: 'img-1', label: 'Tampak Utama Kemasan', subLabel: 'Kemasan Zipper Valve 250g' },
      { id: 'img-2', label: 'Biji Kopi Medium Roast', subLabel: 'Ukuran Biji Seragam Grade 1' },
      { id: 'img-3', label: 'Sertifikat Single Origin', subLabel: 'Grade Specialty Arabica' },
      { id: 'img-4', label: 'Hasil Seduhan Espresso & V60', subLabel: 'Crema Tebal & Aroma Kuat' },
    ],
    specs: [
      { label: 'Varietas', value: 'Heirloom Arabica' },
      { label: 'Proses', value: 'Washed Process' },
      { label: 'Roast Level', value: 'Medium Roast' },
      { label: 'Berat Bersih', value: '250 Gram' },
      { label: 'Masa Simpan', value: '6 Bulan dalam kemasan valve' },
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Rian Pratama',
        userCity: 'Jakarta Selatan',
        rating: 5,
        date: '3 hari yang lalu',
        comment: 'Kopinya sangat wangi bunga melati dan ada fruity note saat diseduh V60. Biji kopinya utuh dan seragam, roasting date masih fresh!',
        variant: 'Biji Kopi Utuh (Whole Beans)',
      },
      {
        id: 'rev-2',
        userName: 'Citra Dewi',
        userCity: 'Bandung',
        rating: 5,
        date: '1 minggu yang lalu',
        comment: 'Sudah langganan beli di sini. Pengiriman aman pakai bubble wrap tebal, rasa kopi autentik banget buat espresso di rumah.',
        variant: 'Giling Medium (V60/Filter)',
      },
      {
        id: 'rev-3',
        userName: 'Bambang Kusuma',
        userCity: 'Surabaya',
        rating: 4,
        date: '2 minggu yang lalu',
        comment: 'Aroma kopi mantap, keasaman buah ceri terasa lembut tidak menusuk lambung. Recommended!',
        variant: 'Biji Kopi Utuh (Whole Beans)',
      },
    ],
  },
  {
    id: 'c-2',
    name: 'Iced Oat Vanilla Madagascar Caramel Macchiato 500ml',
    category: 'Coffee',
    price: 38000,
    originalPrice: 45000,
    description: 'Susu oat creamy premium berpadu harmonis dengan espresso ganda arabika dan saus karamel madagascar murni. Bebas laktosa (dairy-free), cocok untuk vegetarian dan pecinta minuman kopi kekinian dengan cita rasa gurih legit.',
    stock: 85,
    sku: 'KOP-OAT-02',
    rating: 4.8,
    soldCount: 98,
    location: 'Jakarta Selatan',
    tag: 'Favorit',
    images: [
      { id: 'img-1', label: 'Tampak Utama Minuman', subLabel: 'Cup 500ml dengan Layer Karamel' },
      { id: 'img-2', label: 'Susu Oat Barista Premium', subLabel: '100% Plant-Based Laktosa Free' },
      { id: 'img-3', label: 'Double Shot Espresso', subLabel: 'Biji Kopi Arabika Pilihan' },
    ],
    specs: [
      { label: 'Kandungan', value: 'Espresso Ganda, Susu Oat, Sirup Vanilla, Saus Karamel' },
      { label: 'Ukuran', value: '500 ml' },
      { label: 'Kategori Diet', value: 'Dairy-Free, Plant-Based' },
      { label: 'Saran Penyimpanan', value: 'Simpan di kulkas, habiskan dalam 24 jam' },
    ],
    reviews: [
      {
        id: 'rev-4',
        userName: 'Sari Rahmadani',
        userCity: 'Tangerang',
        rating: 5,
        date: '2 hari yang lalu',
        comment: 'Manisnya pas, rasa karamelnya alami bukan perisa buatan. Susu oat nya creamy banget!',
      },
    ],
  },
  {
    id: 'c-3',
    name: 'Butter Croissant French AOP Pure Butter Freshly Baked',
    category: 'Bakery',
    price: 24000,
    originalPrice: 28000,
    description: '72 lapisan adonan mentega Prancis AOP murni. Dipanggang segar setiap pagi menghasilkan tekstur luar yang renyah keemasan (flaky) dan rongga dalam yang lembut beraroma mentega susu otentik.',
    stock: 25,
    sku: 'BAK-CRS-01',
    rating: 4.9,
    soldCount: 230,
    location: 'Jakarta Selatan',
    tag: 'Baru Dipanggang',
    images: [
      { id: 'img-1', label: 'Croissant Golden Crust', subLabel: 'Lapisan Renyah Berwarna Emas' },
      { id: 'img-2', label: 'Struktur Rongga Honeycomb', subLabel: '72 Lapisan Butter Prancis' },
      { id: 'img-3', label: 'Penyajian Bersama Kopi', subLabel: 'Pas untuk Sarapan Pagi' },
    ],
    specs: [
      { label: 'Bahan Utama', value: 'Tepung Prancis T55, Mentega AOP Beurre d’Isigny, Ragi Alami' },
      { label: 'Tekstur', value: 'Flaky & Crispy di luar, Soft di dalam' },
      { label: 'Berat', value: '85 Gram / Pcs' },
    ],
    reviews: [
      {
        id: 'rev-5',
        userName: 'Fajar Nugroho',
        userCity: 'Jakarta Pusat',
        rating: 5,
        date: 'Kemarin',
        comment: 'Croissant terbaik! Dipanaskan di airfryer 3 menit langsung renyah seperti baru keluar dari oven bakery Prancis.',
      },
    ],
  },
  {
    id: 'c-4',
    name: 'Smoked Beef Brisket 12-Hour Oak Brioche Sandwich',
    category: 'Meals',
    price: 48000,
    originalPrice: 55000,
    description: 'Daging sapi brisket premium diasap lambat selama 12 jam dengan kayu oak pilihan. Disajikan di atas roti brioche mentega panggang dengan lelehan keju cheddar, daun arugula segar, acar timun homemade, dan saus mustard mayo gurih.',
    stock: 18,
    sku: 'ML-BRS-01',
    rating: 4.7,
    soldCount: 76,
    location: 'Jakarta Selatan',
    tag: 'Spesial',
    images: [
      { id: 'img-1', label: 'Tampak Sandwich Utuh', subLabel: 'Brioche Bun dengan Isian Melimpah' },
      { id: 'img-2', label: 'Daging Brisket 12 Jam', subLabel: 'Smoked Ring Juicy & Tender' },
    ],
    specs: [
      { label: 'Daging', value: 'US Beef Brisket Smoked' },
      { label: 'Roti', value: 'Brioche Bun Butter' },
      { label: 'Pelengkap', value: 'Arugula, Cheddar, Honey Mustard' },
    ],
    reviews: [
      {
        id: 'rev-6',
        userName: 'Kevin Sanjaya',
        userCity: 'Jakarta Barat',
        rating: 5,
        date: '4 hari yang lalu',
        comment: 'Daging brisketnya luar biasa empuk dan juicy, asap kayunya berasa banget!',
      },
    ],
  },
  {
    id: 'c-5',
    name: 'Ceremonial Grade Uji Kyoto Pure Matcha Latte 350ml',
    category: 'Tea',
    price: 35000,
    originalPrice: 40000,
    description: 'Bubuk matcha kasta seremonial murni dari perkebunan teh Uji, Kyoto, Jepang. Digiling menggunakan batu tradisional dan dikocok dengan microfoam susu segar yang lembut. Kaya akan antioksidan L-theanine untuk ketenangan fokus.',
    stock: 50,
    sku: 'TEA-MTC-01',
    rating: 4.9,
    soldCount: 115,
    location: 'Jakarta Selatan',
    tag: 'Official Store',
    images: [
      { id: 'img-1', label: 'Matcha Latte Hijau Pekat', subLabel: 'Ceremonial Grade Uji Kyoto' },
      { id: 'img-2', label: 'Bubuk Matcha Murni', subLabel: 'Warna Hijau Giok Alami' },
    ],
    specs: [
      { label: 'Asal Daun Teh', value: 'Uji, Prefektur Kyoto, Jepang' },
      { label: 'Grade', value: 'Ceremonial First Harvest' },
      { label: 'Pemanis', value: 'Sedikit Gula Tebu Alami (Bisa Request Less Sweet)' },
    ],
    reviews: [
      {
        id: 'rev-7',
        userName: 'Nadya Putri',
        userCity: 'Depok',
        rating: 5,
        date: '5 hari yang lalu',
        comment: 'Matchanya asli Jepang banget, tidak pahit berlebihan dan ada rasa umami yang khas.',
      },
    ],
  },
  {
    id: 'c-6',
    name: 'Pain au Chocolat Belgian Dark Chocolate Pastry',
    category: 'Bakery',
    price: 28000,
    originalPrice: 32000,
    description: 'Pastry mentega renyah dengan isian dua batang cokelat dark Belgia 70% yang meleleh saat dipanaskan.',
    stock: 30,
    sku: 'BAK-CHO-02',
    rating: 4.8,
    soldCount: 84,
    location: 'Jakarta Selatan',
    images: [
      { id: 'img-1', label: 'Pastry Cokelat Belgia', subLabel: 'Dua Batang Dark Chocolate 70%' },
      { id: 'img-2', label: 'Lapisan Renyah Flaky', subLabel: 'Mentega Prancis Berkualitas' },
    ],
    specs: [
      { label: 'Isian Cokelat', value: 'Belgian Dark Chocolate 70%' },
      { label: 'Berat', value: '90 Gram' },
    ],
    reviews: [
      {
        id: 'rev-8',
        userName: 'Hendri Wijaya',
        userCity: 'Bekasi',
        rating: 5,
        date: '1 minggu yang lalu',
        comment: 'Cokelatnya lumer dan tidak terlalu manis, perpaduan pas dengan kopi hitam.',
      },
    ],
  },
  {
    id: 'c-7',
    name: 'Artisan Chocochip Sea Salt Soft Baked Cookie',
    category: 'Snacks',
    price: 18000,
    originalPrice: 22000,
    description: 'Kue kering artisan bertekstur lembut (chewy) dengan taburan lelehan cokelat Belgia dan garam laut Bali.',
    stock: 55,
    sku: 'SNK-CKI-001',
    rating: 4.9,
    soldCount: 160,
    location: 'Jakarta Selatan',
    tag: 'Terlaris',
    images: [
      { id: 'img-1', label: 'Soft Cookie Chocochip', subLabel: 'Lumeran Cokelat Melimpah' },
      { id: 'img-2', label: 'Taburan Sea Salt Bali', subLabel: 'Sensasi Manis & Gurih Seimbang' },
    ],
    specs: [
      { label: 'Tekstur', value: 'Crispy Edges & Soft Fudgy Center' },
      { label: 'Berat', value: '75 Gram' },
    ],
    reviews: [
      {
        id: 'rev-9',
        userName: 'Dina Mariana',
        userCity: 'Jakarta Selatan',
        rating: 5,
        date: '3 hari yang lalu',
        comment: 'Cookies terenak! Sea salt nya bikin rasa cokelatnya makin gurih dan tidak enek.',
      },
    ],
  },
  {
    id: 'c-8',
    name: 'Sparkling Lemon Cold Brew Arabica 330ml',
    category: 'Coffee',
    price: 30000,
    originalPrice: 35000,
    description: 'Kopi cold brew seduh dingin 24 jam berpadu dengan sari lemon asli dan soda segar berkarbonasi.',
    stock: 45,
    sku: 'KOP-COL-03',
    rating: 4.7,
    soldCount: 62,
    location: 'Jakarta Selatan',
    images: [
      { id: 'img-1', label: 'Botol Kaca Cold Brew 330ml', subLabel: 'Kopi Dingin Berkarbonasi Segar' },
    ],
    specs: [
      { label: 'Proses Seduh', value: 'Cold Maceration 24 Hours' },
      { label: 'Volume', value: '330 ml' },
    ],
    reviews: [
      {
        id: 'rev-10',
        userName: 'Ahmad Fauzi',
        userCity: 'Jakarta Timur',
        rating: 5,
        date: '2 minggu yang lalu',
        comment: 'Sangat menyegarkan diminum siang hari! Asam lemon dan aroma kopinya nge-blend pas.',
      },
    ],
  },
];
