const API_BASE_URL = "http://127.0.0.1:5001/api";

// Handle the "Forgot Password" form submission
document.getElementById("forgot-password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("reset-email").value.trim();
  const messageElement = document.getElementById("reset-message");
  const errorElement = document.getElementById("reset-error");

  messageElement.textContent = "";
  errorElement.textContent = "";

  if (!email) {
    errorElement.textContent = "Please enter your email address.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.textContent = "A password reset link has been sent to your email.";
    } else {
      errorElement.textContent = data.message || "Failed to send the password reset link.";
    }
  } catch (error) {
    console.error("Error sending reset link:", error.message);
    errorElement.textContent = "An error occurred. Please try again later.";
  }
});

// Handle the "Reset Password" form submission
document.getElementById("reset-password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const errorMessage = document.getElementById("reset-error");
  const successMessage = document.getElementById("reset-message");

  errorMessage.textContent = "";
  successMessage.textContent = "";

  if (!newPassword || !confirmPassword) {
    errorMessage.textContent = "All fields are required.";
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Password reset successful. You can now log in.");
      window.location.href = "login.html";
    } else {
      errorMessage.textContent = data.message || "Failed to reset the password.";
    }
  } catch (error) {
    console.error("Error resetting password:", error.message);
    errorMessage.textContent = "An error occurred. Please try again later.";
  }
});

 
