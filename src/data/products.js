const API_URL = 'https://fakestoreapi.com/products';

// Convert USD to IDR (approximate)
const USD_TO_IDR = 16000;

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

const shopsByCategory = {
  "electronics": { name: 'TechZone Official', badge: 'official' },
  "jewelery": { name: 'GoldStar Jewelry', badge: 'official' },
  "men's clothing": { name: 'FashionHub ID', badge: 'power-merchant' },
  "women's clothing": { name: 'StyleKu Store', badge: 'power-merchant' },
};

function mapProduct(item, index) {
  const priceIDR = Math.round(item.price * USD_TO_IDR);
  const hasDiscount = Math.random() > 0.3;
  const discountPercent = hasDiscount ? Math.floor(Math.random() * 40) + 10 : 0;
  const originalPrice = hasDiscount
    ? Math.round(priceIDR / (1 - discountPercent / 100))
    : null;
  const shop = shopsByCategory[item.category] || { name: 'TokoMart', badge: null };
  const location = locations[index % locations.length];
  const condition = Math.random() > 0.15 ? 'Baru' : 'Bekas';

  return {
    id: item.id,
    name: item.title,
    price: priceIDR,
    originalPrice,
    discount: discountPercent,
    image: item.image,
    rating: item.rating.rate,
    sold: item.rating.count,
    shop: shop.name,
    location,
    badge: shop.badge,
    condition,
    category: item.category,
  };
}

// Cache fetched products
let cachedProducts = null;

export async function fetchAllProducts() {
  if (cachedProducts) return cachedProducts;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    cachedProducts = data.map(mapProduct);
    return cachedProducts;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function fetchFlashSaleProducts() {
  const all = await fetchAllProducts();
  // Pick 6 products and give them flash sale pricing
  return all.slice(0, 6).map((p) => {
    const discount = Math.floor(Math.random() * 30) + 40; // 40-70%
    const original = Math.round(p.price / (1 - discount / 100));
    return {
      ...p,
      discount,
      original,
      price: p.price,
      sold: Math.floor(Math.random() * 80) + 20,
      stock: 100,
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
