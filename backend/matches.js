const express = require("express");
const { protect, requireActive } = require("./authMiddleware");
const { Match, User } = require("./models");

const router = express.Router();
router.use(protect, requireActive);

router.get("/my", async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ investorId: req.user._id }, { businessmanId: req.user._id }],
    })
      .populate("investorId", "name avatar role")
      .populate("businessmanId", "name avatar role")
      .populate("postId", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
});

router.post("/request", async (req, res, next) => {
  try {
    const { businessmanId, investorId, postId } = req.body;
    let targetId, targetRole;

    if (req.user.role === "investor") {
      targetId = businessmanId;
      targetRole = "businessman";
    } else if (req.user.role === "businessman") {
      targetId = investorId;
      targetRole = "investor";
    } else {
      return res.status(403).json({ message: "Only investors and businessmen can send match requests" });
    }

    if (!targetId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    const target = await User.findById(targetId);
    if (!target || target.role !== targetRole) {
      return res.status(400).json({
        message: `Target user must be ${targetRole === "businessman" ? "a business" : "an investor"} account`,
      });
    }

    const invId = req.user.role === "investor" ? req.user._id : target._id;
    const bizId = req.user.role === "investor" ? target._id : req.user._id;

    const existingMatch = await Match.findOne({ investorId: invId, businessmanId: bizId });
    if (existingMatch) {
      // A rejected match can be re-requested; anything else is already in progress.
      if (existingMatch.status === "rejected") {
        existingMatch.status = "pending";
        existingMatch.requestedBy = req.user._id;
        existingMatch.postId = postId || existingMatch.postId;
        await existingMatch.save();
        return res.status(201).json({ success: true, data: existingMatch });
      }
      const message =
        existingMatch.status === "pending"
          ? "A match request between you two is already pending"
          : "You are already matched with this user";
      return res.status(400).json({ message });
    }

    const match = await Match.create({
      investorId: invId,
      businessmanId: bizId,
      postId: postId || null,
      requestedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/accept", async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isInvestor = match.investorId.toString() === req.user._id.toString();
    const isBusinessman = match.businessmanId.toString() === req.user._id.toString();
    if (!isInvestor && !isBusinessman) return res.status(403).json({ message: "Not authorized" });
    if (match.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be accepted" });
    }
    if (match.requestedBy && match.requestedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot accept your own match request" });
    }

    match.status = "accepted";
    await match.save();
    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/reject", async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isInvestor = match.investorId.toString() === req.user._id.toString();
    const isBusinessman = match.businessmanId.toString() === req.user._id.toString();
    if (!isInvestor && !isBusinessman) return res.status(403).json({ message: "Not authorized" });
    // The sender may also reject (withdraw) their own pending request.
    if (match.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected" });
    }

    match.status = "rejected";
    await match.save();
    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
});

// Withdraw: the sender deletes their own pending request entirely,
// so a fresh request can be sent later.
router.delete("/:id", async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isParty = [match.investorId.toString(), match.businessmanId.toString()].includes(req.user._id.toString());
    if (!isParty) return res.status(403).json({ message: "Not authorized" });
    if (match.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be withdrawn" });
    }
    if (match.requestedBy && match.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the sender can withdraw a match request" });
    }

    await match.deleteOne();
    res.json({ success: true, message: "Match request withdrawn" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
