import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isSignedIn]);

  const fetchCart = async () => {
    try {
      const cartData = await api.getCart();
      setCart(cartData.items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (item) => {
    if (!isSignedIn) {
      return false;
    }

    try {
      setIsLoading(true);
      const response = await api.addToCart({
        designId: item.id.toString(),
        designerId: item.designerId.toString(),
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      setCart(response.items);
      setIsCartOpen(true);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (designId) => {
    try {
      setIsLoading(true);
      const response = await api.removeFromCart(designId.toString());
      setCart(response.items);
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (designId, quantity) => {
    try {
      setIsLoading(true);
      const response = await api.updateCartItemQuantity(
        designId.toString(),
        quantity,
      );
      setCart(response.items);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
