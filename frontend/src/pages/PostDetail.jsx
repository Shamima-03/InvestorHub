import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft, Eye, Calendar, MapPin, MessageCircle, UserPlus, Pencil, Tag,
} from "lucide-react";
import API from "../api";

function formatBdt(n) {
  if (!n && n !== 0) return "";
  return `BDT ${Number(n).toLocaleString()}`;
}

export default function PostDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchSent, setMatchSent] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => setPost(res.data.data))
      .catch(() => navigate("/finding-goal"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading listing...</p>
      </div>
    );
  }
  if (!post) return null;

  const author = post.authorId || {};
  const profile = post.authorProfile || {};
  const isInvestorPost = post.type === "investor_post";
  const isAuthor = author._id && user?._id === author._id;
  const authorRole = author.role || post.authorRole;
  const canContact =
    isAuthenticated &&
    user?.status === "active" &&
    !isAuthor &&
    ((user?.role === "investor" && authorRole === "businessman") ||
      (user?.role === "businessman" && authorRole === "investor"));

  const sendMatchRequest = async () => {
    if (!canContact) return;
    setMatching(true);
    setError("");
    try {
      const body = { postId: post._id };
      if (user.role === "investor") body.businessmanId = author._id;
      else body.investorId = author._id;
      await API.post("/matches/request", body);
      setMatchSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send match request");
    } finally {
      setMatching(false);
    }
  };

  const startMessage = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }
    if (!canContact) return;
    setContacting(true);
    setError("");
    try {
      const { data } = await API.post("/conversations", { participantId: author._id });
      if (data.data?._id) navigate(`/dashboard/chat?c=${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start conversation");
    } finally {
      setContacting(false);
    }
  };

  const facts = [
    { label: "Category", value: post.category?.length ? post.category.join(", ") : "—" },
    { label: "Listing type", value: isInvestorPost ? "Investor" : "Business" },
    { label: "Status", value: post.status || "active" },
    { label: "Budget", value: post.budget > 0 ? formatBdt(post.budget) : "Not specified" },
    { label: "Posted", value: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—" },
    { label: "Views", value: post.viewsCount ?? 0 },
  ];

  return (
    <div className="bg-slate-50 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link
          to="/finding-goal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>

        {post.status === "pending" && (
          <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            This post is pending admin approval and is not visible to other users yet.
          </div>
        )}
        {post.status === "rejected" && (
          <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            This post was rejected by an admin and is not visible to other users. You can edit and resubmit it.
          </div>
        )}

        <div className="mt-5 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="relative h-56 sm:h-72 bg-slate-100">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Tag size={40} />
                  </div>
                )}
                <span
                  className={`absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-md ${
                    isInvestorPost
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {isInvestorPost ? "Investor" : "Business"}
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  {post.category?.map((cat) => (
                    <span key={cat} className="text-xs font-medium text-slate-600 bg-slate-50 border border-gray-200 px-2 py-0.5 rounded">
                      {cat}
                    </span>
                  ))}
                  {post.status && (
                    <span className="text-xs font-medium capitalize text-slate-500">{post.status}</span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">{post.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} />
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={14} />
                    {post.viewsCount || 0} views
                  </span>
                </div>

                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-7">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Listing details</h2>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="border-b border-gray-100 pb-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{f.label}</dt>
                    <dd className="mt-1 text-sm text-slate-800 capitalize">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {authorRole === "investor" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-7">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Investor profile</h2>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Investment type</dt>
                    <dd className="mt-1 text-sm text-slate-800 capitalize">{profile.investmentType || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Investment range</dt>
                    <dd className="mt-1 text-sm text-slate-800">
                      {profile.investmentRange?.min || profile.investmentRange?.max
                        ? `${formatBdt(profile.investmentRange.min || 0)} – ${formatBdt(profile.investmentRange.max || 0)}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Preferred industry</dt>
                    <dd className="mt-1 text-sm text-slate-800">{profile.preferredIndustries?.join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Experience</dt>
                    <dd className="mt-1 text-sm text-slate-800">{profile.experience || "—"}</dd>
                  </div>
                  {profile.bio && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Bio</dt>
                      <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{profile.bio}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {authorRole === "businessman" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-7">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Business profile</h2>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Company</dt>
                    <dd className="mt-1 text-sm text-slate-800">{profile.companyName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Industry</dt>
                    <dd className="mt-1 text-sm text-slate-800">{profile.industry || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Stage</dt>
                    <dd className="mt-1 text-sm text-slate-800 capitalize">{profile.businessStage || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Funding needed</dt>
                    <dd className="mt-1 text-sm text-slate-800">
                      {profile.fundingNeeded > 0 ? formatBdt(profile.fundingNeeded) : "—"}
                    </dd>
                  </div>
                  {profile.bio && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Bio</dt>
                      <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{profile.bio}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Budget / investment</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {post.budget > 0 ? formatBdt(post.budget) : "Not specified"}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">Posted by</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold shrink-0">
                  {author.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{author.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {authorRole === "businessman" ? "Business" : authorRole || "Member"}
                  </p>
                </div>
              </div>
              {author.location && (
                <p className="mt-3 text-sm text-slate-600 inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {author.location}
                </p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">Contact</p>
              {error && (
                <div className="mb-3 bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}

              {isAuthor ? (
                <Link
                  to={`/dashboard/edit-post/${post._id}`}
                  className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                >
                  <Pencil size={16} />
                  Edit listing
                </Link>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate("/login", { state: { from: `/post/${id}` } })}
                  className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                >
                  <MessageCircle size={16} />
                  Log in to message
                </button>
              ) : user?.status !== "active" ? (
                <div>
                  <p className="text-sm text-slate-500">
                    Your account is pending approval. You can message after an admin activates it.
                  </p>
                  <Link
                    to="/pending"
                    className="mt-3 h-11 w-full inline-flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
                  >
                    View account status
                  </Link>
                </div>
              ) : canContact ? (
                <div className="space-y-2">
                  <button
                    onClick={startMessage}
                    disabled={contacting}
                    className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <MessageCircle size={16} />
                    {contacting ? "Opening..." : "Message"}
                  </button>
                  {matchSent ? (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                      Match request sent.
                    </p>
                  ) : (
                    <button
                      onClick={sendMatchRequest}
                      disabled={matching}
                      className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      {matching ? "Sending..." : "Send match request"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Only an investor and a business can message each other on a listing.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
