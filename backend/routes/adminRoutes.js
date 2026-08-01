const express = require("express");
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getReports,
  resolveReport,
  getAnalytics,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/roleCheck");

const router = express.Router();

router.use(protect);
router.use(checkRole(["admin"]));

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/reports", getReports);
router.put("/reports/:id", resolveReport);
router.get("/analytics", getAnalytics);

module.exports = router;
