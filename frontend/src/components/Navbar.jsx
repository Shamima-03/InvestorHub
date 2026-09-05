import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search, Menu, X, LogOut, LayoutDashboard, ChevronDown, UserCircle, Clock, ArrowRight,
} from "lucide-react";
import { logout } from "../store";
import { canAccessDashboard } from "./Layout";

const ROLE_BADGE = {
  investor: { label: "Investor", color: "bg-emerald-50 text-emerald-700" },
  businessman: { label: "Business", color: "bg-slate-100 text-slate-700" },
  admin: { label: "Admin", color: "bg-amber-50 text-amber-700" },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
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
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
  const roleInfo = ROLE_BADGE[user?.role] || ROLE_BADGE.investor;

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_12px_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <nav className="border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-sm font-bold flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              IH
            </span>
            <span className="text-[17px] font-bold text-slate-900 tracking-tight">
              Investor<span className="text-emerald-600">Hub</span>
            </span>
          </Link>

          {/* Center nav — pill group */}
          <div className="hidden md:flex items-center gap-0.5 bg-slate-100/70 border border-gray-200/60 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`h-8 px-4 inline-flex items-center text-sm rounded-full transition-all ${
                  isActive(link.to)
                    ? "bg-white text-emerald-700 font-semibold shadow-sm"
                    : "text-slate-600 font-medium hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="hidden sm:flex items-center h-9 w-60 border border-gray-200 rounded-full bg-slate-50 overflow-hidden focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
              >
                <Search size={15} className="ml-3 text-slate-400 shrink-0" />
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
                  className="px-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Search"
              >
                <Search size={17} />
              </button>
            )}

            {isAuthenticated ? (
              <div className="hidden md:block relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={`flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-full border transition-colors ${
                    menuOpen ? "border-emerald-200 bg-emerald-50/60" : "border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-xs font-semibold flex items-center justify-center">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                  <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[110px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                    <div className="p-1.5">
                      {canAccessDashboard(user) ? (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <LayoutDashboard size={16} className="text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/dashboard/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <UserCircle size={16} className="text-slate-400" />
                            My profile
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/pending"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Clock size={16} className="text-slate-400" />
                          Account status
                        </Link>
                      )}
                      <div className="my-1.5 border-t border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`h-9 px-3.5 inline-flex items-center text-sm font-medium rounded-full transition-colors ${
                    location.pathname === "/login"
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="h-9 pl-4 pr-3 inline-flex items-center gap-1.5 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <form
                onSubmit={handleSearch}
                className="flex items-center h-10 mb-2 border border-gray-200 rounded-full bg-slate-50 overflow-hidden focus-within:border-emerald-500 focus-within:bg-white"
              >
                <Search size={15} className="ml-3.5 text-slate-400" />
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
                  className={`block px-3.5 py-2.5 rounded-xl text-sm ${
                    isActive(link.to)
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-700 font-medium hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-2" />

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3.5 py-2">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={canAccessDashboard(user) ? "/dashboard" : "/pending"}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard size={16} className="text-slate-400" />
                    {canAccessDashboard(user) ? "Dashboard" : "Account status"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    className="block text-center px-3 py-2.5 rounded-full text-sm font-medium text-slate-700 border border-gray-200 hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Get started
                    <ArrowRight size={14} />
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
