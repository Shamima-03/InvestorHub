import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Banknote, ShieldCheck, XCircle, AlertCircle, LogOut, CheckCircle2 } from "lucide-react";
import { logout } from "../store";
import API from "../api";

const ENTRY_FEE = 100;

const BANNERS = {
  failed: {
    icon: XCircle,
    className: "bg-red-50 border-red-100 text-red-700",
    text: "Payment failed. No money was charged — please try again.",
  },
  cancelled: {
    icon: AlertCircle,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    text: "Payment cancelled. You can try again anytime.",
  },
};

export default function EntryFee() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard" replace />;
  if (user.entryFeePaid) return <Navigate to="/onboarding" replace />;

  const banner = BANNERS[searchParams.get("fee")];

  const pay = async () => {
    setPaying(true);
    setError("");
    try {
      const { data } = await API.post("/payments/entry-fee/init");
      window.location.href = data.data.gatewayUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the payment. Please try again.");
      setPaying(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-20 min-h-[60vh]">
      <div className="max-w-[520px] mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600">
            <Banknote size={26} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Step 2 of 3 · Registration fee
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Pay the one-time entry fee{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Every {user?.role === "businessman" ? "business" : "investor"} account pays a one-time entry fee.
            It keeps the platform limited to serious members and starts your verification review.
          </p>

          {banner && (
            <div className={`mt-5 flex items-start gap-2.5 border px-4 py-3 rounded-lg text-sm text-left ${banner.className}`}>
              <banner.icon size={16} className="mt-0.5 shrink-0" />
              {banner.text}
            </div>
          )}
          {error && (
            <div className="mt-5 bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-lg text-sm text-left">
              {error}
            </div>
          )}

          <div className="mt-6 bg-slate-50 border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Entry fee</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">BDT {ENTRY_FEE.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">One-time · non-refundable</p>
          </div>

          <ul className="mt-5 space-y-2 text-left">
            {[
              "Unlocks the identity verification (NID) step",
              "Your account goes to admins for approval after payment",
              "Pay securely with card, bKash, Nagad, or bank via SSLCommerz",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={15} className="mt-0.5 text-emerald-600 shrink-0" />
                {line}
              </li>
            ))}
          </ul>

          <button
            onClick={pay}
            disabled={paying}
            className="mt-6 w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            {paying ? "Redirecting to SSLCommerz..." : `Pay BDT ${ENTRY_FEE} with SSLCommerz`}
          </button>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
            >
              <LogOut size={14} />
              Log out — pay later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
