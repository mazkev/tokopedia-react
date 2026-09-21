import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useOrders(user, view, addNotification) {
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('orders')) || [];
    } catch {
      return [];
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('reviews')) || [];
    } catch {
      return [];
    }
  });

  const [activePaymentOrder, setActivePaymentOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Sinkronisasi Pesanan dari Backend saat user login atau membuka menu orders/admin
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        if (user.role === 'admin') {
          const data = await api.getAllOrders();
          if (data && Array.isArray(data)) setOrders(data);
        } else {
          const data = await api.getMyOrders();
          if (data && Array.isArray(data)) setOrders(data);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi pesanan dari API:', err);
      }
    };
    fetchOrders();
  }, [user, view]);

  const createOrder = useCallback(async (orderPayload, fallbackOrder) => {
    let createdOrder = null;
    try {
      createdOrder = await api.createOrder(orderPayload);
    } catch (err) {
      console.warn('Gagal kirim order ke API, fallback simpan lokal:', err);
      createdOrder = fallbackOrder;
    }
    setOrders(prev => [createdOrder, ...prev]);
    setActivePaymentOrder(createdOrder);
    if (addNotification) {
      addNotification(`Pesanan ${createdOrder.invoiceNumber || createdOrder.id} dibuat! Silakan selesaikan pembayaran.`);
    }
    return createdOrder;
  }, [addNotification]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.warn('Gagal update status di backend:', err);
    }
    setOrders(prev => prev.map(order =>
      (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
    ));
    if (addNotification) {
      addNotification(`Status pesanan diupdate ke: ${newStatus}`);
    }
  }, [addNotification]);

  const payOrder = useCallback(async (orderId) => {
    try {
      const updated = await api.payOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Diproses' } : o));
      if (addNotification) {
        addNotification('Pembayaran berhasil diverifikasi! Pesanan Anda sedang diproses penjual.');
      }
      return updated;
    } catch (err) {
      console.warn('Gagal panggil payOrder API, fallback update lokal:', err);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Diproses' } : o));
      if (addNotification) {
        addNotification('Pembayaran berhasil diverifikasi! Pesanan Anda sedang diproses.');
      }
    }
  }, [addNotification]);

  const cancelOrder = useCallback(async (orderId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      await api.updateOrderStatus(orderId, 'Dibatalkan');
    } catch {
      // ignore
    }
    setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Dibatalkan' } : o));
    if (addNotification) {
      addNotification(`Pesanan ${orderId} berhasil dibatalkan.`);
    }
  }, [addNotification]);

  const addReview = useCallback(async (orderId, productId, reviewData) => {
    try {
      await api.createReview({
        orderId: String(orderId),
        productId: String(productId),
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
    } catch (err) {
      console.warn('Gagal simpan review ke API:', err);
    }
    const newReview = {
      id: Date.now(),
      orderId,
      productId,
      userName: user?.name || 'User',
      ...reviewData,
      date: new Date().toLocaleDateString('id-ID'),
    };
    setReviews(prev => [...prev, newReview]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewed: true } : o));
    if (addNotification) {
      addNotification('Terima kasih atas ulasanmu!');
    }
  }, [user, addNotification]);

  return {
    orders,
    setOrders,
    reviews,
    setReviews,
    activePaymentOrder,
    setActivePaymentOrder,
    createOrder,
    updateOrderStatus,
    payOrder,
    cancelOrder,
    addReview,
  };
}

export default useOrders;
