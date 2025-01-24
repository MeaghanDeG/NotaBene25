const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { closeDB } = require("./src/config/db"); // Import database connection logic
const mongoose = require("mongoose");


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Import Routes
const authRoutes = require("./src/routes/auth");
const notesRoutes = require("./src/routes/notes");
const resetPasswordRoutes = require("./src/routes/reset-password");

// Routes
app.use("/auth", authRoutes); // Routes for authentication
app.use("/notes", notesRoutes); // Routes for notes
app.use("/auth", resetPasswordRoutes); // Routes for forgot password

// Serve static files (frontend files)
app.use(express.static(path.join(__dirname, "public")));

// Catch-All Route (Frontend SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("\n🔌 Gracefully shutting down...");
  await closeDB(); // Close the MongoDB connection
  server.close(() => {
    console.log("💤 Server shut down.");
    process.exit(0); // Exit the process
  });
});
