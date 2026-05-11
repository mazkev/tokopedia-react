import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function CartPage({ items, onUpdateQty, onRemove, onGoHome, onCheckout, onApplyVoucher, appliedVoucher }) {
  const [voucherCode, setVoucherCode] = useState('');
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);


  if (items.length === 0) {

    return (
      <div className="cart-page-empty animate-in">
        <div className="empty-content">
          <img src="https://assets.tokopedia.net/assets-tokopedia-lite/v2/pastilaku/k_line/pdp/empty-cart.png" alt="Empty Cart" />
          <h2>Wah, keranjang belanjamu kosong</h2>
          <p>Yuk, isi dengan barang-barang impianmu!</p>
          <button className="btn-shop-now" onClick={onGoHome}>Mulai Belanja</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container animate-in">
      <div className="cart-page-inner">
        {/* Left Side: Items */}
        <div className="cart-items-section">
          <h1 className="cart-title">Keranjang</h1>
          <div className="cart-actions-top">
            <label className="checkbox-container">
              <input type="checkbox" defaultChecked />
              <span className="checkmark"></span>
              Pilih Semua
            </label>
            <button className="btn-delete-all">Hapus</button>
          </div>

          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="item-selection">
                  <label className="checkbox-container">
                    <input type="checkbox" defaultChecked />
                    <span className="checkmark"></span>
                  </label>
                </div>
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <p className="item-name">{item.name}</p>
                  <p className="item-shop">🏢 {item.shop}</p>
                  <div className="item-price-row">
                    <span className="current-price">{formatPrice(item.price)}</span>
                    {item.discount > 0 && <span className="discount-tag">{item.discount}%</span>}
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-wishlist">❤️ Pindahkan ke Wishlist</button>
                  <button className="btn-delete" onClick={() => onRemove(item.id)}>🗑️</button>
                  <div className="qty-control">
                    <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                    <input type="text" value={item.qty} readOnly />
                    <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Ringkasan Belanja</h3>
            <div className="summary-row">
              <span className="label">Total Harga ({items.length} Barang)</span>
              <span className="value">{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Total Diskon</span>
              <span className="value" style={{color: 'var(--red-sale)'}}>-{formatPrice(appliedVoucher ? appliedVoucher.discount : 0)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span className="label">Total Harga</span>
              <span className="value">{formatPrice(Math.max(0, subtotal - (appliedVoucher ? appliedVoucher.discount : 0)))}</span>
            </div>

            <button className="btn-checkout" onClick={onCheckout}>Beli ({items.length})</button>
            <div className="voucher-input-group">
              <input 
                type="text" 
                placeholder="Punya kode promo?" 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button className="btn-apply-voucher" onClick={() => onApplyVoucher(voucherCode)}>Pakai</button>
            </div>
            {appliedVoucher && (
              <div className="applied-voucher-info animate-in">
                <span className="icon">🎟️</span>
                <span className="text">Promo <b>{appliedVoucher.code}</b> terpasang</span>
                <button className="remove-v" onClick={() => onApplyVoucher('')}>✕</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
