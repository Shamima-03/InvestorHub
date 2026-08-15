const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect, requireActive } = require("./middleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

router.post("/", protect, requireActive, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const formData = new URLSearchParams();
    formData.append("image", req.file.buffer.toString("base64"));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=346b5a9d98b086e8adf2450957eb52d4`,
      { method: "POST", body: formData }
    );
    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    res.json({ success: true, url: data.data.url, delete_url: data.data.delete_url });
  } catch (error) {
    console.error("imgbb upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;
