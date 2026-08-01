const User = require("../models/User");
const Post = require("../models/Post");
const Match = require("../models/Match");
const Report = require("../models/Report");

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 0"User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvestors = await User.countDocuments({ role: "investor" });
    const totalBusinessmen = await User.countDocuments({ role: "businessman" });
    const totalPosts = await Post.countDocuments();
    const totalMatches = await Match.countDocuments();
    const acceptedMatches = await Match.countDocuments({ status: "accepted" });
    const pendingReports = await Report.countDocuments({ status: "pending" });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalInvestors,
        totalBusinessmen,
        totalPosts,
        totalMatches,
        acceptedMatches,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
};
