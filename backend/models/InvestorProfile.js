const mongoose = require("mongoose");

const investorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    investmentRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    preferredIndustries: [
      {
        type: String,
        trim: true,
      },
    ],
    investmentType: {
      type: String,
      enum: ["equity", "loan", "partnership"],
      default: "equity",
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    pastInvestments: [
      {
        type: String,
      },
    ],
    documents: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

investorProfileSchema.index({ preferredIndustries: 1 });
investorProfileSchema.index({ "investmentRange.min": 1, "investmentRange.max": 1 });
investorProfileSchema.index({ location: 1 });

module.exports = mongoose.model("InvestorProfile", investorProfileSchema);
