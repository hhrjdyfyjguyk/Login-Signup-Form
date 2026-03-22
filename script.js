const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");
const authContainer = document.getElementById("authContainer");
const profileContainer = document.getElementById("profileContainer");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const avatarInitial = document.getElementById("avatarInitial");
const logoutBtn = document.getElementById("logoutBtn");

let isSignup = false;

// Initialize the app
function init() {
  checkLoginStatus();
}

// Check if user is already logged in
function checkLoginStatus() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    showProfile(currentUser);
  }
}

// Get all users from localStorage
function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Get current logged-in user
function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

// Set current logged-in user
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Clear current user (logout)
function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

// Simple password hash (for demo purposes only - use bcrypt in production)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Show profile section
function showProfile(user) {
  authContainer.style.display = "none";
  profileContainer.style.display = "block";
  profileContainer.classList.add("fade-in");
  
  profileName.textContent = user.name;
  profileEmail.textContent = user.email;
  avatarInitial.textContent = user.name.charAt(0).toUpperCase();
}

// Show auth form
function showAuthForm() {
  profileContainer.style.display = "none";
  authContainer.style.display = "block";
  authContainer.classList.add("fade-in");
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
  clearInputStyles();
  successMsg.style.display = "none";
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
  });
}

/* ---------------- CLEAR INPUT STYLES ---------------- */
function clearInputStyles() {
  document.querySelectorAll("input").forEach((input) => {
    input.classList.remove("error-input");
  });
}

/* ---------------- SHOW ERROR ---------------- */
function showError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = "block";
  }
  
  // Add error style to input
  const inputId = elementId.replace("Error", "");
  const inputElement = document.getElementById(inputId);
  if (inputElement) {
    inputElement.classList.add("error-input");
  }
}

/* ---------------- VALIDATE EMAIL ---------------- */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* ---------------- FORM SUBMIT ---------------- */
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();
  clearInputStyles();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let isValid = true;

  if (isSignup) {
    if (name.length < 2) {
      showError("nameError");
      isValid = false;
    }
  }

  if (!validateEmail(email)) {
    showError("emailError");
    isValid = false;
  }

  if (password.length < 6) {
    showError("passwordError");
    isValid = false;
  }

  if (!isValid) return;

  const users = getUsers();

  if (isSignup) {
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      alert("This email is already registered. Please use a different email or login.");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    successMsg.style.display = "block";
    successMsg.innerText = "Signup successful 🎉 Please login now.";

    setTimeout(() => {
      toggleForm();
    }, 1500);
  } else {
    // Login logic
    const user = users.find(user => 
      user.email === email && user.password === hashPassword(password)
    );

    if (user) {
      // Set current user session
      const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      setCurrentUser(currentUser);

      successMsg.style.display = "block";
      successMsg.innerText = `Welcome back, ${user.name}! ✅`;

      setTimeout(() => {
        showProfile(currentUser);
        form.reset();
        successMsg.style.display = "none";
      }, 1000);
    } else {
      alert("Invalid email or password ❌");
    }
  }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", function() {
  clearCurrentUser();
  showAuthForm();
  isSignup = false;
  toggleForm();
});

// Initialize the app
init();