import { useState, useEffect } from 'react';

function formatPrice(n) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 3600); // 24 hours countdown
  const [activeGuideTab, setActiveGuideTab] = useState('mbca');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const vaNumber = order?.paymentInfo?.vaNumber || '80777081234567890';
  const method = (order?.paymentMethod || 'Virtual Account').toLowerCase();
  const isQRIS = method.includes('qris');
  const isGoPay = method.includes('gopay');
  const isOVO = method.includes('ovo');

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      if (onSuccess) {
        await onSuccess(order.id || order._id);
      }
      setIsSuccess(true);
    } catch (err) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-card animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pay-modal-header">
          <div className="header-brand">
            <span className="tokped-pay-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
              </svg>
              Tokopedia Pay
            </span>
            <span className="pay-secure-tag">100% Aman & Terverifikasi</span>
          </div>
          <button className="pay-modal-close" onClick={onClose}>×</button>
        </div>

        {isSuccess ? (
          /* Layar Pembayaran Sukses */
          <div className="pay-success-card animate-in">
            <div className="success-icon-wrapper">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#03AC0E" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Pembayaran Berhasil!</h2>
            <p className="pay-success-subtitle">
              Terima kasih! Pembayaran untuk pesanan <b>{order.invoiceNumber}</b> sebesar <b>{formatPrice(order.total)}</b> telah diverifikasi otomatis oleh Tokopedia Pay.
            </p>
            <div className="pay-success-info-box">
              <div className="row">
                <span>Status Pesanan</span>
                <b style={{ color: '#03AC0E' }}>Diproses Penjual</b>
              </div>
              <div className="row">
                <span>Metode Pembayaran</span>
                <b>{order.paymentMethod || 'BCA Virtual Account'}</b>
              </div>
              <div className="row">
                <span>Waktu Pembayaran</span>
                <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
              </div>
            </div>
            <button className="btn-finish-payment" onClick={onClose}>
              Lihat Riwayat Pesanan
            </button>
          </div>
        ) : (
          /* Layar Instruksi Pembayaran */
          <div className="pay-modal-body">
            {/* Countdown Box */}
            <div className="pay-countdown-banner">
              <div className="banner-left">
                <span className="timer-icon">⏳</span>
                <span>Selesaikan dalam</span>
              </div>
              <div className="timer-countdown">
                <span>{String(hours).padStart(2, '0')}</span> :
                <span>{String(minutes).padStart(2, '0')}</span> :
                <span>{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Total Pembayaran & Invoice */}
            <div className="pay-amount-box">
              <div className="amount-info">
                <span className="label">Total Tagihan</span>
                <span className="value">{formatPrice(order.total)}</span>
              </div>
              <div className="invoice-info">
                <span>No. Invoice:</span>
                <b>{order.invoiceNumber}</b>
              </div>
            </div>

            {/* Konten Berdasarkan Metode Pembayaran */}
            {isQRIS ? (
              /* QRIS View */
              <div className="pay-qris-container">
                <div className="qris-header">
                  <span className="qris-brand">QRIS</span>
                  <span className="gpn-brand">GPN</span>
                </div>
                <div className="qris-qr-frame">
                  <div className="qr-box-pattern">
                    {/* SVG Realistic QR Code */}
                    <svg width="170" height="170" viewBox="0 0 100 100" fill="#222">
                      <rect x="0" y="0" width="30" height="30" fill="#111" />
                      <rect x="5" y="5" width="20" height="20" fill="#fff" />
                      <rect x="10" y="10" width="10" height="10" fill="#111" />

                      <rect x="70" y="0" width="30" height="30" fill="#111" />
                      <rect x="75" y="5" width="20" height="20" fill="#fff" />
                      <rect x="80" y="10" width="10" height="10" fill="#111" />

                      <rect x="0" y="70" width="30" height="30" fill="#111" />
                      <rect x="5" y="75" width="20" height="20" fill="#fff" />
                      <rect x="10" y="80" width="10" height="10" fill="#111" />

                      {/* Random Data Dots */}
                      <rect x="36" y="8" width="6" height="6" />
                      <rect x="48" y="12" width="6" height="6" />
                      <rect x="36" y="24" width="6" height="6" />
                      <rect x="8" y="44" width="6" height="6" />
                      <rect x="20" y="52" width="6" height="6" />
                      <rect x="42" y="40" width="16" height="16" fill="#03AC0E" />
                      <rect x="72" y="44" width="6" height="6" />
                      <rect x="84" y="56" width="6" height="6" />
                      <rect x="44" y="72" width="6" height="6" />
                      <rect x="56" y="80" width="6" height="6" />
                      <rect x="78" y="76" width="6" height="6" />
                      <rect x="88" y="84" width="6" height="6" />
                    </svg>
                  </div>
                </div>
                <p className="qris-hint">
                  Scan QR code di atas menggunakan <b>GoPay, BCA Mobile, OVO, ShopeePay, Dana</b>, atau aplikasi m-Banking apa saja.
                </p>
              </div>
            ) : isGoPay || isOVO ? (
              /* E-Wallet View */
              <div className="pay-ewallet-container">
                <div className="ewallet-icon-circle">
                  {isGoPay ? '📱' : '🟣'}
                </div>
                <h3>{isGoPay ? 'GoPay Instant Pay' : 'OVO Payment'}</h3>
                <p className="ewallet-desc">
                  Simulasi saldo e-wallet Anda akan langsung didebit untuk pesanan ini secara instan.
                </p>
                <div className="ewallet-phone-box">
                  <span>Nomor Terdaftar:</span>
                  <b>0812-3456-7890</b>
                </div>
              </div>
            ) : (
              /* Virtual Account View (BCA / Mandiri / BNI) */
              <div className="pay-va-container">
                <div className="va-header-row">
                  <div className="bank-brand">
                    <span className="bank-logo">🏦</span>
                    <span className="bank-name">BCA Virtual Account</span>
                  </div>
                  <span className="bank-auto-tag">Verifikasi Otomatis</span>
                </div>

                <div className="va-number-card">
                  <div className="va-number-left">
                    <span className="va-label">Nomor Virtual Account</span>
                    <span className="va-value">{vaNumber}</span>
                  </div>
                  <button className={`btn-copy-va ${copied ? 'copied' : ''}`} onClick={handleCopyVA}>
                    {copied ? '✓ Tersalin!' : 'Salin'}
                  </button>
                </div>

                {/* Panduan Transfer Collapsible */}
                <div className="pay-guides-wrapper">
                  <div className="guide-tabs">
                    <button 
                      className={`tab-btn ${activeGuideTab === 'mbca' ? 'active' : ''}`}
                      onClick={() => setActiveGuideTab('mbca')}
                    >
                      m-BCA
                    </button>
                    <button 
                      className={`tab-btn ${activeGuideTab === 'klikbca' ? 'active' : ''}`}
                      onClick={() => setActiveGuideTab('klikbca')}
                    >
                      KlikBCA
                    </button>
                    <button 
                      className={`tab-btn ${activeGuideTab === 'atm' ? 'active' : ''}`}
                      onClick={() => setActiveGuideTab('atm')}
                    >
                      ATM BCA
                    </button>
                  </div>
                  <div className="guide-content">
                    {activeGuideTab === 'mbca' && (
                      <ol>
                        <li>Buka aplikasi BCA Mobile, pilih <b>m-BCA</b></li>
                        <li>Pilih menu <b>m-Transfer ➡️ BCA Virtual Account</b></li>
                        <li>Masukkan No. Virtual Account <b>{vaNumber}</b> lalu kirim</li>
                        <li>Periksa rincian tagihan sebesar <b>{formatPrice(order.total)}</b></li>
                        <li>Masukkan PIN m-BCA Anda untuk menyelesaikan</li>
                      </ol>
                    )}
                    {activeGuideTab === 'klikbca' && (
                      <ol>
                        <li>Login ke website KlikBCA Individual</li>
                        <li>Pilih <b>Transfer Dana ➡️ Transfer ke BCA Virtual Account</b></li>
                        <li>Masukkan No. Virtual Account <b>{vaNumber}</b></li>
                        <li>Validasi total tagihan dan masukkan respon KeyBCA</li>
                      </ol>
                    )}
                    {activeGuideTab === 'atm' && (
                      <ol>
                        <li>Masukkan kartu ATM dan PIN BCA Anda</li>
                        <li>Pilih menu <b>Transaksi Lainnya ➡️ Transfer ➡️ ke Rek BCA Virtual Account</b></li>
                        <li>Masukkan <b>{vaNumber}</b> lalu tekan Benar</li>
                        <li>Ambil struk ATM sebagai bukti transaksi</li>
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Simulasi Pembayaran */}
            <div className="pay-action-section">
              <button 
                className="btn-simulate-pay"
                disabled={isProcessing}
                onClick={handleSimulatePayment}
              >
                {isProcessing ? (
                  <span className="pay-loading">
                    <span className="spinner-dots"></span> Memverifikasi Pembayaran...
                  </span>
                ) : (
                  <>⚡ Simulasikan Pembayaran Berhasil</>
                )}
              </button>
              <p className="pay-simulation-notice">
                *Klik tombol di atas untuk menyimulasikan transfer uang berhasil tanpa uang sungguhan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
