import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  LayoutDashboard, FileText, PlusCircle, UsersRound, MessageCircle,
  UserCircle, Shield, AlertTriangle, BarChart3, LogOut, ChevronLeft,
  ChevronRight, Search, Menu, Banknote, Flag, Inbox, ExternalLink,
} from "lucide-react";

// Titles for the dashboard routes that are not in the sidebar, so the top bar
// can still name the page the user is on.
const EXTRA_TITLES = {
  "/dashboard/edit-post": "Edit listing",
  "/dashboard/invoice": "Invoice",
  "/dashboard/users": "User profile",
};

export function canAccessDashboard(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.status === "active";
}

// loginOnly: the page just needs a signed-in account (no admin approval),
// used by pages that live outside the dashboard such as /review.
export function ProtectedRoute({ children, roles, loginOnly = false }) {
  const { user, isAuthenticated, authChecked } = useSelector((state) => state.auth);
  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  if (!loginOnly && !canAccessDashboard(user)) return <Navigate to="/pending" replace />;
  return children;
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Navigation is grouped: a flat list of eight items is harder to scan than
// three small labelled groups.
const userGroups = [
  { label: "Workspace", items: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/posts", label: "My Posts", icon: FileText },
    { to: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
  ]},
  { label: "Deals", items: [
    { to: "/dashboard/matches", label: "Matches", icon: UsersRound },
    { to: "/dashboard/chat", label: "Messages", icon: MessageCircle },
    { to: "/dashboard/investments", label: "Investments", icon: Banknote },
  ]},
  { label: "Account", items: [
    { to: "/dashboard/my-reports", label: "My Reports", icon: Flag },
    { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ]},
];

const adminGroups = [
  { label: "Workspace", items: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  ]},
  { label: "Moderation", items: [
    { to: "/dashboard/listings", label: "Post Approvals", icon: FileText },
    { to: "/dashboard/users", label: "Manage Users", icon: Shield },
    { to: "/dashboard/reports", label: "Reports", icon: AlertTriangle },
  ]},
  { label: "Operations", items: [
    { to: "/dashboard/payments", label: "Payments", icon: Banknote },
    { to: "/dashboard/contacts", label: "Contact Inbox", icon: Inbox },
    { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ]},
];

const ROLE_BADGE = {
  investor: { label: "Investor", color: "bg-emerald-50 text-emerald-700" },
  businessman: { label: "Businessman", color: "bg-slate-100 text-slate-700" },
  admin: { label: "Admin", color: "bg-amber-50 text-amber-700" },
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const groups = user?.role === "admin" ? adminGroups : userGroups;
  const links = groups.flatMap((g) => g.items);
  const roleInfo = ROLE_BADGE[user?.role] || ROLE_BADGE.investor;
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  // Ctrl/Cmd + K focuses the search box, the shortcut the hint advertises.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/finding-goal?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);

  const pageTitle =
    links.find((l) => isActive(l.to))?.label ||
    Object.entries(EXTRA_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    "Overview";

  const Sidebar = ({ isMobile = false }) => {
    const compact = collapsed && !isMobile;

    return (
      <aside
        className={`${compact ? "w-[72px]" : "w-64"} ${
          isMobile ? "w-64" : ""
        } h-screen bg-gradient-to-b from-white to-slate-50/70 border-r border-gray-200 flex flex-col shrink-0`}
      >
        <div className={`h-16 shrink-0 border-b border-gray-200/80 flex items-center ${compact ? "justify-center px-2" : "justify-between px-4"}`}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm group-hover:shadow transition-shadow">
              IH
            </span>
            {!compact && (
              <span className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                InvestorHub
              </span>
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              {!compact ? (
                <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {group.label}
                </p>
              ) : (
                <div className="mx-3 mb-2 border-t border-gray-200/70" />
              )}
              <div className="space-y-0.5">
                {group.items.map((link) => {
                  const active = isActive(link.to);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => isMobile && setMobileOpen(false)}
                      title={compact ? link.label : undefined}
                      className={`relative flex items-center rounded-lg text-sm transition-colors ${
                        compact ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2"
                      } ${
                        active
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-slate-600 font-medium hover:bg-white hover:text-slate-900 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      {active && !compact && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-emerald-600" />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.1 : 1.75}
                        className={`shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      {!compact && <span className="truncate">{link.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-200/80 p-2.5">
          {!compact ? (
            <div className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">{user?.name}</p>
                  <p className={`mt-1 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${roleInfo.color}`}>
                    {roleInfo.label}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="flex items-center justify-center w-full p-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-xl">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="sticky top-0 z-20 h-16 shrink-0 flex items-center gap-3 px-4 lg:px-6
          bg-white/85 backdrop-blur-md border-b border-gray-200">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* breadcrumb only: each page prints its own heading, so no title is repeated here */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0 text-[13px]">
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              Dashboard
            </Link>
            {pageTitle !== "Overview" && (
              <>
                <span className="text-slate-300 shrink-0">/</span>
                <span className="font-medium text-slate-700 truncate">{pageTitle}</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center h-9 w-52 lg:w-72 gap-2 px-3 rounded-lg
                bg-slate-50 border border-gray-200 transition-colors
                focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
            >
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings..."
                className="bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none w-full"
              />
              <kbd className="hidden lg:inline-block shrink-0 text-[10px] font-medium text-slate-400
                bg-white border border-gray-200 rounded px-1.5 py-0.5">
                Ctrl K
              </kbd>
            </form>


            <Link
              to="/"
              title="Open the public site"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500
                hover:text-slate-900 hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={17} />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
