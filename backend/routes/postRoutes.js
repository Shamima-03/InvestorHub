const express = require("express");
const { body } = require("express-validator");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router
  .route("/")
  .get(optionalAuth, getPosts)
  .post(
    protect,
    [
      body("title").notEmpty().withMessage("Title is required"),
      body("description").notEmpty().withMessage("Description is required"),
    ],
    validate,
    createPost
  );

router.route("/:id").get(getPost);

router
  .route("/:id")
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
