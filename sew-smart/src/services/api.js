// src/services/api.js
const API_URL = "http://localhost:5003/api";

const getAuthToken = async () => {
  try {
    return await window.Clerk.session.getToken();
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw new Error("Authentication failed");
  }
};

const authenticatedFetch = async (url, options = {}) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const api = {
  // Posts
  async createPost(formData) {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }
    return response.json();
  },

  async getPosts() {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    return response.json();
  },

  async getUserPosts(userId) {
    return authenticatedFetch(`${API_URL}/users/${userId}/posts`);
  },

  async likePost(postId) {
    return authenticatedFetch(`${API_URL}/posts/${postId}/like`, {
      method: "POST",
    });
  },

  async deletePost(postId) {
    return authenticatedFetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
    });
  },

  async addComment(postId, content) {
    return authenticatedFetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(postId, commentId) {
    return authenticatedFetch(
      `${API_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
      },
    );
  },

  // Users
  async createOrUpdateUser(userData) {
    return authenticatedFetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  },

  async getUser(userId) {
    return authenticatedFetch(`${API_URL}/users/${userId}`);
  },

  // Cart operations
  async getCart() {
    return authenticatedFetch(`${API_URL}/cart`);
  },

  async addToCart(item) {
    return authenticatedFetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
  },

  async removeFromCart(designId) {
    return authenticatedFetch(`${API_URL}/cart/${designId}`, {
      method: "DELETE",
    });
  },

  async updateCartItemQuantity(designId, quantity) {
    return authenticatedFetch(`${API_URL}/cart/${designId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });
  },

  // Wishlist operations
  async getWishlist() {
    return authenticatedFetch(`${API_URL}/wishlist`);
  },

  async addToWishlist(item) {
    return authenticatedFetch(`${API_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
  },

  async removeFromWishlist(designId) {
    return authenticatedFetch(`${API_URL}/wishlist/${designId}`, {
      method: "DELETE",
    });
  },

  // Order operations
  async createOrder(orderData) {
    return authenticatedFetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
  },

  async getOrders() {
    return authenticatedFetch(`${API_URL}/orders`);
  },

  async getOrder(orderId) {
    return authenticatedFetch(`${API_URL}/orders/${orderId}`);
  },

  // Error handler helper
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    return response.json();
  },

  // Utility function for handling API errors
  handleError(error) {
    console.error("API Error:", error);
    // You can implement custom error handling logic here
    return {
      error: true,
      message: error.message || "An unexpected error occurred",
    };
  },

  // Helper function to format API requests
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await authenticatedFetch(
        `${API_URL}${endpoint}`,
        options,
      );
      return { data: response, error: null };
    } catch (error) {
      return this.handleError(error);
    }
  },
};

export default api;
