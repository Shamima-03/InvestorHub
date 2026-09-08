import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Star, Trash2, MessageSquareQuote } from "lucide-react";
import API from "../api";

const ROLE_BADGE = {
  investor: { label: "Investor", color: "bg-emerald-50 text-emerald-700" },
  businessman: { label: "Business", color: "bg-slate-100 text-slate-700" },
  admin: { label: "Admin", color: "bg-amber-50 text-amber-700" },
};

const RATING_HINT = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function Stars({ value, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export default function Review() {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0, breakdown: [] });
  const [mine, setMine] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      const { data } = await API.get("/reviews");
      setReviews(data.data || []);
      setSummary(data.summary || { total: 0, average: 0, breakdown: [] });
      setMine(data.mine || null);
      if (data.mine) {
        setRating(data.mine.rating);
        setComment(data.mine.comment);
      }
    } catch {
      setError("Could not load the reviews. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!rating) {
      setError("Pick a star rating first");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Your review must be at least 10 characters");
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.post("/reviews", { rating, comment });
      setNotice(data.message || "Thanks for reviewing InvestorHub.");
      await load();
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Could not save your review. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!mine) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await API.delete(`/reviews/${mine._id}`);
      setMine(null);
      setRating(0);
      setComment("");
      setNotice("Your review was deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete your review.");
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Community</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Reviews of InvestorHub
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Tell other members what the platform is like to use — matching, listings, chat, payments.
            Only signed-in accounts can read and write reviews, and everyone gets one review they can
            edit at any time.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Summary + write form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-slate-900 leading-none">
                  {summary.average ? summary.average.toFixed(1) : "—"}
                </span>
                <div className="pb-1">
                  <Stars value={Math.round(summary.average)} />
                  <p className="mt-1 text-xs text-slate-500">
                    {summary.total} {summary.total === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {summary.breakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-slate-500 tabular-nums">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: summary.total ? `${(count / summary.total) * 100}%` : 0 }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-slate-500 tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                {mine ? "Edit your review" : "Write a review"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Posting as <span className="font-medium text-slate-700">{user?.name}</span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      className="p-0.5 rounded hover:scale-110 transition-transform"
                      aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
                    >
                      <Star
                        size={26}
                        className={star <= shown ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-500">{RATING_HINT[shown] || "Tap a star"}</span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="What worked well for you on InvestorHub, and what could be better?"
                className="mt-4 w-full px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none resize-y focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="mt-1 text-xs text-slate-400 text-right">{comment.length}/1000</p>

              {error && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {notice && (
                <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {notice}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : mine ? "Update review" : "Post review"}
                </button>
                {mine && (
                  <button
                    type="button"
                    onClick={remove}
                    disabled={saving}
                    className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* All reviews */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-sm text-slate-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
                <MessageSquareQuote size={28} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-800">No reviews yet</p>
                <p className="mt-1 text-sm text-slate-500">Be the first member to review the platform.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const author = r.userId;
                  const isMine = author?._id === user?._id;
                  const badge = ROLE_BADGE[author?.role] || ROLE_BADGE.investor;
                  return (
                    <div
                      key={r._id}
                      className={`bg-white border rounded-xl p-4 sm:p-5 ${
                        isMine ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                          {author?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {author?.name || "Deleted account"}
                            </p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                            {isMine && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Stars value={r.rating} size={14} />
                            <span className="text-xs text-slate-400">
                              {new Date(r.updatedAt || r.createdAt).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                              {r.updatedAt && r.createdAt && r.updatedAt !== r.createdAt ? " · edited" : ""}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                            {r.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
