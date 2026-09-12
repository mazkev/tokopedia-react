export const categories = [
  { name: 'Elektronik', icon: '💻' },
  { name: 'Fashion Pria', icon: '👔' },
  { name: 'Fashion Wanita', icon: '👗' },
  { name: 'Perhiasan', icon: '💍' },
  { name: 'Handphone', icon: '📱' },
  { name: 'Komputer', icon: '🖥️' },
  { name: 'Makanan', icon: '🍜' },
  { name: 'Kesehatan', icon: '💊' },
  { name: 'Olahraga', icon: '⚽' },
  { name: 'Otomotif', icon: '🚗' },
  { name: 'Mainan', icon: '🧸' },
  { name: 'Buku', icon: '📚' },
  { name: 'Perawatan', icon: '🧴' },
  { name: 'Rumah Tangga', icon: '🏠' },
  { name: 'Gaming', icon: '🎮' },
];

export const services = [
  { label: 'Top-Up', icon: '💳' },
  { label: 'Tagihan', icon: '📄' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Official Store', icon: '🏪' },
  { label: 'Pulsa', icon: '📶' },
  { label: 'Listrik', icon: '⚡' },
  { label: 'BPJS', icon: '🏥' },
  { label: 'Streaming', icon: '🎬' },
  { label: 'Investasi', icon: '📈' },
  { label: 'Donasi', icon: '❤️' },
];

const locations = [
  'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Pusat',
  'Bandung', 'Surabaya', 'Tangerang',
  'Bekasi', 'Depok', 'Bogor', 'Yogyakarta',
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    price: 21999000,
    originalPrice: 24999000,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
    rating: 4.9,
    sold: 450,
    shop: 'iBox Official',
    location: 'Jakarta Pusat',
    badge: 'official',
    condition: 'Baru',
    category: 'Elektronik',
    stock: 50,
  },
  {
    id: 'prod-002',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    price: 4999000,
    originalPrice: 5999000,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    rating: 4.8,
    sold: 1200,
    shop: 'Sony Audio Official',
    location: 'Jakarta Selatan',
    badge: 'official',
    condition: 'Baru',
    category: 'Elektronik',
    stock: 80,
  },
  {
    id: 'prod-003',
    name: 'Kaos Polos Pria Heavyweight Cotton Combed 24s',
    price: 65000,
    originalPrice: 85000,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    rating: 4.7,
    sold: 15400,
    shop: 'BasicWear ID',
    location: 'Bandung',
    badge: 'power-merchant',
    condition: 'Baru',
    category: 'Fashion Pria',
    stock: 500,
  },
  {
    id: 'prod-004',
    name: 'Jam Tangan Pria Automatic Skeleton Luxury Stainless',
    price: 350000,
    originalPrice: 700000,
    discount: 50,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    rating: 4.6,
    sold: 890,
    shop: 'TimeMaster Store',
    location: 'Jakarta Barat',
    badge: 'power-merchant',
    condition: 'Baru',
    category: 'Perhiasan',
    stock: 100,
  },
  {
    id: 'prod-005',
    name: 'Sepatu Sneaker Pria Casual Sporty Slip-on Breathable',
    price: 189000,
    originalPrice: 299000,
    discount: 36,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    rating: 4.8,
    sold: 3200,
    shop: 'SneakerZone Official',
    location: 'Surabaya',
    badge: 'official',
    condition: 'Baru',
    category: 'Fashion Pria',
    stock: 200,
  },
];

let cachedProducts = null;

export async function fetchAllProducts() {
  if (cachedProducts && cachedProducts.length > 0) return cachedProducts;

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.length > 0) {
        cachedProducts = json.data;
        return cachedProducts;
      }
    }
  } catch (e) {
    console.warn('Gagal fetch /api/products, menggunakan data Tokopedia lokal:', e);
  }

  cachedProducts = DEFAULT_PRODUCTS;
  return cachedProducts;
}

export async function fetchFlashSaleProducts() {
  const all = await fetchAllProducts();
  return all.slice(0, 6).map((p) => {
    const discount = p.discount > 0 ? p.discount : 40;
    const original = p.originalPrice || Math.round(p.price / (1 - discount / 100));
    return {
      ...p,
      discount,
      original,
      price: p.price,
      sold: p.sold || 50,
      stock: p.stock || 100,
    };
  });
}

export function filterProducts(products, filters = {}) {
  return products.filter((p) => {
    if (filters.condition && p.condition !== filters.condition) return false;
    if (filters.location && p.location !== filters.location) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export { locations };
