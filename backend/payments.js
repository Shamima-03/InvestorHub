const express = require("express");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const { body } = require("express-validator");
const { protect, requireActive, validate, checkRole } = require("./middleware");
const { Investment, Post, Match } = require("./models");

const router = express.Router();

const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";
const SSLCZ_BASE = IS_LIVE ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "testbox";
const STORE_PASSWD = process.env.SSLCOMMERZ_STORE_PASSWD || "qwerty";
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
// Platform commission: deducted from what the business receives, not added on
// top of the investor's payment.
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 10);

// SSLCommerz redirects the customer's browser back with a POST, so callbacks
// answer with a 303 redirect to the frontend result page (/payment/success|fail|cancel).
const resultRedirect = (res, outcome, tranId = "") =>
  res.redirect(303, `${CLIENT_URL}/payment/${outcome}${tranId ? `?tran=${encodeURIComponent(tranId)}` : ""}`);

const isParty = (investment, user) =>
  user.role === "admin" ||
  [
    String(investment.investorId?._id || investment.investorId),
    String(investment.businessmanId?._id || investment.businessmanId),
  ].includes(user._id.toString());

async function createSession(params) {
  const response = await fetch(`${SSLCZ_BASE}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  return response.json();
}

async function validateWithGateway(valId) {
  const qs = new URLSearchParams({ val_id: valId, store_id: STORE_ID, store_passwd: STORE_PASSWD, format: "json" });
  const response = await fetch(`${SSLCZ_BASE}/validator/api/validationserverAPI.php?${qs}`);
  return response.json();
}

// Never trust the callback payload alone — confirm with the validation API.
// Idempotent because both the success redirect and the IPN can fire for one payment.
async function settlePayment(tranId, valId) {
  const investment = await Investment.findOne({ tranId });
  if (!investment) return { ok: false };
  if (investment.status === "completed") return { ok: true };
  if (!valId) return { ok: false };

  const v = await validateWithGateway(valId);
  const isValid =
    v &&
    ["VALID", "VALIDATED"].includes(v.status) &&
    v.tran_id === tranId &&
    Math.abs(Number(v.amount) - investment.amount) < 1;

  if (!isValid) {
    investment.status = "failed";
    await investment.save();
    return { ok: false };
  }

  investment.status = "completed";
  investment.valId = valId;
  investment.paymentMethod = v.card_type || v.card_issuer || "";
  investment.bankTranId = v.bank_tran_id || "";
  investment.paidAt = new Date();
  await investment.save();

  await Match.findOneAndUpdate(
    { investorId: investment.investorId, businessmanId: investment.businessmanId, status: "accepted" },
    { status: "finalized" }
  );

  // Once the post's funding goal is reached, mark it completed so it stops
  // appearing in public listings and no longer accepts new investments.
  const post = await Post.findById(investment.postId);
  if (post && post.budget > 0 && post.status === "active") {
    const agg = await Investment.aggregate([
      { $match: { postId: post._id, status: "completed" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } },
    ]);
    if ((agg[0]?.sum || 0) >= post.budget) {
      post.status = "completed";
      await post.save();
    }
  }

  return { ok: true };
}

router.post(
  "/init",
  protect,
  requireActive,
  checkRole(["investor"]),
  [
    body("postId").isMongoId().withMessage("A valid postId is required"),
    body("amount").isFloat({ min: 10 }).withMessage("Amount must be at least 10 BDT"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { postId, amount } = req.body;
      const post = await Post.findById(postId).populate("authorId", "name role");
      if (!post || post.status !== "active") {
        return res.status(404).json({ message: "Listing not found or not active" });
      }
      if (post.type !== "business_post") {
        return res.status(400).json({ message: "You can only invest in a business listing" });
      }
      if (post.authorId._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot invest in your own listing" });
      }

      const tranId = `IH${Date.now().toString(36)}${crypto.randomBytes(5).toString("hex")}`.toUpperCase();

      const amountNum = Number(amount);
      const platformFee = Math.round(amountNum * PLATFORM_FEE_PERCENT) / 100;
      const netAmount = Math.round((amountNum - platformFee) * 100) / 100;

      const investment = await Investment.create({
        investorId: req.user._id,
        businessmanId: post.authorId._id,
        postId: post._id,
        amount: amountNum,
        platformFee,
        netAmount,
        tranId,
      });

      const session = await createSession({
        store_id: STORE_ID,
        store_passwd: STORE_PASSWD,
        total_amount: Number(amount).toFixed(2),
        currency: "BDT",
        tran_id: tranId,
        success_url: `${SERVER_URL}/api/payments/callback/success`,
        fail_url: `${SERVER_URL}/api/payments/callback/fail`,
        cancel_url: `${SERVER_URL}/api/payments/callback/cancel`,
        ipn_url: `${SERVER_URL}/api/payments/ipn`,
        shipping_method: "NO",
        product_name: post.title.slice(0, 250),
        product_category: post.category?.[0] || "Investment",
        product_profile: "non-physical-goods",
        cus_name: req.user.name,
        cus_email: req.user.email,
        cus_add1: req.user.location || "Dhaka",
        cus_city: req.user.location || "Dhaka",
        cus_country: "Bangladesh",
        cus_phone: req.user.phone || "01700000000",
        value_a: investment._id.toString(),
      });

      if (session?.status !== "SUCCESS" || !session.GatewayPageURL) {
        investment.status = "failed";
        await investment.save();
        return res.status(502).json({ message: session?.failedreason || "Could not start payment session" });
      }

      res.json({ success: true, data: { gatewayUrl: session.GatewayPageURL, tranId } });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/callback/success", async (req, res) => {
  const { tran_id, val_id } = req.body || {};
  try {
    const { ok } = await settlePayment(tran_id, val_id);
    resultRedirect(res, ok ? "success" : "fail", tran_id);
  } catch (error) {
    resultRedirect(res, "fail", tran_id);
  }
});

router.post("/callback/fail", async (req, res) => {
  const { tran_id } = req.body || {};
  try {
    await Investment.findOneAndUpdate({ tranId: tran_id, status: "pending" }, { status: "failed" });
  } catch (error) {
    // fall through to redirect
  }
  resultRedirect(res, "fail", tran_id);
});

router.post("/callback/cancel", async (req, res) => {
  const { tran_id } = req.body || {};
  try {
    await Investment.findOneAndUpdate({ tranId: tran_id, status: "pending" }, { status: "cancelled" });
  } catch (error) {
    // fall through to redirect
  }
  resultRedirect(res, "cancel", tran_id);
});

// Server-to-server IPN — requires SERVER_URL to be publicly reachable.
router.post("/ipn", async (req, res, next) => {
  try {
    const { tran_id, val_id, status } = req.body || {};
    if (!tran_id) return res.status(400).json({ message: "tran_id is required" });

    if (status === "VALID" || status === "VALIDATED") {
      await settlePayment(tran_id, val_id);
    } else if (status === "FAILED") {
      await Investment.findOneAndUpdate({ tranId: tran_id, status: "pending" }, { status: "failed" });
    } else if (status === "CANCELLED") {
      await Investment.findOneAndUpdate({ tranId: tran_id, status: "pending" }, { status: "cancelled" });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/my", protect, requireActive, async (req, res, next) => {
  try {
    const investments = await Investment.find({
      $or: [{ investorId: req.user._id }, { businessmanId: req.user._id }],
    })
      .populate("investorId", "name avatar role")
      .populate("businessmanId", "name avatar role")
      .populate("postId", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
});

router.get("/tran/:tranId", protect, requireActive, async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ tranId: req.params.tranId })
      .populate("investorId", "name avatar role email phone location")
      .populate("businessmanId", "name avatar role email phone location")
      .populate("postId", "title");
    if (!investment) return res.status(404).json({ message: "Investment not found" });
    if (!isParty(investment, req.user)) return res.status(403).json({ message: "Not authorized" });
    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/invoice", protect, requireActive, async (req, res, next) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate("investorId", "name email phone location")
      .populate("businessmanId", "name email phone location")
      .populate("postId", "title");
    if (!investment) return res.status(404).json({ message: "Investment not found" });
    if (!isParty(investment, req.user)) return res.status(403).json({ message: "Not authorized" });
    if (investment.status !== "completed") {
      return res.status(400).json({ message: "Invoice is only available for completed payments" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${investment.tranId}.pdf"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    const bdt = (n) => `BDT ${Number(n).toLocaleString("en-US")}`;
    const emerald = "#059669";
    const slate = "#334155";
    const muted = "#64748b";
    const investor = investment.investorId || {};
    const businessman = investment.businessmanId || {};

    doc.fontSize(20).font("Helvetica-Bold").fillColor(emerald).text("InvestorHub", 50, 50);
    doc.fontSize(9).font("Helvetica").fillColor(muted).text("Investment payment receipt", 50, 74);
    doc.fontSize(22).font("Helvetica-Bold").fillColor(slate).text("INVOICE", 0, 50, { align: "right" });
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(muted)
      .text(`Invoice no: ${investment.tranId}`, 0, 80, { align: "right" })
      .text(`Date: ${new Date(investment.paidAt || investment.createdAt).toLocaleDateString("en-GB")}`, { align: "right" })
      .text("Status: PAID", { align: "right" });

    doc.moveTo(50, 118).lineTo(545, 118).strokeColor("#e2e8f0").stroke();

    doc.fontSize(9).font("Helvetica-Bold").fillColor(muted).text("BILLED TO (INVESTOR)", 50, 134);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(slate).text(investor.name || "—", 50, 148);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(muted)
      .text(investor.email || "", 50)
      .text(investor.phone || "", 50)
      .text(investor.location || "", 50);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(muted).text("PAID TO (BUSINESS)", 320, 134);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(slate).text(businessman.name || "—", 320, 148);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(muted)
      .text(businessman.email || "", 320)
      .text(businessman.phone || "", 320)
      .text(businessman.location || "", 320);

    const tableTop = 235;
    doc.rect(50, tableTop, 495, 22).fill("#f1f5f9");
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(slate)
      .text("DESCRIPTION", 60, tableTop + 7)
      .text("AMOUNT", 0, tableTop + 7, { align: "right", width: 535 });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(slate)
      .text(`Investment in "${(investment.postId?.title || "listing").slice(0, 80)}"`, 60, tableTop + 32, { width: 340 })
      .text(bdt(investment.amount), 0, tableTop + 32, { align: "right", width: 535 });
    doc.moveTo(50, tableTop + 58).lineTo(545, tableTop + 58).strokeColor("#e2e8f0").stroke();

    doc.fontSize(11).font("Helvetica-Bold").fillColor(slate).text("Total paid", 320, tableTop + 72);
    doc.fontSize(13).font("Helvetica-Bold").fillColor(emerald).text(bdt(investment.amount), 0, tableTop + 70, { align: "right", width: 535 });

    const feePct = investment.amount ? Math.round(((investment.platformFee || 0) / investment.amount) * 100) : 0;
    const payTop = tableTop + 115;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(muted).text("PAYMENT DETAILS", 50, payTop);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(slate)
      .text("Gateway: SSLCommerz", 50, payTop + 14)
      .text(`Method: ${investment.paymentMethod || "—"}`, 50)
      .text(`Transaction ID: ${investment.tranId}`, 50)
      .text(`Bank transaction ID: ${investment.bankTranId || "—"}`, 50)
      .text(`Currency: ${investment.currency}`, 50)
      .text(`Platform fee (${feePct}%): ${bdt(investment.platformFee || 0)}`, 50)
      .text(`Business receives: ${bdt(investment.netAmount || investment.amount)}`, 50);

    doc
      .fontSize(8)
      .fillColor(muted)
      .text("This invoice was generated by InvestorHub. Payment processed securely by SSLCommerz.", 50, 770, {
        align: "center",
        width: 495,
      });

    doc.end();
  } catch (error) {
    next(error);
  }
});

router.get("/:id", protect, requireActive, async (req, res, next) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate("investorId", "name avatar role email phone location")
      .populate("businessmanId", "name avatar role email phone location")
      .populate("postId", "title");
    if (!investment) return res.status(404).json({ message: "Investment not found" });
    if (!isParty(investment, req.user)) return res.status(403).json({ message: "Not authorized" });
    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
