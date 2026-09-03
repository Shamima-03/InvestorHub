import { useState } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, UploadCloud, X, LogOut } from "lucide-react";
import { getMe, logout } from "../store";
import API from "../api";

export default function Onboarding() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const feePaidNow = searchParams.get("fee") === "success";
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard" replace />;
  // Entry fee comes first in the signup sequence
  if (user.status === "pending" && !user.entryFeePaid) return <Navigate to="/entry-fee" replace />;

  const alreadySubmitted = Boolean(user.nidImage);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a photo of your NID card first");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = uploadRes.data?.url;
      if (!url) throw new Error("Upload failed");

      await API.put("/users/me/nid", { nidImage: url });
      await dispatch(getMe());
      navigate("/pending", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your NID. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-20 min-h-[60vh]">
      <div className="max-w-[520px] mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600">
              <ShieldCheck size={26} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Step 3 of 3 · Identity verification
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              Upload your National ID{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              To keep InvestorHub safe, every {user?.role === "businessman" ? "business" : "investor"} account
              is verified. Upload a clear photo of your NID card — an admin reviews it before activating your account.
            </p>
          </div>

          {feePaidNow && (
            <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-lg text-sm">
              <span className="font-semibold">Entry fee paid successfully.</span> One last step — upload your NID
              so an admin can verify and activate your account.
            </div>
          )}

          {alreadySubmitted && (
            <div className="mt-5 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-lg text-sm">
              You already submitted an NID. Uploading a new photo will replace it.
            </div>
          )}

          {error && (
            <div className="mt-5 bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={submit} className="mt-5">
            {preview ? (
              <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                <img src={preview} alt="NID preview" className="w-full max-h-64 object-contain" />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 text-slate-600 hover:text-red-600 flex items-center justify-center"
                  title="Remove"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-emerald-300 rounded-xl py-10 cursor-pointer text-center transition-colors">
                <UploadCloud size={28} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Click to choose your NID photo</span>
                <span className="text-xs text-slate-400">JPG or PNG, max 5MB</span>
                <input type="file" accept="image/*" onChange={pickFile} className="hidden" />
              </label>
            )}

            <button
              type="submit"
              disabled={submitting || !file}
              className="mt-5 w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit NID for verification"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
            >
              <LogOut size={14} />
              Log out — continue later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
