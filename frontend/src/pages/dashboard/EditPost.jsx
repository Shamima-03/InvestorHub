import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import API from "../../services/api";

const CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education",
  "Manufacturing", "Agriculture", "Energy", "Retail", "Other",
];

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", budget: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => {
        const p = res.data.data;
        setForm({
          title: p.title,
          description: p.description,
          category: p.category?.join(", ") || "",
          budget: p.budget || "",
        });
        if (p.image) setExistingImage(p.image);
      })
      .catch(() => navigate("/dashboard/posts"))
      .finally(() => setLoading(false));
  }, [id]);

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

  const uploadImage = async () => {
    const fd = new FormData();
    fd.append("image", imageFile);
    const { data } = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = existingImage || "";
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage();
        setUploading(false);
      }

      await API.put(`/posts/${id}`, {
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget) || 0,
        image: imageUrl,
      });
      navigate("/dashboard/posts");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          {(imagePreview || existingImage) ? (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={imagePreview || existingImage} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-10 flex flex-col items-center gap-2 hover:border-green-400 hover:bg-green-50/50 transition-all"
            >
              <ImagePlus size={28} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload an image</span>
              <span className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget ($)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-green-400 text-white py-3 rounded-lg font-semibold hover:bg-green-500 disabled:opacity-50">
          {uploading ? "Uploading image..." : saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
