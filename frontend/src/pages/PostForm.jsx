import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ImagePlus, X, ChevronDown } from "lucide-react";
import API from "../api";

const CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education",
  "Manufacturing", "Agriculture", "Energy", "Retail", "Other",
];

const inputClass =
  "w-full h-11 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function PostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", budget: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/posts/${id}`)
      .then((res) => {
        const p = res.data.data;
        setForm({
          title: p.title,
          description: p.description,
          category: p.category?.[0] || "",
          budget: p.budget || "",
        });
        if (p.image) setExistingImage(p.image);
      })
      .catch(() => navigate("/dashboard/posts"))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImage("");
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = existingImage || "";
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const { data } = await API.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = data.url;
        setUploading(false);
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget) || 0,
        image: imageUrl,
      };

      if (isEdit) await API.put(`/posts/${id}`, payload);
      else await API.post("/posts", payload);

      navigate("/dashboard/posts", {
        state: {
          notice: isEdit
            ? "Your changes were saved. The post is pending admin approval before it goes public again."
            : "Your post was submitted. It will be visible to others once an admin approves it.",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? "Failed to update" : "Failed to create post"));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading post...</p>
      </div>
    );
  }

  const showImage = imagePreview || existingImage;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Content</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
          {isEdit ? "Edit post" : "Create post"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit ? "Update your listing details." : "Publish a listing for investors or businesses to find."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover image</label>
          {showImage ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={showImage} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 text-slate-700 p-1.5 rounded-full hover:bg-white border border-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
            >
              <ImagePlus size={24} className="text-slate-400" />
              <span className="text-sm text-slate-600">Click to upload an image</span>
              <span className="text-xs text-slate-400">JPG, PNG, GIF up to 5MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="What are you looking for?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            rows={5}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
            placeholder="Describe your requirements in detail..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <div className="relative">
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputClass} appearance-none pr-10 ${!form.category ? "text-slate-400" : ""}`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 h-11 text-sm font-medium text-slate-600 bg-slate-50 border border-r-0 border-gray-200 rounded-l-lg">
                BDT
              </span>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className={`${inputClass} rounded-l-none`}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100">
          <Link
            to="/dashboard/posts"
            className="h-11 px-4 inline-flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading image..." : saving ? (isEdit ? "Saving..." : "Publishing...") : isEdit ? "Save changes" : "Publish post"}
          </button>
        </div>
      </form>
    </div>
  );
}
