import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import PostCard from "../components/PostCard";

const CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education",
  "Manufacturing", "Agriculture", "Energy", "Retail", "Other",
];

const STORAGE_KEY = "findingGoalFilters";

function loadSavedFilters() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveFilters(filters) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch {}
}

export default function FindingGoalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const hasURLFilters = [...searchParams.keys()].length > 0;
  const saved = hasURLFilters ? null : loadSavedFilters();

  const [search, setSearch] = useState(searchParams.get("search") || saved?.search || "");
  const [type, setType] = useState(searchParams.get("type") || saved?.type || "");
  const [category, setCategory] = useState(searchParams.get("category") || saved?.category || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || saved?.sortBy || "newest");
  const [minBudget, setMinBudget] = useState(searchParams.get("minBudget") || saved?.minBudget || "");
  const [maxBudget, setMaxBudget] = useState(searchParams.get("maxBudget") || saved?.maxBudget || "");

  const applied = useRef({
    search: searchParams.get("search") || saved?.search || "",
    type: searchParams.get("type") || saved?.type || "",
    category: searchParams.get("category") || saved?.category || "",
    sortBy: searchParams.get("sortBy") || saved?.sortBy || "newest",
    minBudget: searchParams.get("minBudget") || saved?.minBudget || "",
    maxBudget: searchParams.get("maxBudget") || saved?.maxBudget || "",
  });

  useEffect(() => {
    if (hasURLFilters) {
      const params = {};
      if (applied.current.search) params.search = applied.current.search;
      if (applied.current.type) params.type = applied.current.type;
      if (applied.current.category) params.category = applied.current.category;
      if (applied.current.sortBy !== "newest") params.sortBy = applied.current.sortBy;
      if (applied.current.minBudget) params.minBudget = applied.current.minBudget;
      if (applied.current.maxBudget) params.maxBudget = applied.current.maxBudget;
      if (Object.keys(params).length > 0) saveFilters(params);
    }
  }, []);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const f = applied.current;
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "12");
      if (f.type) params.set("type", f.type);
      if (f.category) params.set("category", f.category);
      if (f.sortBy) params.set("sortBy", f.sortBy);
      if (f.minBudget) params.set("minBudget", f.minBudget);
      if (f.maxBudget) params.set("maxBudget", f.maxBudget);
      if (f.search) params.set("search", f.search);

      const { data } = await API.get(`/posts?${params.toString()}`);
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleFilter = () => {
    applied.current = { search, type, category, sortBy, minBudget, maxBudget };
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (category) params.category = category;
    if (sortBy) params.sortBy = sortBy;
    if (minBudget) params.minBudget = minBudget;
    if (maxBudget) params.maxBudget = maxBudget;
    saveFilters(params);
    setSearchParams(params);
    setSidebarOpen(false);
    fetchPosts(1);
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setCategory("");
    setSortBy("newest");
    setMinBudget("");
    setMaxBudget("");
    applied.current = { search: "", type: "", category: "", sortBy: "newest", minBudget: "", maxBudget: "" };
    localStorage.removeItem(STORAGE_KEY);
    setSearchParams({});
    fetchPosts(1);
  };

  const filterUI = (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleFilter(); }}
          placeholder="Search posts..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Post Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-green/50 transition-all text-sm">
          <option value="" className="bg-slate-900">All Types</option>
          <option value="investor_post" className="bg-slate-900">Investor Posts</option>
          <option value="business_post" className="bg-slate-900">Business Posts</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-green/50 transition-all text-sm">
          <option value="" className="bg-slate-900">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-slate-900">{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-green/50 transition-all text-sm">
          <option value="newest" className="bg-slate-900">Newest</option>
          <option value="oldest" className="bg-slate-900">Oldest</option>
          <option value="budget_high" className="bg-slate-900">Budget (High → Low)</option>
          <option value="budget_low" className="bg-slate-900">Budget (Low → High)</option>
          <option value="popular" className="bg-slate-900">Most Popular</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="Min"
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 transition-all text-sm"
          />
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max"
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 transition-all text-sm"
          />
        </div>
      </div>

      <button onClick={handleFilter} className="w-full bg-accent-green text-slate-950 py-2.5 rounded-xl font-semibold hover:bg-accent-green/90 transition-all duration-300 text-sm">
        Apply Filters
      </button>
      <button onClick={clearFilters} className="w-full border border-white/10 text-gray-400 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all text-sm">
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent-green/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent-pink/5 blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block text-accent-green font-semibold text-xs uppercase tracking-widest bg-accent-green/10 border border-accent-green/20 px-4 py-1.5 rounded-full mb-3">Discover</span>
            <h1 className="text-3xl font-bold text-white">Finding Goal</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/15 transition-all"
          >
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-lg text-white mb-5">Filters</h2>
              {filterUI}
            </div>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-slate-900 border-r border-white/10 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg text-white">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
                </div>
                {filterUI}
              </div>
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-10 h-10 border-2 border-accent-green/30 border-t-accent-green rounded-full animate-spin mx-auto mb-4" />
                Loading...
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-gray-400 text-lg mb-2">No posts found</p>
                <button onClick={clearFilters} className="text-accent-green hover:text-accent-green/80 text-sm font-medium transition-colors">
                  Clear filters
                </button>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchPosts(i + 1)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pagination.page === i + 1
                        ? "bg-accent-green text-slate-950"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
