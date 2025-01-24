const API_BASE_URL = "http://127.0.0.1:5001";
let jwtToken = localStorage.getItem("jwt");

// Redirect to login page if not authenticated
function redirectToLogin() {
  if (!jwtToken) {
    console.log("No JWT token found. Redirecting to login page...");
    window.location.href = "login.html";
  }
}

// Login Function
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("jwt", data.token);
      jwtToken = data.token;
      alert("Login successful!");
      window.location.href = "index.html"; // Redirect to the main app
    } else {
      alert(data.message || "Invalid email or password.");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    alert("An error occurred during login. Please try again.");
  }
}

// Add event listener to the login form
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!email || !password) {
        alert("Both email and password are required.");
        return;
      }

      console.log("Submitting login form with email:", email); // Debugging log

      await login(email, password); // Call the login function
    });
  }

  // Handle redirection for authenticated users
  if (window.location.pathname.includes("login.html") && jwtToken) {
    window.location.href = "index.html"; // Redirect if already logged in
  }
});

// Fetch Notes
async function fetchNotes() {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (response.ok) {
      const notes = await response.json();
      displayNotes(notes);
      updateCalendar(notes); // Update the calendar with notes
    } else {
      alert("Failed to fetch notes. Please log in again.");
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

// Form Handling for General Notes
document.getElementById("generalNoteForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("generalNoteTitle").value.trim();
  const content = document.getElementById("generalNoteContent").value.trim();
  const calendarDate = document.getElementById("calendarDate")?.value || null;

  if (!title || !content) {
    alert("Title and content are required.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ title, content, category: "General", calendarDate }),
    });

    if (response.ok) {
      alert("Note saved successfully!");
      document.getElementById("generalNoteForm").reset();
      fetchNotes(); // Refresh notes and calendar
    } else {
      alert("Failed to save the note.");
    }
  } catch (error) {
    console.error("Error saving note:", error.message);
    alert("An error occurred while saving the note.");
  }
});

// Form Handling for Grocery List
document.getElementById("groceryForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("groceryListTitle").value.trim();
  const items = Array.from(document.querySelectorAll("#groceryItems input[type='text']"))
    .map((input) => input.value.trim())
    .filter((item) => item !== "");

  if (!title) {
    alert("Title is required.");
    return;
  }
  if (items.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ title, content: items.join("\n"), category: "Grocery" }),
    });

    if (response.ok) {
      alert("Grocery list saved successfully!");
      document.getElementById("groceryForm").reset();
      fetchNotes();
    } else {
      alert("Failed to save the grocery list.");
    }
  } catch (error) {
    console.error("Error saving grocery list:", error.message);
    alert("An error occurred while saving the grocery list.");
  }
});

// Form Handling for To-Do List
document.getElementById("todoNoteForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("todoListTitle").value.trim();
  const tasks = Array.from(document.querySelectorAll("#todoItems input[type='text']"))
    .map((input) => input.value.trim())
    .filter((task) => task !== "");

  if (!title) {
    alert("Title is required.");
    return;
  }
  if (tasks.length === 0) {
    alert("Please add at least one task.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ title, content: tasks.join("\n"), category: "To-Do" }),
    });

    if (response.ok) {
      alert("To-Do list saved successfully!");
      document.getElementById("todoNoteForm").reset();
      fetchNotes();
    } else {
      alert("Failed to save the to-do list.");
    }
  } catch (error) {
    console.error("Error saving to-do list:", error.message);
    alert("An error occurred while saving the to-do list.");
  }
});

// Handle Dynamic Tab Switching
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".file-folder-tab");
  const containers = document.querySelectorAll(".dropdown-container");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab-id");

      // Hide all containers
      containers.forEach((container) => container.classList.add("d-none"));

      // Show the selected container
      document.getElementById(tabId).classList.remove("d-none");
    });
  });

  // Set the first tab as active on page load
  if (tabs.length > 0) {
    tabs[0].click();
  }
});

// Add New Item (Grocery/To-Do)
function addNewItem(event, containerId) {
  if (event.key === "Enter") {
    event.preventDefault();

    const container = document.getElementById(containerId);
    const newInput = document.createElement("div");
    newInput.className = "input-group mb-2";

    newInput.innerHTML = `
      <input type="text" class="form-control" placeholder="Add item/task">
      <button type="button" class="btn btn-danger" onclick="removeItem(this)">X</button>
    `;

    container.appendChild(newInput);
  }
}

// Remove Item
function removeItem(button) {
  const parent = button.parentElement;
  parent.remove();
}

// Initialize Calendar
function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: [], // Events will be updated later
  });
  calendar.render();

  // Save the calendar instance for later updates
  window.calendar = calendar;
}

// Update Calendar with Notes
function updateCalendar(notes) {
  if (!window.calendar) return;

  const events = notes
    .filter((note) => note.calendarDate) // Only include notes with a calendarDate
    .map((note) => ({
      title: note.title,
      start: note.calendarDate,
      description: note.content,
    }));

  // Remove old events and add new ones
  window.calendar.removeAllEvents();
  window.calendar.addEventSource(events);
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("login.html") && jwtToken) {
    window.location.href = "index.html";
  }

  if (window.location.pathname.includes("index.html")) {
    redirectToLogin();
    initializeCalendar(); // Initialize the calendar
    fetchNotes(); // Fetch notes and populate the calendar
  }
});
