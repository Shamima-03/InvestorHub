import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  UsersRound, FileText, Handshake, AlertTriangle, ArrowRight, ArrowLeft, Search,
  Shield, BarChart3, ChevronDown, Trash2, Check, X, LayoutGrid, LayoutList,
  Clock, Eye, Tag, Banknote, Mail, Phone, MapPin, Briefcase, ShieldCheck, RefreshCw,
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

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800 capitalize break-words">{value || "—"}</dd>
    </div>
  );
}

function ReportTarget({ r }) {
  if (r.targetType === "post") {
    return r.target ? (
      <p className="mt-2 text-sm min-w-0">
        <span className="text-slate-400">Reported listing: </span>
        <Link to={`/post/${r.target._id}`} className="font-medium text-emerald-700 hover:underline break-words">
          {r.target.title}
        </Link>
        <span className={`ml-2 text-[11px] font-medium capitalize px-1.5 py-0.5 rounded ${statusClass[r.target.status] || "bg-slate-100 text-slate-600"}`}>
          {r.target.status}
        </span>
      </p>
    ) : (
      <p className="mt-2 text-sm text-slate-400 italic">Reported listing no longer exists</p>
    );
  }
  return r.target ? (
    <p className="mt-2 text-sm min-w-0">
      <span className="text-slate-400">Reported user: </span>
      <Link to={`/dashboard/users/${r.target._id}`} className="font-medium text-emerald-700 hover:underline">
        {r.target.name}
      </Link>
      {r.target.email ? <span className="text-slate-400"> · {r.target.email}</span> : null}
    </p>
  ) : (
    <p className="mt-2 text-sm text-slate-400 italic">Reported user no longer exists</p>
  );
}

