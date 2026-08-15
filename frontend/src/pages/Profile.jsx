import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import API from "../api";
import { getMe } from "../store";

const CATEGORIES = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education",
  "Manufacturing", "Agriculture", "Energy", "Retail", "Other",
];

const inputClass =
  "w-full h-11 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function Select({ value, onChange, children, required }) {
  return (
    <div className="relative">
      <select
        required={required}
        value={value}
        onChange={onChange}
        className={`${inputClass} appearance-none pr-10 ${!value ? "text-slate-400" : ""}`}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function BdtInput({ value, onChange, placeholder = "0" }) {
  return (
    <div className="flex">
      <span className="inline-flex items-center px-3 h-11 text-sm font-medium text-slate-600 bg-slate-50 border border-r-0 border-gray-200 rounded-l-lg">
        BDT
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        className={`${inputClass} rounded-l-none`}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isInvestor = user?.role === "investor";

  const [userForm, setUserForm] = useState({ name: "", phone: "", location: "", email: "" });
  const [profileForm, setProfileForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => {
        const u = res.data.data;
        setUserForm({
          name: u.name || "",
          phone: u.phone || "",
          location: u.location || "",
          email: u.email || "",
        });
        if (u.profile) setProfileForm(u.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await API.put("/users/me", {
        name: userForm.name,
        phone: userForm.phone,
        location: userForm.location,
      });

      const endpoint = isInvestor ? "/users/me/investor-profile" : "/users/me/businessman-profile";
      const payload = isInvestor
        ? {
            investmentRange: {
              min: Number(profileForm.investmentRange?.min) || 0,
              max: Number(profileForm.investmentRange?.max) || 0,
            },
            investmentType: profileForm.investmentType || "equity",
            preferredIndustries: profileForm.preferredIndustries?.filter(Boolean) || [],
            bio: profileForm.bio || "",
            experience: profileForm.experience || "",
          }
        : {
            companyName: profileForm.companyName || "",
            industry: profileForm.industry || "",
            businessStage: profileForm.businessStage || "idea",
            fundingNeeded: Number(profileForm.fundingNeeded) || 0,
            bio: profileForm.bio || "",
          };

      await API.put(endpoint, payload);
      await dispatch(getMe());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const initial = (userForm.name || user?.name || "U").charAt(0).toUpperCase();
  const roleLabel = user?.role === "businessman" ? "Business" : user?.role || "Member";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Keep your details current so matches stay relevant.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-gray-200 rounded-xl p-5 sm:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2.5 rounded-lg text-sm">{error}</div>
        )}
        {saved && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-2.5 rounded-lg text-sm">
            Profile saved.
          </div>
        )}

        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-semibold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{userForm.name || "Your name"}</p>
            <p className="text-sm text-slate-500 truncate">{userForm.email}</p>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700 capitalize">{roleLabel}</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Basic information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className={inputClass}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input value={userForm.email} disabled className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className={inputClass}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                  className={inputClass}
                  placeholder="City, country"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {isInvestor ? "Investment preferences" : "Business details"}
          </h2>

          {isInvestor ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min investment</label>
                  <BdtInput
                    value={profileForm.investmentRange?.min || ""}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        investmentRange: { ...profileForm.investmentRange, min: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Max investment</label>
                  <BdtInput
                    value={profileForm.investmentRange?.max || ""}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        investmentRange: { ...profileForm.investmentRange, max: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Investment type</label>
                  <Select
                    value={profileForm.investmentType || "equity"}
                    onChange={(e) => setProfileForm({ ...profileForm, investmentType: e.target.value })}
                  >
                    <option value="equity">Equity</option>
                    <option value="loan">Loan</option>
                    <option value="partnership">Partnership</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred industry</label>
                  <Select
                    value={profileForm.preferredIndustries?.[0] || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, preferredIndustries: e.target.value ? [e.target.value] : [] })
                    }
                  >
                    <option value="">Select industry</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience</label>
                <input
                  value={profileForm.experience || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 10 years in tech investing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                  placeholder="Tell others about your investment focus..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company name</label>
                <input
                  value={profileForm.companyName || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                  className={inputClass}
                  placeholder="Your company"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                  <Select
                    value={profileForm.industry || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                  >
                    <option value="">Select industry</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Business stage</label>
                  <Select
                    value={profileForm.businessStage || "idea"}
                    onChange={(e) => setProfileForm({ ...profileForm, businessStage: e.target.value })}
                  >
                    <option value="idea">Idea</option>
                    <option value="startup">Startup</option>
                    <option value="growth">Growth</option>
                    <option value="established">Established</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Funding needed</label>
                <BdtInput
                  value={profileForm.fundingNeeded || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, fundingNeeded: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y"
                  placeholder="Describe your business..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
