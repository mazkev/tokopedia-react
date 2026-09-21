import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';

describe('useCart Hook', () => {
  const sampleProduct = {
    id: 'p-1',
    name: 'Wireless Earbuds',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'
  };

  it('harus menginisialisasi cart kosong jika tidak ada data di localStorage', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cartItems).toEqual([]);
  });

  it('harus menambah produk baru ke keranjang dengan kuantitas default 1', () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useCart(mockNotif));

    act(() => {
      result.current.addToCart(sampleProduct);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].qty).toBe(1);
    expect(result.current.cartItems[0].name).toBe('Wireless Earbuds');
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('Berhasil menambah Wireless Earbuds'));
  });

  it('harus menambah kuantitas jika produk yang sama dimasukkan kembali', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(sampleProduct, 1);
    });
    act(() => {
      result.current.addToCart(sampleProduct, 2);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].qty).toBe(3);
  });

  it('harus mengupdate kuantitas barang dan tidak boleh kurang dari 1', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(sampleProduct, 2);
    });

    // Tambah 1 -> jadi 3
    act(() => {
      result.current.updateCartQty('p-1', 1);
    });
    expect(result.current.cartItems[0].qty).toBe(3);

    // Kurang 5 -> clamp minimal 1
    act(() => {
      result.current.updateCartQty('p-1', -5);
    });
    expect(result.current.cartItems[0].qty).toBe(1);
  });

  it('harus menghapus barang dari keranjang saat removeFromCart dipanggil', () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useCart(mockNotif));

    act(() => {
      result.current.addToCart(sampleProduct);
    });
    expect(result.current.cartItems).toHaveLength(1);

    act(() => {
      result.current.removeFromCart('p-1');
    });
    expect(result.current.cartItems).toHaveLength(0);
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('dihapus dari keranjang'));
  });

  it('harus berhasil menerapkan voucher diskon valid secara lokal', async () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useCart(mockNotif));

    let success = false;
    await act(async () => {
      success = await result.current.applyVoucher('TOKOPEDIA10');
    });

    expect(success).toBe(true);
    expect(result.current.appliedVoucher).not.toBeNull();
    expect(result.current.appliedVoucher.code).toBe('TOKOPEDIA10');
    expect(result.current.appliedVoucher.discount).toBe(10000);
  });

  it('harus menolak voucher yang tidak valid', async () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useCart(mockNotif));

    let success = true;
    await act(async () => {
      success = await result.current.applyVoucher('KODESALAH999');
    });

    expect(success).toBe(false);
    expect(result.current.appliedVoucher).toBeNull();
  });

  it('harus menghapus hanya barang yang di-checkout melalui removeProcessedItems', () => {
    const { result } = renderHook(() => useCart());

    const itemA = { id: 'item-A', name: 'Item A', price: 10000 };
    const itemB = { id: 'item-B', name: 'Item B', price: 20000 };

    act(() => {
      result.current.addToCart(itemA);
      result.current.addToCart(itemB);
    });
    expect(result.current.cartItems).toHaveLength(2);

    act(() => {
      result.current.removeProcessedItems(['item-A']);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].id).toBe('item-B');
  });
});
