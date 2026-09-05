import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import API from "../api";
import PostCard from "../components/PostCard";

const CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education",
  "Manufacturing", "Agriculture", "Energy", "Retail", "Food and Beverage", "Transportation", "Other",
];

const STORAGE_KEY = "findingGoalFilters";
const inputClass =
  "w-full h-10 px-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function filtersFromUrl(searchParams) {
  return {
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    minBudget: searchParams.get("minBudget") || "",
    maxBudget: searchParams.get("maxBudget") || "",
  };
}

export default function FindingGoalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = filtersFromUrl(searchParams);
  const [search, setSearch] = useState(initial.search);
  const [type, setType] = useState(initial.type);
  const [category, setCategory] = useState(initial.category);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [minBudget, setMinBudget] = useState(initial.minBudget);
  const [maxBudget, setMaxBudget] = useState(initial.maxBudget);

  const applied = useRef(initial);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const f = applied.current;
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (f.type) params.set("type", f.type);
      if (f.category) params.set("category", f.category);
      if (f.sortBy && f.sortBy !== "newest") params.set("sortBy", f.sortBy);
      if (f.minBudget) params.set("minBudget", f.minBudget);
      if (f.maxBudget) params.set("maxBudget", f.maxBudget);
      if (f.search) params.set("search", f.search);

      const { data } = await API.get(`/posts?${params.toString()}`);
      setPosts(data.data || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const next = filtersFromUrl(searchParams);
    applied.current = next;
    setSearch(next.search);
    setType(next.type);
    setCategory(next.category);
    setSortBy(next.sortBy);
    setMinBudget(next.minBudget);
    setMaxBudget(next.maxBudget);
    fetchPosts(1);
  }, [searchParams, fetchPosts]);

  const handleFilter = () => {
    applied.current = { search, type, category, sortBy, minBudget, maxBudget };
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (category) params.category = category;
    if (sortBy && sortBy !== "newest") params.sortBy = sortBy;
    if (minBudget) params.minBudget = minBudget;
    if (maxBudget) params.maxBudget = maxBudget;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSearchParams(params);
    setSidebarOpen(false);
  };

  const clearFilters = () => {
    const empty = { search: "", type: "", category: "", sortBy: "newest", minBudget: "", maxBudget: "" };
    setSearch("");
    setType("");
    setCategory("");
    setSortBy("newest");
    setMinBudget("");
    setMaxBudget("");
    applied.current = empty;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    if ([...searchParams.keys()].length === 0) fetchPosts(1);
    else setSearchParams({});
    setSidebarOpen(false);
  };

  const filterUI = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Post type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          <option value="">All types</option>
          <option value="investor_post">Investor posts</option>
          <option value="business_post">Business posts</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort by</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="budget_high">Budget: high to low</option>
          <option value="budget_low">Budget: low to high</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget range</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="Min"
            className={inputClass}
          />
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max"
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={handleFilter}
        className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
      >
        Apply filters
      </button>
      <button
        onClick={clearFilters}
        className="w-full h-10 rounded-lg border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50"
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Discover</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">Finding Goal</h1>
            <p className="mt-1 text-slate-600">Browse investor and business opportunities.</p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-20 border border-gray-200 rounded-xl p-5 bg-white">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Filters</h2>
              {filterUI}
            </div>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-white border-r border-gray-200 p-5 overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filterUI}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading..."
                  : `${pagination.total ?? posts.length} result${(pagination.total ?? posts.length) === 1 ? "" : "s"}`}
              </p>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-sm text-slate-500">Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
                <p className="text-slate-700 font-medium">No posts found</p>
                <p className="mt-1 text-sm text-slate-500">Try a different search or clear your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center flex-wrap gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchPosts(i + 1)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium ${
                      pagination.page === i + 1
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-200 text-slate-600 hover:bg-gray-50"
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
