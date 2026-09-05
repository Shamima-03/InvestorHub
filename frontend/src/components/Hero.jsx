import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, ArrowRight, TrendingUp, Users, Building2, Check } from "lucide-react";

const RESOURCE_TYPES = [
  { label: "All resources", value: "" },
  { label: "Investors", value: "investor_post" },
  { label: "Businesses", value: "business_post" },
  { label: "Posts", value: "" },
];

const POPULAR = ["Technology", "Healthcare", "Real Estate", "FinTech"];

const STATS = [
  { icon: Users, label: "Active investors", value: "1,200+", tile: "from-emerald-500 to-emerald-600" },
  { icon: Building2, label: "Businesses listed", value: "850+", tile: "from-teal-500 to-teal-600" },
  { icon: TrendingUp, label: "Matches made", value: "3,400+", tile: "from-cyan-500 to-teal-500" },
];

const TRUST = ["Free to join", "NID-verified members", "Secure payments via SSLCommerz"];

const STEPS = [
  "Create a free investor or business profile",
  "Publish or browse opportunities",
  "Match, chat, and close the deal",
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
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[440px] h-[440px] rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="pointer-events-none absolute top-44 -left-36 w-[380px] h-[380px] rounded-full bg-teal-100/50 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Investor &amp; business matching
            </p>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-slate-900 leading-[1.12] tracking-tight">
              Where investors meet{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  visionaries
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 6 C 50 1, 150 1, 198 5" stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.45" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
              Discover opportunities, send match requests, and grow partnerships
              between investors and entrepreneurs — in one place.
            </p>

            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(5,150,105,0.10)] focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-[148px] h-11 px-3.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                  >
                    {resourceType.label}
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl shadow-slate-900/10 py-1.5 z-20">
                      {RESOURCE_TYPES.map((type) => (
                        <button
                          key={type.label}
                          type="button"
                          onClick={() => {
                            setResourceType(type);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-sm ${
                            resourceType.label === type.label
                              ? "text-emerald-700 font-medium bg-emerald-50"
                              : "text-slate-700 hover:bg-slate-50"
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
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shrink-0 shadow-sm transition-all"
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
                  className="text-sm text-slate-600 hover:text-emerald-700 px-3 py-1 rounded-full border border-gray-200 bg-white/70 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-sm transition-all"
              >
                Get started free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/finding-goal"
                className="inline-flex items-center h-11 px-6 rounded-full border border-gray-200 bg-white/70 text-slate-700 text-sm font-semibold hover:bg-white hover:border-gray-300 transition-colors"
              >
                Browse posts
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="relative lg:pl-4">
            <div className="relative rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Platform snapshot
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-4 py-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.tile} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <stat.icon size={19} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{stat.value}</p>
                      <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50/80 border border-gray-100 px-5 py-5">
                <p className="text-sm font-semibold text-slate-900">How it works</p>
                <ol className="mt-4 space-y-3.5">
                  {STEPS.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-600 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Floating match notification */}
            <div className="hidden sm:flex absolute -bottom-6 -left-4 lg:-left-8 items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-slate-900/10 px-4 py-3">
              <div className="flex -space-x-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                  S
                </span>
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                  D
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">New match accepted</p>
                <p className="text-[11px] text-slate-400">Investor · Business</p>
              </div>
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check size={13} strokeWidth={3} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
