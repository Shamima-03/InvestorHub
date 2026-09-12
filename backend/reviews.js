const express = require("express");
const { body } = require("express-validator");
const { protect, validate } = require("./authMiddleware");
const { Review } = require("./models");

const router = express.Router();

// Platform reviews are for signed-in accounts only — reading and writing both
// need a token, so a logged-out visitor gets 401 and never sees the page data.
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const [reviews, grouped, mine] = await Promise.all([
      Review.find().populate("userId", "name avatar role").sort({ createdAt: -1 }).limit(100),
      // Summary comes from an aggregate, so it stays correct beyond the page limit.
      Review.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
      Review.findOne({ userId: req.user._id }),
    ]);

    const counts = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
    const total = grouped.reduce((sum, g) => sum + g.count, 0);
    const rated = grouped.reduce((sum, g) => sum + g._id * g.count, 0);

    res.json({
      success: true,
      data: reviews,
      summary: {
        total,
        average: total ? Math.round((rated / total) * 10) / 10 : 0,
        breakdown: [5, 4, 3, 2, 1].map((star) => ({ star, count: counts[star] || 0 })),
      },
      mine,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Pick a rating between 1 and 5 stars"),
    body("comment").trim().isLength({ min: 10, max: 1000 })
      .withMessage("Your review must be between 10 and 1000 characters"),
  ],
  validate,
  async (req, res, next) => {
    // The platform review is member feedback about the service. An administrator
    // runs the platform, so letting them rate it would be self-promotion.
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Administrators cannot review the platform. Reviews come from investors and businesses only.",
      });
    }

    try {
      const { rating, comment } = req.body;
      // Upsert on the unique userId: the second submit updates instead of duplicating.
      const review = await Review.findOneAndUpdate(
        { userId: req.user._id },
        { rating: Number(rating), comment: comment.trim() },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
      ).populate("userId", "name avatar role");

      res.status(201).json({ success: true, data: review, message: "Thanks for reviewing InvestorHub." });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
