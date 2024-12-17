import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  HeartIcon,
  ShoppingCartIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/clerk-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import AuthModal from "../components/AuthModal";
import { designers } from "../data/designers";

const DesignerDetail = () => {
  const { id } = useParams();
  const designer = designers.find((d) => d.id === parseInt(id));
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isSignedIn } = useUser();
  const { addToCart, removeFromCart, updateQuantity, cart } = useCart();

  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    }
  }, [isSignedIn]);

  const fetchWishlist = async () => {
    try {
      const response = await api.getWishlist();
      setWishlist(response.items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load wishlist");
    }
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const toggleWishlist = async (design) => {
    if (!isSignedIn) {
      return handleAuthRequired();
    }

    try {
      const designId = design.id.toString();
      const isInWishlist = wishlist.some((item) => item.designId === designId);

      if (isInWishlist) {
        await api.removeFromWishlist(designId);
        setWishlist(wishlist.filter((item) => item.designId !== designId));
      } else {
        const response = await api.addToWishlist({
          designId,
          designerId: designer.id.toString(),
          title: design.title,
          price: design.price,
          image: design.image,
        });
        setWishlist(response.items);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setError("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (design) => {
    if (!isSignedIn) {
      return handleAuthRequired();
    }

    try {
      await addToCart({
        id: design.id,
        designerId: designer.id,
        title: design.title,
        price: design.price,
        image: design.image,
      });
    } catch (error) {
      setError("Failed to add item to cart");
    }
  };

  if (!designer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Designer not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Designer Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <img
          src={designer.avatar}
          alt={designer.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
        />
        <div className="flex-1">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {designer.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-4">
              <MapPinIcon className="h-5 w-5" />
              <span>{designer.location}</span>
            </div>
          </div>
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
        {designer.designs.map((design) => {
          const isInCart = cart.some(
            (item) => item.designId === design.id.toString(),
          );
          const cartItem = cart.find(
            (item) => item.designId === design.id.toString(),
          );
          const isInWishlist = wishlist.some(
            (item) => item.designId === design.id.toString(),
          );

          return (
            <div
              key={design.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
              </div>
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
                    onClick={() => toggleWishlist(design)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isInWishlist ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>

                {isInCart ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (cartItem.quantity > 1) {
                              updateQuantity(
                                design.id.toString(),
                                cartItem.quantity - 1,
                              );
                            }
                          }}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span>{cartItem.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              design.id.toString(),
                              cartItem.quantity + 1,
                            )
                          }
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(design.id.toString())}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(design)}
                    disabled={!design.inStock}
                    className={`mt-4 w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2
                      ${
                        design.inStock
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>
                      {design.inStock ? "Add to Cart" : "Out of Stock"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Error Message */}
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
};

export default DesignerDetail;
