import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useAuth(addNotification) {
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('user'));
      return (saved && typeof saved === 'object' && (saved.name || saved.email)) ? saved : null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('registeredUsers'));
    return saved || [
      { email: 'admin@tokopedia.com', password: 'admin123', name: 'Admin Tokopedia', role: 'admin', id: 'admin-001' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = useCallback(async (credentials) => {
    try {
      const resp = await api.login(credentials);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      if (addNotification) addNotification(`Selamat datang kembali, ${resp.user.name}!`);
      return resp.user;
    } catch (err) {
      // Fallback akun lokal jika server backend belum siap/offline
      const foundUser = registeredUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      );
      if (foundUser) {
        const fallbackUser = { id: foundUser.id, name: foundUser.name, role: foundUser.role };
        setUser(fallbackUser);
        if (addNotification) addNotification(`Selamat datang kembali, ${foundUser.name}!`);
        return fallbackUser;
      } else {
        if (addNotification) addNotification(err.message || 'Email atau password salah! Silakan daftar jika belum punya akun.');
        throw err;
      }
    }
  }, [registeredUsers, addNotification]);

  const register = useCallback(async (data) => {
    try {
      const resp = await api.register(data);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      if (addNotification) addNotification(`Pendaftaran berhasil. Selamat datang, ${resp.user.name}!`);
      return resp.user;
    } catch {
      // Fallback registrasi lokal
      const newUser = {
        id: 'u-' + Date.now(),
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'user'
      };
      setRegisteredUsers(prev => [...prev, newUser]);
      const createdUser = { id: newUser.id, name: newUser.name, role: newUser.role };
      setUser(createdUser);
      if (addNotification) addNotification(`Pendaftaran berhasil. Selamat datang, ${newUser.name}!`);
      return createdUser;
    }
  }, [addNotification]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    if (addNotification) addNotification('Berhasil Logout.');
  }, [addNotification]);

  const resetPassword = useCallback(async (email, newPassword) => {
    setRegisteredUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
    if (addNotification) addNotification('✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
  }, [addNotification]);

  return {
    user,
    setUser,
    registeredUsers,
    login,
    register,
    logout,
    resetPassword,
  };
}

export default useAuth;
