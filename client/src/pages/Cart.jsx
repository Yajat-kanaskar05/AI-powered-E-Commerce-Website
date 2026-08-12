import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Cart() {
  const { cart, fetchCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user]);

  if (!cart) return <p className="page muted">Loading cart...</p>;

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setCheckingOut(true);
    try {
      const { data } = await api.post("/orders/checkout", {
        shippingAddress: { street, city, postalCode, country },
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <h2>Your Cart</h2>
        <p className="muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h2>Your Cart</h2>

      <div style={{ marginTop: 20 }}>
        {items.map((item) => (
          <div key={item.product._id} className="cart-item">
            <img
              src={item.product.images?.[0] || "https://via.placeholder.com/64"}
              alt={item.product.name}
              className="cart-item-image"
            />
            <div className="cart-item-info">
              <p className="cart-item-name">{item.product.name}</p>
              <p className="cart-item-unit">${item.product.price} each</p>
            </div>
            <input
              type="number"
              min="1"
              max={item.product.stock}
              value={item.qty}
              onChange={(e) => handleQtyChange(item.product._id, Number(e.target.value))}
              className="cart-item-qty"
            />
            <p className="cart-item-subtotal">${(item.product.price * item.qty).toFixed(2)}</p>
            <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.product._id)}>Remove</button>
          </div>
        ))}
      </div>

      <p className="cart-total">Total: ${total.toFixed(2)}</p>

      <h3 style={{ marginBottom: 12 }}>Shipping Address</h3>
      <form onSubmit={handleCheckout} style={{ maxWidth: 380 }}>
        <div className="field">
          <input className="input" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} required />
        </div>
        <div className="field">
          <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="field">
          <input className="input" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
        </div>
        <div className="field">
          <input className="input" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-signal" disabled={checkingOut} style={{ width: "100%" }}>
          {checkingOut ? "Redirecting to payment..." : "Checkout"}
        </button>
      </form>
    </div>
  );
}