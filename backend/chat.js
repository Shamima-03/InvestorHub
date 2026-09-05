const express = require("express");
const jwt = require("jsonwebtoken");
const { protect, requireActive } = require("./authMiddleware");
const { Conversation, Message, User } = require("./models");

const router = express.Router();
router.use(protect, requireActive);

router.get("/", async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name avatar role")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: "Participant is required" });
    }
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const other = await User.findById(participantId);
    if (!other) return res.status(404).json({ message: "User not found" });

    const roles = [req.user.role, other.role];
    if (!(roles.includes("investor") && roles.includes("businessman"))) {
      return res.status(403).json({ message: "Messages are only between investors and businesses" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    });
    if (existing) return res.json({ success: true, data: existing });

    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
    });
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/messages", async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
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
});

router.post("/:id/messages", async (req, res, next) => {
  try {
    const { text, attachments } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
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
});

router.put("/:id/seen", async (req, res, next) => {
  try {
    await Message.updateMany({ conversationId: req.params.id, seen: false }, { seen: true });
    res.json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    next(error);
  }
});

function socketHandler(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error"));
      if (user.role !== "admin" && user.status !== "active") {
        return next(new Error("Account pending approval"));
      }
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);

    socket.on("join_conversation", (conversationId) => socket.join(conversationId));
    socket.on("leave_conversation", (conversationId) => socket.leave(conversationId));

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, text, attachments } = data;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) return;

        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text,
          attachments: attachments || [],
        });
        conversation.lastMessage = text;
        await conversation.save();

        const populated = await message.populate("senderId", "name avatar");
        io.to(conversationId).emit("new_message", populated);
        conversation.participants.forEach((participantId) => {
          io.to(participantId.toString()).emit("message_notification", { conversationId, message: populated });
        });
      } catch (error) {
        console.error("Socket send_message error:", error.message);
      }
    });

    socket.on("typing", (conversationId) => {
      socket.to(conversationId).emit("user_typing", { userId: socket.userId, conversationId });
    });
    socket.on("stop_typing", (conversationId) => {
      socket.to(conversationId).emit("user_stop_typing", { userId: socket.userId, conversationId });
    });

    socket.on("mark_seen", async (conversationId) => {
      try {
        await Message.updateMany(
          { conversationId, seen: false, senderId: { $ne: socket.userId } },
          { seen: true }
        );
        io.to(conversationId).emit("messages_seen", { conversationId, seenBy: socket.userId });
      } catch (error) {
        console.error("Socket mark_seen error:", error.message);
      }
    });
  });
}

module.exports = router;
module.exports.socketHandler = socketHandler;
