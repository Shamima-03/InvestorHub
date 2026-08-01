import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-green/5 blur-[120px]" />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-accent-pink/5 blur-[100px]" />
      </div>
      <div className="max-w-3xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-accent-green font-semibold text-xs uppercase tracking-widest bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-4">
            Get In Touch
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Contact Us
          </h1>
          <p className="text-gray-400 mt-3">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-accent-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-accent-green mb-2">
              Message Sent!
            </h2>
            <p className="text-gray-400">
              We&apos;ll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-accent-green hover:text-accent-green/80 text-sm font-medium transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                rows={6}
                required
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent-green text-slate-950 py-3 rounded-xl font-bold hover:bg-accent-green/90 transition-all duration-300 shadow-lg shadow-accent-green/20"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
