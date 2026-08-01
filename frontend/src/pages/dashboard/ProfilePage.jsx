import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [userForm, setUserForm] = useState({ name: "", phone: "", location: "" });
  const [profileForm, setProfileForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get("/auth/me").then((res) => {
      const u = res.data.data;
      setUserForm({ name: u.name || "", phone: u.phone || "", location: u.location || "" });
      if (u.profile) setProfileForm(u.profile);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveUser = async () => {
    await API.put("/users/me", userForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveProfile = async () => {
    const endpoint = user?.role === "investor" ? "/users/me/investor-profile" : "/users/me/businessman-profile";
    await API.put(endpoint, profileForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>
      {saved && <div className="bg-green-50 text-green-500 px-4 py-2 rounded-lg text-sm">Profile saved!</div>}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Info</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={userForm.location} onChange={(e) => setUserForm({ ...userForm, location: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
          </div>
        </div>
        <button onClick={saveUser} className="bg-green-400 text-white px-6 py-2 rounded-lg hover:bg-green-500">Save Basic Info</button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold capitalize">{user?.role} Profile</h2>

        {user?.role === "investor" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Investment ($)</label>
                <input type="number" value={profileForm.investmentRange?.min || ""} onChange={(e) => setProfileForm({ ...profileForm, investmentRange: { ...profileForm.investmentRange, min: Number(e.target.value) } })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Investment ($)</label>
                <input type="number" value={profileForm.investmentRange?.max || ""} onChange={(e) => setProfileForm({ ...profileForm, investmentRange: { ...profileForm.investmentRange, max: Number(e.target.value) } })} className="w-full border rounded-lg px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Investment Type</label>
              <select value={profileForm.investmentType || "equity"} onChange={(e) => setProfileForm({ ...profileForm, investmentType: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                <option value="equity">Equity</option>
                <option value="loan">Loan</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Industries (comma-separated)</label>
              <input value={profileForm.preferredIndustries?.join(", ") || ""} onChange={(e) => setProfileForm({ ...profileForm, preferredIndustries: e.target.value.split(",").map((s) => s.trim()) })} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Technology, Healthcare" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea rows={3} value={profileForm.bio || ""} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input value={profileForm.experience || ""} onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. 10 years in tech investing" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input value={profileForm.companyName || ""} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input value={profileForm.industry || ""} onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. FinTech" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Stage</label>
                <select value={profileForm.businessStage || "idea"} onChange={(e) => setProfileForm({ ...profileForm, businessStage: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option value="idea">Idea</option>
                  <option value="startup">Startup</option>
                  <option value="growth">Growth</option>
                  <option value="established">Established</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Funding Needed ($)</label>
                <input type="number" value={profileForm.fundingNeeded || ""} onChange={(e) => setProfileForm({ ...profileForm, fundingNeeded: Number(e.target.value) })} className="w-full border rounded-lg px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea rows={3} value={profileForm.bio || ""} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
            </div>
          </>
        )}

        <button onClick={saveProfile} className="bg-green-400 text-white px-6 py-2 rounded-lg hover:bg-green-500">Save Profile</button>
      </div>
    </div>
  );
}
