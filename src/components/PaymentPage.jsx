import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function PaymentPage({ items = [], user, appliedVoucher, onConfirm, onCancel }) {
  const [selectedMethod, setSelectedMethod] = useState('gopay');
  const [selectedShipping, setSelectedShipping] = useState('free');

  // Alamat Pengiriman
  const [address, setAddress] = useState({
    recipient: user?.name || 'Kevin Pratama',
    phone: '0812-3456-7890',
    street: 'Jl. Kemanggisan Raya No. 45, RT 03 / RW 07',
    city: 'Jakarta Barat, DKI Jakarta',
    postalCode: '11480'
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editForm, setEditForm] = useState(address);

  const shippingOptions = [
    { id: 'free', name: 'Bebas Ongkir', courier: 'Kurir Rekomendasi Tokopedei', cost: 0, etd: 'Estimasi tiba 2-3 hari', badge: 'GRATIS' },
    { id: 'reguler', name: 'Reguler', courier: 'SiCepat / JNE Express', cost: 10000, etd: 'Estimasi tiba 1-2 hari' },
    { id: 'instant', name: 'Instan (3 Jam Tiba)', courier: 'GoSend / GrabExpress', cost: 20000, etd: 'Tiba Hari Ini', badge: 'CEPAT' },
    { id: 'cargo', name: 'Kargo', courier: 'JNE Trucking (JTR)', cost: 35000, etd: 'Estimasi tiba 3-5 hari' }
  ];

  const paymentMethods = [
    { id: 'gopay', name: 'GoPay', icon: '📱', desc: 'Bayar instan pakai saldo GoPay' },
    { id: 'ovo', name: 'OVO', icon: '🟣', desc: 'Bayar pakai saldo OVO' },
    { id: 'va', name: 'Virtual Account', icon: '🏦', desc: 'Transfer bank otomatis (BCA, Mandiri, BNI)' },
    { id: 'cc', name: 'Kartu Kredit', icon: '💳', desc: 'Visa, Mastercard, JCB' },
  ];

  const productSubtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const activeCourier = shippingOptions.find(o => o.id === selectedShipping) || shippingOptions[0];
  const shippingCost = activeCourier.cost;
  const discount = appliedVoucher ? (appliedVoucher.discount || 0) : 0;
  const grandTotal = Math.max(0, productSubtotal + shippingCost - discount);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddress(editForm);
    setIsEditingAddress(false);
  };

  const handlePay = () => {
    if (onConfirm) {
      onConfirm({
        paymentMethod: selectedMethod,
        shippingAddress: address,
        courier: activeCourier,
        shippingCost: shippingCost,
        subtotal: productSubtotal,
        discount: discount,
        total: grandTotal
      });
    }
  };

  return (
    <div className="payment-page-container animate-in">
      <div className="payment-layout">
        <div className="payment-main">
          <div className="payment-header">
            <button className="btn-back-payment" onClick={onCancel}>←</button>
            <h1>Pengiriman & Pembayaran</h1>
          </div>

          {/* 1. Alamat Pengiriman */}
          <div className="checkout-card animate-in">
            <div className="card-header-row">
              <h3>📍 Alamat Pengiriman</h3>
              <button className="btn-edit-link" onClick={() => { setEditForm(address); setIsEditingAddress(true); }}>
                Ubah Alamat
              </button>
            </div>
            <div className="address-body">
              <div className="recipient-row">
                <span className="name">{address.recipient}</span>
                <span className="phone">({address.phone})</span>
                <span className="label-badge">Utama</span>
              </div>
              <p className="street">{address.street}</p>
              <p className="city">{address.city} - {address.postalCode}</p>
            </div>
          </div>

          {/* 2. Barang yang Dibeli */}
          <div className="checkout-card animate-in">
            <h3 style={{ marginBottom: '14px' }}>📦 Rincian Barang ({items.length})</h3>
            <div className="checkout-items-list">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="checkout-item-row">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <p className="name">{item.name}</p>
                    {item.selectedVariant && (
                      <span className="variant-tag">Varian: {item.selectedVariant}</span>
                    )}
                    <p className="price-qty">{item.qty} x {formatPrice(item.price)}</p>
                  </div>
                  <div className="subtotal-val">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pilihan Jasa Kurir & Pengiriman */}
          <div className="checkout-card animate-in">
            <h3 style={{ marginBottom: '14px' }}>🚚 Pilih Jasa Pengiriman</h3>
            <div className="shipping-options-list">
              {shippingOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className={`shipping-option-card ${selectedShipping === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedShipping(opt.id)}
                >
                  <div className="shipping-info">
                    <div className="title-row">
                      <span className="shipping-name">{opt.name}</span>
                      {opt.badge && <span className="shipping-badge">{opt.badge}</span>}
                    </div>
                    <p className="courier-name">{opt.courier}</p>
                    <p className="etd">{opt.etd}</p>
                  </div>
                  <div className="shipping-cost">
                    {opt.cost === 0 ? <b style={{ color: '#03AC0E' }}>Gratis</b> : formatPrice(opt.cost)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Pilihan Metode Pembayaran */}
          <div className="checkout-card animate-in">
            <h3 style={{ marginBottom: '14px' }}>💳 Pilih Metode Pembayaran</h3>
            <div className="payment-methods-list">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className={`payment-method-card ${selectedMethod === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <p className="name">{method.name}</p>
                    <p className="desc">{method.desc}</p>
                  </div>
                  <div className="method-radio">
                    <div className="radio-circle"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aside: Ringkasan Tagihan */}
        <aside className="payment-summary">
          <div className="summary-card">
            <h3>Ringkasan Pembayaran</h3>
            <div className="summary-row">
              <span>Total Harga Produk</span>
              <span>{formatPrice(productSubtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Biaya Pengiriman</span>
              <span>{shippingCost === 0 ? <b style={{ color: '#03AC0E' }}>Gratis (Rp0)</b> : formatPrice(shippingCost)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row" style={{ color: 'var(--red-sale)' }}>
                <span>Diskon Kupon</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="divider"></div>
            <div className="summary-row total">
              <span>Total Tagihan</span>
              <span className="total-val">{formatPrice(grandTotal)}</span>
            </div>
            <p className="payment-notice">
              Dengan klik Bayar Sekarang, pesananmu akan langsung dikonfirmasi oleh sistem Tokopedei.
            </p>
            <button className="btn-confirm-payment" onClick={handlePay}>
              Bayar Sekarang ({formatPrice(grandTotal)})
            </button>
          </div>
        </aside>
      </div>

      {/* Modal Ubah Alamat */}
      {isEditingAddress && (
        <div className="admin-modal-overlay" onClick={() => setIsEditingAddress(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Ubah Alamat Pengiriman</h2>
              <button className="close-modal" onClick={() => setIsEditingAddress(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Nama Penerima</label>
                  <input 
                    type="text" 
                    value={editForm.recipient} 
                    onChange={e => setEditForm({ ...editForm, recipient: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nomor Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Alamat Lengkap (Jalan, RT/RW, No. Rumah)</label>
                  <textarea 
                    rows="3" 
                    value={editForm.street} 
                    onChange={e => setEditForm({ ...editForm, street: e.target.value })}
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
                  <div className="form-group">
                    <label>Kota / Kabupaten</label>
                    <input 
                      type="text" 
                      value={editForm.city} 
                      onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Kode Pos</label>
                    <input 
                      type="text" 
                      value={editForm.postalCode} 
                      onChange={e => setEditForm({ ...editForm, postalCode: e.target.value })}
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="btn-cancel" onClick={() => setIsEditingAddress(false)}>Batal</button>
                <button type="submit" className="btn-save" style={{ background: 'var(--green-primary)', color: 'white' }}>Simpan Alamat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
