import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Users,
  Handshake,
  Shield,
} from 'lucide-react';
import API from '../api';
import Hero from '../components/Hero';
import PostCard from '../components/PostCard';

const faqs = [
  {
    q: 'What is InvestorHub?',
    a: 'A platform connecting investors with businessmen for mutually beneficial partnerships and growth opportunities.',
  },
  {
    q: 'How do I get started?',
    a: 'Register as an Investor or Businessman, complete your profile, and start browsing posts to find your perfect match.',
  },
  {
    q: 'Is it free to use?',
    a: 'Yes! Registration and basic features are completely free. Premium features may be added in the future.',
  },
  {
    q: 'How does matching work?',
    a: "Send a match request to someone you're interested in. Once they accept, you can chat in real-time and explore opportunities together.",
  },
];

const features = [
  {
    icon: Users,
    title: 'Smart Matching',
    desc: 'AI-powered matching connects the right investors with the right businesses.',
    tile: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Handshake,
    title: 'Direct Connection',
    desc: 'Communicate directly with potential partners through real-time chat.',
    tile: 'from-teal-500 to-teal-600',
  },
  {
    icon: TrendingUp,
    title: 'Grow Together',
    desc: 'Build meaningful partnerships that drive growth and success.',
    tile: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    desc: 'All users go through verification for a safe and trusted environment.',
    tile: 'from-emerald-600 to-teal-600',
  },
];

export default function LandingPage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    API.get('/posts?limit=6&sortBy=popular')
      .then(res => setFeaturedPosts(res.data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <Hero />

      <section className="relative overflow-hidden bg-slate-50 border-y border-gray-200">
        <div className="pointer-events-none absolute -top-24 right-1/4 w-[360px] h-[360px] rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
              Why InvestorHub
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Tools to find the right partner, start a conversation, and grow
              with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tile} text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-transform duration-300`}
                >
                  <f.icon size={21} />
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-teal-50 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
                Latest opportunities
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Featured{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  posts
                </span>
              </h2>
              <p className="mt-3 text-slate-600">
                Recent investor and business listings on the platform.
              </p>
            </div>
            <Link
              to="/finding-goal"
              className="group inline-flex items-center gap-2 h-11 px-6 rounded-full border border-gray-200 bg-white text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors shrink-0"
            >
              Browse all posts
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl py-16 text-center bg-slate-50/50">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <TrendingUp size={22} />
              </span>
              <p className="mt-4 font-semibold text-slate-800">No featured posts yet</p>
              <p className="mt-1 text-sm text-slate-500">New opportunities will show up here soon.</p>
              <Link
                to="/finding-goal"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Browse posts <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                FAQ
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Quick answers about how InvestorHub works. Still stuck?{" "}
                <Link to="/contact" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  Contact us
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-gray-200 border-t border-b border-gray-200">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left py-5 flex items-start justify-between gap-4"
                  >
                    <span className="font-semibold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 mt-0.5 transition-transform ${
                        openFaq === i ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="pb-5 -mt-1 text-sm text-slate-600 leading-relaxed pr-8">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl border border-gray-200 bg-slate-50 px-6 py-8 sm:px-10 sm:py-10">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Ready to find your perfect match?
              </h2>
              <p className="mt-2 text-slate-600 leading-relaxed">
                Join investors and entrepreneurs building partnerships on InvestorHub.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                Get started free
              </Link>
              <Link
                to="/finding-goal"
                className="inline-flex items-center h-11 px-5 rounded-lg border border-gray-200 bg-white text-slate-700 text-sm font-semibold hover:bg-gray-50"
              >
                Browse posts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
