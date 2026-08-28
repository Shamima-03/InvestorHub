const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 100 },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: { type: String, enum: ["admin", "investor", "businessman"], required: [true, "Role is required"] },
    status: { type: String, enum: ["pending", "active", "suspended", "blocked"], default: "pending" },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const investorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    investmentRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    preferredIndustries: [{ type: String, trim: true }],
    investmentType: { type: String, enum: ["equity", "loan", "partnership"], default: "equity" },
    bio: { type: String, maxlength: 1000, default: "" },
    experience: { type: String, default: "" },
    pastInvestments: [{ type: String }],
    documents: [{ type: String }],
  },
  { timestamps: true }
);

investorProfileSchema.index({ preferredIndustries: 1 });
investorProfileSchema.index({ "investmentRange.min": 1, "investmentRange.max": 1 });

const businessmanProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    businessStage: { type: String, enum: ["idea", "startup", "growth", "established"], default: "idea" },
    fundingNeeded: { type: Number, default: 0 },
    businessPlanDoc: { type: String, default: "" },
    bio: { type: String, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

businessmanProfileSchema.index({ industry: 1 });
businessmanProfileSchema.index({ businessStage: 1 });
businessmanProfileSchema.index({ fundingNeeded: 1 });

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, enum: ["investor", "businessman"], required: true },
    type: { type: String, enum: ["investor_post", "business_post"], required: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 200 },
    description: { type: String, required: [true, "Description is required"], maxlength: 5000 },
    category: [{ type: String, trim: true }],
    budget: { type: Number, default: 0 },
    image: { type: String, default: "" },
    attachments: [{ type: String }],
    status: { type: String, enum: ["pending", "active", "rejected", "closed", "under_review"], default: "pending" },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ authorRole: 1 });
postSchema.index({ type: 1 });
postSchema.index({ title: "text", description: "text" });

const matchSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessmanId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    status: { type: String, enum: ["pending", "accepted", "rejected", "finalized"], default: "pending" },
  },
  { timestamps: true }
);

matchSchema.index({ investorId: 1, businessmanId: 1 }, { unique: true });

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 5000 },
    attachments: [{ type: String }],
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["post", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: [true, "Reason is required"], maxlength: 1000 },
    status: { type: String, enum: ["pending", "reviewed", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  InvestorProfile: mongoose.model("InvestorProfile", investorProfileSchema),
  BusinessmanProfile: mongoose.model("BusinessmanProfile", businessmanProfileSchema),
  Post: mongoose.model("Post", postSchema),
  Match: mongoose.model("Match", matchSchema),
  Conversation: mongoose.model("Conversation", conversationSchema),
  Message: mongoose.model("Message", messageSchema),
  Report: mongoose.model("Report", reportSchema),
};
