import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import {
  PlusIcon,
  UserIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";

export default function Navbar() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors ${
        location.pathname === to
          ? "text-indigo-600 font-medium"
          : "text-gray-600"
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 font-bold text-xl text-indigo-600 hover:text-indigo-700"
            >
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="hidden sm:inline">SewSmart</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <SignedIn>
                <NavLink to="/" icon={HomeIcon}>
                  Feed
                </NavLink>
                <NavLink to="/designers" icon={UsersIcon}>
                  Designers
                </NavLink>
                <NavLink to={`/profile/${user?.id}`} icon={UserIcon}>
                  Profile
                </NavLink>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-8 w-8 rounded-full ring-2 ring-indigo-100 hover:ring-indigo-200",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
              <SignedOut>
                <NavLink to="/designers" icon={UsersIcon}>
                  Designers
                </NavLink>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign in
                </button>
              </SignedOut>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <SignedIn>
                <NavLink to="/" icon={HomeIcon}>
                  Feed
                </NavLink>
                <NavLink to="/designers" icon={UsersIcon}>
                  Designers
                </NavLink>
                <NavLink to={`/profile/${user?.id}`} icon={UserIcon}>
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 p-2 w-full rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                </button>
                <div className="p-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "h-8 w-8 rounded-full ring-2 ring-indigo-100 hover:ring-indigo-200",
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </SignedIn>
              <SignedOut>
                <NavLink to="/designers" icon={UsersIcon}>
                  Designers
                </NavLink>
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign in
                </button>
              </SignedOut>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Action Button - Only shown when signed in */}
      <SignedIn>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </SignedIn>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
