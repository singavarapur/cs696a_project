import { useState, useEffect } from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import DesignersPage from "./pages/DesignersPage";
import DesignerDetail from "./pages/DesignerDetail";
import { api } from "./services/api";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

const ClerkUserSync = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (!syncAttempted && isLoaded && isSignedIn && user) {
        try {
          const userData = {
            clerkId: user.id,
            username:
              user.username ||
              user.primaryEmailAddress?.emailAddress.split("@")[0],
            name: user.fullName || user.username,
            avatar: user.imageUrl,
            bio: "",
            email: user.primaryEmailAddress?.emailAddress,
          };
          await api.createOrUpdateUser(userData);
          setSyncAttempted(true);
        } catch (error) {
          console.error("Error syncing user:", error);
          setSyncError(error.message);
        }
      }
    };
    syncUserWithDatabase();
  }, [isLoaded, isSignedIn, user, syncAttempted]);

  if (syncError) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error syncing user data: {syncError}</p>
        <button
          onClick={() => {
            setSyncError(null);
            setSyncAttempted(false);
          }}
          className="underline ml-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
};

const PublicOnlyRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function Routes() {
  return (
    <>
      <ClerkUserSync />
      <RouterRoutes>
        <Route path="/" element={<Feed />} />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        {/* Designer Routes - Available to all users */}
        <Route path="/designers" element={<DesignersPage />} />
        <Route path="/designers/:id" element={<DesignerDetail />} />
        <Route
          path="/sign-in"
          element={
            <PublicOnlyRoute>
              <Navigate to="/" replace />
            </PublicOnlyRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </>
  );
}

export default Routes;
