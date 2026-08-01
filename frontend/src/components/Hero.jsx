import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';

export default function Hero() {
  const [query, setQuery] = useState('');
  const [resourceType, setResourceType] = useState('All resources');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const resourceTypes = ['All resources', 'Investors', 'Businesses', 'Posts'];

  const handleSearch = e => {
    e.preventDefault();
    navigate(`/finding-goal?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[750px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large green circle - top right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent-green/8 animate-pulse-slow" />

        {/* Neon green ring */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-accent-green/20 animate-float" />

        {/* Pink blob - top left */}
        <div className="absolute top-40 -left-20 w-48 h-48 rounded-full bg-accent-pink/10 animate-float-reverse" />

        {/* Small green dot cluster */}
        <div className="absolute top-32 left-1/4 w-3 h-3 rounded-full bg-accent-green/50 animate-float" />
        <div className="absolute top-48 left-1/3 w-2 h-2 rounded-full bg-accent-green/30 animate-float-reverse" />
        <div className="absolute top-24 left-1/3 w-4 h-4 rounded-full bg-accent-green/20 animate-pulse-slow" />

        {/* Purple light circle */}
        <div className="absolute bottom-40 right-1/4 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />

        {/* Green curved line */}
        <svg
          className="absolute top-16 left-0 w-full h-full opacity-15"
          viewBox="0 0 1440 750"
          fill="none"
        >
          <path
            d="M-100 300 C 200 100, 500 500, 800 200 S 1200 400, 1540 150"
            stroke="#34D399"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Second green curved line */}
        <svg
          className="absolute bottom-20 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 750"
          fill="none"
        >
          <path
            d="M-50 550 C 300 700, 600 300, 900 500 S 1300 350, 1540 500"
            stroke="#34D399"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Dots pattern - top */}
        <div className="absolute top-36 right-1/3 grid grid-cols-5 gap-2 opacity-15">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        {/* Dots pattern - bottom left */}
        <div className="absolute bottom-32 left-16 grid grid-cols-4 gap-3 opacity-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-accent-green" />
          ))}
        </div>

        {/* Floating abstract shapes */}
        <div className="absolute top-1/3 right-12 w-20 h-20 bg-accent-pink/10 rounded-2xl rotate-45 animate-float blur-sm" />
        <div className="absolute bottom-1/3 left-24 w-16 h-16 bg-accent-green/10 rounded-full animate-float-reverse blur-sm" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up">
          Where Investors Meet <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
            Visionaries
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto animate-fade-in-up-delay">
          Connect, Collaborate, and Grow Together. The ultimate matchmaking
          platform for investors and entrepreneurs.
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="mt-10 animate-fade-in-up-delay-2"
        >
          <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-2 max-w-3xl mx-auto flex items-center border border-white/10 shadow-2xl">
            {/* Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white text-sm font-medium whitespace-nowrap rounded-xl hover:bg-white/10 transition-all"
              >
                {resourceType}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl py-2 w-48 z-50">
                  {resourceTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setResourceType(type);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${
                        resourceType === type
                          ? 'text-primary font-semibold bg-primary/5'
                          : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for investors, businesses, opportunities..."
              className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 outline-none text-sm"
            />

            {/* Search Button */}
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 shrink-0"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-in-up-delay-2">
          <span className="text-white/40 text-sm">Popular:</span>
          {['Technology', 'Healthcare', 'Real Estate', 'FinTech'].map(tag => (
            <button
              key={tag}
              onClick={() => navigate(`/finding-goal?category=${tag}`)}
              className="text-white/60 hover:text-accent-green text-sm px-3 py-1 rounded-full border border-white/10 hover:border-accent-green/30 transition-all duration-300"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
