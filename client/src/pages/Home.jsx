import { useState, useEffect } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    if (!searchActive) fetchProducts();
  }, [page, searchActive]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}&limit=8`);
      setProducts(data.products);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, mode) => {
    if (!query.trim()) {
      setSearchActive(false);
      return;
    }
    setLoading(true);
    setSearchActive(true);
    try {
      const endpoint = mode === "ai" ? "/products/search-ai" : "/products";
      const param = mode === "ai" ? "q" : "search";
      const { data } = await api.get(`${endpoint}?${param}=${encodeURIComponent(query)}`);
      setProducts(mode === "ai" ? data : data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Products</h1>
      <SearchBar onSearch={handleSearch} />

      {searchActive && (
        <button className="btn btn-ghost btn-sm" onClick={() => setSearchActive(false)}>
          Clear search
        </button>
      )}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <>
          <div className="product-grid">
            {products.length === 0 && <p className="muted">No products found.</p>}
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {!searchActive && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span>Page {page} / {pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}