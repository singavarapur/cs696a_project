import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SignIn } from "@clerk/clerk-react";

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg">
          {/* Modal Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Sign In Content */}
          <div className="p-6">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0",
                  header: "hidden",
                  footer: "hidden",
                  socialButtonsBlockButton:
                    "w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium",
                  formButtonPrimary: "hidden",
                  formFieldInput: "hidden",
                  dividerLine: "hidden",
                  dividerText: "hidden",
                  form: "hidden",
                  socialButtonsProviderIcon: "w-5 h-5 mr-2",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
              routing="virtual"
              redirectUrl={window.location.href}
              afterSignInUrl={window.location.href}
            />

            <p className="mt-4 text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
