const dotenv = require("dotenv");
dotenv.config();

// Fail fast if required configuration is missing
["JWT_SECRET", "MONGO_URI", "CLIENT_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(
      `WithUSync Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err, promise) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
});