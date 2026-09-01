import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, Download } from "lucide-react";
import API from "../api";

function formatBdt(n) {
  if (!n && n !== 0) return "";
  return `BDT ${Number(n).toLocaleString()}`;
}

const statusClass = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  failed: "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

function Party({ label, user }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 font-semibold text-slate-900">{user?.name || "—"}</p>
      {user?.email && <p className="text-sm text-slate-500">{user.email}</p>}
      {user?.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
      {user?.location && <p className="text-sm text-slate-500">{user.location}</p>}
    </div>
  );
}

export default function Invoice() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    API.get(`/payments/${id}`)
      .then((res) => setInv(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Invoice not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = async () => {
    setDownloading(true);
    setError("");
    try {
      const res = await API.get(`/payments/${id}/invoice`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${inv?.tranId || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download the PDF invoice");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading invoice...</p>
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-xl text-sm">
          {error || "Invoice not found"}
        </div>
        <Link to="/dashboard/investments" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700">
          <ArrowLeft size={16} />
          Back to investments
        </Link>
      </div>
    );
  }

  const isPaid = inv.status === "completed";

  return (
    <div className="max-w-3xl">
      <style>{`@media print { aside, header, .no-print { display: none !important; } main { padding: 0 !important; overflow: visible !important; } }`}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard/investments" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700">
          <ArrowLeft size={16} />
          Back to investments
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={downloadPdf}
            disabled={downloading || !isPaid}
            title={isPaid ? "Download PDF invoice" : "Invoice PDF is only available for completed payments"}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="no-print mt-4 bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!isPaid && (
        <div className="no-print mt-4 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-3 rounded-xl text-sm">
          This payment is {inv.status}. A downloadable invoice is only issued for completed payments.
        </div>
      )}

      <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">IH</span>
              <span className="text-lg font-bold text-slate-900 tracking-tight">InvestorHub</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Investment payment receipt</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
            <p className="mt-1 text-sm text-slate-500">No: {inv.tranId}</p>
            <p className="text-sm text-slate-500">
              Date: {new Date(inv.paidAt || inv.createdAt).toLocaleDateString()}
            </p>
            <span className={`mt-2 inline-block text-xs font-semibold uppercase px-2.5 py-1 rounded-md border ${statusClass[inv.status] || statusClass.cancelled}`}>
              {isPaid ? "Paid" : inv.status}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 grid sm:grid-cols-2 gap-6">
          <Party label="Billed to (Investor)" user={inv.investorId} />
          <Party label="Paid to (Business)" user={inv.businessmanId} />
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 rounded-l-lg">Description</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-4 text-slate-800">
                  Investment in{" "}
                  {inv.postId?._id ? (
                    <Link to={`/post/${inv.postId._id}`} className="font-medium text-emerald-700 hover:underline">
                      {inv.postId?.title || "listing"}
                    </Link>
                  ) : (
                    <span className="font-medium">{inv.postId?.title || "listing"}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right font-semibold text-slate-900">{formatBdt(inv.amount)}</td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-right font-semibold text-slate-900">Total {isPaid ? "paid" : ""}</td>
                <td className="px-4 py-4 text-right text-lg font-bold text-emerald-700">{formatBdt(inv.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment details</p>
          <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Gateway</dt>
              <dd className="font-medium text-slate-800">SSLCommerz</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Method</dt>
              <dd className="font-medium text-slate-800">{inv.paymentMethod || "—"}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Transaction ID</dt>
              <dd className="font-medium text-slate-800 break-all">{inv.tranId}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Bank transaction ID</dt>
              <dd className="font-medium text-slate-800 break-all">{inv.bankTranId || "—"}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Platform fee (10%)</dt>
              <dd className="font-medium text-slate-800">{formatBdt(inv.platformFee || 0)}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Business receives</dt>
              <dd className="font-semibold text-emerald-700">{formatBdt(inv.netAmount || inv.amount)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          This invoice was generated by InvestorHub. Payment processed securely by SSLCommerz.
        </p>
      </div>
    </div>
  );
}
