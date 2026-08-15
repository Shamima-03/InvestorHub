import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "../store";
import { canAccessDashboard } from "./Layout";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/finding-goal?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Finding Goal", to: "/finding-goal" },
    { label: "Contact", to: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
              IH
            </span>
            <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
              InvestorHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-emerald-700 font-semibold"
                    : "text-slate-600 font-medium hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="hidden sm:flex items-center h-9 w-56 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20"
              >
                <Search size={15} className="ml-2.5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="px-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={canAccessDashboard(user) ? "/dashboard" : "/pending"}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LayoutDashboard size={16} />
                  {canAccessDashboard(user) ? "Dashboard" : "Account status"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
                <div
                  className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center border border-emerald-100"
                  title={user?.name}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`h-9 px-3 inline-flex items-center text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === "/login"
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-gray-100"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={`h-9 px-4 inline-flex items-center text-sm font-semibold rounded-lg transition-colors ${
                    location.pathname === "/register"
                      ? "text-white bg-emerald-700"
                      : "text-white bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Get started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <form
                onSubmit={handleSearch}
                className="flex items-center h-10 mb-2 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
              >
                <Search size={15} className="ml-3 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2.5 rounded-lg text-sm ${
                    isActive(link.to)
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-700 font-medium hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to={canAccessDashboard(user) ? "/dashboard" : "/pending"}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard size={16} />
                    {canAccessDashboard(user) ? "Dashboard" : "Account status"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    className="block text-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
