const express = require("express");
const { protect, checkRole } = require("./authMiddleware");
const { User, Post, Match, Report, Investment, FeePayment, ContactMessage } = require("./models");

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

    const existing = await Post.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Post not found" });
    // A fully funded post must not be re-opened for new investments.
    if (existing.status === "completed") {
      return res.status(400).json({ message: "This post is fully funded and can no longer be moderated" });
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

    // Attach the reported post/user so the admin can see and open the target
    const postIds = reports.filter((r) => r.targetType === "post").map((r) => r.targetId);
    const userIds = reports.filter((r) => r.targetType === "user").map((r) => r.targetId);
    const [posts, users] = await Promise.all([
      Post.find({ _id: { $in: postIds } }).select("title status type"),
      User.find({ _id: { $in: userIds } }).select("name email role status"),
    ]);
    const postMap = new Map(posts.map((p) => [p._id.toString(), p]));
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const data = reports.map((r) => ({
      ...r.toObject(),
      target:
        r.targetType === "post"
          ? postMap.get(r.targetId.toString()) || null
          : userMap.get(r.targetId.toString()) || null,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put("/reports/:id", async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // The note is shown to the reporter on a final decision; a reopened
    // report clears the stale note.
    const isFinal = status === "resolved" || status === "dismissed";
    const update = { status, adminNote: isFinal ? (note || "").trim().slice(0, 1000) : "" };
    const report = await Report.findByIdAndUpdate(req.params.id, update, { new: true });
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

router.get("/contacts", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      query.$or = [{ name: rx }, { email: rx }, { subject: rx }];
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await ContactMessage.countDocuments(query);
    const newCount = await ContactMessage.countDocuments({ status: "new" });

    res.json({
      success: true,
      data: messages,
      newCount,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/contacts/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["new", "read"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

router.delete("/contacts/:id", async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    await message.deleteOne();
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/entry-fees", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.tranId = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const fees = await FeePayment.find(query)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await FeePayment.countDocuments(query);

    res.json({
      success: true,
      data: fees,
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
      pendingPosts, activePosts, rejectedPosts, completedPosts,
      totalMatches, pendingMatches, acceptedMatches, rejectedMatches,
      totalReports, pendingReports, resolvedReports, dismissedReports,
      totalInvestments, completedInvestments, pendingInvestments, failedInvestments, cancelledInvestments, investmentSum,
      entryFeeAgg,
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
      Post.countDocuments({ status: "completed" }),
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
      Investment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, sum: { $sum: "$amount" }, fees: { $sum: "$platformFee" } } },
      ]),
      FeePayment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, investor: totalInvestors, businessman: totalBusinessmen, admin: totalAdmins, pending: pendingUsers, active: activeUsers, suspended: suspendedUsers, blocked: blockedUsers },
        posts: { total: totalPosts, investor: investorPosts, business: businessPosts, pending: pendingPosts, active: activePosts, rejected: rejectedPosts, completed: completedPosts },
        matches: { total: totalMatches, pending: pendingMatches, accepted: acceptedMatches, rejected: rejectedMatches },
        reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports, dismissed: dismissedReports },
        payments: { total: totalInvestments, completed: completedInvestments, pending: pendingInvestments, failed: failedInvestments, cancelled: cancelledInvestments, totalAmount: investmentSum[0]?.sum || 0, feeRevenue: investmentSum[0]?.fees || 0, entryFeeCount: entryFeeAgg[0]?.count || 0, entryFeeAmount: entryFeeAgg[0]?.amount || 0 },
        totalUsers, totalInvestors, totalBusinessmen, totalPosts, totalMatches, acceptedMatches, pendingReports, pendingPosts,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
