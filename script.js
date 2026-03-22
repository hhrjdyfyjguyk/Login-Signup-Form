const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");

let isSignup = false;

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function redirectToProfile() {
  window.location.href = "profile.html";
}

function checkAuthStatus() {
  if (isLoggedIn() && window.location.pathname.includes("index.html")) {
    redirectToProfile();
  }
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
  clearSuccess();
  form.reset();
}

/* ---------------- SHOW / HIDE PASSWORD ---------------- */
function togglePassword() {
  const password = document.getElementById("password");
  const toggleBtn = document.querySelector(".password-toggle");
  if (password.type === "password") {
    password.type = "text";
    toggleBtn.innerText = "Hide Password";
  } else {
    password.type = "password";
    toggleBtn.innerText = "Show Password";
  }
}

/* ---------------- CLEAR ERRORS ---------------- */
function clearErrors() {
  document.querySelectorAll(".error").forEach((err) => {
    err.style.display = "none";
    err.innerText = "";
  });
}

function clearSuccess() {
  successMsg.style.display = "none";
  successMsg.innerText = "";
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }
}

function showSuccess(message) {
  successMsg.innerText = message;
  successMsg.style.display = "block";
}

/* ---------------- VALIDATION ---------------- */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateName(name) {
  return name.trim().length >= 2;
}

/* ---------------- FORM SUBMIT ---------------- */
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    clearSuccess();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    let isValid = true;

    if (isSignup) {
      if (!validateName(name)) {
        showError("nameError", "Name must be at least 2 characters");
        isValid = false;
      }
    }

    if (!validateEmail(email)) {
      showError("emailError", "Please enter a valid email address");
      isValid = false;
    }

    if (!validatePassword(password)) {
      showError("passwordError", "Password must be at least 6 characters");
      isValid = false;
    }

    if (!isValid) return;

    const users = getUsers();

    if (isSignup) {
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        showError("emailError", "This email is already registered");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      showSuccess("Signup successful! Please login now.");
      setTimeout(() => {
        toggleForm();
      }, 1500);
      return;
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      showError("emailError", "No account found with this email");
      return;
    }

    if (user.passwordHash !== hashPassword(password)) {
      showError("passwordError", "Incorrect password");
      return;
    }

    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email
    });

    showSuccess(`Welcome back, ${user.name}! Redirecting...`);
    setTimeout(() => {
      redirectToProfile();
    }, 1000);
  });
}

document.addEventListener("DOMContentLoaded", checkAuthStatus);
