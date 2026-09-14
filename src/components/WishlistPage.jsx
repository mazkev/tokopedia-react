function formatPrice(n) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function WishlistPage({ items = [], onAddToCart, onRemove, onGoHome, onProductClick }) {
  if (items.length === 0) {
    return (
      <div className="cart-page-empty animate-in">
        <div className="empty-content">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤍</div>
          <h2>Wishlist Belanjamu Masih Kosong</h2>
          <p>Yuk, simpan barang-barang impianmu dan pantau diskonnya di sini!</p>
          <button className="btn-shop-now" onClick={onGoHome}>Cari Produk</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container animate-in" style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Wishlist Saya <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--green-primary)' }}>({items.length} Produk)</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Daftar produk idaman yang kamu simpan untuk dibeli nanti
          </p>
        </div>
        <button 
          onClick={onGoHome}
          style={{ 
            background: 'white', 
            border: '1px solid #E5E7EB', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 600, 
            fontSize: '14px',
            color: 'var(--text-primary)'
          }}
        >
          ← Lanjut Belanja
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        {items.map((p) => (
          <div 
            key={p.id} 
            className="product-card animate-in" 
            style={{ 
              background: 'white', 
              borderRadius: '12px', 
              border: '1px solid #E8E8E8', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => onProductClick && onProductClick(p)}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#F8F9FA' }}>
              <img 
                src={p.image} 
                alt={p.name} 
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
                }}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove(p);
                }}
                title="Hapus dari wishlist"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                🗑️
              </button>
            </div>

            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {formatPrice(p.price)}
                </div>
                {p.discount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ background: '#FFEAEF', color: '#E02424', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                      {p.discount}%
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>
                      {formatPrice(p.originalPrice)}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  📍 {p.location || 'Indonesia'}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart && onAddToCart(p, 1);
                }}
                style={{
                  width: '100%',
                  background: 'var(--green-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                + Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
