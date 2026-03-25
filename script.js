const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");

let isSignup = false;

/* ---------------- UTILITY FUNCTIONS ---------------- */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? JSON.parse(currentUser) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find((u) => u.email === email);
}

/* ---------------- CHECK LOGIN STATUS ---------------- */
function checkLoginStatus() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    showProfile(currentUser);
  }
}

/* ---------------- SHOW PROFILE ---------------- */
function showProfile(user) {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <div class="profile">
      <h2>Personal Center</h2>
      <div class="profile-info">
        <p><strong>Name:</strong> ${escapeHtml(user.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      </div>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

function logout() {
  clearCurrentUser();
  location.reload();
}

/* ---------------- TOGGLE FORM ---------------- */
function toggleForm() {
  isSignup = !isSignup;

  if (isSignup) {
    formTitle.innerText = "Sign Up";
    submitBtn.innerText = "Sign Up";
    toggleText.innerText = "Already have an account?";
    toggleLink.innerText = "Login";
    nameGroup.style.display = "block";
  } else {
    formTitle.innerText = "Login";
    submitBtn.innerText = "Login";
    toggleText.innerText = "Don't have an account?";
    toggleLink.innerText = "Sign Up";
    nameGroup.style.display = "none";
  }

  clearErrors();
  successMsg.style.display = "none";
  form.reset();
}

/* ---------------- SHOW / HIDE PASSWORD ---------------- */
function togglePassword() {
  const password = document.getElementById("password");
  password.type = password.type === "password" ? "text" : "password";
}

/* ---------------- CLEAR ERRORS ---------------- */
function clearErrors() {
  document.querySelectorAll(".error").forEach((err) => {
    err.style.display = "none";
  });
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

/* ---------------- FORM SUBMIT ---------------- */
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let isValid = true;

  if (isSignup && name === "") {
    showError("nameError", "Name is required");
    isValid = false;
  }

  if (email === "") {
    showError("emailError", "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("emailError", "Please enter a valid email address");
    isValid = false;
  }

  if (password === "") {
    showError("passwordError", "Password is required");
    isValid = false;
  } else if (password.length < 6) {
    showError("passwordError", "Password must be at least 6 characters");
    isValid = false;
  }

  if (!isValid) return;

  /* -------- SIGN UP LOGIC -------- */
  if (isSignup) {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      showError("emailError", "This email is already registered");
      return;
    }

    const hashedPassword = simpleHash(password);
    const newUser = {
      id: Date.now().toString(),
      name: escapeHtml(name),
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    successMsg.style.display = "block";
    successMsg.innerText = "Signup successful! Please login now.";

    toggleForm();
    return;
  }

  /* -------- LOGIN LOGIC -------- */
  const user = findUserByEmail(email);

  if (!user) {
    alert("No account found with this email. Please sign up first.");
    return;
  }

  const hashedPassword = simpleHash(password);
  if (hashedPassword === user.password) {
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    successMsg.style.display = "block";
    successMsg.innerText = `Welcome back, ${escapeHtml(user.name)}!`;
    form.reset();

    setTimeout(() => {
      showProfile(user);
    }, 1000);
  } else {
    alert("Invalid email or password");
  }
});

document.addEventListener("DOMContentLoaded", checkLoginStatus);
