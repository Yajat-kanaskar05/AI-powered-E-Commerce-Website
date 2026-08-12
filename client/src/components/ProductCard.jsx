import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <img
        src={product.images?.[0] || "https://via.placeholder.com/220"}
        alt={product.name}
        className="product-card-image"
      />
      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h4 className="product-card-name">{product.name}</h4>
        <div className="product-card-footer">
          <span className="product-card-price">${product.price}</span>
          {product.score && (
            <div className="match-score">
              <span className="match-score-value">{(product.score * 100).toFixed(0)}% match</span>
              <div className="match-score-bar">
                <div
                  className="match-score-fill"
                  style={{ width: `${Math.min(product.score * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}