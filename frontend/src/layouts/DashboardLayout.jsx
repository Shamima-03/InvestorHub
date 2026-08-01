import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  LayoutDashboard, FileText, PlusCircle, UsersRound, MessageCircle,
  UserCircle, Shield, AlertTriangle, BarChart3, LogOut, ChevronLeft,
  ChevronRight, Search, Bell, Menu, ChevronDown
} from "lucide-react";

const investorLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/posts", label: "My Posts", icon: FileText },
  { to: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
  { to: "/dashboard/matches", label: "Matches", icon: UsersRound },
  { to: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

const businessmanLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/posts", label: "My Posts", icon: FileText },
  { to: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
  { to: "/dashboard/matches", label: "Matches", icon: UsersRound },
  { to: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/users", label: "Manage Users", icon: Shield },
  { to: "/dashboard/reports", label: "Reports", icon: AlertTriangle },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const ROLE_BADGE = {
  investor: { label: "Investor", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  businessman: { label: "Businessman", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  admin: { label: "Admin", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const links = user?.role === "admin" ? adminLinks : user?.role === "businessman" ? businessmanLinks : investorLinks;
  const roleInfo = ROLE_BADGE[user?.role] || ROLE_BADGE.investor;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${
        collapsed && !isMobile ? "w-[72px]" : "w-[280px]"
      } h-screen bg-slate-700 flex flex-col transition-all duration-300 relative ${
        isMobile ? "w-[280px]" : ""
      }`}
    >
      {/* ===== Top: Logo ===== */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-slate-600 ${
          collapsed && !isMobile ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        {collapsed && !isMobile ? (
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IH</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">InvestorHub</span>
          </div>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* ===== Middle: Navigation ===== */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Menu
          </p>
        )}
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                collapsed && !isMobile
                  ? "justify-center p-3"
                  : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
              }`}
              title={collapsed && !isMobile ? link.label : ""}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}

              <Icon
                size={18}
                strokeWidth={1.8}
                className={`shrink-0 ${
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 group-hover:text-white"
                }`}
              />

              {(!collapsed || isMobile) && (
                <span
                  className={`text-sm ${
                    isActive
                      ? "font-semibold text-white"
                      : "font-medium text-slate-300 group-hover:text-white"
                  }`}
                >
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ===== Bottom: Profile Card + Logout ===== */}
      <div className="shrink-0 border-t border-slate-600 p-3 space-y-2">
        {/* Profile Card */}
        {!collapsed || isMobile ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-600/50 transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-600 border border-slate-500 rounded-xl shadow-xl overflow-hidden">
                <Link
                  to="/dashboard/profile"
                  onClick={() => { setProfileOpen(false); isMobile && setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-500/50 hover:text-white transition-all"
                >
                  <UserCircle size={16} />
                  View Profile
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Logout (only visible when expanded) */}
        {(!collapsed || isMobile) && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 font-['Inter',sans-serif]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-700 border-b border-slate-600 h-16 flex items-center px-4 lg:px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center bg-slate-600/50 border border-slate-500 rounded-lg px-3 py-2 gap-2 w-72">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent text-sm text-white placeholder-slate-400 outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold ml-1">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
