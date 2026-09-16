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
const WishlistPage = lazy(() => import('./components/WishlistPage'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));


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
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders')) || []);
  const [notifications, setNotifications] = useState([]);
  const [vouchers, setVouchers] = useState(() => JSON.parse(localStorage.getItem('vouchers')) || [
    { code: 'TOKOPEDIA10', discount: 10000, type: 'flat' },
    { code: 'HEMAT20', discount: 20000, type: 'flat' }
  ]);
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem('reviews')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist')) || []);
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
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);

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

  const handleAddProduct = async (newProductData) => {
    let created;
    try {
      created = await api.createProduct(newProductData);
    } catch (err) {
      console.warn("Gagal simpan produk baru ke API:", err);
      created = {
        ...newProductData,
        id: 'PROD-' + Date.now()
      };
    }
    const finalProd = created && created.id ? created : { ...newProductData, id: (created && created._id) || 'PROD-' + Date.now() };
    setProducts(prev => [finalProd, ...prev]);
    addNotification(`Produk "${finalProd.name}" berhasil ditambahkan ke katalog!`);
    return finalProd;
  };

  const handleLogin = async (credentials) => {
    try {
      const resp = await api.login(credentials);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      if (resp.user.role === 'admin') {
        window.history.pushState({}, '', '?page=admin');
        setView('admin');
      } else {
        window.history.pushState({}, '', window.location.pathname);
        setView('home');
      }
      addNotification(`Selamat datang kembali, ${resp.user.name}!`);
    } catch (err) {
      // Fallback akun lokal jika server backend belum siap
      const foundUser = registeredUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      if (foundUser) {
        setUser({ id: foundUser.id, name: foundUser.name, role: foundUser.role });
        if (foundUser.role === 'admin') {
          window.history.pushState({}, '', '?page=admin');
          setView('admin');
        } else {
          window.history.pushState({}, '', window.location.pathname);
          setView('home');
        }
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
    window.history.pushState({}, '', window.location.pathname);
    setView('home');
    addNotification("Berhasil Logout.");
    window.scrollTo(0, 0);
  };

  const handleRegister = async (data) => {
    try {
      const resp = await api.register(data);
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
      window.history.pushState({}, '', window.location.pathname);
      setView('home');
      addNotification(`Pendaftaran berhasil. Selamat datang, ${resp.user.name}!`);
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
      window.history.pushState({}, '', window.location.pathname);
      setView('home');
      addNotification(`Pendaftaran berhasil. Selamat datang, ${newUser.name}!`);
    }
    window.scrollTo(0, 0);
  };

  const handleResetPassword = async (email, newPassword) => {
    setRegisteredUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
    addNotification("✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.");
    window.history.pushState({}, '', '?page=login');
    setView('login');
    window.scrollTo(0, 0);
  };

  const addToCart = (product, qty = 1) => {
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
    addNotification(`Berhasil menambah ${addQty > 1 ? addQty + 'x ' : ''}${product.name} ke keranjang!`);
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

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addNotification(`${product.name} dihapus dari Wishlist.`);
        return prev.filter(item => item.id !== product.id);
      } else {
        addNotification(`❤️ ${product.name} berhasil ditambahkan ke Wishlist!`);
        return [...prev, product];
      }
    });
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

  const handleCheckout = (selectedItems) => {
    if (!user) {
      setView('login');
      addNotification("Silakan login terlebih dahulu untuk checkout.");
      return;
    }
    const toCheckout = (selectedItems && selectedItems.length > 0) ? selectedItems : cartItems;
    if (toCheckout.length === 0) {
      addNotification("Pilih minimal satu barang di keranjang.");
      return;
    }
    
    setCheckoutItems(toCheckout);
    setView('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentConfirm = async (paymentDetails) => {
    const isObj = paymentDetails && typeof paymentDetails === 'object';
    const method = isObj ? paymentDetails.paymentMethod : paymentDetails;
    const shippingAddress = isObj ? paymentDetails.shippingAddress : null;
    const courier = isObj ? paymentDetails.courier : null;
    const shippingCost = isObj ? (paymentDetails.shippingCost || 0) : 0;
    
    const itemsToProcess = checkoutItems.length > 0 ? checkoutItems : cartItems;
    const subtotal = itemsToProcess.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = appliedVoucher ? (appliedVoucher.discount || 0) : 0;
    const grandTotal = Math.max(0, subtotal + shippingCost - discount);
    
    let createdOrder = null;
    try {
      const orderPayload = {
        items: itemsToProcess.map(item => ({
          id: String(item.id),
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          selectedVariant: item.selectedVariant || null,
          shop: item.shop || 'Tokopedei Store'
        })),
        paymentMethod: method,
        shippingAddress: shippingAddress,
        courier: courier ? courier.name : 'Bebas Ongkir',
        shippingCost: shippingCost,
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
        items: [...itemsToProcess],
        shippingAddress: shippingAddress,
        courier: courier ? courier.name : 'Bebas Ongkir',
        shippingCost: shippingCost,
        total: grandTotal,
        status: 'Menunggu Konfirmasi',
        paymentMethod: method,
        voucherUsed: appliedVoucher ? appliedVoucher.code : null
      };
    }

    setOrders(prev => [createdOrder, ...prev]);
    // Hapus hanya barang yang di-checkout dari keranjang
    const processedIds = itemsToProcess.map(i => i.id);
    setCartItems(prev => prev.filter(i => !processedIds.includes(i.id)));
    setCheckoutItems([]);
    setAppliedVoucher(null);
    setActivePaymentOrder(createdOrder);
    setView('orders');
    addNotification(`Pesanan ${createdOrder.invoiceNumber || createdOrder.id} dibuat! Silakan selesaikan pembayaran.`);
    window.scrollTo(0, 0);
  };

  const handlePayOrder = async (orderId) => {
    try {
      const updated = await api.payOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Diproses' } : o));
      addNotification("Pembayaran berhasil diverifikasi! Pesanan Anda sedang diproses penjual.");
      return updated;
    } catch (err) {
      console.warn("Gagal panggil payOrder API, fallback update lokal:", err);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Diproses' } : o));
      addNotification("Pembayaran berhasil diverifikasi! Pesanan Anda sedang diproses.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    try {
      await api.updateOrderStatus(orderId, 'Dibatalkan');
    } catch {
      // ignore
    }
    setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'Dibatalkan' } : o));
    addNotification(`Pesanan ${orderId} berhasil dibatalkan.`);
  };

  const handleReorder = (order) => {
    if (!order || !order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart(item, item.qty || 1);
    });
    setView('cart');
    addNotification(`Barang dari pesanan berhasil dimasukkan kembali ke keranjang.`);
    window.scrollTo(0, 0);
  };





  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };


  // Sinkronisasi URL query params (?product=... atau ?page=...) dengan tampilan aplikasi
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const page = params.get('page');

      if (productId) {
        if (products.length > 0) {
          const found = products.find(p => String(p.id || p._id) === String(productId));
          if (found) {
            setSelectedProduct(found);
            setView('detail');
            return;
          }
        }
      } else if (page) {
        if (page === 'admin') {
          if (!user) {
            setView('login');
            addNotification("🔒 Akses ditolak: Silakan login sebagai Admin terlebih dahulu.");
            return;
          }
          if (user.role !== 'admin') {
            setView('forbidden');
            addNotification("🚫 Akses ditolak: Halaman ini khusus untuk Administrator.");
            return;
          }
          setView('admin');
          return;
        }
        if (['cart', 'wishlist', 'orders', 'login', 'register', 'forbidden'].includes(page)) {
          setView(page);
          return;
        }
      } else {
        setView('home');
        setSelectedProduct(null);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [products, user]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setView('detail');
    const productId = product.id || product._id;
    if (new URLSearchParams(window.location.search).get('product') !== String(productId)) {
      window.history.pushState({}, '', `?product=${productId}`);
    }
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView('home');
    setSelectedProduct(null);
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  };

  const goCart = () => {
    setView('cart');
    window.history.pushState({}, '', '?page=cart');
    window.scrollTo(0, 0);
  };

  const goOrders = () => {
    setView('orders');
    window.history.pushState({}, '', '?page=orders');
    window.scrollTo(0, 0);
  };

  const goWishlist = () => {
    setView('wishlist');
    window.history.pushState({}, '', '?page=wishlist');
    window.scrollTo(0, 0);
  };

  const goLogin = () => {
    setView('login');
    window.history.pushState({}, '', '?page=login');
    window.scrollTo(0, 0);
  };

  const goRegister = () => {
    setView('register');
    window.history.pushState({}, '', '?page=register');
    window.scrollTo(0, 0);
  };

  const goAdmin = () => {
    if (!user) {
      setView('login');
      addNotification("🔒 Akses ditolak: Silakan login sebagai Admin terlebih dahulu.");
      window.history.pushState({}, '', '?page=login');
      window.scrollTo(0, 0);
      return;
    }
    if (user.role !== 'admin') {
      setView('forbidden');
      addNotification("🚫 Akses ditolak: Halaman ini khusus untuk Administrator.");
      window.history.pushState({}, '', '?page=forbidden');
      window.scrollTo(0, 0);
      return;
    }
    setView('admin');
    window.history.pushState({}, '', '?page=admin');
    window.scrollTo(0, 0);
  };

  return (
    <div id="app-root">
      {view !== 'admin' && (
        <Header 
          cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} 
          cartItems={cartItems}
          wishlist={wishlist}
          goWishlist={goWishlist}
          onToggleWishlist={toggleWishlist}
          onProductClick={handleProductClick}
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
      )}

      <main className={view === 'admin' ? 'main-admin-full' : ''}>
        <Suspense fallback={<div className="view-loading-spinner" style={{ textAlign: 'center', padding: '60px 20px', color: '#6c727c' }}>Memuat konten...</div>}>
        {view === 'login' && (
          <AuthPage 
            mode="login" 
            onLogin={handleLogin} 
            onSwitch={goRegister} 
            onResetPassword={handleResetPassword}
            addNotification={addNotification}
          />
        )}

        {view === 'register' && (
          <AuthPage 
            mode="register" 
            onRegister={handleRegister} 
            onSwitch={goLogin} 
            onResetPassword={handleResetPassword}
            addNotification={addNotification}
          />
        )}

        {view === 'forbidden' && (
          <div className="forbidden-page-container animate-in">
            <div className="forbidden-content">
              <div className="forbidden-icon">🔒</div>
              <h2>Akses Dibatasi (403 Forbidden)</h2>
              <p>
                Halaman Back Office ini memiliki sistem proteksi keamanan dan hanya dapat diakses oleh akun <b>Administrator Tokopedei</b>.
              </p>
              <div className="forbidden-user-status">
                Status Akun Saat Ini: <b>{user ? `${user.name} (${user.role || 'Member'})` : 'Belum Login'}</b>
              </div>
              <div className="forbidden-actions">
                <button className="btn-primary-forbidden" onClick={goHome}>Kembali ke Beranda</button>
                <button className="btn-secondary-forbidden" onClick={() => { handleLogout(); goLogin(); }}>
                  {user ? 'Ganti Akun Admin' : 'Login Sebagai Admin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          user && user.role === 'admin' ? (
            <AdminDashboard 
              orders={orders} 
              products={products}
              onUpdateStatus={updateOrderStatus} 
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
              onGoHome={goHome}
              onLogout={handleLogout}
              addNotification={addNotification}
            />
          ) : (
            <div className="forbidden-page-container animate-in">
              <div className="forbidden-content">
                <div className="forbidden-icon">🔒</div>
                <h2>Akses Dibatasi (403 Forbidden)</h2>
                <p>
                  Halaman Back Office ini memiliki sistem proteksi keamanan dan hanya dapat diakses oleh akun <b>Administrator Tokopedei</b>.
                </p>
                <div className="forbidden-user-status">
                  Status Akun Saat Ini: <b>{user ? `${user.name} (${user.role || 'Member'})` : 'Belum Login'}</b>
                </div>
                <div className="forbidden-actions">
                  <button className="btn-primary-forbidden" onClick={goHome}>Kembali ke Beranda</button>
                  <button className="btn-secondary-forbidden" onClick={() => { handleLogout(); goLogin(); }}>
                    {user ? 'Ganti Akun Admin' : 'Login Sebagai Admin'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {view === 'detail' && selectedProduct && (

          <ProductDetail 
            product={selectedProduct} 
            allProducts={products}
            onProductClick={handleProductClick}
            localReviews={reviews}
            isWishlisted={wishlist.some(item => item.id === selectedProduct.id)}
            onToggleWishlist={toggleWishlist}
            onAddToCart={(prod, qty) => addToCart(prod || selectedProduct, qty)}
            onBuyNow={(prod, qty) => {
              addToCart(prod || selectedProduct, qty);
              setView('cart');
            }}
          />
        )}

        {view === 'wishlist' && (
          <WishlistPage 
            items={wishlist} 
            onAddToCart={addToCart} 
            onRemove={toggleWishlist} 
            onGoHome={goHome} 
            onProductClick={handleProductClick} 
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
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
            onPayOrder={(order) => setActivePaymentOrder(order)}
          />
        )}


        {view === 'payment' && (
          <PaymentPage 
            items={checkoutItems.length > 0 ? checkoutItems : cartItems}
            user={user}
            appliedVoucher={appliedVoucher}
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

        {activePaymentOrder && (
          <PaymentModal 
            order={activePaymentOrder} 
            onClose={() => setActivePaymentOrder(null)} 
            onSuccess={handlePayOrder} 
          />
        )}
        </Suspense>
      </main>

      <Notification items={notifications} />
      {view !== 'admin' && <Footer />}
    </div>
  );
}


