import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    isLoading,
  } = useCart();

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    try {
      await api.createOrder({
        items: cart,
        totalAmount: cartTotal,
      });

      setShowPaymentSuccess(true);
      clearCart();

      setTimeout(() => {
        setShowPaymentSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error) {
      setError("Failed to process order. Please try again.");
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto z-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.designId}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-indigo-600">${item.price}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.designId, item.quantity - 1);
                          }
                        }}
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        disabled={isLoading}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.designId, item.quantity + 1)
                        }
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        disabled={isLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.designId)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </div>
        </div>
      )}
    </>
  );
}
