const express = require("express");
const {
  getUser,
  updateUser,
  updateInvestorProfile,
  updateBusinessmanProfile,
  searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/me", protect, (req, res) => {
  res.redirect("/api/auth/me");
});
router.get("/:id", protect, getUser);
router.put("/me", protect, updateUser);
router.put("/me/investor-profile", protect, updateInvestorProfile);
router.put("/me/businessman-profile", protect, updateBusinessmanProfile);

module.exports = router;
