import { useState, useEffect, useRef } from 'react';
import { fetchAllProducts, filterProducts } from '../data/products';
import ProductCard from './ProductCard';

export default function ProductGrid({ products: productsProp, filters, onProductClick }) {
  const [allProducts, setAllProducts] = useState(productsProp || []);
  const [displayed, setDisplayed] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!productsProp);
  const sentinelRef = useRef(null);
  const PAGE_SIZE = 8;

  // Sync internal state with prop
  useEffect(() => {
    if (productsProp) {
      setAllProducts(productsProp);
      setLoading(false);
    }
  }, [productsProp]);

  // Fetch only if not provided
  useEffect(() => {
    if (!productsProp) {
      setLoading(true);
      fetchAllProducts().then((data) => {
        setAllProducts(data);
        setLoading(false);
      });
    }
  }, [productsProp]);


  // Apply filters and reset pagination
  useEffect(() => {
    const filtered = filterProducts(allProducts, filters);
    setDisplayed(filtered.slice(0, PAGE_SIZE));
    setPage(1);
  }, [filters, allProducts]);

  // Infinite scroll — load more from already-fetched & filtered list
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayed]);

  useEffect(() => {
    if (page <= 1) return;
    const filtered = filterProducts(allProducts, filters);
    const nextSlice = filtered.slice(0, page * PAGE_SIZE);
    setDisplayed(nextSlice);
  }, [page, allProducts, filters]);

  const filtered = filterProducts(allProducts, filters);
  const hasMore = displayed.length < filtered.length;

  return (
    <section className="products-section" id="products-section">
      <div className="section-header">
        <h2 className="section-title">Rekomendasi Untukmu</h2>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Memuat produk...</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="loading-spinner">
          <span>Tidak ada produk yang sesuai filter</span>
        </div>
      ) : (
        <>
          <div className="products-grid" id="products-grid">
            {displayed.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={onProductClick}
              />
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

          {!hasMore && displayed.length > 0 && (
            <div className="loading-spinner">
              <span>Semua produk telah ditampilkan</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}

