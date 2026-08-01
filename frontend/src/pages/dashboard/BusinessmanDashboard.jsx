import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function BusinessmanDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ posts: 0, pending: 0, accepted: 0 });
  const [pendingMatches, setPendingMatches] = useState([]);

  useEffect(() => {
    API.get("/posts?limit=1").then((res) => setStats((s) => ({ ...s, posts: res.data.pagination?.total || 0 }))).catch(() => {});
    API.get("/matches/my").then((res) => {
      const matches = res.data.data || [];
      setStats((s) => ({
        ...s,
        pending: matches.filter((m) => m.status === "pending").length,
        accepted: matches.filter((m) => m.status === "accepted").length,
      }));
      setPendingMatches(matches.filter((m) => m.status === "pending").slice(0, 5));
    }).catch(() => {});
  }, []);

  const accept = async (id) => {
    await API.put(`/matches/${id}/accept`);
    setPendingMatches((prev) => prev.filter((m) => m._id !== id));
    setStats((s) => ({ ...s, pending: s.pending - 1, accepted: s.accepted + 1 }));
  };

  const reject = async (id) => {
    await API.put(`/matches/${id}/reject`);
    setPendingMatches((prev) => prev.filter((m) => m._id !== id));
    setStats((s) => ({ ...s, pending: s.pending - 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Manage your business and find investors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <p className="text-purple-100 text-sm">My Posts</p>
          <p className="text-3xl font-bold mt-1">{stats.posts}</p>
          <Link to="/dashboard/posts" className="text-sm text-purple-200 hover:underline mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
          <p className="text-yellow-100 text-sm">Pending Requests</p>
          <p className="text-3xl font-bold mt-1">{stats.pending}</p>
          <Link to="/dashboard/matches" className="text-sm text-yellow-200 hover:underline mt-2 inline-block">Review →</Link>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-400 rounded-lg shadow p-6 text-white">
          <p className="text-green-50 text-sm">Accepted Matches</p>
          <p className="text-3xl font-bold mt-1">{stats.accepted}</p>
          <Link to="/dashboard/chat" className="text-sm text-green-100 hover:underline mt-2 inline-block">Open chat →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/dashboard/create-post" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl">+</div>
              <div>
                <p className="font-medium">Create Business Post</p>
                <p className="text-sm text-gray-500">Pitch your business to investors</p>
              </div>
            </Link>
            <Link to="/finding-goal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-green-50 text-green-400 rounded-lg flex items-center justify-center text-xl">🔍</div>
              <div>
                <p className="font-medium">Browse Investor Posts</p>
                <p className="text-sm text-gray-500">Find investors who match your needs</p>
              </div>
            </Link>
            <Link to="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="font-medium">Update Business Profile</p>
                <p className="text-sm text-gray-500">Keep company info and funding needs updated</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Incoming Match Requests</h2>
          {pendingMatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No pending requests</p>
              <p className="text-sm text-gray-400">Investors will send match requests when they find your posts interesting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMatches.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                    {m.investorId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{m.investorId?.name}</p>
                    <p className="text-xs text-gray-500">{m.postId?.title || "General match"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => accept(m._id)} className="bg-green-400 text-white px-3 py-1 rounded text-xs hover:bg-green-500">
                      Accept
                    </button>
                    <button onClick={() => reject(m._id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
