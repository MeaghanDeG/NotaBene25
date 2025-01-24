const express = require("express");
const jwt = require("jsonwebtoken");
const Note = require("../models/Note");

const router = express.Router();

// ===============================
// Middleware: Authenticate Token
// ===============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); // Log the Authorization header

  const token = authHeader && authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Log the extracted token

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("Decoded Token:", decoded); // Log the decoded token
    req.user = decoded; // Attach the decoded token payload to `req.user`
    next();
  });
}

// ===============================
// POST: Create a New Note
// ===============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // Log the authenticated user
    const { title, content, category, createdAt, calendarDate } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const newNote = new Note({
      title,
      content,
      category: category || "General",
      createdAt: createdAt || Date.now(),
      calendarDate: calendarDate ? new Date(calendarDate) : null,
      user: req.user.id, // Attach the user ID from the JWT token
    });

    const savedNote = await newNote.save();
    res.status(201).json({
      message: "Note saved successfully!",
      note: savedNote,
    });
  } catch (error) {
    console.error("Error saving note:", error.message);
    res.status(500).json({ message: "Failed to save the note" });
  }
});

// ===============================
// GET: Fetch All Notes for Logged-In User
// ===============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }); // Fetch notes for the logged-in user
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error.message);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ===============================
// GET: Fetch a Single Note by ID (Ownership Check)
// ===============================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching the note:", error.message);
    res.status(500).json({ message: "Failed to fetch the note" });
  }
});

// ===============================
// PUT: Update a Note by ID (Ownership Check)
// ===============================
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content, category, calendarDate } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Ownership check
      {
        title,
        content,
        category: category || "General",
        calendarDate: calendarDate ? new Date(calendarDate) : null,
      },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json({
      message: "Note updated successfully!",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).json({ message: "Failed to update the note" });
  }
});

// ===============================
// DELETE: Delete a Note by ID
// ===============================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // Ensure the user owns the note
    });

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error deleting note:", error.message);
    res.status(500).json({ message: "Failed to delete the note" });
  }
});


module.exports = router;
