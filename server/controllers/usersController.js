const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { USER_ROLES, USER_STATUSES } = require("../models/User");

function canCreateRole(requesterRole, targetRole) {
  if (requesterRole === "SUPER_ADMIN") return true;
  if (requesterRole === "ADMIN") return targetRole === "USER";
  return false;
}

function toSafeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

exports.listUsers = async (req, res) => {
  try {
    const { role, status, q } = req.query || {};
    const filter = {};

    if (role && USER_ROLES.includes(role)) filter.role = role;
    if (status && USER_STATUSES.includes(status)) filter.status = status;
    if (q) {
      const s = String(q).trim();
      if (s) {
        filter.$or = [
          { email: { $regex: s, $options: "i" } },
          { name: { $regex: s, $options: "i" } }
        ];
      }
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.json({ users: users.map(toSafeUser) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list users" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const requesterRole = req.auth.role;
    const { name, email, password, role } = req.body || {};

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const targetRole = role && USER_ROLES.includes(role) ? role : "USER";

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!canCreateRole(requesterRole, targetRole)) {
      return res.status(403).json({ message: "Not allowed to create this role" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      name: name ? String(name).trim() : undefined,
      email: normalizedEmail,
      passwordHash,
      role: targetRole,
      status: "ACTIVE"
    });

    return res.status(201).json({ user: toSafeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const requesterRole = req.auth.role;
    const { id } = req.params;
    const { name, role, status, password } = req.body || {};

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only SUPER_ADMIN can change roles (and never downgrade themselves by accident)
    if (role !== undefined) {
      if (requesterRole !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Only SUPER_ADMIN can change roles" });
      }
      if (!USER_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    // SUPER_ADMIN or ADMIN can disable/enable non-super users
    if (status !== undefined) {
      if (!USER_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (requesterRole !== "SUPER_ADMIN" && requesterRole !== "ADMIN") {
        return res.status(403).json({ message: "Not allowed" });
      }
      if (user.role === "SUPER_ADMIN" && requesterRole !== "SUPER_ADMIN") {
        return res.status(403).json({ message: "Cannot modify SUPER_ADMIN" });
      }
      user.status = status;
    }

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (password !== undefined) {
      if (requesterRole !== "SUPER_ADMIN" && requesterRole !== "ADMIN") {
        return res.status(403).json({ message: "Not allowed" });
      }
      user.passwordHash = await bcrypt.hash(String(password), 12);
    }

    await user.save();
    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update user" });
  }
};

