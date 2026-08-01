const express = require("express");
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsSeen,
} = require("../controllers/conversationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getConversations);
router.post("/", protect, createConversation);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);
router.put("/:id/seen", protect, markAsSeen);

module.exports = router;
