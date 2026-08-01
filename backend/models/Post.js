const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorRole: {
      type: String,
      enum: ["investor", "businessman"],
      required: true,
    },
    type: {
      type: String,
      enum: ["investor_post", "business_post"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 5000,
    },
    category: [
      {
        type: String,
        trim: true,
      },
    ],
    budget: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "closed", "under_review"],
      default: "active",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ category: 1 });
postSchema.index({ authorRole: 1 });
postSchema.index({ type: 1 });
postSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Post", postSchema);
