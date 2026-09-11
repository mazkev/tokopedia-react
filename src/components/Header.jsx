import { useState, useEffect } from 'react';
import { categories } from '../data/products';

export default function Header({ cartCount, cartItems = [], user, goHome, goCart, goOrders, goLogin, goRegister, goAdmin, onLogout, onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [notifCount, setNotifCount] = useState(5);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    onSearch(val);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(search);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-links">
            <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }}>Tentang Tokopedia</a>
            <a href="#">Mitra Tokopedia</a>
            <a href="#">Mulai Berjualan</a>
            <a href="#">Promo</a>
          </div>
          <div className="top-bar-links">
            <a href="#">Tokopedia Care</a>
            <a href="#">Download App</a>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <div className="logo" onClick={goHome} style={{ cursor: 'pointer' }}>
            Toko<span>pedia</span>
          </div>

          {/* Category Mega Menu */}
          <button className="category-trigger" id="category-menu-trigger">
            <span>☰</span>
            <span>Kategori</span>
            <div className="mega-menu" id="mega-menu">
              {categories.map((cat) => (
                <a key={cat.name} className="mega-menu-item" href="#">
                  <div className="mega-menu-icon">{cat.icon}</div>
                  <span>{cat.name}</span>
                </a>
              ))}
            </div>
          </button>

          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              className="search-bar"
              type="text"
              placeholder="Cari di Tokopedia"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>


          {/* Actions */}
          <div className="header-actions">
            {/* Cart Dropdown */}
            <div className="header-action-wrapper">
              <button className="header-action-btn" id="cart-btn" title="Keranjang" onClick={goCart}>
                🛒
                <span className="badge">{cartCount}</span>
              </button>
              <div className="action-dropdown cart-dropdown">
                <div className="dropdown-header">
                  <h3>Keranjang ({cartCount})</h3>
                  <a href="#" onClick={(e) => { e.preventDefault(); goCart(); }}>Lihat Sekarang</a>
                </div>
                <div className="dropdown-body">
                  {cartItems.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#717171' }}>
                      <p>Wah, keranjangmu kosong!</p>
                    </div>
                  ) : (
                    cartItems.slice(0, 3).map(item => (
                      <div key={item.id} className="dropdown-item" onClick={goCart}>
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-qty">{item.qty} Barang</p>
                        </div>
                        <div className="item-price">Rp{item.price.toLocaleString('id-ID')}</div>
                      </div>
                    ))
                  )}
                  {cartItems.length > 3 && (
                    <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--green-primary)', fontWeight: '700' }}>
                      +{cartItems.length - 3} barang lainnya
                    </div>
                  )}
                </div>
                <div className="dropdown-footer">
                  <button className="btn-view-cart" onClick={goCart}>Lihat Keranjang</button>
                </div>
              </div>
            </div>

            {/* Notification Dropdown */}
            <div className="header-action-wrapper">
              <button className="header-action-btn" id="notif-btn" title="Notifikasi" onClick={() => setNotifCount(0)}>
                🔔
                {notifCount > 0 && <span className="badge">{notifCount}</span>}
              </button>
              <div className="action-dropdown notif-dropdown">
                <div className="dropdown-header">
                  <h3>Notifikasi</h3>
                  <a href="#">Pengaturan</a>
                </div>
                <div className="dropdown-tabs">
                  <div className="tab active">Transaksi</div>
                  <div className="tab">Update</div>
                </div>
                <div className="dropdown-body">
                  <div className="dropdown-item notif" onClick={() => { setNotifCount(0); goOrders(); }}>
                    <div className="notif-icon status">📦</div>
                    <div className="item-info">
                      <p className="notif-title">Pesanan Baru</p>
                      <p className="notif-desc">Pesananmu telah berhasil dibuat. Cek statusnya di sini.</p>
                      <p className="notif-time">Baru saja</p>
                    </div>
                  </div>
                  <div className="dropdown-item notif">
                    <div className="notif-icon status">📦</div>
                    <div className="item-info">
                      <p className="notif-title">Pesanan Selesai</p>
                      <p className="notif-desc">Pesanan #INV/2023/123 telah diterima.</p>
                      <p className="notif-time">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="dropdown-item notif">
                    <div className="notif-icon promo">🎉</div>
                    <div className="item-info">
                      <p className="notif-title">Promo Menunggumu!</p>
                      <p className="notif-desc">Diskon hingga 90% untuk Gadget pilihan.</p>
                      <p className="notif-time">5 jam yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <button className="header-action-btn" id="mail-btn" title="Pesan">
              ✉️
            </button>

            <div className="header-divider"></div>

            {user ? (
              <div className="header-user-profile">
                <div className="user-avatar" title={user.name || user.email || 'User'}>
                  {((user.name || user.email || 'U')[0]).toUpperCase()}
                </div>
                <div className="user-dropdown-wrapper">
                  <div className="user-name-label">{user.name || user.email || 'User'}</div>
                  <div className="user-actions-dropdown">
                    {user.role === 'admin' && (
                      <button onClick={goAdmin}>Admin Dashboard</button>
                    )}
                    <button onClick={() => { goOrders(); }}>Pembelian</button>
                    <button>Wishlist</button>
                    <button>Pengaturan</button>
                    <div className="dropdown-divider"></div>
                    <button className="logout-btn" onClick={onLogout}>Keluar</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-login" onClick={goLogin}>Masuk</button>
                <button className="btn-register" onClick={goRegister}>Daftar</button>
              </div>
            )}
          </div>
        </div>
      </header>


    </>
  );
}

