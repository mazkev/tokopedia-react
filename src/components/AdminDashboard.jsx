import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function AdminDashboard({ orders, products, onUpdateStatus, onUpdateProduct, onGoHome, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'statistics', 'profile', 'config'
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Shop & Config states
  const [shopInfo, setShopInfo] = useState({
    name: 'Tokopedia Official Store',
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

  const handleProductEdit = (e) => {
    e.preventDefault();
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
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
            <p className="admin-name">Admin Tokopedia</p>
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
              <button className="btn-add-product">➕ Tambah Produk</button>
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
                        <button className="btn-edit-product" onClick={() => setEditingProduct(product)}>Edit</button>
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
      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Produk</h2>
              <button className="close-modal" onClick={() => setEditingProduct(null)}>×</button>
            </div>
            <form onSubmit={handleProductEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Produk</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <input 
                    type="text" 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-auth-submit">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


