const mongoose = require("mongoose");

const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "USER"];
const USER_STATUSES = ["ACTIVE", "DISABLED"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "USER" },
    status: { type: String, enum: USER_STATUSES, default: "ACTIVE" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
module.exports.USER_ROLES = USER_ROLES;
module.exports.USER_STATUSES = USER_STATUSES;

