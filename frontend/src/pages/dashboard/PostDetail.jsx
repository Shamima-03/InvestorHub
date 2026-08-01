import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchSent, setMatchSent] = useState(false);

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => setPost(res.data.data))
      .catch(() => navigate("/finding-goal"))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMatchRequest = async () => {
    try {
      const authorId = post.authorId?._id;
      if (!authorId) return;

      const body = { postId: post._id };
      if (user?.role === "investor") {
        body.businessmanId = authorId;
      } else {
        body.investorId = authorId;
      }

      await API.post("/matches/request", body);
      setMatchSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send match request");
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">Loading...</div>;
  if (!post) return null;

  const isAuthor = post.authorId?._id === user?._id;
  const canMatchInvestor = user?.role === "investor" && !isAuthor && post.type === "business_post";
  const canMatchBusinessman = user?.role === "businessman" && !isAuthor && post.type === "investor_post";
  const canMatch = canMatchInvestor || canMatchBusinessman;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="text-green-400 hover:underline mb-4 text-sm">← Back</button>

      <div className="bg-white rounded-lg shadow p-8">
        {post.image && (
          <div className="rounded-lg overflow-hidden mb-6 -mt-2">
            <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded ${
            post.type === "investor_post" ? "bg-green-50 text-green-500" : "bg-purple-100 text-purple-700"
          }`}>
            {post.type === "investor_post" ? "Investor Post" : "Business Post"}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            post.status === "active" ? "bg-green-50 text-green-400" :
            post.status === "closed" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
          }`}>{post.status}</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
            {post.authorId?.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="font-medium">{post.authorId?.name}</p>
            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.description}</p>
        </div>

        {post.category?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category.map((cat) => (
              <span key={cat} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{cat}</span>
            ))}
          </div>
        )}

        {post.budget > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-400">Budget / Investment Amount</p>
            <p className="text-2xl font-bold text-green-600">${post.budget.toLocaleString()}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <span>{post.viewsCount} views</span>
          <span>{post.likesCount} likes</span>
        </div>

        {canMatch && (
          <div className="border-t pt-6">
            {matchSent ? (
              <div className="bg-green-50 text-green-500 px-4 py-3 rounded-lg">
                Match request sent! Waiting for acceptance.
              </div>
            ) : (
              <button
                onClick={sendMatchRequest}
                className="bg-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500"
              >
                Send Match Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
