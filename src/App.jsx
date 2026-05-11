import { useState, useEffect } from 'react';
import Header from './components/Header';
import Carousel from './components/Carousel';
import ServiceIcons from './components/ServiceIcons';
import FlashSale from './components/FlashSale';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import Notification from './components/Notification';
import Footer from './components/Footer';
import PaymentPage from './components/PaymentPage';


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

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null); 
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

  useEffect(() => {
    import('./data/products').then(m => {
      m.fetchAllProducts().then(data => setProducts(data));
    });
  }, []);


  const handleApplyVoucher = (code) => {
    const v = vouchers.find(x => x.code === code.toUpperCase());
    if (v) {
      setAppliedVoucher(v);
      addNotification(`Voucher ${code.toUpperCase()} berhasil digunakan!`);
      return true;
    } else {
      addNotification("Voucher tidak valid.");
      return false;
    }
  };

  const handleAddReview = (orderId, productId, reviewData) => {
    const newReview = {
      id: Date.now(),
      orderId,
      productId,
      userName: user.name,
      ...reviewData,
      date: new Date().toLocaleDateString('id-ID')
    };
    setReviews(prev => [...prev, newReview]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewed: true } : o));
    addNotification("Terima kasih atas ulasanmu!");
  };


  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addNotification(`Produk "${updatedProduct.name}" berhasil diupdate!`);
  };


  const handleLogin = (credentials) => {
    const foundUser = registeredUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (foundUser) {
      setUser({ id: foundUser.id, name: foundUser.name, role: foundUser.role });
      setView(foundUser.role === 'admin' ? 'admin' : 'home');
      addNotification(`Selamat datang kembali, ${foundUser.name}!`);
    } else {
      addNotification("Email atau password salah! Silakan daftar jika belum punya akun.");
    }
    window.scrollTo(0, 0);
  };


  const handleLogout = () => {
    setUser(null);
    setView('home');
    addNotification("Berhasil Logout.");
  };

  const handleRegister = (data) => {
    const newUser = {
      id: 'u-' + Date.now(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'user' // Strictly regular account for new registrations
    };
    
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser({ id: newUser.id, name: newUser.name, role: newUser.role });
    setView('home');
    addNotification(`Pendaftaran berhasil. Selamat datang ${newUser.name}!`);
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

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    addNotification(`Status pesanan ${orderId} diupdate ke: ${newStatus}`);
  };

  const handleCheckout = () => {
    if (!user) {
      setView('login');
      addNotification("Silakan login terlebih dahulu untuk checkout.");
      return;
    }
    if (cartItems.length === 0) return;
    
    // Go to payment page instead of success
    setView('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentConfirm = (method) => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = appliedVoucher ? appliedVoucher.discount : 0;
    
    const newOrder = {
      id: 'INV/' + Date.now().toString().slice(-8),
      userId: user.id,
      userName: user.name,
      date: new Date().toLocaleString('id-ID'),
      items: [...cartItems],
      total: Math.max(0, subtotal - discount),
      status: 'Menunggu Konfirmasi',
      paymentMethod: method,
      voucherUsed: appliedVoucher ? appliedVoucher.code : null
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedVoucher(null); // Clear voucher after use
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
              <p>Terima kasih telah berbelanja di Tokopedia. Pesananmu akan segera diproses oleh penjual.</p>
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

      </main>

      <Notification items={notifications} />
      <Footer />
    </div>
  );
}


