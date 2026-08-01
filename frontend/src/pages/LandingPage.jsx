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
import API from '../services/api';
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
    <div className="bg-slate-950">
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent-green/5 blur-[100px]" />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-accent-pink/5 blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-accent-green font-semibold text-xs uppercase tracking-widest bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-6">
              Why InvestorHub
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-accent-green to-green-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-accent-green/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-accent-green/5 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent-green/20 transition-all duration-500">
                    <f.icon size={28} className="text-accent-green" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent-pink/5 blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="inline-block text-accent-green font-semibold text-xs uppercase tracking-widest bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-4">
              Latest Opportunities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Featured Posts
            </h2>
          </div>
          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No featured posts yet. Check back soon!
            </p>
          )}
          <div className="text-center mt-10">
            <Link
              to="/finding-goal"
              className="inline-flex items-center gap-2 bg-accent-green/10 text-accent-green border border-accent-green/30 px-8 py-3 rounded-xl font-semibold hover:bg-accent-green/20 transition-all duration-300 shadow-lg shadow-accent-green/10"
            >
              Browse All Posts <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-green/5 blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="inline-block text-accent-green font-semibold text-xs uppercase tracking-widest bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-4">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${openFaq === i ? 'border-accent-green/30 bg-white/5 shadow-lg shadow-accent-green/5' : 'border-white/10 bg-white/5'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 font-semibold flex justify-between items-center group"
                >
                  <span className="text-white group-hover:text-accent-green transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ml-4 ${
                      openFaq === i ? 'rotate-180 text-accent-green' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-green/8 blur-[120px]" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-pink/5 animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary/10 animate-pulse-slow" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of investors and entrepreneurs building the future
            together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-accent-green text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-accent-green/90 transition-all duration-300 shadow-lg shadow-accent-green/20"
            >
              Get Started Free
            </Link>
            <Link
              to="/finding-goal"
              className="border-2 border-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Browse Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
