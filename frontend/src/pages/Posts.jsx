import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Eye, Pencil, Trash2, LayoutGrid, LayoutList, Tag } from "lucide-react";
import API from "../api";

const VIEW_KEY = "myPostsView";

function Badge({ post }) {
  const isInvestor = post.type === "investor_post";
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
        isInvestor ? "bg-emerald-50 text-emerald-700" : "bg-slate-800 text-white"
      }`}
    >
      {isInvestor ? "Investor" : "Business"}
    </span>
  );
}

function Actions({ id, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/dashboard/edit-post/${id}`}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 hover:text-slate-900"
      >
        <Pencil size={14} />
        Edit
      </Link>
      <button
        onClick={() => onDelete(id)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

function GridCard({ post, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-200 hover:shadow-sm transition-all flex flex-col">
      <div className="relative h-40 bg-slate-100">
        {post.image ? (
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Tag size={28} />
          </div>
        )}
        <span className="absolute top-3 left-3">
          <Badge post={post} />
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">{post.title}</h3>
        <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 flex-1">{post.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Eye size={13} />
            {post.viewsCount || 0}
          </span>
          <span className="truncate">{post.category?.[0] || "No category"}</span>
          {post.budget > 0 && <span>BDT {Number(post.budget).toLocaleString()}</span>}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Actions id={post._id} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

function ListRow({ post, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-emerald-200 transition-colors">
      <div className="flex gap-4">
        {post.image ? (
          <img src={post.image} alt="" className="hidden sm:block w-28 h-20 object-cover rounded-lg shrink-0 bg-slate-100" />
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge post={post} />
                {post.status && (
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{post.status}</span>
                )}
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900 truncate">{post.title}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{post.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Eye size={13} />
                  {post.viewsCount || 0} views
                </span>
                <span>{post.category?.join(", ") || "No category"}</span>
                {post.budget > 0 && <span>BDT {Number(post.budget).toLocaleString()}</span>}
              </div>
            </div>
            <Actions id={post._id} onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "grid");

  useEffect(() => {
    API.get("/posts?limit=50&my=true")
      .then((res) => setPosts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setViewMode = (mode) => {
    setView(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Content</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">My posts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Loading..." : `${posts.length} post${posts.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-white border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`w-9 h-8 rounded-md flex items-center justify-center ${
                view === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`w-9 h-8 rounded-md flex items-center justify-center ${
                view === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
              title="List view"
            >
              <LayoutList size={16} />
            </button>
          </div>
          <Link
            to="/dashboard/create-post"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
          >
            <PlusCircle size={16} />
            New post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-800">No posts yet</p>
          <p className="mt-1 text-sm text-slate-500">Publish your first listing to start matching.</p>
          <Link
            to="/dashboard/create-post"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <PlusCircle size={16} />
            Create your first post
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post) => (
            <GridCard key={post._id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <ListRow key={post._id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
