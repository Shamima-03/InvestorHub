const express = require("express");
const { protect, checkRole } = require("./middleware");
const { User, Post, Match, Report, Investment } = require("./models");

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
    const { status, reason } = req.body;
    if (!["pending", "active", "suspended", "blocked", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (status === "rejected" && !reason?.trim()) {
      return res.status(400).json({ message: "A rejection note is required" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot be moderated" });
    }

    // The note is shown to the user; clear it when the account leaves the rejected state.
    target.status = status;
    target.rejectionReason = status === "rejected" ? reason.trim().slice(0, 1000) : "";
    await target.save();
    res.json({ success: true, data: target });
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
    const { status, reason } = req.body;
    if (!["pending", "active", "rejected", "closed", "under_review", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (status === "rejected" && !reason?.trim()) {
      return res.status(400).json({ message: "A rejection reason is required" });
    }
    // The reason is shown to the author; clear it when the post leaves the rejected state.
    const update = { status, rejectionReason: status === "rejected" ? reason.trim().slice(0, 1000) : "" };
    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true })
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

router.get("/investments", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.tranId = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const investments = await Investment.find(query)
      .populate("investorId", "name email avatar")
      .populate("businessmanId", "name email avatar")
      .populate("postId", "title")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Investment.countDocuments(query);

    res.json({
      success: true,
      data: investments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
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
      totalInvestments, completedInvestments, pendingInvestments, failedInvestments, cancelledInvestments, investmentSum,
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
      Investment.countDocuments(),
      Investment.countDocuments({ status: "completed" }),
      Investment.countDocuments({ status: "pending" }),
      Investment.countDocuments({ status: "failed" }),
      Investment.countDocuments({ status: "cancelled" }),
      Investment.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, investor: totalInvestors, businessman: totalBusinessmen, admin: totalAdmins, pending: pendingUsers, active: activeUsers, suspended: suspendedUsers, blocked: blockedUsers },
        posts: { total: totalPosts, investor: investorPosts, business: businessPosts, pending: pendingPosts, active: activePosts, rejected: rejectedPosts },
        matches: { total: totalMatches, pending: pendingMatches, accepted: acceptedMatches, rejected: rejectedMatches },
        reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports, dismissed: dismissedReports },
        payments: { total: totalInvestments, completed: completedInvestments, pending: pendingInvestments, failed: failedInvestments, cancelled: cancelledInvestments, totalAmount: investmentSum[0]?.sum || 0 },
        totalUsers, totalInvestors, totalBusinessmen, totalPosts, totalMatches, acceptedMatches, pendingReports, pendingPosts,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
