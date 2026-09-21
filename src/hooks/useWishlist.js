import { useState, useEffect, useCallback } from 'react';

export function useWishlist(addNotification) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    setWishlist(prev => {
      const exists = prev.some(item => String(item.id || item._id) === String(product.id || product._id));
      if (exists) {
        if (addNotification) addNotification(`${product.name} dihapus dari Wishlist.`);
        return prev.filter(item => String(item.id || item._id) !== String(product.id || product._id));
      } else {
        if (addNotification) addNotification(`❤️ ${product.name} berhasil ditambahkan ke Wishlist!`);
        return [...prev, product];
      }
    });
  }, [addNotification]);

  return {
    wishlist,
    setWishlist,
    toggleWishlist,
  };
}

export default useWishlist;
