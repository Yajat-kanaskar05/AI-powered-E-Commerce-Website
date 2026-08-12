import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  }, [user]);

  const addToCart = async (productId, qty = 1) => {
    const { data } = await api.post("/cart/add", { productId, qty });
    setCart(data);
  };

  const updateCartItem = async (productId, qty) => {
    const { data } = await api.put("/cart/update", { productId, qty });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, updateCartItem, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);