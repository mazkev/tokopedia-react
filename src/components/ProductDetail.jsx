import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function ProductDetail({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const p = product;

  return (
    <div className="product-detail-container animate-in">
      <div className="product-detail-inner">
        {/* Left: Images */}
        <div className="product-detail-gallery">
          <div className="main-image">
            <img src={p.image} alt={p.name} />
          </div>
          <div className="thumbnail-list">
            <div className="thumb active"><img src={p.image} /></div>
            <div className="thumb"><img src={p.image} /></div>
            <div className="thumb"><img src={p.image} /></div>
          </div>
        </div>

        {/* Middle: Info */}
        <div className="product-detail-info">
          <h1 className="product-title">{p.name}</h1>
          <div className="product-stats">
            <span className="stat-item">Terjual <span className="stat-val">{p.sold}+</span></span>
            <span className="stat-sep">•</span>
            <span className="stat-item">★ <span className="stat-val">{p.rating}</span></span>
          </div>
          <div className="product-price-section">
            <div className="main-price">{formatPrice(p.price)}</div>
            {p.discount > 0 && (
              <div className="discount-info">
                <span className="percent">{p.discount}%</span>
                <span className="original">{formatPrice(p.originalPrice)}</span>
              </div>
            )}
          </div>
          
          <div className="detail-divider"></div>
          
          <div className="product-tabs">
            <div className="tab active">Detail</div>
            <div className="tab">Spesifikasi</div>
            <div className="tab">Info Penting</div>
          </div>
          
          <div className="product-description">
            <p>Kondisi: <span className="bold">{p.condition}</span></p>
            <p>Min. Pemesanan: <span className="bold">1 Buah</span></p>
            <p>Etalase: <span className="bold" style={{color: 'var(--green-primary)'}}>Promo Hari Ini</span></p>
            <div className="desc-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              <br/><br/>
              - Kualitas Premium<br/>
              - Bergaransi Resmi<br/>
              - Pengiriman Cepat
            </div>
          </div>

          <div className="detail-divider"></div>

          <div className="shop-info">
            <div className="shop-avatar">
              {p.badge === 'official' ? '🏪' : '🏬'}
            </div>
            <div className="shop-details">
              <div className="shop-name">
                {p.shop} 
                {p.badge && <span className={`badge-icon ${p.badge}`}></span>}
              </div>
              <div className="shop-location">{p.location}</div>
            </div>
            <button className="btn-follow">Follow</button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="product-detail-actions">
          <div className="action-card">
            <h3>Atur jumlah dan catatan</h3>
            <div className="quantity-control">
              <div className="qty-btns">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <div className="stock-info">Stok: <b>99+</b></div>
            </div>
            <div className="subtotal">
              <div className="label">Subtotal</div>
              <div className="amount">{formatPrice(p.price * quantity)}</div>
            </div>
            <div className="main-btns">
              <button className="btn-add-cart" onClick={onAddToCart}>+ Keranjang</button>
              <button className="btn-buy">Beli Langsung</button>
            </div>
            <div className="action-footer">
              <button>💬 Chat</button>
              <button>❤️ Wishlist</button>
              <button>🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
