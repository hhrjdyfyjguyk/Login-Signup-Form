const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");

let isSignup = false;

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

/* ---------------- FORM SUBMIT ---------------- */
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  let isValid = true;

  if (isSignup && name === "") {
    document.getElementById("nameError").style.display = "block";
    isValid = false;
  }

  if (!email.includes("@") || email === "") {
    document.getElementById("emailError").style.display = "block";
    isValid = false;
  }

  if (password.length < 6) {
    document.getElementById("passwordError").style.display = "block";
    isValid = false;
  }

  if (!isValid) return;

  /* -------- SIGN UP LOGIC -------- */
  if (isSignup) {
    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    successMsg.style.display = "block";
    successMsg.innerText = "Signup successful 🎉 Please login now.";

    toggleForm(); // Switch to login
    return;
  }

  /* -------- LOGIN LOGIC -------- */
  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    alert("No account found. Please sign up first.");
    return;
  }

  if (email === savedUser.email && password === savedUser.password) {
    successMsg.style.display = "block";
    successMsg.innerText = `Welcome back, ${savedUser.name} ✅`;
    form.reset();
  } else {
    alert("Invalid email or password ❌");
  }
});
