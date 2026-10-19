// Quản lý Đăng nhập / Đăng ký
window.authModule = {
  isLoggedIn: false,

  toggleModal(show) {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.toggle('active', show);
    ['login-error', 'register-error'].forEach(id => {
      const errorEl = document.getElementById(id);
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.innerText = '';
      }
    });
  },

  switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    const isLogin = tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    formLogin.style.display = isLogin ? 'block' : 'none';
    formRegister.style.display = isLogin ? 'none' : 'block';
    this.toggleModal(true);
  },

  showError(id, message) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.innerText = message;
      errorEl.style.display = 'block';
    }
  },

  handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
      this.showError('register-error', 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ HOA, chữ thường và số!');
      return;
    }

    let accounts = JSON.parse(localStorage.getItem('nexus_accounts') || '{}');
    if (accounts[user]) {
      this.showError('register-error', 'Tên đăng nhập này đã tồn tại!');
      return;
    }

    accounts[user] = pass;
    localStorage.setItem('nexus_accounts', JSON.stringify(accounts));
    this.loginSuccess(user);
    toast.show('Đăng ký thành công!', 'success');
  },

  handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    // 1. Kiểm tra tài khoản Admin (Hardcode)
    if (user === 'admin' && pass === 'Admin123') {
      localStorage.setItem('nexus_username', 'Admin');
      localStorage.setItem('nexus_is_logged_in', 'true');
      localStorage.setItem('nexus_role', 'admin');
      window.location.href = 'admin.html';
      return;
    }

    // 2. Kiểm tra tài khoản người chơi
    let accounts = JSON.parse(localStorage.getItem('nexus_accounts') || '{}');
    if (!accounts[user] || accounts[user] !== pass) {
      this.showError('login-error', 'Tài khoản hoặc mật khẩu không chính xác!');
      return;
    }

    localStorage.setItem('nexus_username', user);
    localStorage.setItem('nexus_is_logged_in', 'true');
    localStorage.setItem('nexus_role', 'user');

    const profile = document.getElementById('profile-username');
    if (profile) profile.innerText = user;
    if (typeof updateAvatar === 'function') updateAvatar();

    this.toggleModal(false);
    toast.show(`Chào mừng ${user} trở lại!`, 'success');
  },

  loginSuccess(username) {
    localStorage.setItem('nexus_username', username);
    localStorage.setItem('nexus_is_logged_in', 'true');
    localStorage.setItem('nexus_role', 'user');
    
    const profile = document.getElementById('profile-username');
    if (profile) profile.innerText = username;
    if (typeof updateAvatar === 'function') updateAvatar();
    
    if (typeof trackingModule !== 'undefined') trackingModule.logLogin(username);
    
    this.toggleModal(false);
  },

  checkLogin() {
    const isLoggedIn = localStorage.getItem('nexus_is_logged_in') === 'true';
    const username = localStorage.getItem('nexus_username') || 'Khách';
    this.isLoggedIn = isLoggedIn;
    
    const profile = document.getElementById('profile-username');
    if (profile) profile.innerText = isLoggedIn ? username : 'Khách';
    if (typeof updateAvatar === 'function') updateAvatar();
  },

  logout() {
    localStorage.removeItem('nexus_is_logged_in');
    localStorage.removeItem('nexus_role');
    localStorage.removeItem('nexus_username');
    this.isLoggedIn = false;
    toast.show('Đã đăng xuất!', 'info');
    setTimeout(() => location.reload(), 1000);
  }
};