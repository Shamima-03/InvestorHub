import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { login, clearError } from "../store";
import { AuthTabs, inputClass } from "./AuthTabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      const u = result.payload;
      if (u?.role === "admin" || u?.status === "active") {
        navigate(location.state?.from || "/dashboard");
      } else {
        navigate("/pending");
      }
    }
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-[480px] mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <AuthTabs />
          <h1 className="text-xl font-semibold text-slate-900">Log in to InvestorHub</h1>
          <p className="mt-1 text-sm text-slate-500">Use your email and password to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2.5 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
