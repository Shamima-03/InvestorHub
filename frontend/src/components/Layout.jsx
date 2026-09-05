import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  LayoutDashboard, FileText, PlusCircle, UsersRound, MessageCircle,
  UserCircle, Shield, AlertTriangle, BarChart3, LogOut, ChevronLeft,
  ChevronRight, Search, Bell, Menu, Banknote, Flag, Inbox,
} from "lucide-react";

export function canAccessDashboard(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.status === "active";
}

export function ProtectedRoute({ children, roles }) {
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
  if (!canAccessDashboard(user)) return <Navigate to="/pending" replace />;
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

const userLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/posts", label: "My Posts", icon: FileText },
  { to: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
  { to: "/dashboard/matches", label: "Matches", icon: UsersRound },
  { to: "/dashboard/investments", label: "Investments", icon: Banknote },
  { to: "/dashboard/my-reports", label: "My Reports", icon: Flag },
  { to: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/listings", label: "Post Approvals", icon: FileText },
  { to: "/dashboard/users", label: "Manage Users", icon: Shield },
  { to: "/dashboard/reports", label: "Reports", icon: AlertTriangle },
  { to: "/dashboard/payments", label: "Payments", icon: Banknote },
  { to: "/dashboard/contacts", label: "Contact Inbox", icon: Inbox },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
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

  const links = user?.role === "admin" ? adminLinks : userLinks;
  const roleInfo = ROLE_BADGE[user?.role] || ROLE_BADGE.investor;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);

  const Sidebar = ({ isMobile = false }) => {
    const compact = collapsed && !isMobile;

    return (
      <aside
        className={`${compact ? "w-[72px]" : "w-60"} ${
          isMobile ? "w-60" : ""
        } h-screen bg-white border-r border-gray-200 flex flex-col shrink-0`}
      >
        <div className={`h-16 shrink-0 border-b border-gray-200 flex items-center ${compact ? "justify-center px-2" : "justify-between px-4"}`}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
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

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!compact && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
          )}
          {links.map((link) => {
            const active = isActive(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => isMobile && setMobileOpen(false)}
                title={compact ? link.label : undefined}
                className={`flex items-center rounded-lg text-sm ${
                  compact ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
                } ${
                  active
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 font-medium hover:bg-gray-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                {!compact && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-200 p-2">
          {!compact ? (
            <div className="px-2 py-2 mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                  <p className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${roleInfo.color}`}>
                    {roleInfo.label}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            title="Sign out"
            className={`flex items-center w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 ${
              compact ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
            }`}
          >
            <LogOut size={18} />
            {!compact && <span>Sign out</span>}
          </button>
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
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center bg-slate-50 border border-gray-200 rounded-lg px-3 h-9 gap-2 w-72">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
