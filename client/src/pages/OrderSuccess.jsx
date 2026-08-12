import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <h2>Payment successful 🎉</h2>
      <p className="muted">
        Your order {orderId ? `#${orderId.slice(-8)}` : ""} has been placed.
      </p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
        View your orders
      </Link>
    </div>
  );
}