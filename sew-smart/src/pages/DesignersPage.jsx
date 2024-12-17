import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  MapPinIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { designers } from "../data/designers";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import AuthModal from "../components/AuthModal";

export default function DesignersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("designers");
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isSignedIn } = useUser();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [wishlistData, ordersData] = await Promise.all([
        api.getWishlist(),
        api.getOrders(),
      ]);
      setWishlist(wishlistData.items);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designer.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const handleAddToCart = async (item) => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    try {
      await addToCart(item);
    } catch (error) {
      setError("Failed to add item to cart");
    }
  };

  const handleRemoveFromWishlist = async (designId) => {
    try {
      await api.removeFromWishlist(designId);
      setWishlist(wishlist.filter((item) => item.designId !== designId));
    } catch (error) {
      setError("Failed to remove item from wishlist");
    }
  };

  const renderDesigners = () => (
    <>
      <div className="max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search designers by name or specialty..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDesigners.map((designer) => (
          <Link
            key={designer.id}
            to={`/designers/${designer.id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {designer.name}
                  </h2>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {designer.location}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-600 text-sm">{designer.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {designer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  const renderWishlist = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {wishlist.map((item) => (
        <div key={item.designId} className="bg-white rounded-xl shadow-sm">
          <div className="aspect-w-4 aspect-h-3">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-t-xl"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-2xl font-bold text-indigo-600 mt-4">
                  ${item.price}
                </p>
              </div>
              <button
                onClick={() => handleRemoveFromWishlist(item.designId)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              </button>
            </div>
            <button
              onClick={() =>
                handleAddToCart({
                  id: item.designId,
                  designerId: item.designerId,
                  title: item.title,
                  price: item.price,
                  image: item.image,
                })
              }
              className="mt-4 w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      ))}
      {wishlist.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          Your wishlist is empty
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  Order placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-medium">
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
                ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item) => (
                <div key={item.designId} className="flex space-x-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-indigo-600">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          You haven't placed any orders yet
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Fashion Designers
        </h1>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("designers")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                activeTab === "designers"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Designers
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                activeTab === "wishlist"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Wishlist
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                activeTab === "orders"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Orders
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === "designers" && renderDesigners()}
          {activeTab === "wishlist" && renderWishlist()}
          {activeTab === "orders" && renderOrders()}
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
