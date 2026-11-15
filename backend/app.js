const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

// Route handlers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const vitalRoutes = require("./routes/vitalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Error middlewares
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// =========================================================
// MIDDLEWARES
// =========================================================

// Required when running behind a proxy (Render, Railway, etc.)
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "").replace(/\/+$/, ""),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Brute-force protection: only failed logins/registrations count
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 500,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// Password reset requests are limited more strictly
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many reset requests. Please try again in 15 minutes.",
  },
});

app.use(["/api/auth/login", "/api/auth/register"], authLimiter);
app.use(["/api/auth/forgot-password", "/api/auth/reset-password"], resetLimiter);

// Body parsers - MUST come before the routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// LOGGER
// =========================================================

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "WithUSync Healthcare Portal Backend REST API is running",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =========================================================
// API ROUTES
// =========================================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

// =========================================================
// ERROR HANDLING
// =========================================================

app.use(notFound);
app.use(errorHandler);

module.exports = app;