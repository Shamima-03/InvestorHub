import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { register, clearError } from "../store";
import { AuthTabs, inputClass } from "./AuthTabs";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "investor",
  });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setLocalError("");

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    const result = await dispatch(
      register({ name: form.name, email: form.email, password: form.password, role: form.role })
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/pending");
    }
  };

  const displayError = localError || error;

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-[480px] mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <AuthTabs />
          <h1 className="text-xl font-semibold text-slate-900">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">Join as an investor or businessman.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {displayError && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2.5 rounded-lg text-sm">
                {displayError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {["investor", "businessman"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`h-11 rounded-lg border text-sm font-medium capitalize ${
                      form.role === r
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-11`}
                  placeholder="At least 6 characters"
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={inputClass}
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
