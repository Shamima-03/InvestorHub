const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./db");
const { errorHandler } = require("./authMiddleware");
const { socketHandler } = require("./chat");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
// Generous limit: a normal SPA session fires many small requests (dashboard
// stats, chat, status polling), so 100/15min locked users out mid-session.
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: "Too many requests, please try again later" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./auth"));
app.use("/api/users", require("./users"));
app.use("/api/posts", require("./posts"));
app.use("/api/matches", require("./matches"));
app.use("/api/conversations", require("./chat"));
app.use("/api/admin", require("./admin"));
app.use("/api/upload", require("./upload"));
app.use("/api/payments", require("./payments"));
app.use("/api/reports", require("./reports"));
app.use("/api/contact", require("./contact"));

app.get("/", (req, res) => {
  res.json({ message: "InvestorHub API running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
