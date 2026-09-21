import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishlist } from '../useWishlist';

describe('useWishlist Hook', () => {
  it('harus menginisialisasi wishlist kosong dari awal', () => {
    const { result } = renderHook(() => useWishlist());
    expect(result.current.wishlist).toEqual([]);
  });

  it('harus membaca wishlist yang tersimpan dari localStorage', () => {
    const saved = [{ id: 'prod-1', name: 'Sepatu Lari', price: 150000 }];
    localStorage.setItem('wishlist', JSON.stringify(saved));

    const { result } = renderHook(() => useWishlist());
    expect(result.current.wishlist).toHaveLength(1);
    expect(result.current.wishlist[0].name).toBe('Sepatu Lari');
  });

  it('harus menambahkan barang ke wishlist saat toggle pertama kali', () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useWishlist(mockNotif));

    const sample = { id: 'prod-101', name: 'Kemeja Formal' };
    act(() => {
      result.current.toggleWishlist(sample);
    });

    expect(result.current.wishlist).toHaveLength(1);
    expect(result.current.wishlist[0].id).toBe('prod-101');
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('Kemeja Formal berhasil ditambahkan'));

    // Verifikasi tersimpan ke localStorage
    const inStorage = JSON.parse(localStorage.getItem('wishlist'));
    expect(inStorage).toHaveLength(1);
  });

  it('harus menghapus barang dari wishlist saat toggle kedua kali', () => {
    const mockNotif = vi.fn();
    const sample = { id: 'prod-101', name: 'Kemeja Formal' };
    localStorage.setItem('wishlist', JSON.stringify([sample]));

    const { result } = renderHook(() => useWishlist(mockNotif));
    expect(result.current.wishlist).toHaveLength(1);

    act(() => {
      result.current.toggleWishlist(sample);
    });

    expect(result.current.wishlist).toHaveLength(0);
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('Kemeja Formal dihapus'));
  });
});
