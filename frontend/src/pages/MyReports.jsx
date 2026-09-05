import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import API from "../api";

const statusClass = {
  pending: "bg-amber-50 text-amber-700",
  reviewed: "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-600",
};

const statusHint = {
  pending: "Waiting for an admin to review your report.",
  reviewed: "An admin is currently reviewing this report.",
  resolved: "Reviewed — action was taken on your report.",
  dismissed: "Reviewed — the admin decided no action was needed.",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "reviewed", label: "Under review" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
];

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    API.get("/reports/my")
      .then((res) => setReports(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, f.id === "all" ? reports.length : reports.filter((r) => r.status === f.id).length])
  );

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Safety</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">My reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reports you submitted and what the admins decided about them.
        </p>
      </div>

      <div className="mt-5 flex gap-1 p-1 bg-white border border-gray-200 rounded-lg w-fit overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap ${
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
          <p className="mt-3 text-sm text-slate-500">Loading reports...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Flag size={28} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-800">
            No {filter === "all" ? "" : FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} reports
          </p>
          <p className="mt-1 text-sm text-slate-500">
            When you report a listing or a user, it will show up here with its review status.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {r.targetType === "post" ? "Listing" : "User"}
                </span>
                <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-md ${statusClass[r.status] || "bg-slate-100 text-slate-600"}`}>
                  {r.status === "reviewed" ? "Under review" : r.status}
                </span>
              </div>

              <p className="mt-2 text-sm">
                <span className="text-slate-400">You reported: </span>
                {r.targetType === "post" ? (
                  r.target ? (
                    <Link to={`/post/${r.target._id}`} className="font-medium text-emerald-700 hover:underline break-words">
                      {r.target.title}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">a listing that no longer exists</span>
                  )
                ) : r.target ? (
                  <span className="font-medium text-slate-800">{r.target.name}</span>
                ) : (
                  <span className="text-slate-400 italic">a user that no longer exists</span>
                )}
              </p>

              <p className="mt-1.5 text-sm text-slate-700">{r.reason}</p>

              {r.adminNote && (r.status === "resolved" || r.status === "dismissed") && (
                <div className="mt-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-slate-700">
                  <span className="font-semibold text-emerald-800">Admin's note:</span> {r.adminNote}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{statusHint[r.status] || ""}</p>
                <p className="text-xs text-slate-400">
                  Submitted {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
