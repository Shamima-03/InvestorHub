import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, XCircle, AlertCircle, FileText, Banknote, RotateCcw } from "lucide-react";
import API from "../api";

function formatBdt(n) {
  if (!n && n !== 0) return "";
  return `BDT ${Number(n).toLocaleString()}`;
}

const CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 bg-emerald-50",
    title: "Payment successful!",
    subtitle: "Your investment has been recorded and confirmed by SSLCommerz.",
  },
  fail: {
    icon: XCircle,
    iconClass: "text-red-600 bg-red-50",
    title: "Payment failed",
    subtitle: "No money was charged. You can try again anytime.",
  },
  cancel: {
    icon: AlertCircle,
    iconClass: "text-amber-600 bg-amber-50",
    title: "Payment cancelled",
    subtitle: "You cancelled the payment. No money was charged.",
  },
};

export default function PaymentResult({ status }) {
  const [searchParams] = useSearchParams();
  const tran = searchParams.get("tran") || "";
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [investment, setInvestment] = useState(null);

  const cfg = CONFIG[status] || CONFIG.fail;
  const Icon = cfg.icon;

  useEffect(() => {
    if (!tran || !isAuthenticated) return;
    API.get(`/payments/tran/${tran}`)
      .then((res) => setInvestment(res.data.data))
      .catch(() => {});
  }, [tran, isAuthenticated]);

  const retryTo = investment?.postId?._id ? `/post/${investment.postId._id}` : "/finding-goal";

  return (
    <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${cfg.iconClass}`}>
          <Icon size={32} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 tracking-tight">{cfg.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{cfg.subtitle}</p>

        {investment && (
          <div className="mt-6 bg-slate-50 border border-gray-200 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">{formatBdt(investment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-slate-500 shrink-0">Listing</span>
              <span className="font-medium text-slate-800 truncate">{investment.postId?.title || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Business</span>
              <span className="font-medium text-slate-800">{investment.businessmanId?.name || "—"}</span>
            </div>
            {investment.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Platform fee (10%)</span>
                <span className="font-medium text-slate-800">{formatBdt(investment.platformFee)}</span>
              </div>
            )}
            {investment.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-800">{investment.paymentMethod}</span>
              </div>
            )}
          </div>
        )}

        {tran && <p className="mt-4 text-xs text-slate-400">Transaction ID: {tran}</p>}

        <div className="mt-6 space-y-2">
          {status === "success" && investment && (
            <Link
              to={`/dashboard/invoice/${investment._id}`}
              className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              <FileText size={16} />
              View invoice
            </Link>
          )}
          {status !== "success" && (
            <Link
              to={retryTo}
              className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              <RotateCcw size={16} />
              Try again
            </Link>
          )}
          <Link
            to="/dashboard/investments"
            className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            <Banknote size={16} />
            My investments
          </Link>
        </div>
      </div>
    </div>
  );
}
