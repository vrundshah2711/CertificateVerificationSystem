const express = require("express");
const router = express.Router();
const multer = require("multer");

const { requireAuth, requireRole } = require("../middleware/auth");
const { uploadExcel } = require("../controllers/uploadController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/excel", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), upload.single("file"), uploadExcel);

module.exports = router;

