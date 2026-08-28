const express = require("express");
const multer = require("multer");
const { protect, requireActive } = require("./middleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Trust the mimetype: browser images often have odd extensions (.jfif, .avif, none)
    if (/^image\/(jpe?g|pjpeg|png|gif|webp|avif|bmp)$/.test(file.mimetype)) {
      return cb(null, true);
    }
    const err = new Error("Only image files are allowed (JPG, PNG, GIF, WEBP, AVIF, BMP)");
    err.statusCode = 400;
    cb(err);
  },
});

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be under 5MB" : err.message || "Upload failed";
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

router.post("/", protect, requireActive, handleUpload, async (req, res) => {
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
