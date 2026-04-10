const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment.");
  return secret;
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/"
  };
}

function signToken(user) {
  return jwt.sign(
    { role: user.role },
    getJwtSecret(),
    {
      subject: String(user._id),
      expiresIn: "7d"
    }
  );
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account disabled" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.cookie("auth_token", token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("auth_token", getCookieOptions());
  return res.json({ message: "Logged out" });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load user" });
  }
};

