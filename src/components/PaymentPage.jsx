import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

export default function PaymentPage({ total, onConfirm, onCancel }) {
  const [selectedMethod, setSelectedMethod] = useState('gopay');

  const paymentMethods = [
    { id: 'gopay', name: 'GoPay', icon: '📱', desc: 'Bayar instan pakai saldo GoPay' },
    { id: 'ovo', name: 'OVO', icon: '🟣', desc: 'Bayar pakai saldo OVO' },
    { id: 'va', name: 'Virtual Account', icon: '🏦', desc: 'Transfer bank otomatis (BCA, Mandiri, BNI)' },
    { id: 'cc', name: 'Kartu Kredit', icon: '💳', desc: 'Visa, Mastercard, JCB' },
  ];

  return (
    <div className="payment-page-container animate-in">
      <div className="payment-layout">
        <div className="payment-main">
          <div className="payment-header">
            <button className="btn-back-payment" onClick={onCancel}>←</button>
            <h1>Metode Pembayaran</h1>
          </div>

          <div className="payment-section">
            <h3>Pilih Cara Bayar</h3>
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

        <aside className="payment-summary">
          <div className="summary-card">
            <h3>Ringkasan Pembayaran</h3>
            <div className="summary-row">
              <span>Total Tagihan</span>
              <span className="total-val">{formatPrice(total)}</span>
            </div>
            <div className="divider"></div>
            <p className="payment-notice">
              Dengan klik Bayar, kamu setuju dengan Syarat & Ketentuan yang berlaku.
            </p>
            <button className="btn-confirm-payment" onClick={() => onConfirm(selectedMethod)}>
              Bayar Sekarang
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
