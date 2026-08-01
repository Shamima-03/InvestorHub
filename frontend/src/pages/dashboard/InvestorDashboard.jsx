import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function InvestorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ posts: 0, matches: 0, messages: 0 });
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    API.get("/posts?limit=1").then((res) => setStats((s) => ({ ...s, posts: res.data.pagination?.total || 0 }))).catch(() => {});
    API.get("/matches/my").then((res) => {
      setStats((s) => ({ ...s, matches: res.data.data?.length || 0 }));
      setRecentMatches(res.data.data?.slice(0, 5) || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here's your investment overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-400 to-green-400 rounded-lg shadow p-6 text-white">
          <p className="text-green-50 text-sm">My Posts</p>
          <p className="text-3xl font-bold mt-1">{stats.posts}</p>
          <Link to="/dashboard/posts" className="text-sm text-green-100 hover:underline mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-6 text-white">
          <p className="text-emerald-100 text-sm">Sent Matches</p>
          <p className="text-3xl font-bold mt-1">{stats.matches}</p>
          <Link to="/dashboard/matches" className="text-sm text-emerald-200 hover:underline mt-2 inline-block">View all →</Link>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <p className="text-purple-100 text-sm">Conversations</p>
          <p className="text-3xl font-bold mt-1">{stats.messages}</p>
          <Link to="/dashboard/chat" className="text-sm text-purple-200 hover:underline mt-2 inline-block">Open chat →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/dashboard/create-post" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-green-50 text-green-400 rounded-lg flex items-center justify-center text-xl">+</div>
              <div>
                <p className="font-medium">Create Investment Post</p>
                <p className="text-sm text-gray-500">Share what you're looking for</p>
              </div>
            </Link>
            <Link to="/finding-goal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xl">🔍</div>
              <div>
                <p className="font-medium">Browse Business Posts</p>
                <p className="text-sm text-gray-500">Find businesses to invest in</p>
              </div>
            </Link>
            <Link to="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="font-medium">Update Profile</p>
                <p className="text-sm text-gray-500">Keep your investment preferences updated</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Match Activity</h2>
          {recentMatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No match activity yet</p>
              <Link to="/finding-goal" className="text-green-400 hover:underline text-sm">Browse posts to find businesses →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                    {m.businessmanId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{m.businessmanId?.name}</p>
                    <p className="text-xs text-gray-500">{m.postId?.title || "General match"}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    m.status === "accepted" ? "bg-green-50 text-green-500" :
                    m.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
