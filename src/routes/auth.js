const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For email verification
const sendEmail = require("../util/mail"); // The mail utility function
const User = require("../models/User");
const router = express.Router();

// JWT and email configuration
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_SECRET = process.env.EMAIL_SECRET; // Secret for email verification
const BASE_URL = process.env.BASE_URL || "http://localhost:5001"; // Backend base URL

// Nodemailer setup for email verification
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

// ===============================
// POST: Sign Up Route
// ===============================
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("Signup request body:", req.body); // Log the request body

    // Validate input
    if (!username || !email || !password) {
      console.error("Missing required fields"); // Log the error
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("User with this email already exists"); // Log the error
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    console.log("New user created:", newUser); // Log the created user

    // Send verification email (optional)
    const emailToken = jwt.sign({ id: newUser._id }, process.env.EMAIL_SECRET, { expiresIn: "1d" });
    const verificationUrl = `${process.env.BASE_URL}/auth/verify-email/${emailToken}`;
    console.log("Verification URL:", verificationUrl); // Log the verification URL

    await transporter.sendMail({
      to: email,
      subject: "Verify your email address",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
    });

    res.status(201).json({ message: "User registered successfully! Please verify your email." });
  } catch (err) {
    console.error("Error during signup:", err.message); // Log the error
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// GET: Email Verification
// ===============================
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, EMAIL_SECRET); // Decode the token

    // Find the user and set them as verified
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Email verification error:", err.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

/// ===============================
// POST: Login Route
// ===============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Use 'email' instead of 'emailOrUsername'

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the account is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email to log in." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;