const express = require("express");
const router = express.Router();
const {
  addCertificate,
  getCertificate,
  getCertificatePdf
} = require("../controllers/certificateController");

// Add certificate
router.post("/add", addCertificate);

// Get certificate
router.get("/:id", getCertificate);

// Download certificate PDF
router.get("/:id/pdf", getCertificatePdf);

module.exports = router;