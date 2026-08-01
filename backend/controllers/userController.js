const User = require("../models/User");
const InvestorProfile = require("../models/InvestorProfile");
const BusinessmanProfile = require("../models/BusinessmanProfile");

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    if (user.role === "investor") {
      profile = await InvestorProfile.findOne({ userId: user._id });
    } else if (user.role === "businessman") {
      profile = await BusinessmanProfile.findOne({ userId: user._id });
    }

    res.json({ success: true, data: { ...user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
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
};

exports.updateInvestorProfile = async (req, res, next) => {
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
};

exports.updateBusinessmanProfile = async (req, res, next) => {
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
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { role, industry, location, search } = req.query;
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
};
