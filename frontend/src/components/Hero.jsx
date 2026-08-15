import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, ArrowRight, TrendingUp, Users, Building2 } from "lucide-react";

const RESOURCE_TYPES = [
  { label: "All resources", value: "" },
  { label: "Investors", value: "investor_post" },
  { label: "Businesses", value: "business_post" },
  { label: "Posts", value: "" },
];

const POPULAR = ["Technology", "Healthcare", "Real Estate", "FinTech"];

const STATS = [
  { icon: Users, label: "Active investors", value: "1,200+" },
  { icon: Building2, label: "Businesses listed", value: "850+" },
  { icon: TrendingUp, label: "Matches made", value: "3,400+" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (resourceType.value) params.set("type", resourceType.value);
    navigate(`/finding-goal?${params.toString()}`);
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              Investor &amp; business matching
            </p>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.15] tracking-tight">
              Where investors meet{" "}
              <span className="text-emerald-600">visionaries</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
              Discover opportunities, send match requests, and grow partnerships
              between investors and entrepreneurs — in one place.
            </p>

            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-[148px] h-11 px-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-gray-50"
                  >
                    {resourceType.label}
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                      {RESOURCE_TYPES.map((type) => (
                        <button
                          key={type.label}
                          type="button"
                          onClick={() => {
                            setResourceType(type);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            resourceType.label === type.label
                              ? "text-emerald-700 font-medium bg-emerald-50"
                              : "text-slate-700 hover:bg-gray-50"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block w-px h-6 bg-gray-200" />

                <div className="flex-1 flex items-center min-w-0">
                  <Search size={16} className="text-slate-400 ml-2 shrink-0 hidden sm:block" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search investors, businesses, posts..."
                    className="flex-1 h-11 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-400">Popular:</span>
              {POPULAR.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/finding-goal?category=${tag}`)}
                  className="text-sm text-slate-600 hover:text-emerald-700 px-2.5 py-1 rounded-md border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                Get started free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/finding-goal"
                className="inline-flex items-center h-11 px-5 rounded-lg border border-gray-200 text-slate-700 text-sm font-semibold hover:bg-gray-50"
              >
                Browse posts
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">
                Platform snapshot
              </p>
              <div className="space-y-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <stat.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
                      <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-white border border-gray-200 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">How it works</p>
                <ol className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>1. Create a free investor or business profile</li>
                  <li>2. Publish or browse opportunities</li>
                  <li>3. Match, chat, and close the deal</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
