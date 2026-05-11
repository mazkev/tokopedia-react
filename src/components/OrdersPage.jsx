import { useState } from 'react';

function formatPrice(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

function TrackingTimeline({ status }) {
  const steps = ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai'];
  const currentIdx = steps.indexOf(status);
  
  return (
    <div className="tracking-timeline">
      {steps.map((step, idx) => (
        <div key={step} className={`timeline-step ${idx <= currentIdx ? 'active' : ''} ${idx === currentIdx ? 'current' : ''}`}>
          <div className="step-node"></div>
          <span className="step-label">{step}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewModal({ order, onSave, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Beri Ulasan</h2>
          <button className="close-modal" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          {order.items.map(item => (
            <div key={item.id} className="review-item-header">
              <img src={item.image} alt="" />
              <p>{item.name}</p>
            </div>
          ))}
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`star ${s <= rating ? 'active' : ''}`} onClick={() => setRating(s)}>⭐</span>
            ))}
          </div>
          <div className="form-group" style={{marginTop: '20px'}}>
            <label>Tuliskan komentarmu</label>
            <textarea 
              rows="4" 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              placeholder="Bagaimana kualitas barangnya?"
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-auth-submit" onClick={() => onSave({ rating, comment })}>Kirim Ulasan</button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage({ orders, onGoHome, onAddReview }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);

  if (orders.length === 0) {
    return (
      <div className="orders-page-empty animate-in">
        <div className="empty-content">
          <img src="https://assets.tokopedia.net/assets-tokopedia-lite/v2/pastilaku/k_line/pdp/empty-cart.png" alt="No Orders" />
          <h2>Belum ada transaksi</h2>
          <p>Ayo mulai belanja dan temukan barang impianmu!</p>
          <button className="btn-shop-now" onClick={onGoHome}>Mulai Belanja</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container animate-in">
      <div className="orders-header-row">
        <h1 className="orders-title">Daftar Transaksi</h1>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const firstItem = order.items[0];
          const otherItemsCount = order.items.length - 1;

          return (
            <div key={order.id} className={`order-card-v2 ${isExpanded ? 'expanded' : ''}`}>
              <div className="order-card-header">
                <div className="header-left">
                  <span className="order-icon">🛍️</span>
                  <div className="header-text">
                    <p className="type">Belanja</p>
                    <p className="date">{order.date}</p>
                  </div>
                  <span className={`status-badge-user ${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                  <span className="invoice-num">{order.id}</span>
                </div>
              </div>
              
              <div className="order-card-body">
                <div className="main-item-row">
                  <img src={firstItem.image} alt={firstItem.name} className="item-img" />
                  <div className="item-info">
                    <p className="item-name">{firstItem.name}</p>
                    <p className="item-meta">{firstItem.qty} barang x {formatPrice(firstItem.price)}</p>
                    {otherItemsCount > 0 && (
                      <p className="extra-items">+{otherItemsCount} produk lainnya</p>
                    )}
                  </div>
                  <div className="order-price-summary">
                    <p className="label">Total Belanja</p>
                    <p className="value">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-details-expanded animate-in">
                    <div className="divider"></div>
                    
                    <h3 className="detail-title">Status Pengiriman</h3>
                    <TrackingTimeline status={order.status} />

                    <div className="divider"></div>
                    <h3 className="detail-title">Detail Produk</h3>
                    <div className="expanded-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="expanded-item">
                          <img src={item.image} alt="" />
                          <div className="info">
                            <p className="name">{item.name}</p>
                            <p className="qty">{item.qty} x {formatPrice(item.price)}</p>
                          </div>
                          <p className="subtotal">{formatPrice(item.price * item.qty)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="order-card-footer">
                <div className="footer-actions">
                  {order.status === 'Selesai' && !order.reviewed && (
                    <button className="btn-give-review" onClick={() => setReviewingOrder(order)}>Beri Ulasan</button>
                  )}
                  <button 
                    className="btn-toggle-detail"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    {isExpanded ? 'Tutup Detail' : 'Lihat Detail Transaksi'}
                  </button>
                  <button className="btn-buy-again-v2">Beli Lagi</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reviewingOrder && (
        <ReviewModal 
          order={reviewingOrder}
          onSave={(data) => {
            reviewingOrder.items.forEach(item => {
              onAddReview(reviewingOrder.id, item.id, data);
            });
            setReviewingOrder(null);
          }}
          onCancel={() => setReviewingOrder(null)}
        />
      )}
    </div>
  );
}


