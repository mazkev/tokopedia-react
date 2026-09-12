function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

function formatSold(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'rb';
  return n.toString();
}

export default function ProductCard({ product, onClick }) {
  const p = product;

  return (
    <div className="product-card animate-in" onClick={() => onClick && onClick(p)}>
      <div className="product-img">
        <img 
          src={p.image} 
          alt={p.name} 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
          }}
        />
        {p.badge && (
          <div className={`product-badge ${p.badge === 'official' ? 'official' : 'power-merchant'}`}>
            {p.badge === 'official' ? '✓ Official Store' : '⚡ Power Merchant'}
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{p.name}</div>
        <div className="product-price">{formatPrice(p.price)}</div>
        {p.discount > 0 && (
          <div className="product-discount-row">
            <span className="product-discount-percent">{p.discount}%</span>
            <span className="product-original-price">{formatPrice(p.originalPrice)}</span>
          </div>
        )}
        <div className="product-meta">
          <span className="product-location">📍 {p.location}</span>
          <span className="product-rating">
            <span className="star">★</span> {p.rating}
            <span className="product-sold">({formatSold(p.sold)} terjual)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

