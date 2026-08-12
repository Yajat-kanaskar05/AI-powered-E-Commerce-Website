import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setMessage("");
    try {
      await addToCart(product._id, qty);
      setMessage("Added to cart!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) return <p className="page muted">Loading...</p>;
  if (!product) return <p className="page muted">Product not found.</p>;

  return (
    <div className="page" style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
      <img
        src={product.images?.[0] || "https://via.placeholder.com/360"}
        alt={product.name}
        style={{ width: 360, height: 360, objectFit: "cover", borderRadius: "var(--radius-lg)", background: "var(--line)" }}
      />
      <div style={{ flex: 1, minWidth: 280 }}>
        <p className="product-card-category">{product.category}</p>
        <h2 style={{ margin: "4px 0 12px" }}>{product.name}</h2>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700 }}>${product.price}</p>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 480 }}>{product.description}</p>
        <p style={{ color: product.stock > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600, fontSize: 13 }}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        {product.stock > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Math.min(Number(e.target.value), product.stock))}
              className="input"
              style={{ width: 70 }}
            />
            <button className="btn btn-signal" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        )}

        {message && <p className="muted" style={{ fontSize: 14 }}>{message}</p>}
      </div>
    </div>
  );
}