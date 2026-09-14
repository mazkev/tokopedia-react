import { useState, useEffect } from 'react';

function formatPrice(n) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function ProductDetail({ product, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist }) {
  const p = product || {};
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(p.image);
  const [activeTab, setActiveTab] = useState('detail'); // 'detail' | 'spec' | 'info'

  // Pastikan saat produk berganti, gambar & tab kembali ke state awal
  useEffect(() => {
    setSelectedImage(p.image);
    setActiveTab('detail');
    setQuantity(1);
  }, [p.id, p.image]);

  // Siapkan galeri foto sudut berbeda untuk produk
  const getGalleryImages = () => {
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      return p.images;
    }
    const nameLower = (p.name || '').toLowerCase();
    if (nameLower.includes('iphone')) {
      return [
        p.image,
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
      ];
    }
    if (nameLower.includes('sony') || nameLower.includes('headphone')) {
      return [
        p.image,
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80'
      ];
    }
    if (nameLower.includes('kaos') || nameLower.includes('cotton')) {
      return [
        p.image,
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80'
      ];
    }
    if (nameLower.includes('jam') || nameLower.includes('watch') || nameLower.includes('skeleton')) {
      return [
        p.image,
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80',
        'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&q=80'
      ];
    }
    if (nameLower.includes('sepatu') || nameLower.includes('sneaker')) {
      return [
        p.image,
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80'
      ];
    }
    return [
      p.image,
      p.image + (p.image?.includes('?') ? '&' : '?') + 'auto=format&fit=crop&crop=faces,edges',
      p.image + (p.image?.includes('?') ? '&' : '?') + 'auto=format&fit=crop&crop=center'
    ];
  };

  const galleryList = getGalleryImages();

  return (
    <div className="product-detail-container animate-in">
      <div className="product-detail-inner">
        {/* Left: Images */}
        <div className="product-detail-gallery">
          <div className="main-image">
            <img 
              src={selectedImage || p.image} 
              alt={p.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
              }} 
            />
          </div>
          <div className="thumbnail-list">
            {galleryList.map((imgUrl, idx) => (
              <div 
                key={idx}
                className={`thumb ${selectedImage === imgUrl ? 'active' : ''}`}
                onClick={() => setSelectedImage(imgUrl)}
                onMouseEnter={() => setSelectedImage(imgUrl)}
                title={`Lihat foto ${idx + 1}`}
              >
                <img 
                  src={imgUrl} 
                  alt={`${p.name} angle ${idx + 1}`}
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'; 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Info & Tabs */}
        <div className="product-detail-info">
          <h1 className="product-title">{p.name}</h1>
          <div className="product-stats">
            <span className="stat-item">Terjual <span className="stat-val">{p.sold || 100}+</span></span>
            <span className="stat-sep">•</span>
            <span className="stat-item">★ <span className="stat-val">{p.rating || 4.8}</span></span>
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
          
          {/* Interactive Navigation Tabs */}
          <div className="product-tabs" role="tablist">
            <div 
              className={`tab ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('detail')}
              role="tab"
              aria-selected={activeTab === 'detail'}
            >
              Detail
            </div>
            <div 
              className={`tab ${activeTab === 'spec' ? 'active' : ''}`}
              onClick={() => setActiveTab('spec')}
              role="tab"
              aria-selected={activeTab === 'spec'}
            >
              Spesifikasi
            </div>
            <div 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
              role="tab"
              aria-selected={activeTab === 'info'}
            >
              Info Penting
            </div>
          </div>
          
          {/* Tab 1: Detail Produk */}
          {activeTab === 'detail' && (
            <div className="product-description animate-in">
              <p>Kondisi: <span className="bold">{p.condition || 'Baru'}</span></p>
              <p>Min. Pemesanan: <span className="bold">1 Buah</span></p>
              <p>Etalase: <span className="bold" style={{color: 'var(--green-primary)'}}>{p.category || 'Promo Hari Ini'}</span></p>
              <div className="desc-text">
                {p.description ? (
                  p.description
                ) : (
                  <>
                    Produk original berkualitas tinggi dari <strong>{p.shop || 'Tokopedei Official Store'}</strong>. 
                    Setiap barang melewati proses Quality Control ketat sebelum dikemas dan dikirim ke alamat pembeli.
                    <br/><br/>
                    <strong>Keunggulan Produk:</strong><br/>
                    • 100% Produk Original & Bergaransi Resmi<br/>
                    • Pengemasan aman dengan Bubble Wrap tebal berlapis gratis<br/>
                    • Pengiriman cepat dengan dukungan Bebas Ongkir ke seluruh Indonesia<br/>
                    • Jaminan uang kembali jika barang terbukti tidak sesuai deskripsi
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Spesifikasi Produk */}
          {activeTab === 'spec' && (
            <div className="product-specifications animate-in" style={{ marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)', width: '35%' }}>Kategori</td>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--green-primary)' }}>{p.category || 'Elektronik'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Kondisi</td>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{p.condition || 'Baru'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Berat Satuan</td>
                    <td style={{ padding: '10px 0' }}>500 gram</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Garansi</td>
                    <td style={{ padding: '10px 0' }}>12 Bulan Resmi Distributor</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Asal Produk</td>
                    <td style={{ padding: '10px 0' }}>Original Imported / Local Official</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Stok Tersedia</td>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{p.stock || '50'} unit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Info Penting */}
          {activeTab === 'info' && (
            <div className="product-important-info animate-in" style={{ marginTop: '16px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '14px', background: '#F8F9FA', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--green-primary)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>📹 Ketentuan Komplain & Garansi</strong>
                Wajib menyertakan video unboxing utuh tanpa jeda mulai dari paket sebelum dibuka hingga produk dicoba. Klaim tanpa video unboxing tidak dapat diproses.
              </div>
              <div style={{ marginBottom: '14px', background: '#F8F9FA', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #03AC0E' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>🚚 Jam Operasional Pengiriman</strong>
                Pesanan yang masuk sebelum pukul 15.00 WIB akan diproses dan diserahkan ke kurir di hari yang sama (Senin - Sabtu). Hari Minggu dan libur nasional libur.
              </div>
              <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #FA591D' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>🛡️ Asuransi Tokopedei</strong>
                Seluruh barang bernilai tinggi otomatis dilindungi proteksi pengiriman resmi Tokopedei.
              </div>
            </div>
          )}

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
              <div className="stock-info">Stok: <b>{p.stock || 99}+</b></div>
            </div>
            <div className="subtotal">
              <div className="label">Subtotal</div>
              <div className="amount">{formatPrice(p.price * quantity)}</div>
            </div>
            <div className="main-btns">
              <button className="btn-add-cart" onClick={() => onAddToCart && onAddToCart(p, quantity)}>+ Keranjang</button>
              <button className="btn-buy" onClick={() => onBuyNow && onBuyNow(p, quantity)}>Beli Langsung</button>
            </div>
            <div className="action-footer">
              <button onClick={() => alert("Fitur chat toko sedang dalam pengembangan.")}>💬 Chat</button>
              <button 
                onClick={() => onToggleWishlist && onToggleWishlist(p)}
                style={isWishlisted ? { color: '#E02424', borderColor: '#E02424', background: '#FDF2F2', fontWeight: 'bold' } : {}}
              >
                {isWishlisted ? '❤️ Tersimpan' : '🤍 Wishlist'}
              </button>
              <button onClick={() => {
                const productId = p.id || p._id;
                const url = window.location.origin + window.location.pathname + '?product=' + productId;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  alert("Link produk berhasil disalin ke clipboard:\n" + url);
                }
              }}>🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
