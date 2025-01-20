const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Routes
document.addEventListener("DOMContentLoaded", function () {
  // =======================
  // GLOBAL VARIABLES
  // =======================
  const API_BASE_URL = "http://127.0.0.1:5001"; // Backend URL for notes
  const AUTH_BASE_URL = "http://127.0.0.1:3001"; // Backend URL for authentication
  let jwtToken = localStorage.getItem("jwt"); // Get JWT token from localStorage

  // =======================
  // HELPER FUNCTIONS
  // =======================

  // Display messages (success/error)
  function displayMessage(elementId, message, isSuccess = true) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.style.color = isSuccess ? "green" : "red";
  }

  // Redirect to login page if not authenticated
  function redirectToLogin() {
    if (!jwtToken) {
      alert("Please log in to access this page.");
      window.location.href = "login.html"; // Redirect to login page
    }
  }

  // Make an authenticated API request
  async function makeAuthenticatedRequest(url, options = {}) {
    if (!jwtToken) {
      redirectToLogin();
      throw new Error("Unauthorized: No JWT token found.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // If the token is invalid or expired
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("jwt"); // Clear JWT token
        redirectToLogin();
      }
      const error = await response.json();
      throw new Error(error.message || "Request failed.");
    }

    return response.json();
  }

  // =======================
  // AUTHENTICATION LOGIC
  // =======================

  // Handle login form submission
  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailOrUsername = document.getElementById("login-email-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!emailOrUsername || !password) {
      displayMessage("error-message", "Both fields are required.", false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("jwt", data.token); // Save JWT token
        jwtToken = data.token;
        alert("Login successful!");
        window.location.href = "index.html"; // Redirect to main page
      } else {
        displayMessage("error-message", data.message || "Login failed.", false);
      }
    } catch (error) {
      console.error("Login error:", error);
      displayMessage("error-message", "An error occurred during login.", false);
    }
  });

  // Handle signup form submission
  const signupForm = document.getElementById("signup-form");
  signupForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();

    if (password !== confirmPassword) {
      displayMessage("password-match-error", "Passwords do not match.", false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please log in.");
        window.location.href = "login.html"; // Redirect to login page
      } else {
        displayMessage("error-message", data.message || "Signup failed.", false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      displayMessage("error-message", "An error occurred during signup.", false);
    }
  });

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", function () {
    localStorage.removeItem("jwt"); // Clear JWT token
    jwtToken = null;
    alert("You have been logged out.");
    window.location.href = "login.html"; // Redirect to login page
  });

  // =======================
  // NOTES MANAGEMENT
  // =======================

  // Fetch and display notes
  async function fetchAndDisplayNotes() {
    try {
      const notes = await makeAuthenticatedRequest(`${API_BASE_URL}/api/notes`);
      const notesContainer = document.getElementById("notes-container");

      if (!notes || notes.length === 0) {
        notesContainer.innerHTML = "<p>No notes found. Create one!</p>";
        return;
      }

      let notesHtml = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      notes.forEach((note) => {
        notesHtml += `
          <tr>
            <td>${note.title}</td>
            <td>${note.category}</td>
            <td>${new Date(note.createdAt).toLocaleDateString()}</td>
            <td>
              <button onclick="editNote('${note._id}')">Edit</button>
              <button onclick="deleteNote('${note._id}')">Delete</button>
            </td>
          </tr>
        `;
      });

      notesHtml += "</tbody></table>";
      notesContainer.innerHTML = notesHtml;
    } catch (error) {
      console.error("Error fetching notes:", error);
      document.getElementById("notes-container").innerHTML =
        "<p>Error fetching notes.</p>";
    }
  }

  // Create a new note
  const saveNoteForm = document.getElementById("saveNoteForm");
  saveNoteForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    try {
      await makeAuthenticatedRequest(`${API_BASE_URL}/api/notes`, {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });

      alert("Note saved successfully!");
      fetchAndDisplayNotes(); // Refresh notes after saving
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save the note.");
    }
  });

  // Edit a note
  async function editNote(noteId) {
    try {
      const note = await makeAuthenticatedRequest(`${API_BASE_URL}/api/notes/${noteId}`);

      // Populate fields in the edit modal
      document.getElementById("editNoteId").value = note._id;
      document.getElementById("editNoteTitle").value = note.title;
      document.getElementById("editNoteContent").value = note.content;

      const modal = new bootstrap.Modal(document.getElementById("editNoteModal"));
      modal.show();
    } catch (error) {
      console.error("Error fetching note for editing:", error);
      alert("Failed to fetch note for editing.");
    }
  }

  // Delete a note
  async function deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await makeAuthenticatedRequest(`${API_BASE_URL}/api/notes/${noteId}`, { method: "DELETE" });
      alert("Note deleted successfully!");
      fetchAndDisplayNotes(); // Refresh notes
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete the note.");
    }
  }

  // =======================
  // INITIALIZATION
  // =======================

  // Redirect to login if not authenticated
  if (!jwtToken) {
    redirectToLogin();
  } else {
    fetchAndDisplayNotes();
  }
});
