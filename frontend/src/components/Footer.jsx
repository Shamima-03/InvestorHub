import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-accent-green/20 rounded-lg px-2 py-1 border border-accent-green/30">
              <span className="text-accent-green font-extrabold text-sm">
                IH
              </span>
            </div>
            <span className="text-white font-bold text-lg">InvestorHub</span>
          </div>
          <p className="text-sm leading-relaxed">
            Connecting investors and entrepreneurs for mutual growth and
            success. Build meaningful partnerships today.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-accent-green transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/finding-goal"
                className="hover:text-accent-green transition-colors"
              >
                Finding Goal
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-accent-green transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/login"
                className="hover:text-accent-green transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-accent-green transition-colors"
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-accent-green transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-accent-green transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-accent-green transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-accent-green transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 text-center py-4 text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} InvestorHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
