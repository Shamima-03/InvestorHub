const express = require("express");
const { protect, checkRole } = require("./middleware");
const { User, Post, Match, Report } = require("./models");

const router = express.Router();

router.use(protect);
router.use(checkRole(["admin"]));

router.get("/users", async (req, res, next) => {
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
});

router.put("/users/:id/status", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/posts", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      query.$or = [{ title: rx }, { description: rx }];
    }

    const posts = await Post.find(query)
      .populate("authorId", "name email avatar role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/posts/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "rejected", "closed", "under_review"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("authorId", "name email avatar role");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

router.delete("/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/reports", async (req, res, next) => {
  try {
    const reports = await Report.find().populate("reporterId", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
});

router.put("/reports/:id", async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics", async (req, res, next) => {
  try {
    const [
      totalUsers, totalInvestors, totalBusinessmen, totalAdmins,
      pendingUsers, activeUsers, suspendedUsers, blockedUsers,
      totalPosts, investorPosts, businessPosts,
      pendingPosts, activePosts, rejectedPosts,
      totalMatches, pendingMatches, acceptedMatches, rejectedMatches,
      totalReports, pendingReports, resolvedReports, dismissedReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "investor" }),
      User.countDocuments({ role: "businessman" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "pending" }),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "suspended" }),
      User.countDocuments({ status: "blocked" }),
      Post.countDocuments(),
      Post.countDocuments({ type: "investor_post" }),
      Post.countDocuments({ type: "business_post" }),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "active" }),
      Post.countDocuments({ status: "rejected" }),
      Match.countDocuments(),
      Match.countDocuments({ status: "pending" }),
      Match.countDocuments({ status: "accepted" }),
      Match.countDocuments({ status: "rejected" }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "dismissed" }),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, investor: totalInvestors, businessman: totalBusinessmen, admin: totalAdmins, pending: pendingUsers, active: activeUsers, suspended: suspendedUsers, blocked: blockedUsers },
        posts: { total: totalPosts, investor: investorPosts, business: businessPosts, pending: pendingPosts, active: activePosts, rejected: rejectedPosts },
        matches: { total: totalMatches, pending: pendingMatches, accepted: acceptedMatches, rejected: rejectedMatches },
        reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports, dismissed: dismissedReports },
        totalUsers, totalInvestors, totalBusinessmen, totalPosts, totalMatches, acceptedMatches, pendingReports, pendingPosts,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
