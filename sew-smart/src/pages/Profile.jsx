import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import PostModal from "../components/PostModal";

function Profile() {
  const { id } = useParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (!isUserLoaded) return;
    fetchProfileData();
  }, [id, isUserLoaded]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch user profile
      const userResponse = await fetch(
        `http://localhost:5003/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
        },
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch profile");
      }

      const userData = await userResponse.json();

      // Fetch user's posts
      const postsResponse = await fetch(
        `http://localhost:5003/api/users/${id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${await window.Clerk.session.getToken()}`,
          },
        },
      );

      if (!postsResponse.ok) {
        throw new Error("Failed to fetch posts");
      }

      const postsData = await postsResponse.json();

      // Combine profile and posts data
      setProfileData({
        ...userData,
        posts: postsData,
        stats: {
          posts: postsData.length,
        },
      });
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

      const updatedPost = await response.json();

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post._id === postId ? updatedPost : post,
        ),
      }));

      // Update selected post if it's open in modal
      if (selectedPost?._id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (content) => {
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
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) throw new Error("Failed to add comment");

      const updatedPost = await response.json();

      // Update posts in the profile data
      setProfileData((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post._id === selectedPost._id ? updatedPost : post,
        ),
      }));

      // Update the selected post in the modal
      setSelectedPost(updatedPost);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (isLoading || !isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchProfileData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile not found
          </h2>
          <p className="mt-2 text-gray-600">
            The requested profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Profile Header */}
      <div className="px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center">
          <img
            src={profileData.avatar || `/api/placeholder/128/128`}
            alt={profileData.name}
            className="w-32 h-32 rounded-full border-2 border-gray-200 object-cover"
          />

          <div className="mt-6 sm:mt-0 sm:ml-8 flex-1">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <h1 className="text-xl font-semibold">{profileData.username}</h1>
              {isOwnProfile && (
                <button className="px-6 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Edit Profile
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8 my-6">
              <div className="text-center sm:text-left">
                <div className="font-semibold">{profileData.stats.posts}</div>
                <div className="text-gray-500 text-sm">posts</div>
              </div>
            </div>

            {/* Bio */}
            <div className="text-center sm:text-left">
              <h2 className="font-semibold">{profileData.name}</h2>
              <p className="text-gray-600 mt-1">{profileData.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="px-4">
        {profileData.posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-6 mt-4">
            {profileData.posts.map((post) => (
              <div
                key={post._id}
                className="relative aspect-square cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={
                    post.image.startsWith("/uploads")
                      ? `http://localhost:5003${post.image}`
                      : post.image
                  }
                  alt=""
                  className="w-full h-full object-cover rounded-sm sm:rounded-lg hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Squares2X2Icon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-lg">No posts yet</p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onLike={handleLike}
        onAddComment={handleAddComment}
      />
    </div>
  );
}

export default Profile;
