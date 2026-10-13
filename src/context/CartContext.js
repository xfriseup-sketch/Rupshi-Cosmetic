"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "rupshi-cart";

/**
 * Read cart items from localStorage (client only).
 */
function loadCartFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read cart from localStorage:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  // Start with an empty array so SSR & first client render match (no hydration mismatch)
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null); // { id, message }

  // Hydrate cart from localStorage after mount
  useEffect(() => {
    setItems(loadCartFromStorage());
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [items]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  /**
   * Add a product to the cart. If it already exists, increase quantity by 1.
   */
  const addToCart = useCallback(
    (product) => {
      if (!product?._id) return;
      setItems((prev) => {
        const existing = prev.find((item) => item._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1,
          },
        ];
      });
      showToast("প্রোডাক্ট কার্টে যোগ হয়েছে!");
    },
    [showToast]
  );

  /**
   * Remove a product entirely from the cart.
   */
  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  }, []);

  /**
   * Set an exact quantity for a product (removes it if quantity <= 0).
   */
  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));
    setItems((prev) => {
      if (qty === 0) {
        return prev.filter((item) => item._id !== productId);
      }
      return prev.map((item) =>
        item._id === productId ? { ...item, quantity: qty } : item
      );
    });
  }, []);

  /**
   * Empty the whole cart.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Dynamically calculated totals
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      toast,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      showToast,
    }),
    [
      items,
      toast,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      showToast,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to consume the cart context. Must be used inside <CartProvider>.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
