import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/analytics")
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!data) return <p className="text-gray-500">Failed to load analytics.</p>;

  const cards = [
    { label: "Total Users", value: data.totalUsers, color: "bg-emerald-500" },
    { label: "Investors", value: data.totalInvestors, color: "bg-green-400" },
    { label: "Businessmen", value: data.totalBusinessmen, color: "bg-purple-500" },
    { label: "Total Posts", value: data.totalPosts, color: "bg-yellow-500" },
    { label: "Total Matches", value: data.totalMatches, color: "bg-pink-500" },
    { label: "Accepted Matches", value: data.acceptedMatches, color: "bg-emerald-500" },
    { label: "Pending Reports", value: data.pendingReports, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow p-6">
            <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-white font-bold mb-3`}>
              {c.value}
            </div>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
