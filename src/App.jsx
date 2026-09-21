import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
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

// Custom Hooks
import { useNotification } from './hooks/useNotification';
import { useAuth } from './hooks/useAuth';
import { useWishlist } from './hooks/useWishlist';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';

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
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filters, setFilters] = useState({
    condition: null,
    location: null,
    minPrice: null,
    maxPrice: null,
    search: '',
  });

  // 1. Toast Notification Hook
  const { notifications, addNotification } = useNotification();

  // 2. Authentication & User Hook
  const {
    user,
    login,
    register,
    logout,
    resetPassword,
  } = useAuth(addNotification);

  // 3. Wishlist Hook
  const { wishlist, toggleWishlist } = useWishlist(addNotification);

  // 4. Cart & Voucher Hook
  const {
    cartItems,
    checkoutItems,
    setCheckoutItems,
    appliedVoucher,
    setAppliedVoucher,
    addToCart,
    updateCartQty,
    removeFromCart,
    applyVoucher,
    removeProcessedItems,
  } = useCart(addNotification);

  // 5. Orders, Reviews & Payment Hook
  const {
    orders,
    reviews,
    activePaymentOrder,
    setActivePaymentOrder,
    createOrder,
    updateOrderStatus,
    payOrder,
    cancelOrder,
    addReview,
  } = useOrders(user, view, addNotification);

  // Search Handler (Memoized to prevent unnecessary re-render loops in Header)
  const handleSearch = useCallback((query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setView('home');
    window.scrollTo(0, 0);
  }, []);

  // Sinkronisasi Produk dari Backend MongoDB (dengan fallback offline)
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
  }, [products, user, addNotification]);

  // Navigasi & Handlers
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

  // Auth Wrappers with Navigation
  const handleLoginSubmit = async (credentials) => {
    try {
      const loggedUser = await login(credentials);
      if (loggedUser.role === 'admin') {
        window.history.pushState({}, '', '?page=admin');
        setView('admin');
      } else {
        window.history.pushState({}, '', window.location.pathname);
        setView('home');
      }
    } catch {
      // error toast handled in hook
    }
    window.scrollTo(0, 0);
  };

  const handleRegisterSubmit = async (data) => {
    await register(data);
    window.history.pushState({}, '', window.location.pathname);
    setView('home');
    window.scrollTo(0, 0);
  };

  const handleLogoutSubmit = () => {
    logout();
    window.history.pushState({}, '', window.location.pathname);
    setView('home');
    window.scrollTo(0, 0);
  };

  const handleResetPasswordSubmit = async (email, newPassword) => {
    await resetPassword(email, newPassword);
    window.history.pushState({}, '', '?page=login');
    setView('login');
    window.scrollTo(0, 0);
  };

  // Catalog / Admin Product Management
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

  // Checkout & Order Creation
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

    const fallbackOrder = {
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

    await createOrder(orderPayload, fallbackOrder);

    // Hapus barang yang telah dibeli dari keranjang
    const processedIds = itemsToProcess.map(i => i.id);
    removeProcessedItems(processedIds);
    setCheckoutItems([]);
    setAppliedVoucher(null);
    setView('orders');
    window.scrollTo(0, 0);
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

  return (
    <div id="app-root">
      {view !== 'admin' && (
        <Header 
          cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} 
          cartItems={cartItems}
          wishlist={wishlist}
          orders={orders}
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
          onLogout={handleLogoutSubmit}
          onSearch={handleSearch}
        />
      )}

      <main className={view === 'admin' ? 'main-admin-full' : ''}>
        <Suspense fallback={<div className="view-loading-spinner" style={{ textAlign: 'center', padding: '60px 20px', color: '#6c727c' }}>Memuat konten...</div>}>
          {view === 'login' && (
            <AuthPage 
              mode="login" 
              onLogin={handleLoginSubmit} 
              onSwitch={goRegister} 
              onResetPassword={handleResetPasswordSubmit}
              addNotification={addNotification}
            />
          )}

          {view === 'register' && (
            <AuthPage 
              mode="register" 
              onRegister={handleRegisterSubmit} 
              onSwitch={goLogin} 
              onResetPassword={handleResetPasswordSubmit}
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
                  <button className="btn-secondary-forbidden" onClick={() => { handleLogoutSubmit(); goLogin(); }}>
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
                onLogout={handleLogoutSubmit}
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
                    <button className="btn-secondary-forbidden" onClick={() => { handleLogoutSubmit(); goLogin(); }}>
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
              isWishlisted={wishlist.some(item => String(item.id || item._id) === String(selectedProduct.id || selectedProduct._id))}
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
              onApplyVoucher={applyVoucher}
              appliedVoucher={appliedVoucher}
            />
          )}

          {view === 'orders' && (
            <OrdersPage 
              orders={orders} 
              onGoHome={goHome} 
              onAddReview={addReview}
              onCancelOrder={cancelOrder}
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
              onSuccess={payOrder} 
            />
          )}
        </Suspense>
      </main>

      <Notification items={notifications} />
      {view !== 'admin' && <Footer />}
    </div>
  );
}
