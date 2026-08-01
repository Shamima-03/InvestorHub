const Match = require("../models/Match");

exports.requestMatch = async (req, res, next) => {
  try {
    const { businessmanId, investorId, postId } = req.body;

    let senderInvestor, receiverBusinessman;
    if (req.user.role === "investor") {
      senderInvestor = req.user._id;
      receiverBusinessman = businessmanId;
    } else if (req.user.role === "businessman") {
      senderInvestor = investorId;
      receiverBusinessman = req.user._id;
    } else {
      return res.status(403).json({ message: "Only investors and businessmen can send match requests" });
    }

    if (!senderInvestor || !receiverBusinessman) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    const existingMatch = await Match.findOne({
      investorId: senderInvestor,
      businessmanId: receiverBusinessman,
    });

    if (existingMatch) {
      return res.status(400).json({ message: "Match request already exists" });
    }

    const match = await Match.create({
      investorId: senderInvestor,
      businessmanId: receiverBusinessman,
      postId: postId || null,
    });

    res.status(201).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.acceptMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isInvestor = match.investorId.toString() === req.user._id.toString();
    const isBusinessman = match.businessmanId.toString() === req.user._id.toString();

    if (!isInvestor && !isBusinessman) {
      return res.status(403).json({ message: "Not authorized" });
    }

    match.status = "accepted";
    await match.save();

    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.rejectMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isInvestor = match.investorId.toString() === req.user._id.toString();
    const isBusinessman = match.businessmanId.toString() === req.user._id.toString();

    if (!isInvestor && !isBusinessman) {
      return res.status(403).json({ message: "Not authorized" });
    }

    match.status = "rejected";
    await match.save();

    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

exports.getMyMatches = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { investorId: req.user._id },
        { businessmanId: req.user._id },
      ],
    };

    const matches = await Match.find(query)
      .populate("investorId", "name avatar role")
      .populate("businessmanId", "name avatar role")
      .populate("postId", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};
