const express = require("express");
const { body } = require("express-validator");
const { protect, validate } = require("./middleware");
const { User, InvestorProfile, BusinessmanProfile } = require("./models");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["investor", "businessman"]).withMessage("Role must be investor or businessman"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await User.create({ name, email, password, role, status: "pending" });
      if (role === "investor") await InvestorProfile.create({ userId: user._id });
      else if (role === "businessman") await BusinessmanProfile.create({ userId: user._id });

      const token = user.generateToken();
      res.status(201).json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, token },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (user.status === "suspended" || user.status === "blocked") {
        return res.status(403).json({ message: "Account is suspended or blocked" });
      }

      const token = user.generateToken();
      res.json({
        success: true,
        data: {
          _id: user._id, name: user.name, email: user.email, role: user.role,
          status: user.status, avatar: user.avatar, token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", protect, async (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === "investor") {
      profile = await InvestorProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === "businessman") {
      profile = await BusinessmanProfile.findOne({ userId: req.user._id });
    }
    res.json({ success: true, data: { ...req.user.toObject(), profile } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
