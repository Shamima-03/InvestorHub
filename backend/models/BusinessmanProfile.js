const mongoose = require("mongoose");

const businessmanProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      default: "",
    },
    businessStage: {
      type: String,
      enum: ["idea", "startup", "growth", "established"],
      default: "idea",
    },
    fundingNeeded: {
      type: Number,
      default: 0,
    },
    businessPlanDoc: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

businessmanProfileSchema.index({ industry: 1 });
businessmanProfileSchema.index({ businessStage: 1 });
businessmanProfileSchema.index({ fundingNeeded: 1 });

module.exports = mongoose.model("BusinessmanProfile", businessmanProfileSchema);
