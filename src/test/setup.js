import { beforeEach, afterEach, vi } from 'vitest';

// Bersihkan localStorage sebelum dan sesudah setiap test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// Mock browser globals jika belum tersedia di jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
  window.confirm = vi.fn(() => true);
}
