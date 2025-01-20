const crypto = require("crypto");

// Generate a 256-bit (32-byte) secret key (base64 encoded)
const secretKey = crypto.randomBytes(32).toString("base64");

console.log("Your secret key:", secretKey);
