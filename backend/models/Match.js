const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessmanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "finalized"],
      default: "pending",
    },
  },
  { timestamps: true }
);

matchSchema.index({ investorId: 1, businessmanId: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
