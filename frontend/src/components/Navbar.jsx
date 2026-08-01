import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/finding-goal?search=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Finding Goal', to: '/finding-goal' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = path => location.pathname === path;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4 lg:mx-8">
          <nav
            className={`relative flex items-center justify-between px-4 lg:px-6 h-16 rounded-2xl transition-all duration-500 ${
              scrolled
                ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/30'
                : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-md">
                <span className="text-primary font-extrabold text-lg tracking-tight">
                  IH
                </span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">
                InvestorHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive(link.to)
                      ? 'text-white bg-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent-green rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              {searchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center bg-white/15 backdrop-blur-sm rounded-xl overflow-hidden"
                >
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent text-white placeholder-white/50 px-3 py-2 text-sm outline-none w-40 lg:w-56"
                  />
                  <button
                    type="submit"
                    className="text-white/80 hover:text-white px-2 py-2"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-white/60 hover:text-white px-2 py-2"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Auth Buttons - Desktop */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 bg-accent-green/20 text-accent-green hover:bg-accent-green/30 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-white/70 hover:text-red-400 hover:bg-white/10 px-3 py-2 rounded-xl text-sm transition-all duration-300"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-400 text-white hover:bg-green-500 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-green-400/20"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden bg-white text-primary p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-md"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-500 overflow-hidden ${
              mobileOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 mx-0 space-y-1">
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-2"
              >
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-primary px-3"
                >
                  <Search size={16} />
                </button>
              </form>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Spacer */}
      <div className="h-24" />
    </>
  );
}
