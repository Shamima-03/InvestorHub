const express = require("express");
const { body } = require("express-validator");
const { protect, requireActive, validate } = require("./middleware");
const { Report, Post, User } = require("./models");

const router = express.Router();

router.post(
  "/",
  protect,
  requireActive,
  [
    body("targetType").isIn(["post", "user"]).withMessage("Invalid target type"),
    body("targetId").isMongoId().withMessage("A valid target ID is required"),
    body("reason").trim().notEmpty().withMessage("Reason is required").isLength({ max: 1000 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { targetType, targetId, reason } = req.body;

      if (targetType === "post") {
        const post = await Post.findById(targetId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.authorId.toString() === req.user._id.toString()) {
          return res.status(400).json({ message: "You cannot report your own post" });
        }
      } else {
        const target = await User.findById(targetId);
        if (!target) return res.status(404).json({ message: "User not found" });
        if (target._id.toString() === req.user._id.toString()) {
          return res.status(400).json({ message: "You cannot report yourself" });
        }
        if (target.role === "admin") {
          return res.status(400).json({ message: "Admin accounts cannot be reported" });
        }
      }

      const existing = await Report.findOne({
        reporterId: req.user._id,
        targetType,
        targetId,
        status: { $in: ["pending", "reviewed"] },
      });
      if (existing) {
        return res.status(400).json({ message: "You already reported this. An admin will review it soon." });
      }

      const report = await Report.create({
        reporterId: req.user._id,
        targetType,
        targetId,
        reason: reason.trim(),
      });
      res.status(201).json({ success: true, data: report, message: "Report submitted. An admin will review it." });
    } catch (error) {
      next(error);
    }
  }
);

// The reporter's own reports, with the current status so they can track the outcome
router.get("/my", protect, requireActive, async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 });

    const postIds = reports.filter((r) => r.targetType === "post").map((r) => r.targetId);
    const userIds = reports.filter((r) => r.targetType === "user").map((r) => r.targetId);
    const [posts, users] = await Promise.all([
      Post.find({ _id: { $in: postIds } }).select("title status"),
      // Only name/role — a reporter should not receive the target's email
      User.find({ _id: { $in: userIds } }).select("name role"),
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

module.exports = router;
