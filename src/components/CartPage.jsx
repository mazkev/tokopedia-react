import { useState, useEffect } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function CartPage({ items, onUpdateQty, onRemove, onGoHome, onCheckout, onApplyVoucher, appliedVoucher }) {
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => items.map(item => item.id));

  // Sinkronisasi item terpilih jika list barang berubah
  useEffect(() => {
    setSelectedIds(prev => {
      const currentItemIds = items.map(i => i.id);
      const existing = prev.filter(id => currentItemIds.includes(id));
      const newlyAdded = currentItemIds.filter(id => !prev.includes(id));
      return [...existing, ...newlyAdded];
    });
  }, [items]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} barang yang dipilih dari keranjang?`)) {
      selectedIds.forEach(id => onRemove(id));
      setSelectedIds([]);
    }
  };

  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalCount = selectedItems.reduce((acc, item) => acc + item.qty, 0);

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
            <label className="checkbox-container" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={toggleSelectAll} 
              />
              <span className="checkmark"></span>
              <b>Pilih Semua ({items.length})</b>
            </label>
            {selectedIds.length > 0 && (
              <button className="btn-delete-all" onClick={handleDeleteSelected}>
                Hapus ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="cart-items-list">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className={`cart-item-card ${isSelected ? 'selected' : ''}`}>
                  <div className="item-selection">
                    <label className="checkbox-container" style={{ cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)} 
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    {item.selectedVariant && (
                      <p className="item-variant" style={{ fontSize: '12px', color: '#03AC0E', fontWeight: 600, margin: '2px 0' }}>
                        Varian: {item.selectedVariant}
                      </p>
                    )}
                    <p className="item-shop">🏢 {item.shop || 'Tokopedei Official Store'}</p>
                    <div className="item-price-row">
                      <span className="current-price">{formatPrice(item.price)}</span>
                      {item.discount > 0 && <span className="discount-tag">{item.discount}%</span>}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn-delete" title="Hapus dari keranjang" onClick={() => onRemove(item.id)}>🗑️</button>
                    <div className="qty-control">
                      <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                      <input type="text" value={item.qty} readOnly />
                      <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Ringkasan Belanja</h3>
            <div className="summary-row">
              <span className="label">Total Harga ({totalCount} Barang Dipilih)</span>
              <span className="value">{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Total Diskon</span>
              <span className="value" style={{color: 'var(--red-sale)'}}>
                -{formatPrice(appliedVoucher ? appliedVoucher.discount : 0)}
              </span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span className="label">Total Tagihan</span>
              <span className="value">
                {formatPrice(Math.max(0, subtotal - (appliedVoucher ? appliedVoucher.discount : 0)))}
              </span>
            </div>

            <button 
              className="btn-checkout" 
              disabled={selectedItems.length === 0}
              style={selectedItems.length === 0 ? { opacity: 0.5, cursor: 'not-allowed', background: '#ccc' } : {}}
              onClick={() => onCheckout && onCheckout(selectedItems)}
            >
              {selectedItems.length === 0 ? 'Pilih Barang Dulu' : `Beli (${totalCount})`}
            </button>
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

