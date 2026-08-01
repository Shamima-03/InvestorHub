import { useState, useEffect } from "react";
import API from "../../services/api";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    API.get("/admin/reports")
      .then((res) => setReports(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const resolve = async (id, status) => {
    await API.put(`/admin/reports/${id}`, { status });
    fetchReports();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 bg-white rounded-lg shadow p-6 text-center">No reports.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reported by: {r.reporterId?.name || "Unknown"}</p>
                  <p className="mt-1">Target: <span className="font-medium capitalize">{r.targetType}</span></p>
                  <p className="mt-1 text-gray-600">{r.reason}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded mt-2 inline-block ${
                    r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    r.status === "resolved" ? "bg-green-50 text-green-500" :
                    r.status === "reviewed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                  }`}>{r.status}</span>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => resolve(r._id, "resolved")} className="bg-green-400 text-white px-3 py-1 rounded text-sm">Resolve</button>
                    <button onClick={() => resolve(r._id, "dismissed")} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
