const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Match = require("../models/Match");

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar role")
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

exports.createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    const match = await Match.findOne({
      $or: [
        { investorId: req.user._id, businessmanId: participantId, status: "accepted" },
        { investorId: participantId, businessmanId: req.user._id, status: "accepted" },
      ],
    });

    if (!match) {
      return res.status(403).json({
        message: "Chat is only available after a match is accepted",
      });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    });

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { text, attachments } = req.body;

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user._id,
      text,
      attachments: attachments || [],
    });

    conversation.lastMessage = text;
    await conversation.save();

    const populated = await message.populate("senderId", "name avatar");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.markAsSeen = async (req, res, next) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, seen: false },
      { seen: true }
    );
    res.json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    next(error);
  }
};
