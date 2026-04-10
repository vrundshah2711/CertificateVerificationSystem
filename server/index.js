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

// ✅ FIXED: remove trailing slash automatically
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "https://certificate-verification-system-iota.vercel.app")
  .trim()
  .replace(/\/$/, "");

// ✅ Allowed origins
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  ...CLIENT_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, ""))
]);

// ✅ CORS OPTIONS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.has(cleanOrigin)) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ✅ APPLY FIRST
app.use(cors(corsOptions));

// ✅ VERY IMPORTANT (preflight fix)
app.options("*", cors(corsOptions));

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
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false
  }),
  require("./routes/authRoutes")
);

app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/imports", require("./routes/importsRoutes"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ Start server
async function start() {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI)");
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB Connected");

  const { ensureSuperAdmin } = require("./bootstrap/ensureSuperAdmin");
  await ensureSuperAdmin();

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});

// ✅ FINAL ERROR HANDLER (CORS SAFE)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.header("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");

  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});