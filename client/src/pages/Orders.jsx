import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="page muted">Loading orders...</p>;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h2>Your Orders</h2>
        <p className="muted">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h2>Your Orders</h2>
      <div style={{ marginTop: 20 }}>
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{order._id.slice(-8)}</span>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>
            <p className="order-date">Placed {new Date(order.createdAt).toLocaleDateString()}</p>

            {order.items.map((item, idx) => (
              <div key={idx} className="order-line">
                <span>{item.name} × {item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}

            <p className="order-total">Total: ${order.totalAmount.toFixed(2)}</p>

            {order.shippingAddress && (
              <p className="order-address">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}