import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Clock, ShieldCheck, LogOut, XCircle } from "lucide-react";
import { getMe, logout } from "../store";

export default function Pending() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const status = user?.status || "pending";
  const approved = user?.role === "admin" || status === "active";

  useEffect(() => {
    if (approved) navigate("/dashboard", { replace: true });
  }, [approved, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      dispatch(getMe());
    }, 15000);
    return () => clearInterval(id);
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Enforce the signup sequence: entry fee → NID submission → pending review
  if (user.role !== "admin" && status === "pending") {
    if (!user.entryFeePaid) return <Navigate to="/entry-fee" replace />;
    if (!user.nidImage) return <Navigate to="/onboarding" replace />;
  }

  const checkNow = async () => {
    setChecking(true);
    const result = await dispatch(getMe());
    setChecking(false);
    const next = result.payload;
    if (next?.role === "admin" || next?.status === "active") {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const blocked = status === "suspended" || status === "blocked";
  const rejected = status === "rejected";

  return (
    <div className="bg-slate-50 py-12 sm:py-20">
      <div className="max-w-[520px] mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <div
            className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
              blocked || rejected ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
            }`}
          >
            {rejected ? <XCircle size={26} /> : blocked ? <ShieldCheck size={26} /> : <Clock size={26} />}
          </div>

          {rejected ? (
            <>
              <h1 className="mt-4 text-xl font-semibold text-slate-900">Application rejected</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                An admin reviewed your account and rejected it. Please check the note below — after you
                fix the issue (for example, uploading a clearer NID), an admin can review your account again.
              </p>
              {user?.rejectionReason && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm text-left">
                  <span className="font-semibold">Admin's note:</span> {user.rejectionReason}
                </div>
              )}
            </>
          ) : blocked ? (
            <>
              <h1 className="mt-4 text-xl font-semibold text-slate-900">Account {status}</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your account has been {status}. You cannot access the dashboard.
                Contact support if you think this is a mistake.
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Pending approval
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">
                Thanks for registering{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your {user?.role === "businessman" ? "business" : "investor"} account is under review.
                An admin will activate it shortly. After that you can use the dashboard, posts, matches, and messages.
              </p>
            </>
          )}

          {!blocked && !user?.entryFeePaid && user?.role !== "admin" && (
            <div className="mt-5 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm text-left">
              <span className="font-semibold">Entry fee not paid.</span> Your account review starts after the
              one-time BDT 100 entry fee.{" "}
              <Link to="/entry-fee" className="font-semibold underline hover:no-underline">
                Pay entry fee
              </Link>
            </div>
          )}

          {!blocked &&
            (user?.nidImage ? (
              <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-lg text-sm text-left">
                <span className="font-semibold">NID submitted.</span> Your identity document is awaiting admin review.
              </div>
            ) : (
              <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm text-left">
                <span className="font-semibold">NID not submitted yet.</span> Uploading your National ID helps the
                admin verify and approve your account faster.{" "}
                <Link to="/onboarding" className="font-semibold underline hover:no-underline">
                  Upload NID
                </Link>
              </div>
            ))}

          <div className="mt-6 bg-slate-50 border border-gray-100 rounded-lg p-4 text-left text-sm">
            <p className="text-slate-700">
              <span className="font-medium">Email:</span> {user?.email || "—"}
            </p>
            <p className="mt-1 text-slate-700 capitalize">
              <span className="font-medium">Role:</span>{" "}
              {user?.role === "businessman" ? "Business" : user?.role || "—"}
            </p>
            <p className="mt-1 text-slate-700 capitalize">
              <span className="font-medium">Status:</span> {status}
            </p>
          </div>

          {!blocked && (
            <button
              onClick={checkNow}
              disabled={checking}
              className="mt-6 w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {checking ? "Checking..." : "Check status"}
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <Link to="/" className="font-medium text-slate-600 hover:text-slate-900">
              Back to home
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
