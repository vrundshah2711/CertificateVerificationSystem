const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    return { created: false, reason: "SUPER_ADMIN_EMAIL/PASSWORD not set" };
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.role !== "SUPER_ADMIN") {
      existing.role = "SUPER_ADMIN";
      existing.status = "ACTIVE";
      await existing.save();
      return { created: false, reason: "Promoted existing user to SUPER_ADMIN" };
    }
    return { created: false, reason: "SUPER_ADMIN already exists" };
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE"
  });

  return { created: true, reason: "Created SUPER_ADMIN" };
}

module.exports = { ensureSuperAdmin };

