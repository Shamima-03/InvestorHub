const express = require("express");
const { body } = require("express-validator");
const { validate } = require("./middleware");
const { ContactMessage } = require("./models");

const router = express.Router();

// Public: the contact form on the site — no login required
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
    body("email").isEmail().withMessage("A valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 200 }),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 3000 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;
      await ContactMessage.create({ name, email, subject, message });
      res.status(201).json({ success: true, message: "Message sent. We will get back to you soon." });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
