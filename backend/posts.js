const express = require("express");
const { body } = require("express-validator");
const { protect, optionalAuth, validate, requireActive } = require("./authMiddleware");
const { Post, InvestorProfile, BusinessmanProfile, Investment } = require("./models");

const router = express.Router();

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, type, category, search,
      sortBy = "newest", minBudget, maxBudget, my,
    } = req.query;

    const query = my === "true" && req.user ? { authorId: req.user._id } : { status: "active" };
    if (type) query.type = type;
    if (category) query.category = { $in: category.split(",") };
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (search) {
      // Word-by-word matching: every word must appear somewhere in the title,
      // description, or category — and words like "investor"/"business" also
      // match the post type, so type searches return proper results.
      const words = search.trim().split(/\s+/).slice(0, 6);
      query.$and = words.map((word) => {
        const rx = { $regex: word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        const or = [{ title: rx }, { description: rx }, { category: rx }];
        const t = word.toLowerCase();
        if (t.length >= 3) {
          if ("investor".startsWith(t) || t === "investor_post") or.push({ type: "investor_post" });
          if ("business".startsWith(t) || "businessman".startsWith(t) || t === "business_post") {
            or.push({ type: "business_post" });
          }
        }
        return { $or: or };
      });
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      budget_high: { budget: -1 },
      budget_low: { budget: 1 },
      popular: { viewsCount: -1 },
    };
    const sort = sortMap[sortBy] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await Post.find(query)
      .populate("authorId", "name avatar role")
      .sort(sort)
      .skip(skip)
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

router.post(
  "/",
  protect,
  requireActive,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { title, description, category, budget, image } = req.body;
      const authorRole = req.user.role;
      const postType = authorRole === "investor" ? "investor_post" : "business_post";

      const post = await Post.create({
        authorId: req.user._id,
        authorRole,
        type: postType,
        title,
        description,
        category: category ? (typeof category === "string" ? category.split(",").map((c) => c.trim()) : category) : [],
        budget: budget || 0,
        image: image || (req.file ? `/uploads/${req.file.filename}` : ""),
        attachments: req.body.attachments || [],
        status: "pending",
      });

      res.status(201).json({
        success: true,
        data: post,
        message: "Post submitted. It will be visible once an admin approves it.",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("authorId", "name avatar role location");
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Fully funded (completed) posts stay reachable by direct link — for investment
    // history and invoices — but are excluded from public listings above.
    if (!["active", "completed"].includes(post.status)) {
      const postAuthorId = (post.authorId?._id || post.authorId).toString();
      const isOwner = req.user && postAuthorId === req.user._id.toString();
      const isAdmin = req.user?.role === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: "Post not found" });
      }
    }

    post.viewsCount += 1;
    await post.save();

    const authorId = post.authorId?._id || post.authorId;
    let authorProfile = null;
    if (post.authorRole === "investor") {
      const p = await InvestorProfile.findOne({ userId: authorId }).lean();
      if (p) {
        authorProfile = {
          bio: p.bio,
          experience: p.experience,
          investmentType: p.investmentType,
          preferredIndustries: p.preferredIndustries,
          investmentRange: p.investmentRange,
        };
      }
    } else if (post.authorRole === "businessman") {
      const p = await BusinessmanProfile.findOne({ userId: authorId }).lean();
      if (p) {
        authorProfile = {
          bio: p.bio,
          companyName: p.companyName,
          industry: p.industry,
          businessStage: p.businessStage,
          fundingNeeded: p.fundingNeeded,
        };
      }
    }

    let raisedAmount = 0;
    if (post.type === "business_post") {
      const agg = await Investment.aggregate([
        { $match: { postId: post._id, status: "completed" } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]);
      raisedAmount = agg[0]?.sum || 0;
    }

    res.json({ success: true, data: { ...post.toObject(), authorProfile, raisedAmount } });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", protect, requireActive, async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const allowed = ["title", "description", "category", "budget", "image", "attachments"];
    const updateData = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    if (updateData.category && typeof updateData.category === "string") {
      updateData.category = updateData.category.split(",").map((c) => c.trim());
    }
    // Edited posts must be re-approved by an admin before going public again
    updateData.status = "pending";
    updateData.rejectionReason = "";

    post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({
      success: true,
      data: post,
      message: "Post updated. It will be visible once an admin approves it.",
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, requireActive, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
