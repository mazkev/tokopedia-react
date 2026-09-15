import { useState, useRef } from 'react';
import { api } from '../services/api';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function AdminDashboard({ orders, products, onUpdateStatus, onUpdateProduct, onAddProduct, onGoHome, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'statistics', 'profile', 'config'
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <p className="admin-name">Admin Tokopedei</p>
            <p className="admin-role">Back Office Official</p>
          </div>
        </div>
        <nav className="admin-nav">
          <div className="nav-group">
            <p className="nav-label">MAIN MENU</p>
            <a 
              href="#" 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => { setActiveTab('orders'); setSearchQuery(''); }}
            >
              📦 Kelola Pesanan
            </a>
            <a 
              href="#" 
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
            >
              🛍️ Daftar Produk
            </a>
            <a 
              href="#" 
              className={activeTab === 'statistics' ? 'active' : ''}
              onClick={() => { setActiveTab('statistics'); }}
            >
              📊 Statistik Penjualan
            </a>
          </div>
          <div className="nav-group">
            <p className="nav-label">PENGATURAN</p>
            <a 
              href="#" 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => { setActiveTab('profile'); }}
            >
              🏪 Profil Toko
            </a>
            <a 
              href="#" 
              className={activeTab === 'config' ? 'active' : ''}
              onClick={() => { setActiveTab('config'); }}
            >
              ⚙️ Konfigurasi Sistem
            </a>
          </div>
          <div className="nav-footer">
            <a href="#" onClick={onGoHome}>🌐 Lihat Toko</a>
            <a href="#" onClick={onLogout} className="logout">🚪 Keluar</a>
          </div>
        </nav>
      </aside>


      <main className="admin-content">
        <header className="admin-header-v2">
          <div className="header-title">
            <h1>{
              activeTab === 'orders' ? 'Pesanan Masuk' : 
              activeTab === 'products' ? 'Manajemen Produk' : 
              activeTab === 'statistics' ? 'Statistik Penjualan' :
              activeTab === 'profile' ? 'Profil Toko' : 'Konfigurasi Sistem'
            }</h1>
            <p>{
              activeTab === 'orders' ? 'Kelola dan proses transaksi pembeli' : 
              activeTab === 'products' ? 'Atur katalog dan harga produk toko' :
              activeTab === 'statistics' ? 'Analisis performa penjualan toko' :
              activeTab === 'profile' ? 'Atur identitas dan branding toko' : 'Pengaturan teknis platform'
            }</p>
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
                <span className="value">{stats.totalOrders}</span>
              </div>
            </div>
            <div className="stat-card-v2">
              <div className="stat-icon products">🛍️</div>
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
              <div className="toolbar-filters">
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
                          <button className="btn-icon-view" onClick={() => setSelectedOrder(order)} title="Detail">👁️</button>
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
              <div className="modal-footer">
                <div className="total-row">
                  <span>Total Pembayaran:</span>
                  <span className="total-val">{formatPrice(selectedOrder.total)}</span>
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


