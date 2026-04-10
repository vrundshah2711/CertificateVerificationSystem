const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadExcel } = require("../controllers/uploadController");
const { requireAuth, requireRole } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Backwards-compatible route; prefer /api/imports/excel
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), upload.single("file"), uploadExcel);

module.exports = router;