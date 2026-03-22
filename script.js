const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const confirmGroup = document.getElementById("confirmGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");
const rememberMe = document.getElementById("rememberMe");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");

let isSignup = false;

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const REMEMBER_ME_KEY = "rememberMe";

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function sanitizeInput(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find((user) => user.email === email.toLowerCase());
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

function checkAuthAndRedirect() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    window.location.href = "profile.html";
  }
}

function loadRememberedEmail() {
  const remembered = localStorage.getItem(REMEMBER_ME_KEY);
  if (remembered) {
    document.getElementById("email").value = remembered;
    if (rememberMe) rememberMe.checked = true;
  }
}

function toggleForm() {
  isSignup = !isSignup;

  if (isSignup) {
    formTitle.innerText = "Sign Up";
    submitBtn.innerText = "Sign Up";
    toggleText.innerText = "Already have an account?";
    toggleLink.innerText = "Login";
    nameGroup.style.display = "block";
    if (confirmGroup) confirmGroup.style.display = "block";
  } else {
    formTitle.innerText = "Login";
    submitBtn.innerText = "Login";
    toggleText.innerText = "Don't have an account?";
    toggleLink.innerText = "Sign Up";
    nameGroup.style.display = "none";
    if (confirmGroup) confirmGroup.style.display = "none";
  }

  clearErrors();
  successMsg.style.display = "none";
  form.reset();
  if (!isSignup) {
    loadRememberedEmail();
  }
}

function togglePassword(inputId) {
  const password = document.getElementById(inputId);
  const toggleSpan = password.nextElementSibling;
  if (password.type === "password") {
    password.type = "text";
    if (toggleSpan && toggleSpan.classList.contains("password-toggle")) {
      toggleSpan.innerText = "Hide Password";
    }
  } else {
    password.type = "password";
    if (toggleSpan && toggleSpan.classList.contains("password-toggle")) {
      toggleSpan.innerText = "Show Password";
    }
  }
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((err) => {
    err.style.display = "none";
  });
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = "block";
    if (message) {
      errorElement.innerText = message;
    }
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= 6 && hasLetter && hasNumber;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  const name = sanitizeInput(document.getElementById("name").value.trim());
  const email = sanitizeInput(document.getElementById("email").value.trim().toLowerCase());
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  let isValid = true;

  if (isSignup && name === "") {
    showError("nameError", "Name is required");
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError("emailError", "Enter a valid email address");
    isValid = false;
  }

  if (!validatePassword(password)) {
    showError("passwordError", "Password must be at least 6 characters with letters and numbers");
    isValid = false;
  }

  if (isSignup && confirmPassword !== undefined) {
    if (confirmPassword !== password) {
      showError("confirmError", "Passwords do not match");
      isValid = false;
    }
  }

  if (!isValid) return;

  if (isSignup) {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      showError("emailError", "This email is already registered");
      return;
    }

    const hashedPassword = simpleHash(password);
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    successMsg.style.display = "block";
    successMsg.innerText = "Signup successful! Please login now.";
    successMsg.style.color = "green";

    setTimeout(() => {
      toggleForm();
    }, 1500);
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    showError("emailError", "No account found with this email");
    return;
  }

  const hashedPassword = simpleHash(password);
  if (user.password !== hashedPassword) {
    showError("passwordError", "Incorrect password");
    return;
  }

  if (rememberMe && rememberMe.checked) {
    localStorage.setItem(REMEMBER_ME_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    loginAt: new Date().toISOString(),
  };
  setCurrentUser(sessionUser);

  successMsg.style.display = "block";
  successMsg.innerText = `Welcome back, ${user.name}! Redirecting...`;
  successMsg.style.color = "green";

  setTimeout(() => {
    window.location.href = "profile.html";
  }, 1000);
});

document.addEventListener("DOMContentLoaded", function () {
  checkAuthAndRedirect();
  if (!isSignup) {
    loadRememberedEmail();
  }
});
