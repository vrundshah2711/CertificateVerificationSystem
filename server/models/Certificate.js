const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: String,
  domain: String,
  startDate: Date,
  endDate: Date,
  importBatchId: { type: String, index: true },
  uploadedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  issuedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Certificate", certificateSchema);