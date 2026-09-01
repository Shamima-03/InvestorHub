import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound, FileText, Handshake, AlertTriangle, ArrowRight, Search,
  Shield, BarChart3, ChevronDown, Trash2, Check, X, LayoutGrid, LayoutList,
  Clock, Eye, Tag, Banknote,
} from "lucide-react";
import API from "../api";

const inputClass =
  "h-10 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

const statusClass = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-amber-50 text-amber-700",
  blocked: "bg-red-50 text-red-600",
  rejected: "bg-red-50 text-red-600",
  closed: "bg-slate-100 text-slate-600",
  under_review: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  reviewed: "bg-slate-100 text-slate-700",
  dismissed: "bg-slate-100 text-slate-600",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-600",
  cancelled: "bg-slate-100 text-slate-600",
};

const formatBdt = (n) => `BDT ${Number(n || 0).toLocaleString()}`;

const roleClass = {
  investor: "bg-emerald-50 text-emerald-700",
  businessman: "bg-slate-100 text-slate-700",
  admin: "bg-amber-50 text-amber-700",
};

function Select({ value, onChange, children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange} className={`${inputClass} appearance-none pr-9 w-full`}>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div className="py-16 text-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
      {label && <p className="mt-3 text-sm text-slate-500">{label}</p>}
    </div>
  );
}