function ReportActions({ r, busy, onSet }) {
  // A decision is never final: resolved/dismissed reports can be reopened
  // so the admin can change the outcome later.
  if (r.status === "resolved" || r.status === "dismissed") {
    return (
      <button
        onClick={() => onSet(r._id, "pending")}
        disabled={busy}
        title="Move back to pending to change the decision"
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw size={14} />
        Reopen
      </button>
    );
  }
  return (
    <>
      {r.status === "pending" && (
        <button
          onClick={() => onSet(r._id, "reviewed")}
          disabled={busy}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Eye size={14} />
          Reviewed
        </button>
      )}
      <button
        onClick={() => onSet(r._id, "dismissed")}
        disabled={busy}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <X size={14} />
        Dismiss
      </button>
      <button
        onClick={() => onSet(r._id, "resolved")}
        disabled={busy}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
      >
        <Check size={14} />
        Resolve
      </button>
    </>
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

// Segment colors: emerald/blue/amber/red validated for adjacent CVD separation;
// the neutral gray is a deliberate "inactive" bucket — identity is always
// carried by the visible dot + label + value in the legend, never color alone.
const SEG_COLORS = {
  good: "#059669",
  info: "#2a78d6",
  warn: "#f59e0b",
  bad: "#ef4444",
  neutral: "#94a3b8",
};

function PropBar({ segments, total }) {
  const visible = segments.filter((s) => s.value > 0);
  if (!total || visible.length === 0) {
    return <div className="h-2.5 rounded-full bg-slate-100" />;
  }
  return (
    <div className="flex h-2.5 gap-[3px]">
      {visible.map((s) => (
        <div
          key={s.label}
          title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
          className="rounded-full transition-all duration-500"
          style={{ width: `${(s.value / total) * 100}%`, minWidth: 8, background: s.color }}
        />
      ))}
    </div>
  );
}

function SegmentLegend({ segments, total }) {
  return (
    <div className="space-y-2.5">
      {segments.map((s) => {
        const pct = total ? Math.round((s.value / total) * 100) : 0;
        return (
          <div
            key={s.label}
            className="flex items-center justify-between gap-3 text-sm"
            title={`${s.label}: ${s.value} of ${total} (${pct}%)`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-slate-600 truncate">{s.label}</span>
            </span>
            <span className="tabular-nums shrink-0">
              <span className="font-semibold text-slate-900">{s.value}</span>
              <span className="ml-1.5 text-xs text-slate-400 inline-block w-9 text-right">{pct}%</span>
            </span>
          </div>
        );
      })}
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
                          <Link
                            to={`/dashboard/users/${u._id}`}
                            title="View professional profile"
                            className="block max-w-full font-medium text-slate-900 truncate hover:text-emerald-700 hover:underline"
                          >
                            {u.name}
                          </Link>
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

export function UserProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/users/${id}`)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading profile..." />;

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-xl text-sm">
          {error || "User not found"}
        </div>
        <Link
          to="/dashboard/users"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to users
        </Link>
      </div>
    );
  }

  const p = data.profile;
  const isInvestorUser = data.role === "investor";
  const joined = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const contactRows = [
    { icon: Mail, label: "Email", value: data.email },
    { icon: Phone, label: "Phone", value: data.phone || "Not provided" },
    { icon: MapPin, label: "Location", value: data.location || "Not provided" },
  ];

  const highlights = isInvestorUser
    ? [
        { label: "Investment type", value: p?.investmentType || "—" },
        {
          label: "Investment range",
          value:
            p?.investmentRange?.min || p?.investmentRange?.max
              ? `${formatBdt(p.investmentRange?.min)} – ${formatBdt(p.investmentRange?.max)}`
              : "—",
        },
      ]
    : [
        { label: "Business stage", value: p?.businessStage || "—" },
        { label: "Funding needed", value: p?.fundingNeeded > 0 ? formatBdt(p.fundingNeeded) : "—" },
      ];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/dashboard/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        Back to users
      </Link>

      <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500" />
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-3 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-700 text-2xl font-bold flex items-center justify-center border-4 border-white shadow-sm">
              {data.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex items-center gap-1.5 pb-1">
              <span className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-md ${roleClass[data.role] || "bg-slate-100 text-slate-600"}`}>
                {data.role === "businessman" ? "Business" : data.role}
              </span>
              <span className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-md ${statusClass[data.status] || "bg-slate-100 text-slate-600"}`}>
                {data.status}
              </span>
            </div>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">{data.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" />
              {data.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              Joined {joined}
            </span>
          </div>
          {data.status === "rejected" && data.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-lg text-sm">
              <span className="font-semibold">Rejection note:</span> {data.rejectionReason}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Contact information</h2>
          <div className="mt-4 space-y-4">
            {contactRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.label}</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{row.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Verification</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <p className="text-sm font-medium text-slate-800">National ID</p>
              </div>
              {data.nidImage ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Submitted</span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">Not submitted</span>
              )}
            </div>
            {data.role !== "admin" && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Banknote size={16} />
                  </span>
                  <p className="text-sm font-medium text-slate-800">Entry fee (BDT 100)</p>
                </div>
                {data.entryFeePaid ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Paid</span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">Unpaid</span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <Shield size={16} />
                </span>
                <p className="text-sm font-medium text-slate-800">Account status</p>
              </div>
              <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded-md ${statusClass[data.status] || "bg-slate-100 text-slate-600"}`}>
                {data.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </span>
                <p className="text-sm font-medium text-slate-800">Member since</p>
              </div>
              <span className="text-sm text-slate-600">{joined}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Briefcase size={17} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isInvestorUser ? "Investor profile" : "Business profile"}
            </h2>
            <p className="text-xs text-slate-400">Professional details submitted by the user</p>
          </div>
        </div>

        {!p ? (
          <p className="mt-5 text-sm text-slate-500 bg-slate-50 border border-gray-100 rounded-lg px-4 py-3">
            No professional profile submitted yet.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {highlights.map((h) => (
                <div key={h.label} className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{h.label}</p>
                  <p className="mt-1 text-base font-bold text-slate-900 capitalize">{h.value}</p>
                </div>
              ))}
            </div>
            <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {isInvestorUser ? (
                <>
                  <Field label="Preferred industries" value={p.preferredIndustries?.join(", ")} />
                  <Field label="Experience" value={p.experience} />
                  <Field label="Past investments" value={p.pastInvestments?.join(", ")} />
                </>
              ) : (
                <>
                  <Field label="Company" value={p.companyName} />
                  <Field label="Industry" value={p.industry} />
                </>
              )}
            </dl>
            {p.bio && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Bio</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{p.bio}</p>
              </div>
            )}
          </>
        )}
      </div>

      {data.nidImage && (
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">National ID</h2>
            <a
              href={data.nidImage}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Open full size
            </a>
          </div>
          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
            <img src={data.nidImage} alt={`NID of ${data.name}`} className="max-h-[380px] w-auto max-w-full object-contain" />
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

  const [decision, setDecision] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");

  const resolve = async (id, status, note) => {
    setActing(id);
    try {
      await API.put(`/admin/reports/${id}`, note !== undefined ? { status, note } : { status });
      fetchReports();
    } finally {
      setActing("");
    }
  };

  // Final decisions (resolve/dismiss) go through a modal so the admin can
  // leave a note that the reporter will see on their My Reports page.
  const requestStatus = (id, status) => {
    if (status === "resolved" || status === "dismissed") {
      setDecision({ id, status, report: reports.find((x) => x._id === id) });
      setDecisionNote("");
    } else {
      resolve(id, status);
    }
  };

  const confirmDecision = async () => {
    if (!decision) return;
    await resolve(decision.id, decision.status, decisionNote.trim());
    setDecision(null);
    setDecisionNote("");
  };

  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };
  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "reviewed", label: "Reviewed" },
    { id: "resolved", label: "Resolved" },
    { id: "dismissed", label: "Dismissed" },
  ];
  const summary = [
    { label: "Pending", value: counts.pending },
    { label: "Under review", value: counts.reviewed },
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
              <ReportTarget r={r} />
              <p className="mt-2 text-sm text-slate-800 line-clamp-4 flex-1">{r.reason}</p>
              <p className="mt-3 text-xs text-slate-400">
                Reported by {r.reporterId?.name || "Unknown"}
                {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
              </p>
              {r.adminNote && (r.status === "resolved" || r.status === "dismissed") && (
                <p className="mt-2 text-xs bg-slate-50 border border-gray-100 rounded-lg px-3 py-2 text-slate-600">
                  <span className="font-semibold">Note to reporter:</span> {r.adminNote}
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <ReportActions r={r} busy={acting === r._id} onSet={requestStatus} />
              </div>
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
                  <ReportTarget r={r} />
                  <p className="mt-2 text-sm text-slate-800">{r.reason}</p>
                  {r.adminNote && (r.status === "resolved" || r.status === "dismissed") && (
                    <p className="mt-2 text-xs bg-slate-50 border border-gray-100 rounded-lg px-3 py-2 text-slate-600">
                      <span className="font-semibold">Note to reporter:</span> {r.adminNote}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    Reported by {r.reporterId?.name || "Unknown"}
                    {r.reporterId?.email ? ` · ${r.reporterId.email}` : ""}
                    {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <ReportActions r={r} busy={acting === r._id} onSet={requestStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDecision(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900">
              {decision.status === "resolved" ? "Resolve report" : "Dismiss report"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {decision.status === "resolved"
                ? "Mark this report as resolved — action was taken."
                : "Dismiss this report — no action was needed."}
            </p>
            {decision.report && (
              <p className="mt-2 text-sm text-slate-600 bg-slate-50 border border-gray-100 rounded-lg px-3 py-2 line-clamp-2">
                "{decision.report.reason}"
              </p>
            )}
            <label htmlFor="decision-note" className="block mt-4 text-xs font-medium text-slate-600">
              Note to the reporter (optional — shown on their My Reports page)
            </label>
            <textarea
              id="decision-note"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              maxLength={1000}
              autoFocus
              placeholder={
                decision.status === "resolved"
                  ? "e.g. The listing was removed. Thanks for reporting."
                  : "e.g. We reviewed the listing and found no violation."
              }
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{decisionNote.length}/1000</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setDecision(null)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecision}
                disabled={acting === decision.id}
                className={`h-10 px-4 rounded-lg text-white text-sm font-semibold disabled:opacity-50 ${
                  decision.status === "resolved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {acting === decision.id
                  ? "Saving..."
                  : decision.status === "resolved"
                  ? "Resolve report"
                  : "Dismiss report"}
              </button>
            </div>
          </div>
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
    { label: "Completed", value: counts?.completed ?? 0 },
    { label: "Rejected", value: counts?.rejected ?? 0 },
  ];

  const filters = [
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
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

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
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
                      {p.status === "completed" ? (
                        <span className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700">
                          <Check size={14} />
                          Fully funded
                        </span>
                      ) : (
                        <>
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
                        </>
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
  const [view, setView] = useState("investments");
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

  const fetchPayments = (nextPage = 1, status = filter, q = search, v = view) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "15");
    if (status !== "all") params.set("status", status);
    if (q) params.set("search", q);
    API.get(`/admin/${v === "fees" ? "entry-fees" : "investments"}?${params}`)
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

  const switchView = (v) => {
    setView(v);
    setFilter("all");
    setSearch("");
    setPage(1);
    fetchPayments(1, "all", "", v);
  };

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

  const totalRevenue = (stats?.feeRevenue || 0) + (stats?.entryFeeAmount || 0);
  const summary = [
    { label: "Investment volume", value: formatBdt(stats?.totalAmount) },
    { label: "Commission (10%)", value: formatBdt(stats?.feeRevenue) },
    { label: `Entry fees (${stats?.entryFeeCount || 0} paid)`, value: formatBdt(stats?.entryFeeAmount) },
    { label: "Total platform revenue", value: formatBdt(totalRevenue) },
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
        <p className="mt-1 text-sm text-slate-500">
          All SSLCommerz payments — investments and registration entry fees.
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

      <div className="mt-5 flex p-1 bg-white border border-gray-200 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => switchView("investments")}
          className={`h-9 px-4 rounded-md text-sm font-semibold ${
            view === "investments" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Investments
        </button>
        <button
          type="button"
          onClick={() => switchView("fees")}
          className={`h-9 px-4 rounded-md text-sm font-semibold ${
            view === "fees" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Entry fees
        </button>
      </div>

      <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3">
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
            {view === "fees" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Method</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transaction ID</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="min-w-[160px]">
                          <p className="font-medium text-slate-900 truncate">{fee.userId?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 truncate">{fee.userId?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${roleClass[fee.userId?.role] || "bg-slate-100 text-slate-600"}`}>
                          {fee.userId?.role === "businessman" ? "Business" : fee.userId?.role || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(fee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{fee.paymentMethod || "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">{fee.tranId}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${
                            statusClass[fee.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatBdt(fee.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Fee (10%)</th>
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
                    <td className="px-4 py-3.5 text-right text-emerald-700 font-medium whitespace-nowrap">
                      {inv.platformFee > 0 ? formatBdt(inv.platformFee) : "—"}
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
            )}
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

function KpiTile({ icon: Icon, label, value, sub, to }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Icon size={19} />
        </span>
        {to && <ArrowRight size={16} className="text-slate-300" />}
      </div>
      <p className="mt-4 text-[26px] leading-tight font-bold text-slate-900 tabular-nums truncate">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {sub && (
        <p className="mt-2 inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
          {sub}
        </p>
      )}
    </>
  );
  const cls =
    "bg-white border border-gray-200 rounded-2xl p-5" +
    (to ? " block hover:border-emerald-200 hover:shadow-sm transition-all" : "");
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function RateTile({ label, value, total, noun }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5" title={`${value} of ${total} ${noun}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-600 truncate">{label}</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums">{pct}%</p>
      </div>
      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 rounded-full transition-[width] duration-500"
          style={{ width: value > 0 ? `${Math.max(pct, 2)}%` : 0 }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400 tabular-nums">
        {value} of {total} {noun}
      </p>
    </div>
  );
}

function BreakdownCard({ title, icon: Icon, total, action, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Icon size={15} />
          </span>
          <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
        </div>
        {action || <span className="text-xs font-medium text-slate-400 tabular-nums shrink-0">{total} total</span>}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{children}</p>;
}

export function ContactMessages() {
  const [items, setItems] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState("");
  const [viewMsg, setViewMsg] = useState(null);

  const fetchMessages = (nextPage = 1, status = filter, q = search) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "10");
    if (status !== "all") params.set("status", status);
    if (q) params.set("search", q);
    API.get(`/admin/contacts?${params}`)
      .then((res) => {
        setItems(res.data.data || []);
        setNewCount(res.data.newCount || 0);
        setPagination(res.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages(1, "all", "");
  }, []);

  const switchFilter = (f) => {
    setFilter(f);
    setPage(1);
    fetchMessages(1, f);
  };

  const applySearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchMessages(1, filter, search);
  };

  const goPage = (p) => {
    setPage(p);
    fetchMessages(p, filter);
  };

  const setStatus = async (id, status) => {
    setActing(id);
    try {
      await API.put(`/admin/contacts/${id}/status`, { status });
      fetchMessages(page);
    } finally {
      setActing("");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setActing(id);
    try {
      await API.delete(`/admin/contacts/${id}`);
      setViewMsg(null);
      fetchMessages(page);
    } finally {
      setActing("");
    }
  };

  // Opening a message marks it read automatically, like a real inbox
  const openView = (msg) => {
    if (msg.status === "new") {
      setViewMsg({ ...msg, status: "read" });
      API.put(`/admin/contacts/${msg._id}/status`, { status: "read" })
        .then(() => fetchMessages(page))
        .catch(() => {});
    } else {
      setViewMsg(msg);
    }
  };

  const toggleRead = async (msg) => {
    const next = msg.status === "new" ? "read" : "new";
    await setStatus(msg._id, next);
    setViewMsg({ ...msg, status: next });
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "read", label: "Read" },
  ];

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Contact inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Messages from the contact page{newCount > 0 ? ` · ${newCount} new` : ""}.
        </p>
      </div>

      <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => switchFilter(f.id)}
              className={`h-8 px-3 rounded-md text-sm font-medium ${
                filter === f.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
              {f.id === "new" && newCount > 0 && (
                <span className={`ml-1.5 text-xs ${filter === f.id ? "text-white/80" : "text-slate-400"}`}>
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <form onSubmit={applySearch} className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or subject"
              className={`${inputClass} w-full pl-9`}
            />
          </div>
          <button type="submit" className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner label="Loading messages..." />
      ) : items.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Mail size={28} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-800">No {filter === "all" ? "" : filter} messages</p>
          <p className="mt-1 text-sm text-slate-500">Messages sent from the contact page will show up here.</p>
        </div>
      ) : (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sender</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Message</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`hover:bg-slate-50/70 transition-colors ${msg.status === "new" ? "bg-emerald-50/40" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      {msg.status === "new" ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white">New</span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">Read</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-[150px]">
                        <p className={`truncate ${msg.status === "new" ? "font-semibold text-slate-900" : "font-medium text-slate-800"}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{msg.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <button
                        onClick={() => openView(msg)}
                        className={`block max-w-full truncate text-left hover:text-emerald-700 ${
                          msg.status === "new" ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {msg.subject}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <p className="text-slate-500 truncate">{msg.message}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(msg)}
                          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => remove(msg._id)}
                          disabled={acting === msg._id}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete message"
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
                Page {pagination.page} of {pagination.pages} · {pagination.total} messages
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

      {viewMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setViewMsg(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 text-base font-semibold flex items-center justify-center shrink-0">
                  {viewMsg.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{viewMsg.name}</p>
                  <p className="text-sm text-slate-500 truncate">{viewMsg.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewMsg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 shrink-0"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 break-words">{viewMsg.subject}</h3>
                {viewMsg.status === "new" ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">New</span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">Read</span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Received {viewMsg.createdAt ? new Date(viewMsg.createdAt).toLocaleString() : "—"}
              </p>
            </div>

            <div className="mt-4 bg-slate-50 border border-gray-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{viewMsg.message}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => remove(viewMsg._id)}
                disabled={acting === viewMsg._id}
                className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRead(viewMsg)}
                  disabled={acting === viewMsg._id}
                  className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Check size={14} />
                  {viewMsg.status === "new" ? "Mark read" : "Mark unread"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    API.get("/admin/analytics")
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const u = data?.users || {};
  const po = data?.posts || {};
  const m = data?.matches || {};
  const re = data?.reports || {};
  const pay = data?.payments || {};

  const roleSegs = [
    { label: "Investors", value: u.investor || 0, color: SEG_COLORS.good },
    { label: "Businesses", value: u.businessman || 0, color: SEG_COLORS.info },
    { label: "Admins", value: u.admin || 0, color: SEG_COLORS.warn },
  ];
  const userStatusSegs = [
    { label: "Active", value: u.active || 0, color: SEG_COLORS.good },
    { label: "Pending", value: u.pending || 0, color: SEG_COLORS.warn },
    { label: "Suspended", value: u.suspended || 0, color: SEG_COLORS.neutral },
    { label: "Blocked", value: u.blocked || 0, color: SEG_COLORS.bad },
  ];
  const listingSegs = [
    { label: "Approved", value: po.active || 0, color: SEG_COLORS.good },
    { label: "Fully funded", value: po.completed || 0, color: SEG_COLORS.info },
    { label: "Pending approval", value: po.pending || 0, color: SEG_COLORS.warn },
    { label: "Rejected", value: po.rejected || 0, color: SEG_COLORS.bad },
  ];
  const matchSegs = [
    { label: "Accepted", value: m.accepted || 0, color: SEG_COLORS.good },
    { label: "Pending", value: m.pending || 0, color: SEG_COLORS.warn },
    { label: "Rejected", value: m.rejected || 0, color: SEG_COLORS.bad },
  ];
  const paymentSegs = [
    { label: "Completed", value: pay.completed || 0, color: SEG_COLORS.good },
    { label: "Pending", value: pay.pending || 0, color: SEG_COLORS.warn },
    { label: "Failed", value: pay.failed || 0, color: SEG_COLORS.bad },
    { label: "Cancelled", value: pay.cancelled || 0, color: SEG_COLORS.neutral },
  ];
  const reportSegs = [
    { label: "Resolved", value: re.resolved || 0, color: SEG_COLORS.good },
    { label: "Pending", value: re.pending || 0, color: SEG_COLORS.warn },
    { label: "Dismissed", value: re.dismissed || 0, color: SEG_COLORS.neutral },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Live platform totals, conversion health, and revenue.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50 shrink-0 w-fit"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading analytics..." />
      ) : !data ? (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm text-slate-500">Failed to load analytics.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-7">
          <section>
            <SectionLabel>Overview</SectionLabel>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiTile
                icon={UsersRound}
                label="Total users"
                value={u.total ?? 0}
                sub={`${u.active ?? 0} active`}
                to="/dashboard/users"
              />
              <KpiTile
                icon={FileText}
                label="Listings"
                value={po.total ?? 0}
                sub={`${po.active ?? 0} live now`}
                to="/dashboard/listings"
              />
              <KpiTile
                icon={Banknote}
                label="Payment volume"
                value={formatBdt(pay.totalAmount)}
                sub={`${pay.completed ?? 0} completed payments`}
                to="/dashboard/payments"
              />
              <KpiTile
                icon={Handshake}
                label="Platform revenue"
                value={formatBdt(pay.feeRevenue)}
                sub="10% commission"
                to="/dashboard/payments"
              />
            </div>
          </section>

          <section>
            <SectionLabel>Platform health</SectionLabel>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <RateTile label="Account activation" value={u.active ?? 0} total={u.total ?? 0} noun="users active" />
              <RateTile label="Listing approval" value={po.active ?? 0} total={po.total ?? 0} noun="listings approved" />
              <RateTile label="Match acceptance" value={m.accepted ?? 0} total={m.total ?? 0} noun="requests accepted" />
              <RateTile label="Payment success" value={pay.completed ?? 0} total={pay.total ?? 0} noun="payments completed" />
            </div>
          </section>

          <section>
            <SectionLabel>Breakdowns</SectionLabel>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreakdownCard title="Users by role" icon={UsersRound} total={u.total ?? 0}>
                <PropBar segments={roleSegs} total={u.total || 0} />
                <SegmentLegend segments={roleSegs} total={u.total || 0} />
              </BreakdownCard>

              <BreakdownCard title="Users by status" icon={Shield} total={u.total ?? 0}>
                <PropBar segments={userStatusSegs} total={u.total || 0} />
                <SegmentLegend segments={userStatusSegs} total={u.total || 0} />
              </BreakdownCard>

              <BreakdownCard title="Listings" icon={FileText} total={po.total ?? 0}>
                <PropBar segments={listingSegs} total={po.total || 0} />
                <SegmentLegend segments={listingSegs} total={po.total || 0} />
                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium tabular-nums">
                    Investor posts: {po.investor || 0}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium tabular-nums">
                    Business posts: {po.business || 0}
                  </span>
                </div>
              </BreakdownCard>

              <BreakdownCard title="Matches" icon={Handshake} total={m.total ?? 0}>
                <PropBar segments={matchSegs} total={m.total || 0} />
                <SegmentLegend segments={matchSegs} total={m.total || 0} />
              </BreakdownCard>
            </div>
          </section>

          <section>
            <SectionLabel>Money & moderation</SectionLabel>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreakdownCard
                title="Payments"
                icon={Banknote}
                total={pay.total ?? 0}
                action={
                  <Link to="/dashboard/payments" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 shrink-0">
                    View all
                  </Link>
                }
              >
                <div className="flex flex-wrap items-end justify-between gap-3 pb-1 border-b border-gray-100">
                  <div>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">{formatBdt(pay.totalAmount)}</p>
                    <p className="text-xs text-slate-400">total completed volume</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-700 tabular-nums">{formatBdt(pay.feeRevenue)}</p>
                    <p className="text-xs text-slate-400">platform revenue (10%)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-slate-50 border border-gray-100 text-slate-600 tabular-nums">
                    Entry fees: <span className="font-semibold text-slate-900">{formatBdt(pay.entryFeeAmount)}</span>
                    {" · "}
                    {pay.entryFeeCount || 0} paid
                  </span>
                </div>
                <PropBar segments={paymentSegs} total={pay.total || 0} />
                <SegmentLegend segments={paymentSegs} total={pay.total || 0} />
              </BreakdownCard>

              <BreakdownCard
                title="Reports"
                icon={AlertTriangle}
                total={re.total ?? 0}
                action={
                  <Link to="/dashboard/reports" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 shrink-0">
                    Open reports
                  </Link>
                }
              >
                <PropBar segments={reportSegs} total={re.total || 0} />
                <SegmentLegend segments={reportSegs} total={re.total || 0} />
              </BreakdownCard>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
