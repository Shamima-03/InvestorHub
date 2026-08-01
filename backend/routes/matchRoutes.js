const express = require("express");
const {
  requestMatch,
  acceptMatch,
  rejectMatch,
  getMyMatches,
} = require("../controllers/matchController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/my", protect, getMyMatches);
router.post("/request", protect, requestMatch);
router.put("/:id/accept", protect, acceptMatch);
router.put("/:id/reject", protect, rejectMatch);

module.exports = router;
