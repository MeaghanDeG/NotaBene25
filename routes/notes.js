const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authenticateToken = require("../middleware/auth");

// ===============================
// POST: Create a New Note
// ===============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, category, createdAt, calendarDate } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Create a new note
    const newNote = new Note({
      title,
      content,
      category: category || "General",
      createdAt: createdAt || Date.now(),
      calendarDate: calendarDate ? new Date(calendarDate) : null,
      user: req.user.id, // Attach the user ID from the JWT token
    });

    // Save the note to the database
    const savedNote = await newNote.save();
    res.status(201).json({ message: "Note saved successfully!", note: savedNote });
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ message: "Failed to save the note" });
  }
});

// ===============================
// GET: Fetch All Notes for Logged-In User
// ===============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Fetch notes that belong to the logged-in user
    const notes = await Note.find({ user: req.user.id });
    res.status(200).json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ===============================
// GET: Fetch a Single Note by ID (Ownership Check)
// ===============================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    // Find the note by ID and ensure it belongs to the logged-in user
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }
    res.status(200).json(note);
  } catch (err) {
    console.error("Error fetching the note:", err);
    res.status(500).json({ message: "Failed to fetch the note" });
  }
});

// ===============================
// PUT: Update a Note by ID (Ownership Check)
// ===============================
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content, category, calendarDate } = req.body;

    // Update the note only if it belongs to the logged-in user
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Ownership check
      {
        title,
        content,
        category: category || "General",
        calendarDate: calendarDate || null,
      },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json({ message: "Note updated successfully!", note: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Failed to update the note" });
  }
});

// ===============================
// DELETE: Delete a Note by ID (Ownership Check)
// ===============================
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Delete the note only if it belongs to the logged-in user
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Failed to delete the note" });
  }
});

module.exports = router;
