const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.join(socket.userId);

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, text, attachments } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          return;
        }

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
          io.to(participantId.toString()).emit("message_notification", {
            conversationId,
            message: populated,
          });
        });
      } catch (error) {
        console.error("Socket send_message error:", error.message);
      }
    });

    socket.on("typing", (conversationId) => {
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on("stop_typing", (conversationId) => {
      socket.to(conversationId).emit("user_stop_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on("mark_seen", async (conversationId) => {
      try {
        await Message.updateMany(
          { conversationId, seen: false, senderId: { $ne: socket.userId } },
          { seen: true }
        );
        io.to(conversationId).emit("messages_seen", {
          conversationId,
          seenBy: socket.userId,
        });
      } catch (error) {
        console.error("Socket mark_seen error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = socketHandler;
