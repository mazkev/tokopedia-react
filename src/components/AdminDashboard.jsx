import { useState, useRef } from 'react';
import { api } from '../services/api';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function AdminDashboard({ orders, products, onUpdateStatus, onUpdateProduct, onAddProduct, onGoHome, onLogout, addNotification }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'statistics', 'profile', 'config'
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState(null);
  const [productModal, setProductModal] = useState(null); // { mode: 'add' | 'edit', data: { ... } }
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Shop & Config states
  const [shopInfo, setShopInfo] = useState({
    name: 'Tokopedei Official Store',
    desc: 'Toko resmi yang menyediakan berbagai kebutuhan barang original dengan harga terbaik.',
    location: 'Jakarta Selatan',
    logo: 'https://images.tokopedia.net/img/cache/215-square/Gv9S2W/2022/10/5/4e488f2f-1e96-41f2-9f37-1c210d54a638.png'
  });

  const [sysConfig, setSysConfig] = useState({
    maintenance: false,
    freeShipping: true,
    notifEmail: true,
    taxRate: 11
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'Dibatalkan')
    .reduce((acc, o) => acc + o.total, 0);

  const stats = {
    totalOrders: orders.length,
    revenue: totalRevenue,
    totalProducts: products.length,
    avgOrder: orders.length > 0 ? totalRevenue / orders.length : 0
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'Semua' || o.status === filterStatus;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const statusOptions = ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

  // Export orders to CSV file (UTF-8 with BOM for Excel)
  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      if (addNotification) addNotification("⚠️ Tidak ada data pesanan untuk diekspor.");
      return;
    }

    const headers = [
      "No Invoice",
      "Tanggal Transaksi",
      "Nama Pembeli",
      "ID Pembeli",
      "Total Belanja (Rp)",
      "Metode Pembayaran",
      "Status Pesanan",
      "Daftar Barang"
    ];

    const rows = filteredOrders.map(o => {
      const itemsDetail = o.items ? o.items.map(it => `${it.name} (x${it.qty || 1})`).join('; ') : '';
      return [
        `"${o.id || ''}"`,
        `"${o.date || ''}"`,
        `"${(o.userName || '').replace(/"/g, '""')}"`,
        `"${(o.userId || '').replace(/"/g, '""')}"`,
        o.total || 0,
        `"${o.paymentMethod?.toUpperCase() || 'QRIS'}"`,
        `"${o.status || ''}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Laporan_Penjualan_Tokopedei_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (addNotification) {
      addNotification(`📥 Berhasil mengekspor ${filteredOrders.length} data pesanan ke file CSV!`);
    }
  };

  const handleOpenAddProduct = () => {
    setProductModal({
      mode: 'add',
      data: {
        name: '',
        price: '',
        originalPrice: '',
        discount: 0,
        category: 'Elektronik',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        badge: 'official',
        condition: 'Baru',
        shop: shopInfo.name,
        location: shopInfo.location,
        rating: 5.0,
        sold: 0
      }
    });
    setUploadError('');
  };

  const handleOpenEditProduct = (product) => {
    setProductModal({
      mode: 'edit',
      data: { ...product }
    });
    setUploadError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar, maksimal 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await api.uploadProductImage(file);
      if (res && (res.imageUrl || res.path)) {
        const finalUrl = res.imageUrl || res.path;
        setProductModal(prev => ({
          ...prev,
          data: { ...prev.data, image: finalUrl }
        }));
      }
    } catch (err) {
      console.warn("Gagal upload ke server, fallback preview lokal:", err);
      const previewUrl = URL.createObjectURL(file);
      setProductModal(prev => ({
        ...prev,
        data: { ...prev.data, image: previewUrl }
      }));
      setUploadError("Mode offline: Menggunakan preview lokal.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProductModal = async (e) => {
    e.preventDefault();
    if (!productModal) return;

    const data = {
      ...productModal.data,
      price: parseInt(productModal.data.price) || 0,
      stock: parseInt(productModal.data.stock) || 10,
      discount: parseInt(productModal.data.discount) || 0,
      originalPrice: productModal.data.originalPrice ? parseInt(productModal.data.originalPrice) : (parseInt(productModal.data.price) || 0),
    };

    if (productModal.mode === 'edit') {
      onUpdateProduct(data);
    } else if (productModal.mode === 'add') {
      if (onAddProduct) {
        await onAddProduct(data);
      }
    }
    setProductModal(null);
  };

  const handleShopUpdate = (e) => {
    e.preventDefault();
    addNotification("Profil Toko berhasil diperbarui!");
  };

  const handleConfigUpdate = (key, val) => {
    setSysConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="admin-container animate-in">
      {/* SELLER CENTER TOP NAVBAR */}
      <header className="admin-top-navbar">
        <div className="admin-top-navbar-left">
          <div className="admin-brand" onClick={onGoHome} title="Ke Beranda Tokopedei">
            <img src="/tokopedei-icon.svg" alt="Tokopedei" className="admin-brand-icon" />
            <div className="admin-brand-text">
              <span className="admin-brand-title">tokopedei</span>
              <span className="admin-brand-badge">SELLER CENTER</span>
            </div>
          </div>
          <div className="admin-navbar-divider"></div>
          <div className="admin-store-status">
            <span className="status-dot-pulse"></span>
            <div className="store-status-text">
              <span className="store-name">{shopInfo.name}</span>
              <span className="store-badge">Official Store • Aktif</span>
            </div>
          </div>
        </div>

        <div className="admin-top-navbar-center">
          <div className="admin-nav-breadcrumb">
            <span className="breadcrumb-root">Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {activeTab === 'orders' && '📦 Kelola Pesanan'}
              {activeTab === 'products' && '🛍️ Manajemen Produk'}
              {activeTab === 'statistics' && '📊 Statistik Penjualan'}
              {activeTab === 'profile' && '🏪 Profil Toko'}
              {activeTab === 'config' && '⚙️ Konfigurasi Sistem'}
            </span>
          </div>
        </div>

        <div className="admin-top-navbar-right">
          <button 
            type="button" 
            className="admin-btn-quick-add"
            onClick={handleOpenAddProduct}
            title="Tambah produk baru ke katalog"
          >
            <span>➕</span> Tambah Produk
          </button>

          <button 
            type="button" 
            className="admin-btn-storefront"
            onClick={onGoHome}
            title="Kunjungi Toko (Front Office)"
          >
            <span>🌐</span> Kunjungi Toko
          </button>

          <div className="admin-navbar-divider"></div>

          <div className="admin-user-pill">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-meta">
              <span className="admin-user-name">Admin Tokopedei</span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </div>

          <button 
            type="button" 
            className="admin-btn-logout"
            onClick={onLogout}
            title="Keluar dari akun admin"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </header>

      {/* ADMIN WORKSPACE (SIDEBAR + MAIN CONTENT) */}
      <div className="admin-main-layout">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <div className="nav-group">
              <p className="nav-label">MAIN MENU</p>
              <a 
                href="#orders" 
                className={activeTab === 'orders' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); setActiveTab('orders'); setSearchQuery(''); }}
              >
                <span className="nav-icon">📦</span>
                <span className="nav-text">Kelola Pesanan</span>
                {orders.length > 0 && <span className="nav-badge">{orders.length}</span>}
              </a>
              <a 
                href="#products" 
                className={activeTab === 'products' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('products'); setSearchQuery(''); }}
              >
                <span className="nav-icon">🛍️</span>
                <span className="nav-text">Daftar Produk</span>
                <span className="nav-badge-gray">{products.length}</span>
              </a>
              <a 
                href="#statistics" 
                className={activeTab === 'statistics' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('statistics'); }}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Statistik Penjualan</span>
              </a>
            </div>
            <div className="nav-group">
              <p className="nav-label">PENGATURAN</p>
              <a 
                href="#profile" 
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
              >
                <span className="nav-icon">🏪</span>
                <span className="nav-text">Profil Toko</span>
              </a>
              <a 
                href="#config" 
                className={activeTab === 'config' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('config'); }}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Konfigurasi Sistem</span>
              </a>
            </div>
            <div className="nav-footer">
              <a href="#store" onClick={(e) => { e.preventDefault(); onGoHome(); }}>🌐 Lihat Toko</a>
              <a href="#logout" onClick={(e) => { e.preventDefault(); onLogout(); }} className="logout">🚪 Keluar</a>
            </div>
          </nav>
        </aside>

        <main className="admin-content">
          <header className="admin-header-v2">
            <div className="admin-header-title-row">
              <div className="header-title">
                <h1>{
                  activeTab === 'orders' ? 'Pesanan Masuk' : 
                  activeTab === 'products' ? 'Manajemen Produk' : 
                  activeTab === 'statistics' ? 'Statistik Penjualan' :
                  activeTab === 'profile' ? 'Profil Toko' : 'Konfigurasi Sistem'
                }</h1>
                <p>{
                  activeTab === 'orders' ? 'Kelola dan proses transaksi pembeli secara real-time' : 
                  activeTab === 'products' ? 'Atur katalog, stok, dan harga produk toko' :
                  activeTab === 'statistics' ? 'Analisis performa penjualan dan produk terlaris' :
                  activeTab === 'profile' ? 'Atur identitas, logo, dan alamat toko resmi' : 'Pengaturan operasional dan sistem platform'
                }</p>
              </div>
              <div className="admin-header-actions">
                <span className="admin-live-clock">🟢 Backend VPS Terhubung (DigitalOcean)</span>
              </div>
            </div>

            <div className="admin-stats-v2">
              <div className="stat-card-v2">
                <div className="stat-icon revenue">💰</div>
                <div className="stat-data">
                  <span className="label">Total Pendapatan</span>
                  <span className="value">{formatPrice(stats.revenue)}</span>
                </div>
              </div>
              <div className="stat-card-v2">
                <div className="stat-icon orders">📦</div>
                <div className="stat-data">
                  <span className="label">Total Pesanan</span>
                  <span className="value">{stats.totalOrders} Transaksi</span>
                </div>
              </div>
              <div className="stat-card-v2">
                <div className="stat-icon products">🛍️</div>
                <div className="stat-data">
                  <span className="label">Total Produk</span>
                  <span className="value">{stats.totalProducts} Produk</span>
                </div>
              </div>
              <div className="stat-card-v2">
                <div className="stat-icon pending">📈</div>
                <div className="stat-data">
                  <span className="label">Rata-rata Order</span>
                  <span className="value">{formatPrice(stats.avgOrder)}</span>
                </div>
              </div>
            </div>
          </header>

        {activeTab === 'orders' && (
          <div className="admin-orders-container">
            <div className="list-toolbar">
              <div className="toolbar-search">
                <span className="icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari No. Invoice atau Nama Pembeli..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-actions-right">
                <button 
                  type="button" 
                  className="btn-export-csv"
                  onClick={handleExportCSV}
                  title="Unduh laporan transaksi aktif ke file CSV"
                >
                  <span>📥</span> Export Laporan (CSV)
                </button>
              </div>
            </div>

            <div className="toolbar-filters" style={{ marginBottom: '20px' }}>
              {['Semua', ...statusOptions].map(status => (
                <button 
                  key={status}
                  className={filterStatus === status ? 'active' : ''}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Pembeli</th>
                    <th>Item</th>
                    <th>Total</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <span className="inv-tag" onClick={() => setSelectedOrder(order)}>
                          {order.id}
                        </span>
                        <p className="order-date-small">{order.date}</p>
                      </td>
                      <td>
                        <div className="user-cell">
                          <p className="user-name">{order.userName}</p>
                          <p className="user-id">Buyer ID: {order.userId}</p>
                        </div>
                      </td>
                      <td>
                        <div className="items-stack">
                          {order.items.slice(0, 2).map((item, i) => (
                            <img key={i} src={item.image} title={item.name} />
                          ))}
                          {order.items.length > 2 && <span className="more-items">+{order.items.length - 2}</span>}
                        </div>
                      </td>
                      <td><span className="price-bold">{formatPrice(order.total)}</span></td>
                      <td><span className="payment-method-tag">{order.paymentMethod?.toUpperCase() || 'GOPAY'}</span></td>
                      <td>
                        <span className={`status-badge-v2 ${order.status.toLowerCase().replace(' ', '-')}`}>
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-row">
                          <select 
                            className="status-select-v2"
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <button className="btn-icon-view" onClick={() => setSelectedOrder(order)} title="Detail Transaksi">👁️</button>
                          <button 
                            className="btn-icon-print" 
                            onClick={() => setShippingLabelOrder(order)} 
                            title="Cetak Label Pengiriman"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-products-container">
            <div className="list-toolbar">
              <div className="toolbar-search">
                <span className="icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Cari Nama Produk atau Kategori..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-add-product" onClick={handleOpenAddProduct}>➕ Tambah Produk</button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Info Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok/Terjual</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={product.image} alt="" />
                          <div className="info">
                            <p className="name">{product.name}</p>
                            <p className="id">SKU: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="cat-tag">{product.category}</span></td>
                      <td><span className="price-bold">{formatPrice(product.price)}</span></td>
                      <td>
                        <div className="stock-info">
                          <p>Terjual: <b>{product.sold}</b></p>
                        </div>
                      </td>
                      <td>
                        <button className="btn-edit-product" onClick={() => handleOpenEditProduct(product)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="admin-stats-page">
            <div className="stats-top-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Ringkasan & Pembukuan Penjualan</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Unduh pembukuan komprehensif seluruh transaksi untuk rekap omzet toko.
                </p>
              </div>
              <button 
                type="button" 
                className="btn-export-csv"
                onClick={handleExportCSV}
                title="Download pembukuan penjualan ke file CSV"
              >
                <span>📥</span> Unduh Rekap Transaksi (CSV)
              </button>
            </div>
            <div className="stats-grid">
              <div className="stats-main-chart card-v2">
                <h3>Tren Penjualan (7 Hari Terakhir)</h3>
                <div className="dummy-chart">
                  <div className="bar" style={{height: '40%'}}><span>Sen</span></div>
                  <div className="bar" style={{height: '60%'}}><span>Sel</span></div>
                  <div className="bar" style={{height: '30%'}}><span>Rab</span></div>
                  <div className="bar" style={{height: '80%'}}><span>Kam</span></div>
                  <div className="bar" style={{height: '50%'}}><span>Jum</span></div>
                  <div className="bar active" style={{height: '95%'}}><span>Sab</span></div>
                  <div className="bar" style={{height: '70%'}}><span>Min</span></div>
                </div>
              </div>
              <div className="stats-side-list card-v2">
                <h3>Produk Terlaris</h3>
                <div className="top-products-list">
                  {products.sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="top-product-item">
                      <span className="rank">{i+1}</span>
                      <img src={p.image} alt="" />
                      <div className="info">
                        <p className="name">{p.name}</p>
                        <p className="sold">{p.sold} Terjual</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="admin-profile-page card-v2">
            <form onSubmit={handleShopUpdate} className="profile-form">
              <div className="profile-header-edit">
                <div className="logo-upload">
                  <img src={shopInfo.logo} alt="Logo" />
                  <button type="button" className="btn-change-logo">Ubah Logo</button>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nama Toko</label>
                  <input 
                    type="text" 
                    value={shopInfo.name} 
                    onChange={e => setShopInfo({...shopInfo, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Lokasi Toko</label>
                  <input 
                    type="text" 
                    value={shopInfo.location} 
                    onChange={e => setShopInfo({...shopInfo, location: e.target.value})}
                  />
                </div>
                <div className="form-group full">
                  <label>Deskripsi Toko</label>
                  <textarea 
                    rows="4"
                    value={shopInfo.desc}
                    onChange={e => setShopInfo({...shopInfo, desc: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <button type="submit" className="btn-auth-submit">Simpan Perubahan Profil</button>
            </form>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="admin-config-page">
            <div className="config-grid">
              <div className="config-card card-v2">
                <h3>Pengaturan Umum</h3>
                <div className="config-item">
                  <div className="info">
                    <p className="title">Mode Pemeliharaan</p>
                    <p className="desc">Tutup toko sementara untuk perbaikan</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={sysConfig.maintenance} onChange={e => handleConfigUpdate('maintenance', e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="config-item">
                  <div className="info">
                    <p className="title">Bebas Ongkir</p>
                    <p className="desc">Aktifkan promo bebas ongkir otomatis</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={sysConfig.freeShipping} onChange={e => handleConfigUpdate('freeShipping', e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="config-card card-v2">
                <h3>Notifikasi & Pajak</h3>
                <div className="config-item">
                  <div className="info">
                    <p className="title">Email Notifikasi</p>
                    <p className="desc">Kirim email setiap ada pesanan baru</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={sysConfig.notifEmail} onChange={e => handleConfigUpdate('notifEmail', e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group" style={{marginTop: '20px'}}>
                  <label>Persentase Pajak (%)</label>
                  <input 
                    type="number" 
                    value={sysConfig.taxRate} 
                    onChange={e => handleConfigUpdate('taxRate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>


      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Pesanan {selectedOrder.id}</h2>
              <button className="close-modal" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Informasi Transaksi</h3>
                <div className="info-grid">
                  <div className="info-item"><span className="label">Pembeli:</span> <span>{selectedOrder.userName}</span></div>
                  <div className="info-item"><span className="label">Metode Bayar:</span> <span className="payment-highlight">{selectedOrder.paymentMethod?.toUpperCase() || 'GOPAY'}</span></div>
                  <div className="info-item"><span className="label">Tanggal:</span> <span>{selectedOrder.date}</span></div>
                  <div className="info-item"><span className="label">Status:</span> <span className={`status-badge-v2 ${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>{selectedOrder.status}</span></div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Daftar Produk</h3>
                <div className="modal-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="modal-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <p className="name">{item.name}</p>
                        <p className="qty">{item.qty} x {formatPrice(item.price)}</p>
                      </div>
                      <div className="subtotal">{formatPrice(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-print-order-label"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setShippingLabelOrder(ord);
                  }}
                  title="Cetak label pengiriman ekspedisi untuk pesanan ini"
                >
                  <span>🖨️</span> Cetak Label Pengiriman
                </button>
                <div className="total-row">
                  <span>Total Pembayaran:</span>
                  <span className="total-val">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPING LABEL MODAL (PRINT READY) */}
      {shippingLabelOrder && (
        <div className="admin-modal-overlay shipping-label-modal-overlay" onClick={() => setShippingLabelOrder(null)}>
          <div className="admin-modal shipping-label-modal-wrapper" onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <div>
                <h2>Label Pengiriman Pesanan</h2>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Format Standar Ekspedisi E-Commerce (Thermal 100x150mm / Kertas A4)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-action-print-now"
                  onClick={() => window.print()}
                  title="Buka dialog printer atau simpan sebagai PDF"
                >
                  <span>🖨️</span> Cetak Sekarang
                </button>
                <button className="close-modal" onClick={() => setShippingLabelOrder(null)}>×</button>
              </div>
            </div>

            <div className="modal-body" style={{ background: '#F8FAFC', padding: '24px', display: 'flex', justifyContent: 'center' }}>
              {/* THERMAL SHIPPING LABEL SHEET */}
              <div className="shipping-label-sheet" id="printable-shipping-label">
                {/* Header Platform & Kurir */}
                <div className="label-header">
                  <div className="label-brand-block">
                    <img src="/tokopedei-icon.svg" alt="Tokopedei" className="label-logo" />
                    <div>
                      <span className="label-brand-name">tokopedei</span>
                      <span className="label-service-badge">OFFICIAL STORE</span>
                    </div>
                  </div>
                  <div className="label-courier-block">
                    <span className="courier-badge">JNE REG</span>
                    <span className="shipping-type-text">NON-COD (LUNAS)</span>
                  </div>
                </div>

                {/* Barcode Resi & Booking Code */}
                <div className="label-barcode-section">
                  <div className="barcode-bars">
                    <svg width="280" height="46" viewBox="0 0 280 46">
                      {[10, 18, 25, 34, 40, 48, 56, 68, 75, 82, 90, 102, 110, 122, 130, 142, 150, 162, 170, 182, 190, 202, 210, 222, 230, 242, 250, 262].map((pos, idx) => (
                        <rect key={idx} x={pos} y="0" width={(idx % 3 === 0 ? 3.5 : (idx % 2 === 0 ? 2 : 1.5))} height="46" fill="#000" />
                      ))}
                    </svg>
                  </div>
                  <div className="barcode-number">
                    {shippingLabelOrder.id.replace('INV-', 'TKP-JNE-')}
                  </div>
                  <div className="booking-sub">
                    No. Resi: <b>JP{Math.abs(shippingLabelOrder.id.split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0))|0, 0)).toString().slice(0, 10)}</b>
                  </div>
                </div>

                {/* Alamat Penerima & Pengirim */}
                <div className="label-address-grid">
                  <div className="label-address-box receiver-box">
                    <div className="box-title">PENERIMA (KEPADA):</div>
                    <div className="person-name">{shippingLabelOrder.userName}</div>
                    <div className="person-phone">0812-8821-4920</div>
                    <div className="person-address">
                      Jl. Sudirman Boulevard No. 88, Gedung Perkantoran Lt. 12, Karet Semanggi, Setiabudi, Jakarta Selatan, DKI Jakarta 12930
                    </div>
                  </div>

                  <div className="label-address-box sender-box">
                    <div className="box-title">PENGIRIM (DARI):</div>
                    <div className="person-name">{shopInfo.name}</div>
                    <div className="person-phone">(021) 8062-8888</div>
                    <div className="person-address">
                      {shopInfo.location} • Tokopedei Fulfillment Center
                    </div>
                    <div className="order-meta-mini">
                      <span>Tgl: {shippingLabelOrder.date}</span>
                      <span>Berat: 1.0 Kg</span>
                    </div>
                  </div>
                </div>

                {/* Manifest Barang (Packing Slip) */}
                <div className="label-manifest-section">
                  <div className="manifest-title">ISI PAKET (DAFTAR BARANG):</div>
                  <table className="label-items-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}>No</th>
                        <th>Nama Produk</th>
                        <th style={{ textAlign: 'center', width: '50px' }}>Qty</th>
                        <th>Kategori</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingLabelOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td className="item-name-cell">{item.name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.qty}x</td>
                          <td>{item.category || 'Barang Elektronik'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Security & Instruction Footer */}
                <div className="label-footer-instruction">
                  <div className="warning-pill">⚠️ FRAGILE / JANGAN DIBANTING</div>
                  <p className="unboxing-note">
                    Wajib rekam video unboxing saat paket diterima tanpa jeda. Tanpa video unboxing komplain tidak dapat diproses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add & Edit Modal with Image Upload */}
      {productModal && (
        <div className="admin-modal-overlay" onClick={() => setProductModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{productModal.mode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}</h2>
              <button className="close-modal" onClick={() => setProductModal(null)}>×</button>
            </div>
            <form onSubmit={handleSaveProductModal}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Nama Produk</label>
                  <input 
                    type="text" 
                    value={productModal.data.name}
                    onChange={(e) => setProductModal({...productModal, data: {...productModal.data, name: e.target.value}})}
                    placeholder="Contoh: Sony WH-1000XM5 Wireless Headphones"
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Harga (Rp)</label>
                    <input 
                      type="number" 
                      value={productModal.data.price}
                      onChange={(e) => setProductModal({...productModal, data: {...productModal.data, price: e.target.value}})}
                      placeholder="150000"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Stok Barang</label>
                    <input 
                      type="number" 
                      value={productModal.data.stock || 10}
                      onChange={(e) => setProductModal({...productModal, data: {...productModal.data, stock: e.target.value}})}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      value={productModal.data.category}
                      onChange={(e) => setProductModal({...productModal, data: {...productModal.data, category: e.target.value}})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="Elektronik">Elektronik</option>
                      <option value="Fashion Pria">Fashion Pria</option>
                      <option value="Fashion Wanita">Fashion Wanita</option>
                      <option value="Perhiasan">Perhiasan</option>
                      <option value="Handphone & Tablet">Handphone & Tablet</option>
                      <option value="Komputer & Laptop">Komputer & Laptop</option>
                      <option value="Kesehatan">Kesehatan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Badge Toko</label>
                    <select
                      value={productModal.data.badge || 'official'}
                      onChange={(e) => setProductModal({...productModal, data: {...productModal.data, badge: e.target.value}})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="official">Official Store</option>
                      <option value="power-merchant">Power Merchant</option>
                    </select>
                  </div>
                </div>

                {/* AREA UPLOAD FOTO PRODUK */}
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Foto Produk (Self-Hosted Storage)</span>
                    <span style={{ fontSize: '11px', color: '#03AC0E', fontWeight: 600 }}>Tersimpan di VPS</span>
                  </label>

                  {/* Preview Foto */}
                  {productModal.data.image && (
                    <div className="product-image-preview-card">
                      <img src={productModal.data.image} alt="Preview" className="preview-thumb" />
                      <div className="preview-details">
                        <p className="preview-status">✓ Foto Terpilih</p>
                        <p className="preview-url">{productModal.data.image.length > 55 ? productModal.data.image.substring(0, 55) + '...' : productModal.data.image}</p>
                      </div>
                    </div>
                  )}

                  {/* Dropzone Upload Button */}
                  <div 
                    className="admin-dropzone-upload"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-content">
                      <span className="dropzone-icon">📸</span>
                      <p className="dropzone-title">
                        {isUploading ? 'Mengunggah foto ke server VPS...' : 'Klik untuk pilih foto dari komputer / HP'}
                      </p>
                      <p className="dropzone-subtitle">Mendukung format PNG, JPG, JPEG, WEBP (Maksimal 5MB)</p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="upload-progress-indicator">
                      <div className="upload-spinner"></div>
                      <span>Sedang menyimpan ke Docker VPS storage...</span>
                    </div>
                  )}

                  {uploadError && (
                    <p style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>{uploadError}</p>
                  )}

                  {/* Fallback URL Input */}
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>Atau tempel URL gambar langsung:</span>
                    <input 
                      type="text" 
                      value={productModal.data.image} 
                      onChange={(e) => setProductModal({...productModal, data: {...productModal.data, image: e.target.value}})}
                      placeholder="https://..."
                      style={{ marginTop: '4px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '14px', borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
                <button type="button" className="btn-cancel" onClick={() => setProductModal(null)}>Batal</button>
                <button 
                  type="submit" 
                  className="btn-auth-submit" 
                  disabled={isUploading}
                  style={{ background: 'var(--green-primary)', color: 'white', fontWeight: 700 }}
                >
                  {productModal.mode === 'add' ? '➕ Tambah ke Katalog' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


