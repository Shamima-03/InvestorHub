import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileText, UsersRound, MessageCircle, PlusCircle, Search, UserCircle, ArrowRight, Check, X, Inbox,
} from "lucide-react";
import API from "../api";
import { Overview as AdminOverview } from "./Admin";

const statusClass = {
  accepted: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
  finalized: "bg-slate-100 text-slate-700",
};

function InvestorView({ user }) {
  const [stats, setStats] = useState({ posts: 0, matches: 0, messages: 0 });
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    API.get("/posts?limit=1&my=true")
      .then((res) => setStats((s) => ({ ...s, posts: res.data.pagination?.total || 0 })))
      .catch(() => {});
    API.get("/matches/my")
      .then((res) => {
        setStats((s) => ({ ...s, matches: res.data.data?.length || 0 }));
        setRecentMatches(res.data.data?.slice(0, 5) || []);
      })
      .catch(() => {});
    API.get("/conversations")
      .then((res) => setStats((s) => ({ ...s, messages: res.data.data?.length || 0 })))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "My posts", value: stats.posts, to: "/dashboard/posts", icon: FileText },
    { label: "Matches", value: stats.matches, to: "/dashboard/matches", icon: UsersRound },
    { label: "Conversations", value: stats.messages, to: "/dashboard/chat", icon: MessageCircle },
  ];

  const actions = [
    { to: "/dashboard/create-post", icon: PlusCircle, title: "Create investment post", desc: "Share what you are looking to fund." },
    { to: "/finding-goal", icon: Search, title: "Browse businesses", desc: "Find companies that match your thesis." },
    { to: "/dashboard/profile", icon: UserCircle, title: "Update profile", desc: "Keep your investment preferences current." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            {hello}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Your investment activity at a glance.</p>
        </div>
        <Link
          to="/dashboard/create-post"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
        >
          <PlusCircle size={16} />
          New post
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <h2 className="text-sm font-semibold text-slate-900">Recent matches</h2>
            <Link to="/dashboard/matches" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No match activity yet.</p>
              <Link to="/finding-goal" className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-emerald-700">
                Browse businesses <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {recentMatches.map((m) => (
                <div key={m._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
                    {m.businessmanId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{m.businessmanId?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{m.postId?.title || "General match"}</p>
                  </div>
                  <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[m.status] || "bg-slate-100 text-slate-600"}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessView({ user }) {
  const [stats, setStats] = useState({ posts: 0, pending: 0, messages: 0 });
  const [pendingMatches, setPendingMatches] = useState([]);
  const [acting, setActing] = useState("");

  useEffect(() => {
    API.get("/posts?limit=1&my=true")
      .then((res) => setStats((s) => ({ ...s, posts: res.data.pagination?.total || 0 })))
      .catch(() => {});
    API.get("/matches/my")
      .then((res) => {
        const matches = res.data.data || [];
        // Only requests sent TO this user — not the ones they sent themselves
        const incoming = matches.filter(
          (m) => m.status === "pending" && String(m.requestedBy?._id || m.requestedBy) !== String(user?._id)
        );
        setStats((s) => ({ ...s, pending: incoming.length }));
        setPendingMatches(incoming.slice(0, 5));
      })
      .catch(() => {});
    API.get("/conversations")
      .then((res) => setStats((s) => ({ ...s, messages: res.data.data?.length || 0 })))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const accept = async (id) => {
    setActing(id);
    try {
      await API.put(`/matches/${id}/accept`);
      setPendingMatches((prev) => prev.filter((m) => m._id !== id));
      setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
    } finally {
      setActing("");
    }
  };

  const reject = async (id) => {
    setActing(id);
    try {
      await API.put(`/matches/${id}/reject`);
      setPendingMatches((prev) => prev.filter((m) => m._id !== id));
      setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
    } finally {
      setActing("");
    }
  };

  const cards = [
    { label: "My posts", value: stats.posts, to: "/dashboard/posts", icon: FileText },
    { label: "Pending requests", value: stats.pending, to: "/dashboard/matches", icon: Inbox },
    { label: "Conversations", value: stats.messages, to: "/dashboard/chat", icon: MessageCircle },
  ];

  const actions = [
    { to: "/dashboard/create-post", icon: PlusCircle, title: "Create business post", desc: "Pitch your company to investors." },
    { to: "/finding-goal?type=investor_post", icon: Search, title: "Browse investors", desc: "Find investors who match your needs." },
    { to: "/dashboard/profile", icon: UserCircle, title: "Update profile", desc: "Keep company info and funding needs current." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            {hello}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Your business activity at a glance.</p>
        </div>
        <Link
          to="/dashboard/create-post"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
        >
          <PlusCircle size={16} />
          New post
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <h2 className="text-sm font-semibold text-slate-900">Incoming requests</h2>
            <Link to="/dashboard/matches" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </div>
          {pendingMatches.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No pending match requests.</p>
              <Link to="/finding-goal?type=investor_post" className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-emerald-700">
                Browse investors <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {pendingMatches.map((m) => (
                <div key={m._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
                    {m.investorId?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{m.investorId?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{m.postId?.title || "General match"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => reject(m._id)}
                      disabled={acting === m._id}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50"
                      title="Decline"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => accept(m._id)}
                      disabled={acting === m._id}
                      className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <Check size={13} />
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  if (user?.role === "admin") return <AdminOverview user={user} />;
  if (user?.role === "businessman") return <BusinessView user={user} />;
  return <InvestorView user={user} />;
}
