import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Banknote, Search, X, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import API from "../api";

function formatBdt(n) {
  if (!n && n !== 0) return "";
  return `BDT ${Number(n).toLocaleString()}`;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

const statusClass = {
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-600",
  cancelled: "bg-slate-100 text-slate-600",
};

const BANNERS = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    text: "Payment successful. Your investment has been recorded.",
  },
  failed: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-700",
    text: "Payment failed. No money was charged — you can try again.",
  },
  cancelled: {
    icon: AlertCircle,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    text: "Payment cancelled. You can try again anytime.",
  },
};

export default function Investments() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const banner = BANNERS[searchParams.get("payment")];
  const isInvestor = user?.role === "investor";

  useEffect(() => {
    API.get("/payments/my")
      .then((res) => setInvestments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = investments.filter((i) => i.status === "completed");
  const totalCompleted = completed.reduce((sum, i) => sum + (i.amount || 0), 0);
  const visible = filter === "all" ? investments : investments.filter((i) => i.status === filter);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, f.id === "all" ? investments.length : investments.filter((i) => i.status === f.id).length])
  );

  const stats = [
    { label: isInvestor ? "Total invested" : "Total received", value: formatBdt(totalCompleted) },
    { label: "Completed payments", value: completed.length },
    { label: "Pending payments", value: counts.pending },
  ];

  return (
    <div>
      {banner && (
        <div className={`mb-5 flex items-start gap-3 border px-4 py-3 rounded-xl text-sm ${banner.className}`}>
          <banner.icon size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{banner.text}</p>
            {searchParams.get("tran") && (
              <p className="mt-0.5 text-xs opacity-70">Transaction ID: {searchParams.get("tran")}</p>
            )}
          </div>
          <button onClick={() => setSearchParams({}, { replace: true })} className="p-1 opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Payments</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Investments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isInvestor ? "Payments you have made through SSLCommerz." : "Investments received through SSLCommerz."}
          </p>
        </div>
        {isInvestor && (
          <Link
            to="/finding-goal"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shrink-0"
          >
            <Search size={16} />
            Find opportunities
          </Link>
        )}
      </div>

      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
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
          <p className="mt-3 text-sm text-slate-500">Loading investments...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Banknote size={28} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-800">
            No {filter === "all" ? "" : filter} investments yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {isInvestor
              ? "Browse business listings and invest with SSLCommerz to get started."
              : "Investments made into your listings will appear here."}
          </p>
          {isInvestor && (
            <Link
              to="/finding-goal"
              className="inline-flex items-center justify-center h-10 px-4 mt-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              Browse listings
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {isInvestor ? "Business" : "Investor"}
                  </th>
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
                {visible.map((inv) => {
                  const other = isInvestor ? inv.businessmanId : inv.investorId;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">
                            {other?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-slate-900 truncate max-w-[160px]">
                            {other?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[220px]">
                        {inv.postId?._id ? (
                          <Link
                            to={`/post/${inv.postId._id}`}
                            className="text-slate-600 hover:text-emerald-700 truncate block"
                          >
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
