// src/services/auth.js
export const getToken = async () => {
  try {
    const token = await window.Clerk.session.getToken();
    console.log("Got token:", token ? "Token exists" : "No token"); // Debug log
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw new Error("Not authenticated");
  }
};

export const getCurrentUser = () => {
  try {
    const user = window.Clerk.user;
    console.log("Current user:", user); // Debug log
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
