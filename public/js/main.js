const API_BASE_URL = "http://127.0.0.1:5001";
let jwtToken = localStorage.getItem("jwt");

// Redirect to login page if not authenticated
function redirectToLogin() {
  if (!jwtToken) {
    window.location.href = "login.html";
  }
}

// Login Function
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/auth`, { // Correct endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("jwt", data.token);
      jwtToken = data.token;
      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    alert("An error occurred during login. Please try again.");
  }
}

// Fetch Notes
async function fetchNotes() {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (response.ok) {
      const notes = await response.json();
      displayNotes(notes);
    } else if (response.status === 401) {
      alert("Session expired. Please log in again.");
      logout();
    } else {
      console.error("Failed to fetch notes:", await response.text());
      alert("Failed to fetch notes. Please try again later.");
    }
  } catch (error) {
    console.error("Error fetching notes:", error.message);
    alert("An error occurred while fetching notes.");
  }
}

// Display Notes
function displayNotes(notes) {
  const notesContainer = document.getElementById("notes-container");

  if (!notes || notes.length === 0) {
    notesContainer.innerHTML = "<p>No notes available.</p>";
    return;
  }

  notesContainer.innerHTML = notes
    .map(
      (note) =>
        `<div class="note">
          <h3>${note.title}</h3>
          <p>${note.content}</p>
        </div>`
    )
    .join("");
}

// Logout
function logout() {
  localStorage.removeItem("jwt");
  jwtToken = null;
  alert("Logged out successfully");
  window.location.href = "login.html";
}

// Redirect authenticated users on login.html
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("login.html") && jwtToken) {
    window.location.href = "index.html";
  }

  if (window.location.pathname.includes("index.html")) {
    redirectToLogin();
    fetchNotes();
  }
});
