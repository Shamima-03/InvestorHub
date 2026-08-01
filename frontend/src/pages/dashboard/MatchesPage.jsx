import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function MatchesPage() {
  const { user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMatches = () => {
    API.get("/matches/my")
      .then((res) => setMatches(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, []);

  const accept = async (id) => {
    await API.put(`/matches/${id}/accept`);
    fetchMatches();
  };

  const reject = async (id) => {
    await API.put(`/matches/${id}/reject`);
    fetchMatches();
  };

  const startChat = async (match) => {
    const otherUserId = user?.role === "investor"
      ? match.businessmanId?._id
      : match.investorId?._id;

    if (!otherUserId) return;

    try {
      const { data } = await API.post("/conversations", { participantId: otherUserId });
      if (data.data?._id) {
        navigate("/dashboard/chat");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Cannot start chat yet. Match must be accepted first.");
    }
  };

  const statusColor = (s) => {
    const m = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-50 text-green-500",
      rejected: "bg-red-100 text-red-700",
      finalized: "bg-emerald-100 text-emerald-700",
    };
    return m[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Matches</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-gray-500 bg-white rounded-lg shadow p-6 text-center">
          No matches yet. Browse posts and send match requests.
        </p>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const other = user?.role === "investor" ? m.businessmanId : m.investorId;
            return (
              <div key={m._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {other?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{other?.name || "Unknown"}</h3>
                      <p className="text-sm text-gray-500">{m.postId?.title || "General match"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(m.status)}`}>
                          {m.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {m.status === "pending" && (
                      <>
                        <button
                          onClick={() => accept(m._id)}
                          className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => reject(m._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {m.status === "accepted" && (
                      <button
                        onClick={() => startChat(m)}
                        className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
