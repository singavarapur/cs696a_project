import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import PostModal from "../components/PostModal";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5003/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5003/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to like post");

      // Update posts state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const userLiked = post.likes.includes(user.id);
            return {
              ...post,
              likes: userLiked
                ? post.likes.filter((id) => id !== user.id)
                : [...post.likes, user.id],
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!user) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5003/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the post from the posts array
      setPosts(posts.filter((post) => post._id !== postId));
      setSelectedPost(null);
      setIsPostModalOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5003/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      const updatedPost = await response.json();

      // Update posts state with the updated post
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));

      // Update selected post if it's open in modal
      if (selectedPost?._id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  const handleAddComment = async (comment) => {
    if (!selectedPost || !user) return;

    try {
      const response = await fetch(
        `http://localhost:5003/api/posts/${selectedPost._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
          body: JSON.stringify({ content: comment }),
        },
      );

      if (!response.ok) throw new Error("Failed to add comment");

      const updatedPost = await response.json();

      // Update posts state with new comment
      setPosts(
        posts.map((post) =>
          post._id === selectedPost._id ? updatedPost : post,
        ),
      );

      // Update selected post
      setSelectedPost(updatedPost);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <div className="text-center">
          <p className="text-xl font-semibold">Error loading posts</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const PostCard = ({ post }) => (
    <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <Link
          to={`/profile/${post.user?.clerkId}`}
          className="flex items-center"
        >
          <img
            src={post.user?.avatar || "/api/placeholder/32/32"}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-gray-100"
            alt={post.user?.name}
          />
          <div className="ml-2 sm:ml-3">
            <div className="flex items-center">
              <p className="font-medium text-sm sm:text-base hover:underline">
                {post.user?.name || "Anonymous"}
              </p>
              {post.user?.verified && (
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{post.category}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {user?.id === post.user?.clerkId && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeletePost(post._id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete post"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Post Image */}
      <div
        className="cursor-pointer"
        onClick={() => {
          setSelectedPost(post);
          setIsPostModalOpen(true);
        }}
      >
        <img
          src={
            post.image.startsWith("/uploads")
              ? `http://localhost:5003${post.image}`
              : post.image
          }
          className="w-full object-cover max-h-[600px]"
          alt="Design"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLike(post._id)}
              className="group flex items-center space-x-1"
            >
              {post.likes.includes(user?.id) ? (
                <HeartIconSolid className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-red-500" />
              )}
              <span className="text-sm">{post.likes.length}</span>
            </button>
            <button
              onClick={() => {
                setSelectedPost(post);
                setIsPostModalOpen(true);
              }}
              className="group flex items-center space-x-1"
            >
              <ChatBubbleOvalLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-indigo-500" />
              <span className="text-sm">{post.comments.length}</span>
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-2 space-y-2">
          <p className="text-sm sm:text-base">
            <Link
              to={`/profile/${post.user?.clerkId}`}
              className="font-medium hover:underline"
            >
              {post.user?.name}
            </Link>{" "}
            {post.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet</p>
        </div>
      )}

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onDelete={handleDeletePost}
        onDeleteComment={(commentId) =>
          handleDeleteComment(selectedPost._id, commentId)
        }
      />
    </div>
  );
}

export default Feed;
