import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-dot" />
        ShopAI
      </Link>
      <div className="navbar-links">
        <Link to="/cart">Cart</Link>
        {user ? (
          <>
            <Link to="/orders">Orders</Link>
            <span className="navbar-user">Hi, {user.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}