function BarRow({ label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900 tabular-nums">{value} · {pct}%</span>
      </div>
      <div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Overview({ user }) {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/admin/analytics").then((res) => res.data.data).catch(() => null),
      API.get("/admin/users?limit=5").then((res) => res.data.data || []).catch(() => []),
      API.get("/admin/reports").then((res) => (res.data.data || []).filter((r) => r.status === "pending").slice(0, 5)).catch(() => []),
    ]).then(([analytics, users, reports]) => {
      setStats(analytics);
      setRecentUsers(users);
      setPendingReports(reports);
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "Total users", value: stats?.totalUsers ?? 0, to: "/dashboard/users", icon: UsersRound },
    { label: "Listings", value: stats?.totalPosts ?? 0, to: "/dashboard/listings", icon: FileText },
    { label: "Pending posts", value: stats?.pendingPosts ?? 0, to: "/dashboard/listings", icon: Clock },
    { label: "Pending reports", value: stats?.pendingReports ?? 0, to: "/dashboard/reports", icon: AlertTriangle },
  ];

  const actions = [
    { to: "/dashboard/listings", icon: FileText, title: "Approve posts", desc: "Review and publish pending listings." },
    { to: "/dashboard/users", icon: Shield, title: "Manage users", desc: "Activate, suspend, or remove accounts." },
    { to: "/dashboard/reports", icon: AlertTriangle, title: "Review reports", desc: "Resolve or dismiss flagged content." },
    { to: "/dashboard/analytics", icon: BarChart3, title: "View analytics", desc: "See platform totals and activity." },
  ];

  if (loading) return <Spinner label="Loading overview..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
          {hello}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and moderation tools.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <ArrowRight size={16} className="text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-slate-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">{a.title}</span>
                    <span className="block text-xs text-slate-500">{a.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Recent users</h2>
            <Link to="/dashboard/users" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No users yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
                    {u.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${roleClass[u.role] || "bg-slate-100 text-slate-600"}`}>
                    {u.role === "businessman" ? "Business" : u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Pending reports</h2>
          <Link to="/dashboard/reports" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
            View all
          </Link>
        </div>
        {pendingReports.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No pending reports.</p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {pendingReports.map((r) => (
              <div key={r._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 capitalize">{r.targetType} report</p>
                  <p className="text-xs text-slate-500 truncate">{r.reason}</p>
                  <p className="text-xs text-slate-400 mt-0.5">by {r.reporterId?.name || "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState("");
  const [nidView, setNidView] = useState(null);
  const [rejectUser, setRejectUser] = useState(null);
  const [rejectUserNote, setRejectUserNote] = useState("");

  const fetchUsers = (nextPage = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "15");
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    API.get(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(1);
    setPage(1);
  }, []);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const updateStatus = async (id, status, reason) => {
    setActing(id);
    try {
      await API.put(`/admin/users/${id}/status`, reason ? { status, reason } : { status });
      fetchUsers(page);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status");
      return false;
    } finally {
      setActing("");
    }
  };

  const confirmRejectUser = async () => {
    if (!rejectUser || !rejectUserNote.trim()) return;
    const ok = await updateStatus(rejectUser._id, "rejected", rejectUserNote.trim());
    if (ok) {
      setRejectUser(null);
      setRejectUserNote("");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActing(id);
    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers(page);
    } finally {
      setActing("");
    }
  };

  const goPage = (p) => {
    setPage(p);
    fetchUsers(p);
  };

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Search, filter, and manage platform accounts.</p>
      </div>

      <form onSubmit={applyFilters} className="mt-5 bg-white border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className={`${inputClass} w-full pl-9`}
          />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="lg:w-40">
          <option value="">All roles</option>
          <option value="investor">Investor</option>
          <option value="businessman">Business</option>
          <option value="admin">Admin</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lg:w-40">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
          <option value="rejected">Rejected</option>
        </Select>
        <button type="submit" className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0">
          Search
        </button>
      </form>

      {loading ? (
        <Spinner label="Loading users..." />
      ) : users.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm font-medium text-slate-800">No users found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">NID</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${roleClass[u.role] || "bg-slate-100 text-slate-600"}`}>
                        {u.role === "businessman" ? "Business" : u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        title={u.status === "rejected" && u.rejectionReason ? `Note: ${u.rejectionReason}` : undefined}
                        className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[u.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.nidImage ? (
                        <button
                          onClick={() => setNidView(u)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="View NID"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      ) : u.role === "admin" ? (
                        <span className="text-xs text-slate-300">—</span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={u.status}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === "rejected") {
                              setRejectUser(u);
                              setRejectUserNote("");
                            } else {
                              updateStatus(u._id, next);
                            }
                          }}
                          className="w-32"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="blocked">Blocked</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                        <button
                          onClick={() => deleteUser(u._id)}
                          disabled={acting === u._id}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-slate-500">
              <span>
                Page {pagination.page} of {pagination.pages} · {pagination.total} users
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => goPage(page + 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {rejectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setRejectUser(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900">Reject user</h3>
            <p className="mt-1 text-sm text-slate-500 truncate">
              {rejectUser.name} · {rejectUser.email}
            </p>
            <label htmlFor="reject-user-note" className="block mt-4 text-xs font-medium text-slate-600">
              Note <span className="text-red-500">*</span> (shown to the user)
            </label>
            <textarea
              id="reject-user-note"
              value={rejectUserNote}
              onChange={(e) => setRejectUserNote(e.target.value)}
              rows={4}
              maxLength={1000}
              autoFocus
              placeholder="e.g. Your NID photo is unreadable — please upload a clearer photo, or the information does not match your profile..."
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{rejectUserNote.length}/1000</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setRejectUser(null)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectUser}
                disabled={!rejectUserNote.trim() || acting === rejectUser._id}
                className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {acting === rejectUser._id ? "Rejecting..." : "Reject user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {nidView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setNidView(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900">National ID</h3>
                <p className="text-sm text-slate-500 truncate">
                  {nidView.name} · {nidView.email}
                </p>
              </div>
              <button
                onClick={() => setNidView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 shrink-0"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
              <img src={nidView.nidImage} alt={`NID of ${nidView.name}`} className="w-full max-h-[420px] object-contain" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <a
                href={nidView.nidImage}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                Open full size
              </a>
              {nidView.status !== "active" && nidView.role !== "admin" && (
                <button
                  onClick={async () => {
                    await updateStatus(nidView._id, "active");
                    setNidView(null);
                  }}
                  disabled={acting === nidView._id}
                  className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={14} />
                    Approve account
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState("");
  const [view, setView] = useState(() => localStorage.getItem("adminReportsView") || "grid");

  const fetchReports = () => {
    API.get("/admin/reports")
      .then((res) => setReports(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const setViewMode = (mode) => {
    setView(mode);
    localStorage.setItem("adminReportsView", mode);
  };

  const resolve = async (id, status) => {
    setActing(id);
    try {
      await API.put(`/admin/reports/${id}`, { status });
      fetchReports();
    } finally {
      setActing("");
    }
  };

  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };
  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "resolved", label: "Resolved" },
    { id: "dismissed", label: "Dismissed" },
  ];
  const summary = [
    { label: "Total", value: counts.all },
    { label: "Pending", value: counts.pending },
    { label: "Resolved", value: counts.resolved },
    { label: "Dismissed", value: counts.dismissed },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Review flagged posts and users.</p>
        </div>
        <div className="flex p-1 bg-white border border-gray-200 rounded-lg w-fit">
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
      </div>

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`h-8 px-3 rounded-md text-sm font-medium ${
              filter === f.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${filter === f.id ? "text-white/80" : "text-slate-400"}`}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading reports..." />
      ) : visible.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm font-medium text-slate-800">No {filter === "all" ? "" : filter} reports</p>
          <p className="mt-1 text-sm text-slate-500">Flagged items will show up here.</p>
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-200 transition-colors flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {r.targetType}
                </span>
                <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[r.status] || "bg-slate-100 text-slate-600"}`}>
                  {r.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-800 line-clamp-4 flex-1">{r.reason}</p>
              <p className="mt-3 text-xs text-slate-400">
                {r.reporterId?.name || "Unknown"}
                {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
              </p>
              {r.status === "pending" && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => resolve(r._id, "dismissed")}
                    disabled={acting === r._id}
                    className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X size={14} />
                    Dismiss
                  </button>
                  <button
                    onClick={() => resolve(r._id, "resolved")}
                    disabled={acting === r._id}
                    className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <Check size={14} />
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-200 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {r.targetType}
                    </span>
                    <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[r.status] || "bg-slate-100 text-slate-600"}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-800">{r.reason}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Reported by {r.reporterId?.name || "Unknown"}
                    {r.reporterId?.email ? ` · ${r.reporterId.email}` : ""}
                    {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                {r.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => resolve(r._id, "dismissed")}
                      disabled={acting === r._id}
                      className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X size={14} />
                      Dismiss
                    </button>
                    <button
                      onClick={() => resolve(r._id, "resolved")}
                      disabled={acting === r._id}
                      className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      <Check size={14} />
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Listings() {
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchCounts = () => {
    API.get("/admin/analytics")
      .then((res) => setCounts(res.data.data?.posts || null))
      .catch(() => {});
  };

  const fetchPosts = (nextPage = 1, status = filter) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (status !== "all") params.set("status", status);
    API.get(`/admin/posts?${params}`)
      .then((res) => {
        setPosts(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCounts();
    fetchPosts(1, "pending");
  }, []);

  const switchFilter = (f) => {
    setFilter(f);
    setPage(1);
    fetchPosts(1, f);
  };

  const goPage = (p) => {
    setPage(p);
    fetchPosts(p, filter);
  };

  const setStatus = async (id, status, reason) => {
    setActing(id);
    try {
      await API.put(`/admin/posts/${id}/status`, reason ? { status, reason } : { status });
      fetchPosts(page, filter);
      fetchCounts();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update post status");
      return false;
    } finally {
      setActing("");
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    const ok = await setStatus(rejectTarget._id, "rejected", rejectReason.trim());
    if (ok) {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setActing(id);
    try {
      await API.delete(`/admin/posts/${id}`);
      fetchPosts(page, filter);
      fetchCounts();
    } finally {
      setActing("");
    }
  };

  const summary = [
    { label: "Total", value: counts?.total ?? 0 },
    { label: "Pending", value: counts?.pending ?? 0 },
    { label: "Active", value: counts?.active ?? 0 },
    { label: "Rejected", value: counts?.rejected ?? 0 },
  ];

  const filters = [
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Funded" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Post approvals</h1>
        <p className="mt-1 text-sm text-slate-500">
          Investor and business posts stay hidden until you approve them.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => switchFilter(f.id)}
            className={`h-8 px-3 rounded-md text-sm font-medium ${
              filter === f.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading posts..." />
      ) : posts.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm font-medium text-slate-800">
            No {filter === "all" ? "" : filter} posts
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "pending" ? "New posts awaiting approval will show up here." : "Nothing to show for this filter."}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {posts.map((p) => (
            <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-emerald-200 transition-colors">
              <div className="flex gap-4">
                {p.image ? (
                  <img src={p.image} alt="" className="hidden sm:block w-28 h-20 object-cover rounded-lg shrink-0 bg-slate-100" />
                ) : (
                  <div className="hidden sm:flex w-28 h-20 rounded-lg shrink-0 bg-slate-100 items-center justify-center text-slate-300">
                    <Tag size={22} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          p.type === "investor_post" ? "bg-emerald-50 text-emerald-700" : "bg-slate-800 text-white"
                        }`}>
                          {p.type === "investor_post" ? "Investor" : "Business"}
                        </span>
                        <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[p.status] || "bg-slate-100 text-slate-600"}`}>
                          {p.status}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold text-slate-900 truncate">{p.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.description}</p>
                      <p className="mt-2 text-xs text-slate-400 truncate">
                        {p.authorId?.name || "Unknown"}
                        {p.authorId?.email ? ` · ${p.authorId.email}` : ""}
                        {p.createdAt ? ` · ${new Date(p.createdAt).toLocaleDateString()}` : ""}
                        {p.budget > 0 ? ` · BDT ${Number(p.budget).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        to={`/post/${p._id}`}
                        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      {p.status !== "rejected" && (
                        <button
                          onClick={() => {
                            setRejectTarget(p);
                            setRejectReason("");
                          }}
                          disabled={acting === p._id}
                          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      )}
                      {p.status !== "active" && (
                        <button
                          onClick={() => setStatus(p._id, "active")}
                          disabled={acting === p._id}
                          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => deletePost(p._id)}
                        disabled={acting === p._id}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Delete post"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-500">
              <span>
                Page {pagination.page} of {pagination.pages} · {pagination.total} posts
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => goPage(page + 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setRejectTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900">Reject post</h3>
            <p className="mt-1 text-sm text-slate-500 truncate">"{rejectTarget.title}"</p>
            <label htmlFor="reject-reason" className="block mt-4 text-xs font-medium text-slate-600">
              Reason <span className="text-red-500">*</span> (shown to the author)
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={1000}
              autoFocus
              placeholder="e.g. The description is incomplete, the budget looks unrealistic, or the images are missing..."
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{rejectReason.length}/1000</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setRejectTarget(null)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || acting === rejectTarget._id}
                className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {acting === rejectTarget._id ? "Rejecting..." : "Reject post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Payments() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchStats = () => {
    API.get("/admin/analytics")
      .then((res) => setStats(res.data.data?.payments || null))
      .catch(() => {});
  };

  const fetchPayments = (nextPage = 1, status = filter, q = search) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "15");
    if (status !== "all") params.set("status", status);
    if (q) params.set("search", q);
    API.get(`/admin/investments?${params}`)
      .then((res) => {
        setItems(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    fetchPayments(1, "all", "");
  }, []);

  const switchFilter = (f) => {
    setFilter(f);
    setPage(1);
    fetchPayments(1, f);
  };

  const applySearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchPayments(1, filter, search);
  };

  const goPage = (p) => {
    setPage(p);
    fetchPayments(p, filter);
  };

  const summary = [
    { label: "Total received", value: formatBdt(stats?.totalAmount) },
    { label: "Total payments", value: stats?.total ?? 0 },
    { label: "Completed", value: stats?.completed ?? 0 },
    { label: "Pending", value: stats?.pending ?? 0 },
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">All investment payments made through SSLCommerz.</p>
      </div>

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => switchFilter(f.id)}
              className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap ${
                filter === f.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={applySearch} className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction ID"
              className={`${inputClass} w-full pl-9`}
            />
          </div>
          <button type="submit" className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner label="Loading payments..." />
      ) : items.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Banknote size={28} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-800">No {filter === "all" ? "" : filter} payments found</p>
          <p className="mt-1 text-sm text-slate-500">Investment payments will show up here.</p>
        </div>
      ) : (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Investor</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Listing</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Method</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transaction ID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="min-w-[140px]">
                        <p className="font-medium text-slate-900 truncate">{inv.investorId?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 truncate">{inv.investorId?.email || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-[140px]">
                        <p className="font-medium text-slate-900 truncate">{inv.businessmanId?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 truncate">{inv.businessmanId?.email || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      {inv.postId?._id ? (
                        <Link to={`/post/${inv.postId._id}`} className="text-slate-600 hover:text-emerald-700 truncate block">
                          {inv.postId.title || "Listing"}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{inv.paymentMethod || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">{inv.tranId}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${
                          statusClass[inv.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatBdt(inv.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {inv.status === "completed" ? (
                        <Link
                          to={`/dashboard/invoice/${inv._id}`}
                          title="View invoice"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <FileText size={14} />
                          View
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-slate-500">
              <span>
                Page {pagination.page} of {pagination.pages} · {pagination.total} payments
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => goPage(page + 1)}
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/analytics")
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Total users", value: data?.users?.total ?? data?.totalUsers ?? 0, icon: UsersRound, to: "/dashboard/users" },
    { label: "Listings", value: data?.posts?.total ?? data?.totalPosts ?? 0, icon: FileText, to: "/dashboard/listings" },
    { label: "Matches", value: data?.matches?.total ?? data?.totalMatches ?? 0, icon: Handshake },
    { label: "Pending reports", value: data?.reports?.pending ?? data?.pendingReports ?? 0, icon: AlertTriangle, to: "/dashboard/reports" },
  ];

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Platform totals and breakdowns.</p>
      </div>

      {loading ? (
        <Spinner label="Loading analytics..." />
      ) : !data ? (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm text-slate-500">Failed to load analytics.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((c) => {
              const Icon = c.icon;
              const inner = (
                <>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                    {c.to && <ArrowRight size={16} className="text-slate-300" />}
                  </div>
                  <p className="mt-4 text-2xl font-bold text-slate-900">{c.value}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{c.label}</p>
                </>
              );
              const className = "bg-white border border-gray-200 rounded-xl p-5" + (c.to ? " hover:border-emerald-200 hover:shadow-sm transition-all" : "");
              return c.to ? (
                <Link key={c.label} to={c.to} className={className}>{inner}</Link>
              ) : (
                <div key={c.label} className={className}>{inner}</div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900">Users by role</h2>
              <div className="mt-4 space-y-4">
                <BarRow label="Investors" value={data.users?.investor || 0} total={data.users?.total || 0} />
                <BarRow label="Businesses" value={data.users?.businessman || 0} total={data.users?.total || 0} />
                <BarRow label="Admins" value={data.users?.admin || 0} total={data.users?.total || 0} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900">Users by status</h2>
              <div className="mt-4 space-y-4">
                <BarRow label="Active" value={data.users?.active || 0} total={data.users?.total || 0} />
                <BarRow label="Pending" value={data.users?.pending || 0} total={data.users?.total || 0} />
                <BarRow label="Suspended" value={data.users?.suspended || 0} total={data.users?.total || 0} />
                <BarRow label="Blocked" value={data.users?.blocked || 0} total={data.users?.total || 0} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900">Listings</h2>
              <div className="mt-4 space-y-4">
                <BarRow label="Investor posts" value={data.posts?.investor || 0} total={data.posts?.total || 0} />
                <BarRow label="Business posts" value={data.posts?.business || 0} total={data.posts?.total || 0} />
                <BarRow label="Pending approval" value={data.posts?.pending || 0} total={data.posts?.total || 0} />
                <BarRow label="Approved" value={data.posts?.active || 0} total={data.posts?.total || 0} />
                <BarRow label="Rejected" value={data.posts?.rejected || 0} total={data.posts?.total || 0} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900">Matches</h2>
              <div className="mt-4 space-y-4">
                <BarRow label="Pending" value={data.matches?.pending || 0} total={data.matches?.total || 0} />
                <BarRow label="Accepted" value={data.matches?.accepted || 0} total={data.matches?.total || 0} />
                <BarRow label="Rejected" value={data.matches?.rejected || 0} total={data.matches?.total || 0} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
                <Link to="/dashboard/payments" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  View all
                </Link>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{formatBdt(data.payments?.totalAmount)}</p>
              <p className="text-xs text-slate-500">received via SSLCommerz</p>
              <div className="mt-4 space-y-4">
                <BarRow label="Completed" value={data.payments?.completed || 0} total={data.payments?.total || 0} />
                <BarRow label="Pending" value={data.payments?.pending || 0} total={data.payments?.total || 0} />
                <BarRow label="Failed" value={data.payments?.failed || 0} total={data.payments?.total || 0} />
                <BarRow label="Cancelled" value={data.payments?.cancelled || 0} total={data.payments?.total || 0} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Reports</h2>
              <Link to="/dashboard/reports" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                Open reports
              </Link>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              <BarRow label="Pending" value={data.reports?.pending || 0} total={data.reports?.total || 0} />
              <BarRow label="Resolved" value={data.reports?.resolved || 0} total={data.reports?.total || 0} />
              <BarRow label="Dismissed" value={data.reports?.dismissed || 0} total={data.reports?.total || 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
