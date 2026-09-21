import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  it('harus menginisialisasi user null jika belum ada sesi di localStorage', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('harus memuat user dari localStorage jika sesi valid ada', () => {
    const activeSession = { id: 'u-123', name: 'Budi Santoso', email: 'budi@tokopedia.com', role: 'user' };
    localStorage.setItem('user', JSON.stringify(activeSession));

    const { result } = renderHook(() => useAuth());
    expect(result.current.user).not.toBeNull();
    expect(result.current.user.name).toBe('Budi Santoso');
  });

  it('harus dapat login menggunakan akun default admin secara offline fallback', async () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useAuth(mockNotif));

    let loggedInUser = null;
    await act(async () => {
      loggedInUser = await result.current.login({
        email: 'admin@tokopedia.com',
        password: 'admin123'
      });
    });

    expect(loggedInUser).not.toBeNull();
    expect(loggedInUser.role).toBe('admin');
    expect(result.current.user.role).toBe('admin');
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('Selamat datang kembali'));
  });

  it('harus dapat mendaftarkan akun baru secara fallback lokal', async () => {
    const mockNotif = vi.fn();
    const { result } = renderHook(() => useAuth(mockNotif));

    await act(async () => {
      await result.current.register({
        name: 'Siti Rahma',
        email: 'siti@gmail.com',
        password: 'password123'
      });
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user.name).toBe('Siti Rahma');
    expect(result.current.user.role).toBe('user');
    expect(mockNotif).toHaveBeenCalledWith(expect.stringContaining('Pendaftaran berhasil'));
  });

  it('harus membersihkan sesi user dan token saat logout', async () => {
    const mockNotif = vi.fn();
    localStorage.setItem('token', 'sample-jwt-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Pengguna Aktif', email: 'user@tokopedia.com' }));

    const { result } = renderHook(() => useAuth(mockNotif));
    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNotif).toHaveBeenCalledWith('Berhasil Logout.');
  });
});
