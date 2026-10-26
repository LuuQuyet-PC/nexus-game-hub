// ==========================================
// MODULE XÁC THỰC: ĐĂNG NHẬP / ĐĂNG KÝ
// ==========================================
window.authModule = {
  isLoggedIn: false,

  // Mở/Đóng Modal Đăng nhập
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

  // Chuyển Tab Đăng nhập / Đăng ký
  switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    const isLogin = tab === 'login';
    
    // Hiển thị cảnh báo nếu chuyển sang tab Đăng ký mà đang bảo trì / bị tắt
    if (!isLogin) {
      const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
      if (settings.maintenance === true) {
        this.showError('register-error', '⛔ Hệ thống đang bảo trì, chức năng đăng ký tạm thời bị khóa!');
      } else if (settings.allowRegister === false) {
        this.showError('register-error', '⛔ Chức năng đăng ký đang bị Admin tạm khóa!');
      }
    }

    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    formLogin.style.display = isLogin ? 'block' : 'none';
    formRegister.style.display = isLogin ? 'none' : 'block';
    this.toggleModal(true);
  },

  // Hiển thị lỗi
  showError(id, message) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.innerText = message;
      errorEl.style.display = 'block';
    }
  },

  // Xử lý Đăng Ký (Bị chặn nếu bảo trì hoặc tắt đăng ký)
  handleRegister(e) {
    e.preventDefault();
    
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');

    // 1. CHẶN BẢO TRÌ
    if (settings.maintenance === true) {
      this.showError('register-error', '⛔ Hệ thống đang bảo trì, không thể đăng ký tài khoản mới!');
      return;
    }

    // 2. CHẶN ADMIN TẮT ĐĂNG KÝ
    if (settings.allowRegister === false) {
      this.showError('register-error', '⛔ Chức năng đăng ký tài khoản đang bị tạm khóa!');
      return;
    }

    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    
    // 3. VALIDATE MẬT KHẨU
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
      this.showError('register-error', 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ HOA, chữ thường và số!');
      return;
    }

    // 4. KIỂM TRA TRÙNG TÊN
    let accounts = JSON.parse(localStorage.getItem('nexus_accounts') || '{}');
    if (accounts[user]) {
      this.showError('register-error', 'Tên đăng nhập này đã tồn tại!');
      return;
    }

    // 5. LƯU TÀI KHOẢN
    accounts[user] = pass;
    localStorage.setItem('nexus_accounts', JSON.stringify(accounts));
    this.loginSuccess(user);
    toast.show('Đăng ký thành công!', 'success');
  },

  // Xử lý Đăng Nhập
  handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    // 1. ADMIN ĐƯỢC ƯU TIÊN (Không bị chặn bởi bảo trì)
    if (user === 'admin' && pass === 'Admin123') {
      localStorage.setItem('nexus_username', 'Admin');
      localStorage.setItem('nexus_is_logged_in', 'true');
      localStorage.setItem('nexus_role', 'admin');
      window.location.href = 'admin.html';
      return;
    }

    // 2. KIỂM TRA BẢO TRÌ (Chặn user thường)
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
    if (settings.maintenance === true) {
      this.showError('login-error', 'Hệ thống đang bảo trì. Chỉ Admin mới có thể đăng nhập!');
      return;
    }

    // 3. KIỂM TRA TÀI KHOẢN USER THƯỜNG
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

  // Đăng nhập thành công (dùng cho cả đăng ký)
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

  // Kiểm tra trạng thái đăng nhập
  checkLogin() {
    const isLoggedIn = localStorage.getItem('nexus_is_logged_in') === 'true';
    const username = localStorage.getItem('nexus_username') || 'Khách';
    this.isLoggedIn = isLoggedIn;
    
    const profile = document.getElementById('profile-username');
    if (profile) profile.innerText = isLoggedIn ? username : 'Khách';
    if (typeof updateAvatar === 'function') updateAvatar();
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem('nexus_is_logged_in');
    localStorage.removeItem('nexus_role');
    localStorage.removeItem('nexus_username');
    this.isLoggedIn = false;
    toast.show('Đã đăng xuất!', 'info');
    setTimeout(() => location.reload(), 1000);
  }
};