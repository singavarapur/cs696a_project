import { useState } from "react";
import { useParams } from "react-router-dom";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { designers } from "../data/designers";

const DesignerDetail = () => {
  const { id } = useParams();
  const designer = designers.find((d) => d.id === parseInt(id));
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  if (!designer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Designer not found</h2>
      </div>
    );
  }

  const toggleWishlist = (designId) => {
    setWishlist((prev) =>
      prev.includes(designId)
        ? prev.filter((id) => id !== designId)
        : [...prev, designId],
    );
  };

  const addToCart = (design) => {
    setCart((prev) => [...prev, design]);
  };

  const removeFromCart = (designId) => {
    setCart((prev) => prev.filter((item) => item.id !== designId));
  };

  const handleCheckout = () => {
    // Simulate payment processing
    setTimeout(() => {
      setShowPaymentSuccess(true);
      setCart([]);
      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Designer Header */}
      <div className="flex items-center space-x-6 mb-12">
        <img
          src={designer.avatar}
          alt={designer.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {designer.name}
          </h1>
          <p className="text-gray-600 max-w-2xl mb-4">{designer.bio}</p>
          <div className="flex flex-wrap gap-2">
            {designer.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {designer.designs.map((design) => (
          <div key={design.id} className="bg-white rounded-xl shadow-sm">
            <img
              src={design.image}
              alt={design.title}
              className="w-full h-80 object-cover rounded-t-xl"
            />
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {design.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{design.description}</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-4">
                    ${design.price}
                  </p>
                </div>
                <button
                  onClick={() => toggleWishlist(design.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  {wishlist.includes(design.id) ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              <button
                onClick={() => addToCart(design)}
                disabled={
                  !design.inStock || cart.some((item) => item.id === design.id)
                }
                className={`mt-4 w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2
                  ${
                    design.inStock &&
                    !cart.some((item) => item.id === design.id)
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>
                  {!design.inStock
                    ? "Out of Stock"
                    : cart.some((item) => item.id === design.id)
                      ? "Added to Cart"
                      : "Add to Cart"}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-indigo-600">${item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total:</span>
              <span>
                ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDetail;
