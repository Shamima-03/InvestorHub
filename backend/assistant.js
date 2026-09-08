const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { validate } = require("./middleware");

const router = express.Router();

// The key never leaves the server: the widget talks to this route, this route
// talks to Gemini. Putting the key in the React bundle would publish it.
const API_KEY = process.env.GEMINI_API_KEY;
// A "lite" model keeps the widget snappy: the bigger flash models think
// before answering and took ~35s per reply in testing.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const API_BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta";

const MAX_HISTORY = 8;
const REQUEST_TIMEOUT_MS = 20000;

const SYSTEM_PROMPT = `You are the InvestorHub assistant, a helper on the InvestorHub website.

InvestorHub connects investors with business owners in Bangladesh:
- Two member roles: investor and businessman. Sign-up creates a pending account.
- The sign-up sequence is: register, pay the one-time entry fee, submit an NID photo for
  verification, then wait for an admin to activate the account. Only an active account can
  use the dashboard.
- Members publish listings (an investment offer or a funding request). A new listing stays
  pending until an admin approves it.
- A member sends a match request to someone of the opposite role. Once it is accepted they
  can chat in real time. Chat is only allowed between an investor and a business account.
- Investors fund a business listing through the SSLCommerz payment gateway. The platform
  keeps a commission from the transferred amount, and an invoice PDF is available afterwards.
- Members can report a listing or a user, and follow the outcome under "My Reports".
- Signed-in members can review the platform on the Review page.

Rules:
- Answer only about InvestorHub, investing, and running a business listing on this platform.
  For anything unrelated, say briefly that you can only help with InvestorHub.
- Keep answers short: two or three sentences, plain text, no markdown formatting.
- Never invent account details, balances, payment status, or other people's data — you cannot
  see any account. Ask the user to check their dashboard instead.
- You are not a financial adviser. Do not promise returns or recommend specific investments.
- For account problems, a refund, or anything you are unsure about, point the user to the
  Contact page.`;

// A public AI endpoint is billable, so it gets a much tighter cap than the
// site-wide limiter.
const chatLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "You have sent a lot of messages. Please try again in a few minutes." },
});

router.post(
  "/chat",
  chatLimit,
  [
    body("message").trim().isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("history").optional().isArray({ max: 40 }).withMessage("Invalid conversation history"),
  ],
  validate,
  async (req, res, next) => {
    if (!API_KEY) {
      return res.status(503).json({
        message: "The assistant is not configured yet. Add GEMINI_API_KEY to backend/.env and restart the server.",
      });
    }

    try {
      const { message, history = [] } = req.body;

      // Only the last few turns are sent: enough context, bounded cost.
      const contents = [
        ...history
          .filter((turn) => turn && typeof turn.text === "string" && turn.text.trim())
          .slice(-MAX_HISTORY)
          .map((turn) => ({
            role: turn.role === "model" ? "model" : "user",
            parts: [{ text: turn.text.slice(0, 1000) }],
          })),
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await fetch(`${API_BASE}/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // The gateway's own wording can leak the key or the project id, so log it
        // for the developer and send the user something plain.
        console.error("Gemini error", response.status, data?.error?.message || "");
        const status = response.status === 429 ? 429 : 502;
        return res.status(status).json({
          message:
            status === 429
              ? "The assistant is busy right now. Please try again in a moment."
              : "The assistant could not answer right now. Please try again.",
        });
      }

      const reply = (data?.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text)
        .filter(Boolean)
        .join("")
        .trim();

      if (!reply) {
        // Empty candidates means the prompt or the answer was filtered.
        const blocked = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
        console.error("Gemini returned no text", blocked || "unknown reason");
        return res.status(422).json({
          message: "I could not answer that one. Try asking it a different way.",
        });
      }

      res.json({ success: true, reply });
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return res.status(504).json({ message: "The assistant took too long to answer. Please try again." });
      }
      next(error);
    }
  }
);

module.exports = router;
