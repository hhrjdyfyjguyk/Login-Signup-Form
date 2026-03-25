const formTitle = document.getElementById("formTitle");
const nameGroup = document.getElementById("nameGroup");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");

const form = document.getElementById("authForm");
const successMsg = document.getElementById("successMsg");

let isSignup = false;

// 存储键名常量
const STORAGE_KEYS = {
  USERS: "auth_users",      // 存储所有用户数据
  SESSION: "auth_session",  // 存储当前登录会话
  CURRENT_USER: "current_user" // 存储当前登录用户信息
};

/* ---------------- 初始化检查 ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
});

/* ---------------- 检查登录状态 ---------------- */
function checkLoginStatus() {
  const session = getSession();
  if (session && session.isLoggedIn && session.expiresAt > Date.now()) {
    // 已登录且会话未过期，跳转到个人中心
    window.location.href = "profile.html";
  }
}

/* ---------------- 获取所有用户 ---------------- */
function getUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

/* ---------------- 保存所有用户 ---------------- */
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/* ---------------- 根据邮箱查找用户 ---------------- */
function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/* ---------------- 获取当前会话 ---------------- */
function getSession() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : null;
}

/* ---------------- 保存会话 ---------------- */
function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

/* ---------------- 清除会话（登出） ---------------- */
function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/* ---------------- 设置登录会话 ---------------- */
function setLoginSession(user) {
  const session = {
    isLoggedIn: true,
    userEmail: user.email,
    loginTime: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
  };
  saveSession(session);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
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

/* ---------------- 显示错误信息 ---------------- */
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }
}

/* ---------------- 邮箱格式验证 ---------------- */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* ---------------- 密码强度验证 ---------------- */
function isValidPassword(password) {
  // 至少6位，包含字母和数字
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

/* ---------------- 转义HTML防止XSS ---------------- */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---------------- 表单验证 ---------------- */
function validateForm(name, email, password) {
  let isValid = true;
  clearErrors();

  // 注册时验证姓名
  if (isSignup) {
    if (!name || name.trim() === "") {
      showError("nameError", "Name is required");
      isValid = false;
    } else if (name.trim().length < 2) {
      showError("nameError", "Name must be at least 2 characters");
      isValid = false;
    }
  }

  // 验证邮箱
  if (!email || email.trim() === "") {
    showError("emailError", "Email is required");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError("emailError", "Please enter a valid email address");
    isValid = false;
  }

  // 验证密码
  if (!password || password === "") {
    showError("passwordError", "Password is required");
    isValid = false;
  } else if (password.length < 6) {
    showError("passwordError", "Password must be at least 6 characters");
    isValid = false;
  } else if (!isValidPassword(password)) {
    showError("passwordError", "Password must contain both letters and numbers");
    isValid = false;
  }

  return isValid;
}

/* ---------------- FORM SUBMIT ---------------- */
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // 表单验证
  if (!validateForm(name, email, password)) {
    return;
  }

  /* -------- SIGN UP LOGIC -------- */
  if (isSignup) {
    // 检查邮箱是否已注册
    if (findUserByEmail(email)) {
      showError("emailError", "This email is already registered");
      return;
    }

    // 创建新用户（使用转义防止XSS）
    const newUser = {
      id: Date.now().toString(),
      name: escapeHtml(name),
      email: email.toLowerCase(),
      password: password, // 实际项目中应该使用哈希
      createdAt: new Date().toISOString()
    };

    // 获取现有用户列表并添加新用户
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    successMsg.style.display = "block";
    successMsg.innerText = "Signup successful 🎉 Please login now.";
    successMsg.className = "success show";

    // 清空表单并切换到登录
    form.reset();
    setTimeout(() => {
      toggleForm();
    }, 1500);
    return;
  }

  /* -------- LOGIN LOGIC -------- */
  const user = findUserByEmail(email);

  if (!user) {
    showError("emailError", "No account found with this email");
    return;
  }

  if (password !== user.password) {
    showError("passwordError", "Incorrect password");
    return;
  }

  // 登录成功，设置会话
  setLoginSession(user);

  successMsg.style.display = "block";
  successMsg.innerText = `Welcome back, ${user.name} ✅ Redirecting...`;
  successMsg.className = "success show";

  // 跳转到个人中心
  setTimeout(() => {
    window.location.href = "profile.html";
  }, 1000);
});
