const app = {
  games: [],
  library: [],
  favorites: [],

  init() {
    // ===== 1. KIỂM TRA BẢO TRÌ VÀ HIỂN THỊ BANNER =====
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
    if (settings.maintenance === true) {
      const banner = document.createElement('div');
      banner.id = 'maintenance-banner';
      banner.style.cssText = "background: #ff0055; color: #fff; text-align: center; padding: 12px; font-weight: bold; position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; font-family: 'Inter', sans-serif; font-size: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);";
      banner.innerHTML = "⚠️ HỆ THỐNG ĐANG BẢO TRÌ. CHỈ ADMIN MỚI CÓ THỂ ĐĂNG NHẬP!";
      document.body.prepend(banner);
      document.body.style.paddingTop = "50px";
    }

    // ===== 2. KHÔI PHỤC TÀI KHOẢN MẶC ĐỊNH =====
    if (!localStorage.getItem('nexus_accounts')) {
      if (typeof DEFAULT_ACCOUNTS !== 'undefined') {
        localStorage.setItem('nexus_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      }
    }

    // ===== 3. TẢI DỮ LIỆU GAME =====
    const savedGames = localStorage.getItem('nexus_games_v2');
    if (savedGames) {
      this.games = JSON.parse(savedGames);
    } else if (typeof DEFAULT_GAMES_DATABASE !== 'undefined') {
      this.games = DEFAULT_GAMES_DATABASE;
      localStorage.setItem('nexus_games_v2', JSON.stringify(this.games));
    }

    // ===== 4. TẢI THƯ VIỆN & YÊU THÍCH =====
    this.library = JSON.parse(localStorage.getItem('nexus_library_v2')) || [];
    this.favorites = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];

    // ===== 5. KHỞI TẠO VÍ & TÊN =====
    if (!localStorage.getItem('nexus_balance')) localStorage.setItem('nexus_balance', '128.50');
    if (!localStorage.getItem('nexus_username')) localStorage.setItem('nexus_username', 'Khách');

    // ===== 6. KIỂM TRA ĐĂNG NHẬP =====
    if (typeof window.authModule !== 'undefined') {
      window.authModule.checkLogin();
      if (localStorage.getItem('nexus_is_logged_in') !== 'true') {
        setTimeout(() => window.authModule.toggleModal(true), 500);
      }
    }

    // ===== 7. VẼ GIAO DIỆN =====
    renderSidebar();
    renderSpotlight();
    renderCategoryCards();
    this.applyFiltersAndRender();

    if (typeof heroCarousel !== 'undefined') heroCarousel.init(this.games);
    if (typeof filterModule !== 'undefined') filterModule.init();

    // ===== 8. GẮN SỰ KIỆN FORM ĐĂNG BÁN =====
    const publishForm = document.getElementById('publish-form');
    if (publishForm) {
      publishForm.onsubmit = (e) => this.handlePublishSubmit(e);
    }

    // ===== 9. PHÍM ESC =====
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof closePlayer === 'function') closePlayer();
        if (typeof closeDetailModal === 'function') closeDetailModal();
      }
    });
  },

  // ===== HÀM ĐĂNG BÁN GAME (Đã tự động thêm vào Yêu thích) =====
  handlePublishSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('pub-title').value.trim();
    const category = document.getElementById('pub-category').value;
    const price = parseFloat(document.getElementById('pub-price').value);
    const urlInput = document.getElementById('pub-url').value.trim();
    const desc = document.getElementById('pub-desc').value.trim();

    if (!title) { toast.show('Vui lòng nhập tên game!', 'error'); return; }
    if (isNaN(price) || price < 0) { toast.show('Giá không hợp lệ!', 'error'); return; }

    const newGame = {
      id: "g-" + Date.now(),
      title: title,
      category: category,
      price: price,
      rating: 5.0,
      playCount: "1",
      coverColor: "linear-gradient(135deg, #00f0ff, #ff0055)",
      badge: "MỚI",
      isHot: false,
      isNew: true,
      desc: desc || "Mô tả trò chơi chưa cập nhật.",
      gameUrl: urlInput || "https://html-classic.itch.zone/html/18013330/index.html"
    };

    // 1. Lưu vào Kho Game
    this.games.unshift(newGame);
    localStorage.setItem('nexus_games_v2', JSON.stringify(this.games));

    // 2. Tự động lưu vào Yêu thích
    let currentFavs = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];
    currentFavs.push(newGame.id);
    localStorage.setItem('nexus_favs_v2', JSON.stringify(currentFavs));
    this.favorites = currentFavs;

    toast.show(`Đã đăng bán "${title}" và thêm vào Yêu thích!`, "success");

    // 3. Đóng form
    const modal = document.getElementById('modal-publish');
    if (modal) modal.classList.remove('active');
    e.target.reset();

    // 4. Vẽ lại giao diện
    filterModule.currentCategory = 'all';
    filterModule.currentNavFilter = 'all';
    filterModule.searchKeyword = '';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const discoverBtn = document.querySelector('.nav-item[data-filter="all"]');
    if (discoverBtn) discoverBtn.classList.add('active');

    this.switchView('store');
    renderSidebar();
    renderCategoryCards();
    heroCarousel.init(this.games);
    this.applyFiltersAndRender();
  },

  // ===== KIỂM TRA ĐĂNG NHẬP =====
  requireLogin(callback) {
    if (localStorage.getItem('nexus_is_logged_in') === 'true') {
      if (callback) callback();
      return true;
    } else {
      if (typeof window.authModule !== 'undefined') window.authModule.toggleModal(true);
      if (typeof toast !== 'undefined') toast.show("Vui lòng đăng nhập!", "error");
      return false;
    }
  },

  scrollToGames() {
    const gridSection = document.getElementById('all-games-section');
    if (gridSection) setTimeout(() => gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  },

  // ===== BỘ LỌC & RENDER =====
  applyFiltersAndRender() {
    let result = [...this.games];

    if (filterModule.currentCategory !== 'all') result = result.filter(g => g.category === filterModule.currentCategory);
    if (filterModule.currentNavFilter === 'isNew') result = result.filter(g => g.isNew);
    else if (filterModule.currentNavFilter === 'isHot') result = result.filter(g => g.isHot);

    if (filterModule.searchKeyword) {
      const keyword = filterModule.searchKeyword;
      result = result.filter(g =>
        g.title.toLowerCase().includes(keyword) ||
        g.category.toLowerCase().includes(keyword)
      );
    }

    if (filterModule.currentSort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (filterModule.currentSort === 'popular') result.sort((a, b) => parseInt(b.playCount) - parseInt(a.playCount));
    else if (filterModule.currentSort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filterModule.currentSort === 'price-desc') result.sort((a, b) => b.price - a.price);

    const countEl = document.getElementById('results-count');
    if (countEl) countEl.innerText = `Tìm thấy ${result.length} trò chơi phù hợp`;

    renderGameGrid(result);
  },

  // ===== MUA GAME =====
  handleBuy(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game || this.library.some(item => item.gameId === gameId)) {
      toast.show("Bạn đã sở hữu tựa game này!", "info");
      return;
    }

    if (game.price > 0) {
      let balance = parseFloat(localStorage.getItem('nexus_balance') || '0');
      if (balance < game.price) { toast.show(`Số dư không đủ!`, "error"); return; }
      balance -= game.price;
      localStorage.setItem('nexus_balance', balance.toFixed(2));
      const balanceEl = document.getElementById('profile-balance-display');
      if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
    }

    const cdKey = `NEXUS-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.library.unshift({
      libraryId: "lib-" + Date.now(),
      gameId: game.id,
      title: game.title,
      coverImage: game.coverImage || "",
      coverColor: game.coverColor,
      cdKey: cdKey,
      gameUrl: game.gameUrl
    });
    localStorage.setItem('nexus_library_v2', JSON.stringify(this.library));

    toast.show(`Mua thành công! Mã: ${cdKey}`, "success");
    if (typeof closeDetailModal === 'function') closeDetailModal();
    this.switchView('library');
  },

  // ===== XỬ LÝ YÊU THÍCH =====
  toggleFavorite(gameId) {
    const idx = this.favorites.indexOf(gameId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
      toast.show("Đã xóa khỏi Yêu thích", "info");
    } else {
      this.favorites.push(gameId);
      toast.show("Đã thêm vào Yêu thích!", "success");
    }
    localStorage.setItem('nexus_favs_v2', JSON.stringify(this.favorites));

    const favBtn = document.getElementById('btn-detail-fav');
    if (favBtn) favBtn.classList.toggle('active', this.favorites.includes(gameId));

    const libTitle = document.getElementById('library-title');
    if (libTitle && libTitle.innerText.includes('YÊU THÍCH')) {
      this.switchView('favorites');
    }
  },

  // ===== CHUYỂN VIEW (STORE / LIBRARY / FAVORITES) =====
  switchView(viewName) {
    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    const libTitle = document.getElementById('library-title');
    const container = document.getElementById('library-grid');

    if (viewName === 'store') {
      storeView.classList.add('active');
      libraryView.classList.remove('active');
      return;
    }

    storeView.classList.remove('active');
    libraryView.classList.add('active');

    // --- TRANG YÊU THÍCH ---
    if (viewName === 'favorites') {
      libTitle.innerText = "GAME YÊU THÍCH";
      const items = this.games.filter(g => this.favorites.includes(g.id));
      container.innerHTML = items.length ? items.map(item => `
        <div class="game-card" onclick="app.openGameDetail('${item.id}')">
          <div class="game-thumb" style="${item.coverImage ? `background-image:url('${item.coverImage}')` : `background:${item.coverColor}`}">
             <span class="game-badge badge-hot">❤️ YÊU THÍCH</span>${item.title}
          </div>
          <div class="game-info"><div class="game-title">${item.title}</div></div>
        </div>
      `).join('') : '<p style="text-align:center; grid-column:1/-1;">Chưa có game yêu thích.</p>';

    // --- TRANG THƯ VIỆN (ĐÃ MUA) ---
    } else {
      libTitle.innerText = "THƯ VIỆN BẢN QUYỀN";
      container.innerHTML = this.library.length ? this.library.map(item => `
        <div class="game-card">
          <div class="game-thumb" style="${item.coverImage ? `background-image:url('${item.coverImage}')` : `background:${item.coverColor}`}">
            <span class="game-badge badge-new">ĐÃ KÍCH HOẠT</span>${item.title}
          </div>
          <div class="game-info">
            <div class="game-title">${item.title}</div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem;">CD-Key:</p>
            <div style="font-family: monospace; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.8rem;">${item.cdKey}</div>
            <div class="game-actions">
              <button class="btn-primary" style="flex: 1;" onclick="app.playGame('${item.gameUrl || 'https://html-classic.itch.zone/html/18013330/index.html'}', '${item.title}')">▶ CHƠI NGAY</button>
            </div>
          </div>
        </div>
      `).join('') : '<p style="text-align:center; grid-column:1/-1;">Thư viện trống.</p>';
    }
  },

  resetToHome() {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-filter="all"]').forEach(b => b.classList.add('active'));
    this.switchView('store');
    filterModule.applyCategoryFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ===== CÁC HÀM GỌI TỪ HTML =====
  togglePublishModal: (show) => document.getElementById('modal-publish').classList.toggle('active', show),
  handleAvatarClick: () => { if (localStorage.getItem('nexus_is_logged_in') === 'true') toggleProfileDropdown(); else authModule.toggleModal(true); },
  toggleAuthModal: (show) => authModule.toggleModal(show),
  switchAuthTab: (tab) => authModule.switchTab(tab),
  handleLogin: (e) => authModule.handleLogin(e),
  handleRegister: (e) => authModule.handleRegister(e),
  openGameDetail: (id) => openDetailModal(id),
  closeDetailModal: () => closeDetailModal(),
  playGame: (url, title) => playGame(url, title),
  closePlayer: () => closePlayer(),
  reloadPlayer: () => reloadPlayer(),
  toggleFullScreen: () => toggleFullScreen(),
  depositMoney: (amount) => depositMoney(amount),
  changeUsername: () => changeUsername(),
  toggleProfileDropdown: () => toggleProfileDropdown()
};

window.addEventListener('DOMContentLoaded', () => app.init());