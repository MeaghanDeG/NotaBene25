const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// Set strict query mode to avoid deprecation warnings
mongoose.set("strictQuery", true);

// Monitor Mongoose connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to the database");
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from the database");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("reconnectFailed", () => {
  console.error("❌ Reconnection to MongoDB failed. Manual intervention may be required.");
});

/**
 * Connect to MongoDB using Mongoose with retry logic
 */
async function connectDB(retries = 5, delay = 5000) {
  while (retries) {
    try {
      console.log("⏳ Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected successfully");
      break; // Exit the retry loop if connected
    } catch (err) {
      console.error(`❌ MongoDB connection error (${retries} retries left):`, err.message);
      retries -= 1;
      if (retries === 0) {
        console.error("❌ Failed to connect to MongoDB after multiple attempts. Exiting...");
        process.exit(1); // Exit if all retries fail
      }
      console.log(`🔄 Retrying connection in ${delay / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
    }
  }
}

/**
 * Close the MongoDB connection (for clean shutdowns)
 */
async function closeDB() {
  try {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed.");
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err.message);
  }
}

module.exports = { connectDB, closeDB };
