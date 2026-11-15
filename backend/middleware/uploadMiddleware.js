const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// =========================================================
// CLOUDINARY CONFIG
// =========================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =========================================================
// MULTER (files are kept in memory, then streamed to Cloudinary)
// =========================================================

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG and PNG files are allowed"), false);
    }
  },
});

// Uploads a multer file to Cloudinary and resolves with its https URL
const uploadToCloudinary = (file, folder = "withusync/reports") =>
  new Promise((resolve, reject) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return reject(new Error("File storage is not configured on the server"));
    }

    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
      )
      .end(file.buffer);
  });

module.exports = upload;
module.exports.uploadToCloudinary = uploadToCloudinary;
