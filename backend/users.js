const express = require("express");
const { protect, requireActive } = require("./authMiddleware");
const { User, InvestorProfile, BusinessmanProfile } = require("./models");

const router = express.Router();

router.get("/search", protect, requireActive, async (req, res, next) => {
  try {
    const { role, location, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (location) query.location = { $regex: location, $options: "i" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(query).limit(20);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.redirect("/api/auth/me");
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = null;
    if (user.role === "investor") profile = await InvestorProfile.findOne({ userId: user._id });
    else if (user.role === "businessman") profile = await BusinessmanProfile.findOne({ userId: user._id });

    res.json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
});

router.put("/me", protect, requireActive, async (req, res, next) => {
  try {
    const { name, phone, location, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// No requireActive: pending users submit their NID during onboarding,
// before an admin activates the account.
router.put("/me/nid", protect, async (req, res, next) => {
  try {
    const { nidImage } = req.body;
    if (!nidImage || !/^https?:\/\//.test(nidImage)) {
      return res.status(400).json({ message: "A valid NID image URL is required" });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { nidImage }, { new: true });
    res.json({ success: true, data: user, message: "NID submitted for verification" });
  } catch (error) {
    next(error);
  }
});

router.put("/me/investor-profile", protect, requireActive, async (req, res, next) => {
  try {
    const profile = await InvestorProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

router.put("/me/businessman-profile", protect, requireActive, async (req, res, next) => {
  try {
    const profile = await BusinessmanProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
