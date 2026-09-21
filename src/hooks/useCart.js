import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useCart(addNotification) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch {
      return [];
    }
  });

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const [vouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vouchers')) || [
        { code: 'TOKOPEDIA10', discount: 10000, type: 'flat' },
        { code: 'HEMAT20', discount: 20000, type: 'flat' }
      ];
    } catch {
      return [
        { code: 'TOKOPEDIA10', discount: 10000, type: 'flat' },
        { code: 'HEMAT20', discount: 20000, type: 'flat' }
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  const addToCart = useCallback((product, qty = 1) => {
    if (!product) return;
    const addQty = typeof qty === 'number' && qty > 0 ? qty : 1;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + addQty } : item
        );
      }
      return [...prev, { ...product, qty: addQty }];
    });
    if (addNotification) {
      addNotification(`Berhasil menambah ${addQty > 1 ? addQty + 'x ' : ''}${product.name} ke keranjang!`);
    }
  }, [addNotification]);

  const updateCartQty = useCallback((id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && addNotification) {
        addNotification(`${item.name} dihapus dari keranjang.`);
      }
      return prev.filter(i => i.id !== id);
    });
  }, [addNotification]);

  const applyVoucher = useCallback(async (code) => {
    try {
      const v = await api.applyVoucher(code);
      setAppliedVoucher(v);
      if (addNotification) addNotification(`Voucher ${v.code} berhasil digunakan!`);
      return true;
    } catch (err) {
      // Cek fallback lokal
      const v = vouchers.find(x => x.code === code.toUpperCase());
      if (v) {
        setAppliedVoucher(v);
        if (addNotification) addNotification(`Voucher ${code.toUpperCase()} berhasil digunakan!`);
        return true;
      }
      if (addNotification) addNotification(err.message || 'Voucher tidak valid.');
      return false;
    }
  }, [vouchers, addNotification]);

  const removeProcessedItems = useCallback((itemIds) => {
    setCartItems(prev => prev.filter(i => !itemIds.includes(i.id)));
  }, []);

  return {
    cartItems,
    setCartItems,
    checkoutItems,
    setCheckoutItems,
    appliedVoucher,
    setAppliedVoucher,
    vouchers,
    addToCart,
    updateCartQty,
    removeFromCart,
    applyVoucher,
    removeProcessedItems,
  };
}

export default useCart;
