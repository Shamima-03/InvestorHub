import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageCircle, Check, X, Search, LayoutGrid, LayoutList } from "lucide-react";
import API from "../api";

const VIEW_KEY = "myMatchesView";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

const statusClass = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  finalized: "bg-slate-100 text-slate-700",
};

function Actions({ match, isSender, busy, onAccept, onReject, onChat }) {
  if (match.status === "pending") {
    if (isSender) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Awaiting response</span>
          <button
            onClick={() => onReject(match._id)}
            disabled={busy}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <X size={14} />
            Withdraw
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onReject(match._id)}
          disabled={busy}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <X size={14} />
          Decline
        </button>
        <button
          onClick={() => onAccept(match._id)}
          disabled={busy}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
        >
          <Check size={14} />
          Accept
        </button>
      </div>
    );
  }
  if (match.status === "accepted") {
    return (
      <button
        onClick={() => onChat(match)}
        disabled={busy}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
      >
        <MessageCircle size={14} />
        {busy ? "Opening..." : "Message"}
      </button>
    );
  }
  return null;
}

function GridCard({ match, other, otherRole, isSender, busy, onAccept, onReject, onChat }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-semibold shrink-0">
          {other?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[match.status] || "bg-slate-100 text-slate-600"}`}>
          {match.status}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-slate-900 truncate">{other?.name || "Unknown"}</h3>
      {otherRole && <p className="text-xs text-slate-500 capitalize mt-0.5">{otherRole}</p>}
      <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1">{match.postId?.title || "General match"}</p>
      <p className="mt-2 text-xs text-slate-400">{new Date(match.createdAt).toLocaleDateString()}</p>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Actions match={match} isSender={isSender} busy={busy} onAccept={onAccept} onReject={onReject} onChat={onChat} />
      </div>
    </div>
  );
}

function ListRow({ match, other, otherRole, isSender, busy, onAccept, onReject, onChat }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-emerald-200 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {other?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">{other?.name || "Unknown"}</h3>
              {otherRole && (
                <span className="text-[11px] font-medium text-slate-500 capitalize">{otherRole}</span>
              )}
            </div>
            <p className="text-sm text-slate-500 truncate">{match.postId?.title || "General match"}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[match.status] || "bg-slate-100 text-slate-600"}`}>
                {match.status}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(match.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 sm:ml-auto">
          <Actions match={match} isSender={isSender} busy={busy} onAccept={onAccept} onReject={onReject} onChat={onChat} />
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const { user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState("");
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "grid");
  const navigate = useNavigate();

  const fetchMatches = () => {
    API.get("/matches/my")
      .then((res) => setMatches(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const setViewMode = (mode) => {
    setView(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  const accept = async (id) => {
    setActing(id);
    try {
      await API.put(`/matches/${id}/accept`);
      fetchMatches();
    } finally {
      setActing("");
    }
  };

  const reject = async (id) => {
    setActing(id);
    try {
      await API.put(`/matches/${id}/reject`);
      fetchMatches();
    } finally {
      setActing("");
    }
  };

  const startChat = async (match) => {
    const otherUserId = user?.role === "investor" ? match.businessmanId?._id : match.investorId?._id;
    if (!otherUserId) return;
    setActing(match._id);
    try {
      const { data } = await API.post("/conversations", { participantId: otherUserId });
      if (data.data?._id) navigate(`/dashboard/chat?c=${data.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot start chat yet. Match must be accepted first.");
    } finally {
      setActing("");
    }
  };

  const visible = filter === "all" ? matches : matches.filter((m) => m.status === filter);
  const counts = {
    all: matches.length,
    pending: matches.filter((m) => m.status === "pending").length,
    accepted: matches.filter((m) => m.status === "accepted").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  const cardProps = (m) => {
    const other = user?.role === "investor" ? m.businessmanId : m.investorId;
    const otherRole = other?.role === "businessman" ? "Business" : other?.role === "investor" ? "Investor" : "";
    return {
      match: m,
      other,
      otherRole,
      isSender: m.requestedBy ? String(m.requestedBy?._id || m.requestedBy) === String(user?._id) : false,
      busy: acting === m._id,
      onAccept: accept,
      onReject: reject,
      onChat: startChat,
    };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Connections</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Matches</h1>
          <p className="mt-1 text-sm text-slate-500">Review requests and start conversations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-white border border-gray-200 rounded-lg">
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
          <Link
            to="/finding-goal"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
          >
            <Search size={16} />
            Find matches
          </Link>
        </div>
      </div>

      <div className="mt-5 flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit">
        {FILTERS.map((f) => (
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
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading matches...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-sm font-medium text-slate-800">No {filter === "all" ? "" : filter} matches yet</p>
          <p className="mt-1 text-sm text-slate-500">Browse listings and send a match request to get started.</p>
          <Link
            to="/finding-goal"
            className="inline-flex items-center justify-center h-10 px-4 mt-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            Browse listings
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((m) => (
            <GridCard key={m._id} {...cardProps(m)} />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map((m) => (
            <ListRow key={m._id} {...cardProps(m)} />
          ))}
        </div>
      )}
    </div>
  );
}
