import { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Carousel from './components/Carousel';
import ServiceIcons from './components/ServiceIcons';
import FlashSale from './components/FlashSale';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import Notification from './components/Notification';
import Footer from './components/Footer';
import { api } from './services/api';
import { fetchAllProducts } from './data/products';

// Code-split komponen sekunder untuk mempercepat initial load beranda
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const CartPage = lazy(() => import('./components/CartPage'));
const OrdersPage = lazy(() => import('./components/OrdersPage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));


export default function App() {
  const [filters, setFilters] = useState({
    condition: null,
    location: null,
    minPrice: null,
    maxPrice: null,
    search: '',
  });

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setView('home'); // Searching always takes you to the homepage results
    window.scrollTo(0, 0);
  };


  const [view, setView] = useState('home'); 
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Initialize from LocalStorage
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('cartItems')) || []);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders')) || []);
  const [notifications, setNotifications] = useState([]);
  const [vouchers, setVouchers] = useState(() => JSON.parse(localStorage.getItem('vouchers')) || [
    { code: 'TOKOPEDIA10', discount: 10000, type: 'flat' },
    { code: 'HEMAT20', discount: 20000, type: 'flat' }
  ]);
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem('reviews')) || []);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

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
    return saved || [{ email: 'admin@tokopedia.com', password: 'admin123', name: 'Admin Tokopedia', role: 'admin', id: 'admin-001' }];
  });

  // Persist to LocalStorage
  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('vouchers', JSON.stringify(vouchers)); }, [vouchers]);
  useEffect(() => { localStorage.setItem('reviews', JSON.stringify(reviews)); }, [reviews]);

  // 1. Sinkronisasi Produk dari Backend MongoDB (dengan fallback)
  useEffect(() => {
    api.getProducts()
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          fetchAllProducts().then(setProducts);
        }
      })
      .catch(() => {
        fetchAllProducts().then(setProducts);
      });
  }, []);

  // 2. Sinkronisasi Pesanan dari Backend saat user login atau membuka menu orders/admin
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

  const handleApplyVoucher = async (code) => {
    try {
      const v = await api.applyVoucher(code);
      setAppliedVoucher(v);
      addNotification(`Voucher ${v.code} berhasil digunakan!`);
      return true;
    } catch (err) {
      // Cek fallback lokal
      const v = vouchers.find(x => x.code === code.toUpperCase());
      if (v) {
        setAppliedVoucher(v);
        addNotification(`Voucher ${code.toUpperCase()} berhasil digunakan!`);
        return true;
      }
      addNotification(err.message || "Voucher tidak valid.");
      return false;
    }
  };

  const handleAddReview = async (orderId, productId, reviewData) => {
    try {
      await api.createReview({
        orderId: String(orderId),
        productId: String(productId),
        rating: reviewData.rating,
        comment: reviewData.comment
      });
    } catch (err) {
      console.warn("Gagal simpan review ke API:", err);
    }
    const newReview = {
      id: Date.now(),
      orderId,
      productId,
      userName: user?.name || 'User',
      ...reviewData,
      date: new Date().toLocaleDateString('id-ID')
    };
    setReviews(prev => [...prev, newReview]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewed: true } : o));
    addNotification("Terima kasih atas ulasanmu!");
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await api.updateProduct(updatedProduct.id, updatedProduct);
    } catch (err) {
      console.warn("Gagal update produk ke API:", err);
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addNotification(`Produk "${updatedProduct.name}" berhasil diupdate!`);
  };

  const handleLogin = async (credentials) => {
    try {
      const resp = await api.login(credentials);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      setView(resp.user.role === 'admin' ? 'admin' : 'home');
      addNotification(`Selamat datang kembali, ${resp.user.name}!`);
    } catch (err) {
      // Fallback akun lokal jika server backend belum siap
      const foundUser = registeredUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      if (foundUser) {
        setUser({ id: foundUser.id, name: foundUser.name, role: foundUser.role });
        setView(foundUser.role === 'admin' ? 'admin' : 'home');
        addNotification(`Selamat datang kembali, ${foundUser.name}!`);
      } else {
        addNotification(err.message || "Email atau password salah! Silakan daftar jika belum punya akun.");
      }
    }
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('home');
    addNotification("Berhasil Logout.");
  };

  const handleRegister = async (data) => {
    try {
      const resp = await api.register(data);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      setView('home');
      addNotification(`Pendaftaran berhasil. Selamat datang ${resp.user.name}!`);
    } catch (err) {
      // Fallback registrasi lokal
      const newUser = {
        id: 'u-' + Date.now(),
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'user'
      };
      setRegisteredUsers(prev => [...prev, newUser]);
      setUser({ id: newUser.id, name: newUser.name, role: newUser.role });
      setView('home');
      addNotification(`Pendaftaran berhasil. Selamat datang ${newUser.name}!`);
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    addNotification(`Berhasil menambah ${product.name} ke keranjang!`);
  };

  const updateCartQty = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(prev => prev.filter(i => i.id !== id));
    if (item) addNotification(`${item.name} dihapus dari keranjang.`);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.warn("Gagal update status di backend:", err);
    }
    setOrders(prev => prev.map(order => 
      (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
    ));
    addNotification(`Status pesanan diupdate ke: ${newStatus}`);
  };

  const handleCheckout = () => {
    if (!user) {
      setView('login');
      addNotification("Silakan login terlebih dahulu untuk checkout.");
      return;
    }
    if (cartItems.length === 0) return;
    
    setView('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentConfirm = async (method) => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = appliedVoucher ? appliedVoucher.discount : 0;
    
    let createdOrder = null;
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          id: String(item.id),
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          shop: item.shop || 'Tokopedei Store'
        })),
        paymentMethod: method,
        voucherCode: appliedVoucher ? appliedVoucher.code : ''
      };
      createdOrder = await api.createOrder(orderPayload);
    } catch (err) {
      console.warn("Gagal kirim order ke API, fallback simpan lokal:", err);
      createdOrder = {
        id: 'INV/' + Date.now().toString().slice(-8),
        userId: user?.id || 'guest',
        userName: user?.name || 'User',
        date: new Date().toLocaleString('id-ID'),
        items: [...cartItems],
        total: Math.max(0, subtotal - discount),
        status: 'Menunggu Konfirmasi',
        paymentMethod: method,
        voucherUsed: appliedVoucher ? appliedVoucher.code : null
      };
    }

    setOrders(prev => [createdOrder, ...prev]);
    setCartItems([]);
    setAppliedVoucher(null);
    setView('success');
    addNotification(`Pembayaran via ${method.toUpperCase()} berhasil! Pesanan sedang diproses.`);
    window.scrollTo(0, 0);
  };





  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };


  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView('home');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const goCart = () => {
    setView('cart');
    window.scrollTo(0, 0);
  };

  const goOrders = () => {
    setView('orders');
    window.scrollTo(0, 0);
  };

  const goLogin = () => setView('login');
  const goRegister = () => setView('register');
  const goAdmin = () => setView('admin');

  return (
    <div id="app-root">
      <Header 
        cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} 
        cartItems={cartItems}
        user={user}
        goHome={goHome} 
        goCart={goCart}
        goOrders={goOrders}
        goLogin={goLogin}
        goRegister={goRegister}
        goAdmin={goAdmin}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      <main>
        <Suspense fallback={<div className="view-loading-spinner" style={{ textAlign: 'center', padding: '60px 20px', color: '#6c727c' }}>Memuat konten...</div>}>
        {view === 'login' && (
          <AuthPage mode="login" onLogin={handleLogin} onSwitch={goRegister} />
        )}

        {view === 'register' && (
          <AuthPage mode="register" onRegister={handleRegister} onSwitch={goLogin} />
        )}

        {view === 'admin' && (
          <AdminDashboard 
            orders={orders} 
            products={products}
            onUpdateStatus={updateOrderStatus} 
            onUpdateProduct={handleUpdateProduct}
            onGoHome={goHome}
            onLogout={handleLogout}
            addNotification={addNotification}
          />
        )}

        {view === 'detail' && selectedProduct && (

          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={() => addToCart(selectedProduct)}
          />
        )}

        {view === 'cart' && (
          <CartPage 
            items={cartItems} 
            onUpdateQty={updateCartQty} 
            onRemove={removeFromCart}
            onGoHome={goHome}
            onCheckout={handleCheckout}
            onApplyVoucher={handleApplyVoucher}
            appliedVoucher={appliedVoucher}
          />
        )}

        {view === 'orders' && (
          <OrdersPage 
            orders={orders} 
            onGoHome={goHome} 
            onAddReview={handleAddReview}
          />
        )}


        {view === 'payment' && (
          <PaymentPage 
            total={Math.max(0, cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) - (appliedVoucher ? appliedVoucher.discount : 0))}
            onConfirm={handlePaymentConfirm}
            onCancel={goCart}
          />
        )}


        {view === 'success' && (
          <div className="checkout-success-container animate-in">
            <div className="success-content">
              <div className="success-icon">🎉</div>
              <h2>Pembayaran Berhasil!</h2>
              <p>Terima kasih telah berbelanja di Tokopedei. Pesananmu akan segera diproses oleh penjual.</p>
              <div className="success-actions">
                <button className="btn-track" onClick={goOrders}>Cek Status Pesanan</button>
                <button className="btn-home-success" onClick={goHome}>Belanja Lagi</button>
              </div>
            </div>
          </div>
        )}


        {view === 'home' && (
          <>
            <Carousel />
            <ServiceIcons />
            <FlashSale onProductClick={handleProductClick} />
            <FilterBar filters={filters} onChange={setFilters} />
            <ProductGrid 
              products={products}
              filters={filters} 
              onProductClick={handleProductClick} 
            />
          </>
        )}
        </Suspense>
      </main>

      <Notification items={notifications} />
      <Footer />
    </div>
  );
}


