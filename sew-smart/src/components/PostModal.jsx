import { useState } from "react";
import { Link } from "react-router-dom";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/clerk-react";

const PostModal = ({
  isOpen,
  onClose,
  post,
  onLike,
  onAddComment,
  onDelete,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  if (!isOpen || !post) return null;

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-lg flex max-h-[90vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Left side - Image */}
          <div className="w-[60%] bg-black flex items-center">
            <img
              src={
                post.image.startsWith("/uploads")
                  ? `http://localhost:5003${post.image}`
                  : post.image
              }
              alt="Post"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right side - Content */}
          <div className="w-[40%] flex flex-col h-[90vh]">
            {/* Post header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${post.user?.clerkId}`}
                  className="flex items-center group"
                  onClick={onClose}
                >
                  <img
                    src={post.user?.avatar || "/api/placeholder/40/40"}
                    alt={post.user?.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="font-medium group-hover:underline">
                      {post.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">{post.category}</p>
                  </div>
                </Link>
                {user?.id === post.user?.clerkId && (
                  <button
                    onClick={() => onDelete(post._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete post"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Post description */}
            <div className="p-4 border-b">
              <p className="text-sm">{post.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments &&
                post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <img
                      src={comment.user?.avatar || "/api/placeholder/32/32"}
                      alt={comment.user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {comment.user?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete comment"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Post actions */}
            <div className="border-t p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onLike(post._id)}
                  className="flex items-center space-x-1 group"
                >
                  {post.likes.includes(user?.id) ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 group-hover:text-red-500" />
                  )}
                  <span className="text-sm">{post.likes.length} likes</span>
                </button>
                <div className="flex items-center space-x-1">
                  <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                  <span className="text-sm">
                    {post.comments.length} comments
                  </span>
                </div>
              </div>

              {/* Add comment form */}
              <form onSubmit={handleSubmitComment} className="flex space-x-3">
                <img
                  src={user?.imageUrl || "/api/placeholder/32/32"}
                  alt="Your avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows="2"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
