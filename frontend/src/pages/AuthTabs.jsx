import { Link, useLocation } from "react-router-dom";

const inputClass =
  "w-full h-11 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export function AuthTabs() {
  const { pathname } = useLocation();
  const login = pathname === "/login";

  return (
    <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 rounded-lg">
      <Link
        to="/login"
        className={`h-9 rounded-md text-sm font-semibold flex items-center justify-center ${
          login ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Log in
      </Link>
      <Link
        to="/register"
        className={`h-9 rounded-md text-sm font-semibold flex items-center justify-center ${
          !login ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Register
      </Link>
    </div>
  );
}

export { inputClass };
