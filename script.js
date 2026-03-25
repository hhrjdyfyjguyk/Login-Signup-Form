(function() {
    'use strict';

    // DOM元素引用
    const formTitle = document.getElementById("formTitle");
    const nameGroup = document.getElementById("nameGroup");
    const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
    const submitBtn = document.getElementById("submitBtn");
    const toggleText = document.getElementById("toggleText");
    const toggleLink = document.getElementById("toggleLink");
    const toggleTextIcon = document.getElementById("toggleTextIcon");
    const form = document.getElementById("authForm");
    const successMsg = document.getElementById("successMsg");
    const authContainer = document.getElementById("authContainer");
    const profileContainer = document.getElementById("profileContainer");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileCreatedAt = document.getElementById("profileCreatedAt");
    const avatarInitial = document.getElementById("avatarInitial");
    const logoutBtn = document.getElementById("logoutBtn");

    // 状态变量
    let isSignup = false;
    const STORAGE_KEYS = {
        USERS: 'auth_users',
        CURRENT_USER: 'auth_current_user'
    };

    // ==================== 工具函数 ====================
    
    // 安全HTML转义（防止XSS）
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 简单密码哈希（演示用，生产环境建议使用bcrypt）
    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16) + '_' + password.length;
    }

    // 验证邮箱格式
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 生成唯一ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ==================== 存储操作 ====================

    // 获取所有用户
    function getUsers() {
        try {
            const users = localStorage.getItem(STORAGE_KEYS.USERS);
            return users ? JSON.parse(users) : [];
        } catch (e) {
            console.error('读取用户数据失败:', e);
            return [];
        }
    }

    // 保存用户列表
    function saveUsers(users) {
        try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return true;
        } catch (e) {
            console.error('保存用户数据失败:', e);
            return false;
        }
    }

    // 根据邮箱查找用户
    function findUserByEmail(email) {
        const users = getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // 添加新用户
    function addUser(userData) {
        const users = getUsers();
        const newUser = {
            id: generateId(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashPassword(userData.password),
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    }

    // 获取当前登录用户
    function getCurrentUser() {
        try {
            const user = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (user) {
                return JSON.parse(user);
            }
            // 检查持久化登录
            const persistentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (persistentUser) {
                const parsedUser = JSON.parse(persistentUser);
                sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(parsedUser));
                return parsedUser;
            }
            return null;
        } catch (e) {
            console.error('读取当前用户失败:', e);
            return null;
        }
    }

    // 设置当前登录用户
    function setCurrentUser(user, persistent = false) {
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
        if (persistent) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
        }
        return userData;
    }

    // 清除当前登录状态
    function clearCurrentUser() {
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // ==================== 表单操作 ====================

    // 切换表单模式
    window.toggleForm = function() {
        isSignup = !isSignup;

        if (isSignup) {
            formTitle.innerText = "注册账号";
            submitBtn.innerText = "立即注册";
            toggleText.innerText = "已有账号?";
            toggleLink.innerText = "立即登录";
            nameGroup.style.display = "block";
            confirmPasswordGroup.style.display = "block";
        } else {
            formTitle.innerText = "登录账号";
            submitBtn.innerText = "立即登录";
            toggleText.innerText = "还没有账号?";
            toggleLink.innerText = "立即注册";
            nameGroup.style.display = "none";
            confirmPasswordGroup.style.display = "none";
        }

        clearErrors();
        clearSuccess();
        form.reset();
    };

    // 切换密码显示
    window.togglePassword = function() {
        const password = document.getElementById("password");
        if (password.type === "password") {
            password.type = "text";
            toggleTextIcon.innerText = "隐藏";
        } else {
            password.type = "password";
            toggleTextIcon.innerText = "显示";
        }
    };

    // 清除错误提示
    function clearErrors() {
        document.querySelectorAll(".error").forEach(err => {
            err.style.display = "none";
        });
    }

    // 清除成功提示
    function clearSuccess() {
        successMsg.style.display = "none";
    }

    // 显示错误
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = message;
            element.style.display = "block";
        }
    }

    // 显示成功提示
    function showSuccess(message) {
        successMsg.innerText = message;
        successMsg.style.display = "block";
        successMsg.classList.add('fade-in');
    }

    // ==================== 表单验证 ====================

    function validateForm() {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        let isValid = true;
        clearErrors();

        // 注册模式验证
        if (isSignup) {
            // 用户名验证
            if (name.length < 2) {
                showError("nameError", "用户名至少需要2个字符");
                isValid = false;
            } else if (name.length > 20) {
                showError("nameError", "用户名不能超过20个字符");
                isValid = false;
            }

            // 确认密码验证
            if (password !== confirmPassword) {
                showError("confirmPasswordError", "两次输入的密码不一致");
                isValid = false;
            }

            // 检查邮箱是否已注册
            if (findUserByEmail(email)) {
                showError("emailError", "该邮箱已被注册");
                isValid = false;
            }
        }

        // 邮箱格式验证
        if (!isValidEmail(email)) {
            showError("emailError", "请输入有效的邮箱地址");
            isValid = false;
        }

        // 密码验证
        if (password.length < 6) {
            showError("passwordError", "密码至少需要6个字符");
            isValid = false;
        } else if (password.length > 32) {
            showError("passwordError", "密码不能超过32个字符");
            isValid = false;
        }

        return isValid;
    }

    // ==================== 个人中心操作 ====================

    function showProfile(user) {
        if (!user) return;

        profileName.innerText = escapeHtml(user.name);
        profileEmail.innerText = escapeHtml(user.email);
        profileCreatedAt.innerText = formatDate(user.createdAt);
        avatarInitial.innerText = user.name.charAt(0).toUpperCase();

        authContainer.style.display = "none";
        profileContainer.style.display = "block";
        profileContainer.classList.add('fade-in');
    }

    function showAuthForm() {
        profileContainer.style.display = "none";
        authContainer.style.display = "block";
        authContainer.classList.add('fade-in');
    }

    // 退出登录
    function handleLogout() {
        clearCurrentUser();
        showAuthForm();
        isSignup = false;
        toggleForm();
        toggleForm(); // 重置到登录状态
    }

    // ==================== 表单提交 ====================

    function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (isSignup) {
            // 注册逻辑
            const newUser = addUser({ name, email, password });
            showSuccess("注册成功！请使用新账号登录 🎉");
            
            // 自动切换到登录
            setTimeout(() => {
                toggleForm();
                document.getElementById("email").value = email;
                document.getElementById("password").focus();
            }, 1500);
        } else {
            // 登录逻辑
            const user = findUserByEmail(email);
            
            if (!user) {
                showError("emailError", "该邮箱未注册");
                return;
            }

            if (user.password !== hashPassword(password)) {
                showError("passwordError", "密码错误");
                return;
            }

            // 登录成功
            const loggedInUser = setCurrentUser(user, true);
            showSuccess("登录成功！正在跳转... ✅");

            setTimeout(() => {
                showProfile(loggedInUser);
                form.reset();
                clearSuccess();
            }, 1000);
        }
    }

    // ==================== 初始化 ====================

    function init() {
        // 检查登录状态
        const currentUser = getCurrentUser();
        if (currentUser) {
            showProfile(currentUser);
        } else {
            showAuthForm();
        }

        // 绑定事件
        form.addEventListener('submit', handleFormSubmit);
        logoutBtn.addEventListener('click', handleLogout);

        // 输入时清除对应错误提示
        document.getElementById("name").addEventListener('input', () => {
            document.getElementById("nameError").style.display = "none";
        });
        document.getElementById("email").addEventListener('input', () => {
            document.getElementById("emailError").style.display = "none";
        });
        document.getElementById("password").addEventListener('input', () => {
            document.getElementById("passwordError").style.display = "none";
        });
        document.getElementById("confirmPassword").addEventListener('input', () => {
            document.getElementById("confirmPasswordError").style.display = "none";
        });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
