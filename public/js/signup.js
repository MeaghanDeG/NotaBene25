const API_BASE_URL = "http://127.0.0.1:5001"; // Update if needed

document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document.getElementById("signup-confirm-password").value.trim();
  const errorMessage = document.getElementById("signup-error-message");

  // Clear previous error messages
  errorMessage.textContent = "";

  // Validate inputs
  if (!username || !email || !password || !confirmPassword) {
    errorMessage.textContent = "All fields are required.";
    return;
  }

  if (!validateEmail(email)) {
    errorMessage.textContent = "Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters long.";
    return;
  }

  if (password !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match.";
    return;
  }

  // Make the API request
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Account created successfully! Please log in.");
      window.location.href = "login.html";
    } else {
      errorMessage.textContent = data.message || "Sign-up failed.";
    }
  } catch (error) {
    console.error("Sign-up error:", error.message);
    errorMessage.textContent = "An error occurred. Please try again.";
  }
});

// Helper: Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
