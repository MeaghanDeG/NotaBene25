const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../util/mail"); // Utility to send email
const router = express.Router();

// ===============================
// POST: Forgot Password
// ===============================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("Forgot Password Request for email:", email);

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    console.log("Generated reset token:", resetToken);

    // Construct reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password.html?token=${resetToken}`;
    console.log("Reset URL:", resetUrl);

    // Send reset email
    const subject = "Password Reset Request - Nota Bene";
    const text = `Hi ${user.username},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nNota Bene Team`;
    await sendEmail({ to: email, subject, text });
    console.log("Reset email sent to:", email);

    res.status(200).json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("Error in forgot-password route:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// ===============================
// POST: Reset Password
// ===============================
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required." });
  }
  if (error.name === "TokenExpiredError") {
    return res.status(400).json({ message: "The reset link has expired. Please request a new one." });
  }
  

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error in reset-password route:", error.message);
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
