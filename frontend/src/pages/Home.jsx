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
  },
  {
    icon: Handshake,
    title: 'Direct Connection',
    desc: 'Communicate directly with potential partners through real-time chat.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Together',
    desc: 'Build meaningful partnerships that drive growth and success.',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    desc: 'All users go through verification for a safe and trusted environment.',
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

      <section className="bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Why InvestorHub
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Tools to find the right partner, start a conversation, and grow
              with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
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

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Latest opportunities
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Featured posts
              </h2>
              <p className="mt-2 text-slate-600">
                Recent investor and business listings on the platform.
              </p>
            </div>
            <Link
              to="/finding-goal"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Browse all posts <ArrowRight size={16} />
            </Link>
          </div>

          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
              <p className="text-slate-500">No featured posts yet. Check back soon.</p>
              <Link
                to="/finding-goal"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-emerald-700"
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
