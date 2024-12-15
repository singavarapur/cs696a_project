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

  async addComment(postId, content) {
    return authenticatedFetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
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

  // Error handler helper
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    return response.json();
  },
};
