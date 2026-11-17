const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^\d{10}$/;

const isStrongPassword = (password) =>
  typeof password === "string" &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.";

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "patient",
      phone,
      gender,
      age,
      bloodGroup,
      specialization,
      qualifications,
      experience,
      clinicLocation,
      condition,
      allergies,
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanName || !cleanEmail || !password || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone number are required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, message: "Please enter a valid full name" });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: PASSWORD_MESSAGE });
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits",
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be created through public registration",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === cleanEmail
            ? "An account with this email already exists"
            : "An account with this phone number already exists",
      });
    }

    const user = new User({
      name: cleanName,
      email: cleanEmail,
      password,
      role,
      phone: cleanPhone,
      gender: gender || "",
      age: age || null,
      bloodGroup: bloodGroup || "",
      notificationsEnabled: true,
    });

    if (role === "doctor") {
      user.specialization = specialization || "General Physician";
      user.qualifications = qualifications || "MBBS";
      user.experience = experience || 0;
      user.clinicLocation = clinicLocation || "WithUSync Clinic";
      // Self-registered doctors must be approved by the admin first
      user.isApproved = false;
    } else {
      user.condition = condition || "";
      user.allergies = allergies || "";
    }

    await user.save();

    // Doctors cannot log in until approved, so no session token is issued
    if (role === "doctor") {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Registration successful. Your doctor account is awaiting admin approval.",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.role === "admin" && process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is not authorized.",
      });
    }

    if (user.role === "doctor" && user.isApproved === false) {
      return res.status(403).json({
        success: false,
        message: "Your doctor account is awaiting admin approval.",
      });
    }

    const token = generateToken(user._id, user.role);
    res.json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "assignedDoctor",
      "name email specialization qualifications"
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide both current and new password" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_MESSAGE });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password does not match" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const sendResetEmail = async (to, resetUrl) => {
  // If SMTP is not configured (e.g. local dev), log the link instead of failing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "WithUSync - Reset your password",
    text: `You requested a password reset.\n\nOpen this link within 15 minutes to choose a new password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  });
};

// Always responds with the same message so emails cannot be enumerated
const forgotPassword = async (req, res, next) => {
  const generic = {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  try {
    const email = String(req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    try {
      await sendResetEmail(user.email, resetUrl);
    } catch (mailError) {
      console.error("Reset email failed:", mailError.message);
    }

    res.json(generic);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_MESSAGE });
    }

    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
};
