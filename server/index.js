const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const defaultAllowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
   "http://localhost:5174",       
  "http://127.0.0.1:5174" 
]);
const envAllowedOrigins = new Set(
  String(CLIENT_ORIGIN)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / server-to-server (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

// ✅ Routes
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

const certificateRoutes = require("./routes/certificateRoutes");
app.use("/api/certificates", certificateRoutes);

const authRoutes = require("./routes/authRoutes");
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false
  }),
  authRoutes
);

const usersRoutes = require("./routes/usersRoutes");
app.use("/api/users", usersRoutes);

const importsRoutes = require("./routes/importsRoutes");
app.use("/api/imports", importsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

async function start() {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI) in environment.");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const { ensureSuperAdmin } = require("./bootstrap/ensureSuperAdmin");
  const result = await ensureSuperAdmin();
  if (result?.reason) {
    console.log(`[bootstrap] ${result.reason}`);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});

// Centralized error handler (keep last)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});
