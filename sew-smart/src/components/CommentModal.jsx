import { useState } from "react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUser } from "@clerk/clerk-react";

const CommentModal = ({
  isOpen,
  onClose,
  post,
  onAddComment,
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
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Comments</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {post.comments && post.comments.length > 0 ? (
                [...post.comments].reverse().map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <img
                      src={comment.user?.avatar || "/api/placeholder/32/32"}
                      alt={comment.user?.name || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {comment.user?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
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
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Add Comment Form */}
          <div className="border-t p-4 bg-gray-50">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex space-x-3">
                <img
                  src={user?.imageUrl || "/api/placeholder/40/40"}
                  alt="Your avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none bg-white text-base placeholder:text-gray-400"
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting...
                        </div>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
