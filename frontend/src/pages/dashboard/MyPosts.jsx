import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/posts?limit=50&my=true")
      .then((res) => setPosts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Link to="/dashboard/create-post" className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500">
          + New Post
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No posts yet.</p>
          <Link to="/dashboard/create-post" className="text-green-400 hover:underline mt-2 inline-block">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    post.type === "investor_post" ? "bg-green-50 text-green-500" : "bg-purple-100 text-purple-700"
                  }`}>
                    {post.type === "investor_post" ? "Investor" : "Business"}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{post.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-400">
                    <span>{post.viewsCount} views</span>
                    <span>{post.category?.join(", ") || "No category"}</span>
                    {post.budget > 0 && <span>Budget: ${post.budget.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/dashboard/edit-post/${post._id}`} className="text-green-400 hover:underline text-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
