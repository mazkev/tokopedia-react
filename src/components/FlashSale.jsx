import { useState, useEffect } from 'react';
import { fetchFlashSaleProducts } from '../data/products';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function FlashSale({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [time, setTime] = useState({ h: 2, m: 30, s: 0 });

  useEffect(() => {
    fetchFlashSaleProducts().then(setProducts);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) { s--; }
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  if (products.length === 0) return null;

  return (
    <section className="flash-sale-section" id="flash-sale-section">
      <div className="flash-sale-card">
        <div className="flash-sale-header">
          <div className="flash-sale-title">
            <span className="lightning">⚡</span>
            <h2>Kejar Diskon</h2>
            <div className="countdown">
              <span className="countdown-unit">{pad(time.h)}</span>
              <span className="countdown-sep">:</span>
              <span className="countdown-unit">{pad(time.m)}</span>
              <span className="countdown-sep">:</span>
              <span className="countdown-unit">{pad(time.s)}</span>
            </div>
          </div>
          <a href="#" className="flash-sale-link">
            Lihat Semua →
          </a>
        </div>

        <div className="flash-sale-products">
          {products.map((p) => (
            <div 
              className="flash-product-card" 
              key={p.id}
              onClick={() => onProductClick && onProductClick(p)}
            >
              <div className="flash-product-img">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  loading="lazy" 
                  decoding="async" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
                  }}
                />
                <span className="flash-discount-badge">{p.discount}%</span>
              </div>
              <div className="flash-product-info">
                <div className="flash-product-price">{formatPrice(p.price)}</div>
                <div className="flash-product-original">{formatPrice(p.original)}</div>
                <div className="stock-bar">
                  <div
                    className="stock-fill"
                    style={{ width: `${(p.sold / p.stock) * 100}%` }}
                  />
                </div>
                <div className="stock-text">
                  {p.sold >= p.stock * 0.8 ? 'Segera habis!' : `Tersisa ${p.stock - p.sold}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

