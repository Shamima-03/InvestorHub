import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                IH
              </span>
              <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
                InvestorHub
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Connecting investors and entrepreneurs for mutual growth and
              success.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-600 hover:text-slate-900">Home</Link>
              </li>
              <li>
                <Link to="/finding-goal" className="text-slate-600 hover:text-slate-900">Finding Goal</Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-slate-900">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 hover:text-slate-900">Get started</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Social</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">LinkedIn</a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">Facebook</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} InvestorHub. All rights reserved.
          </p>
          <p className="text-sm text-slate-400">Investor &amp; business matching</p>
        </div>
      </div>
    </footer>
  );
}
