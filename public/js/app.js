/**
 * js/app.js
 * Module điều phối chính: Render UI, Library, Spotlight, Modal, Player & Profile
 */

const app = {
  games: [],
  library: [],
  favorites: [],

  init() {
    // ===== Khởi tạo Database =====
    if (!localStorage.getItem('nexus_games_v2')) {
      localStorage.setItem('nexus_games_v2', JSON.stringify(DEFAULT_GAMES_DATABASE));
    }
    this.games = JSON.parse(localStorage.getItem('nexus_games_v2'));
    this.library = JSON.parse(localStorage.getItem('nexus_library_v2')) || [];
    this.favorites = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];

    // ===== Khởi tạo ví tiền =====
    if (!localStorage.getItem('nexus_balance')) {
      localStorage.setItem('nexus_balance', '128.50');
    }
    const balanceEl = document.getElementById('profile-balance-display');
    if (balanceEl) {
      balanceEl.innerText = `$${parseFloat(localStorage.getItem('nexus_balance')).toFixed(2)}`;
    }

    // ===== Khởi tạo tên user =====
    if (!localStorage.getItem('nexus_username')) {
      localStorage.setItem('nexus_username', 'CyberRider_99');
    }
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) {
      usernameEl.innerText = localStorage.getItem('nexus_username');
    }
    this.updateAvatar();

    // ===== Khởi tạo các module con =====
    filterModule.init();
    heroCarousel.init(this.games);
    this.renderCategoriesSidebar();
    this.renderSpotlightSection();
    this.renderCategoryCardsGrid();
    this.applyFiltersAndRender();

    // Phím Esc đóng Player/Modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePlayer();
        this.closeDetailModal();
      }
    });

    // Mobile Hamburger
    const hamburger = document.getElementById('btn-hamburger');
    const sidebar = document.getElementById('sidebar');
    if (hamburger && sidebar) {
      hamburger.onclick = () => sidebar.classList.toggle('open');
    }
  },

  // ===== Helper: Tạo CSS background từ game =====
  buildThumbStyle(game, extraHeight) {
    const height = extraHeight ? `height: ${extraHeight};` : '';
    if (game.coverImage) {
      return `${height} background-image: url('${game.coverImage}'); background-size: cover; background-position: center;`;
    }
    return `${height} background: ${game.coverColor};`;
  },

  // ===== Cập nhật avatar theo tên user =====
  updateAvatar() {
    const avatarEl = document.getElementById('profile-avatar');
    if (!avatarEl) return;
    const name = localStorage.getItem('nexus_username') || 'CyberRider_99';
    const initials = name.replace(/[^A-Za-z0-9]/g, '').substring(0, 2).toUpperCase() || 'NX';
    avatarEl.innerText = initials;
  },

  // ===== Render Sidebar =====
  renderCategoriesSidebar() {
    const listEl = document.getElementById('category-list');
    if (!listEl) return;
    listEl.innerHTML = CATEGORIES_LIST.map(cat => {
      const count = cat.slug === 'all' 
        ? this.games.length 
        : this.games.filter(g => g.category === cat.slug).length;

      return `
        <li class="cat-item ${cat.slug === 'all' ? 'active' : ''}" data-cat="${cat.slug}" onclick="filterModule.applyCategoryFilter('${cat.slug}')">
          <div class="cat-item-left">
            <span class="cat-icon">${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
          <span class="cat-badge">${count}</span>
        </li>
      `;
    }).join('');
  },

  // ===== Spotlight Section =====
  renderSpotlightSection() {
    const container = document.getElementById('popular-spotlight');
    if (!container) return;
    
    const hotGames = this.games.filter(g => g.isHot);
    const topHero = hotGames[0] || this.games[0];
    if (!topHero) return;
    const sideGames = hotGames.slice(1, 5);

    container.innerHTML = `
      <div class="spotlight-hero" style="${this.buildThumbStyle(topHero)}" onclick="app.openGameDetail('${topHero.id}')">
        <span class="game-badge badge-top" style="position: absolute; top: 15px; left: 15px;">TOP 1 THỊNH HÀNH</span>
        <h3 style="font-family: 'Orbitron'; font-size: 1.6rem; margin-bottom: 0.4rem;">${topHero.title}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${topHero.desc}</p>
        <div style="display: flex; gap: 0.8rem;">
          <button class="btn-play-large" onclick="event.stopPropagation(); app.playGame('${topHero.gameUrl}', '${topHero.title}')">▶ CHƠI</button>
          <button class="btn-secondary-large" onclick="event.stopPropagation(); app.handleBuy('${topHero.id}')">MUA $${topHero.price}</button>
        </div>
      </div>
      <div class="spotlight-side-grid">
        ${sideGames.map(g => `
          <div class="game-card" onclick="app.openGameDetail('${g.id}')">
            <div class="game-thumb" style="${this.buildThumbStyle(g, '110px')}">
              <span class="game-badge badge-hot">HOT</span>
              ${g.title}
            </div>
            <div class="game-info">
              <div class="game-title">${g.title}</div>
              <div class="game-stats"><span>★ ${g.rating}</span><span>👁 ${g.playCount}</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ===== Category Cards =====
  renderCategoryCardsGrid() {
    const grid = document.getElementById('category-cards-grid');
    if (!grid) return;
    
    const sampleCats = CATEGORIES_LIST.filter(c => c.slug !== 'all').slice(0, 6);

    grid.innerHTML = sampleCats.map(c => `
      <div class="category-card" onclick="filterModule.applyCategoryFilter('${c.slug}')">
        <div class="cat-card-icon">${c.icon}</div>
        <div class="cat-card-name">${c.name.split(' ')[0]}</div>
        <div class="cat-card-count">${this.games.filter(g => g.category === c.slug).length} Trò chơi</div>
      </div>
    `).join('');
  },

  // ===== Filter + Render =====
  applyFiltersAndRender() {
    let result = [...this.games];

    if (filterModule.currentCategory !== 'all') {
      result = result.filter(g => g.category === filterModule.currentCategory);
    }

    if (filterModule.currentNavFilter === 'isNew') {
      result = result.filter(g => g.isNew);
    } else if (filterModule.currentNavFilter === 'isHot') {
      result = result.filter(g => g.isHot);
    }

    if (filterModule.searchKeyword) {
      result = result.filter(g => 
        g.title.toLowerCase().includes(filterModule.searchKeyword) ||
        g.category.toLowerCase().includes(filterModule.searchKeyword)
      );
    }

    if (filterModule.currentSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filterModule.currentSort === 'popular') {
      result.sort((a, b) => parseInt(b.playCount) - parseInt(a.playCount));
    } else if (filterModule.currentSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filterModule.currentSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    const countEl = document.getElementById('results-count');
    if (countEl) countEl.innerText = `Tìm thấy ${result.length} trò chơi phù hợp`;
    this.renderGameGrid(result);
  },

  // ===== Render Grid Game =====
  renderGameGrid(items) {
    const container = document.getElementById('game-grid');
    if (!container) return;
    
    if (items.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Không tìm thấy tựa game nào phù hợp với yêu cầu.</p>';
      return;
    }

    container.innerHTML = items.map(g => `
      <div class="game-card" onclick="app.openGameDetail('${g.id}')">
        <div class="game-thumb" style="${this.buildThumbStyle(g)}">
          <span class="game-badge badge-${g.badge === 'HOT' ? 'hot' : g.badge === 'MỚI' ? 'new' : 'top'}">${g.badge}</span>
          <div class="thumb-overlay">
            <div class="play-bubble-btn">▶</div>
            <span style="font-size: 0.8rem; font-weight: 700;">CHƠI NGAY</span>
          </div>
          ${g.title}
        </div>
        <div class="game-info">
          <div class="game-title">${g.title}</div>
          <div class="game-stats">
            <span>★ ${g.rating}</span>
            <span>👁 ${g.playCount}</span>
          </div>
          <div class="game-actions" onclick="event.stopPropagation()">
            <button class="btn-card-buy" onclick="app.handleBuy('${g.id}')">MUA $${g.price.toFixed(2)}</button>
            <button class="btn-card-demo" onclick="app.playGame('${g.gameUrl}', '${g.title}')">CHƠI THỬ</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // ===== Modal Chi Tiết =====
  openGameDetail(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById('modal-detail');
    const headerCover = document.getElementById('detail-header-cover');
    if (!modal || !headerCover) return;
    
    if (game.coverImage) {
      headerCover.style.background = '';
      headerCover.style.backgroundImage = `url('${game.coverImage}')`;
      headerCover.style.backgroundSize = 'cover';
      headerCover.style.backgroundPosition = 'center';
    } else {
      headerCover.style.backgroundImage = '';
      headerCover.style.background = game.coverColor;
    }

    document.getElementById('detail-title').innerText = game.title;
    document.getElementById('detail-category').innerText = `Thể loại: ${game.category}`;
    document.getElementById('detail-rating').innerText = `★ ${game.rating}`;
    document.getElementById('detail-plays').innerText = `👁 ${game.playCount} lượt chơi`;
    document.getElementById('detail-price').innerText = `$${game.price.toFixed(2)}`;
    document.getElementById('detail-desc').innerText = game.desc;

    document.getElementById('detail-screenshots').innerHTML = [1, 2, 3].map(num => `
      <div class="screenshot-item" style="background: ${game.coverColor}; opacity: 0.85;">
        SCREENSHOT 0${num}
      </div>
    `).join('');

    document.getElementById('btn-detail-play').onclick = () => {
      this.closeDetailModal();
      this.playGame(game.gameUrl, game.title);
    };

    document.getElementById('btn-detail-buy').onclick = () => {
      this.handleBuy(game.id);
    };

    const favBtn = document.getElementById('btn-detail-fav');
    favBtn.classList.toggle('active', this.favorites.includes(game.id));
    favBtn.onclick = () => this.toggleFavorite(game.id);

    modal.classList.add('active');
  },

  closeDetailModal() {
    const modal = document.getElementById('modal-detail');
    if (modal) modal.classList.remove('active');
  },

  // ===== Game Player =====
  playGame(url, title) {
    const player = document.getElementById('game-player');
    const iframe = document.getElementById('game-iframe');
    const titleEl = document.getElementById('player-game-title');
    const spinner = document.getElementById('player-spinner');
    
    if (!player || !iframe) return;

    titleEl.innerText = title;
    spinner.style.display = 'flex';
    iframe.style.opacity = '0';
    iframe.src = url;

    iframe.onload = () => {
      spinner.style.display = 'none';
      iframe.style.opacity = '1';
    };

    player.classList.add('active');
  },

  closePlayer() {
    const player = document.getElementById('game-player');
    const iframe = document.getElementById('game-iframe');
    if (iframe) iframe.src = '';
    if (player) player.classList.remove('active');
  },

  reloadPlayer() {
    const iframe = document.getElementById('game-iframe');
    if (iframe) iframe.src = iframe.src;
  },

  toggleFullScreen() {
    const player = document.getElementById('game-player');
    if (!player) return;
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => toast.show("Không hỗ trợ fullscreen!", "error"));
    } else {
      document.exitFullscreen();
    }
  },

  // ===== Mua game =====
  handleBuy(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (this.library.some(item => item.gameId === gameId)) {
      toast.show("Bạn đã sở hữu tựa game này trong Thư viện!", "info");
      return;
    }

    if (game.price > 0) {
      let balance = parseFloat(localStorage.getItem('nexus_balance') || '0');
      if (balance < game.price) {
        toast.show(`Số dư không đủ! Cần $${game.price.toFixed(2)}, hiện có $${balance.toFixed(2)}`, "error");
        return;
      }
      balance -= game.price;
      localStorage.setItem('nexus_balance', balance.toFixed(2));
      const balanceEl = document.getElementById('profile-balance-display');
      if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
    }

    const randomSeg = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    const cdKey = `NEXUS-${randomSeg()}-${randomSeg()}`;

    const newLicense = {
      libraryId: "lib-" + Date.now(),
      gameId: game.id,
      title: game.title,
      category: game.category,
      coverColor: game.coverColor,
      coverImage: game.coverImage || "",
      cdKey: cdKey,
      purchasedAt: new Date().toLocaleDateString('vi-VN')
    };

    this.library.unshift(newLicense);
    localStorage.setItem('nexus_library_v2', JSON.stringify(this.library));

    toast.show(`Mua thành công ${game.title}! CD-Key: ${cdKey}`, "success");
    this.closeDetailModal();

    const libraryView = document.getElementById('library-view');
    if (libraryView && libraryView.classList.contains('active')) {
      const libTitle = document.getElementById('library-title');
      if (libTitle && libTitle.innerText.includes('YÊU THÍCH')) {
        this.renderFavoritesGrid();
      } else {
        this.renderLibraryGrid();
      }
    }
  },

  // ===== Yêu thích =====
  toggleFavorite(gameId) {
    const idx = this.favorites.indexOf(gameId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
      toast.show("Đã xóa khỏi danh sách yêu thích", "info");
    } else {
      this.favorites.push(gameId);
      toast.show("Đã thêm vào danh sách yêu thích!", "success");
    }
    localStorage.setItem('nexus_favs_v2', JSON.stringify(this.favorites));
    
    const favBtn = document.getElementById('btn-detail-fav');
    if (favBtn) favBtn.classList.toggle('active', this.favorites.includes(gameId));

    const libraryView = document.getElementById('library-view');
    if (libraryView && libraryView.classList.contains('active')) {
      const libTitle = document.getElementById('library-title');
      if (libTitle && libTitle.innerText.includes('YÊU THÍCH')) {
        this.renderFavoritesGrid();
      }
    }
  },

  // ===== Chuyển View =====
  switchView(viewName) {
    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    const libTitle = document.getElementById('library-title');

    if (!storeView || !libraryView) return;

    if (viewName === 'store') {
      storeView.classList.add('active');
      libraryView.classList.remove('active');
      const tabBtn = document.getElementById('tab-library-btn');
      if (tabBtn) tabBtn.classList.remove('active');
    } else {
      storeView.classList.remove('active');
      libraryView.classList.add('active');
      const tabBtn = document.getElementById('tab-library-btn');
      if (tabBtn) tabBtn.classList.add('active');

      if (viewName === 'favorites') {
        libTitle.innerText = "DANH SÁCH GAME YÊU THÍCH";
        this.renderFavoritesGrid();
      } else {
        libTitle.innerText = "THƯ VIỆN BẢN QUYỀN CỦA BẠN";
        this.renderLibraryGrid();
      }
    }
  },

  // ===== Render Library =====
  renderLibraryGrid() {
    const container = document.getElementById('library-grid');
    if (!container) return;
    
    if (this.library.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Thư viện chưa có game nào. Hãy dạo Store để sở hữu game đầu tiên!</p>';
      return;
    }

    container.innerHTML = this.library.map(item => `
      <div class="game-card">
        <div class="game-thumb" style="${this.buildThumbStyle(item)}">
          <span class="game-badge badge-new">ĐÃ KÍCH HOẠT</span>
          ${item.title}
        </div>
        <div class="game-info">
          <div class="game-title">${item.title}</div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem;">CD-Key Bản Quyền:</p>
          <div style="font-family: monospace; color: var(--accent-cyan); font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 0.8rem;">
            ${item.cdKey}
          </div>
          <div class="game-actions">
            <button class="btn-primary" style="flex: 1; padding: 0.4rem;" onclick="toast.show('Đang khởi tạo trình tải xuống...', 'info')">TẢI VỀ</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // ===== Render Favorites =====
  renderFavoritesGrid() {
    const container = document.getElementById('library-grid');
    if (!container) return;
    
    const favGames = this.games.filter(g => this.favorites.includes(g.id));

    if (favGames.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Chưa có trò chơi nào trong mục yêu thích. Bấm ❤️ trên game để thêm.</p>';
      return;
    }

    container.innerHTML = favGames.map(g => `
      <div class="game-card" onclick="app.openGameDetail('${g.id}')">
        <div class="game-thumb" style="${this.buildThumbStyle(g)}">
          <span class="game-badge badge-hot">❤️ YÊU THÍCH</span>
          <div class="thumb-overlay">
            <div class="play-bubble-btn">▶</div>
            <span style="font-size: 0.8rem; font-weight: 700;">CHƠI NGAY</span>
          </div>
          ${g.title}
        </div>
        <div class="game-info">
          <div class="game-title">${g.title}</div>
          <div class="game-stats">
            <span>★ ${g.rating}</span>
            <span>👁 ${g.playCount}</span>
          </div>
          <div class="game-actions" onclick="event.stopPropagation()">
            <button class="btn-card-buy" onclick="app.handleBuy('${g.id}')">MUA $${g.price.toFixed(2)}</button>
            <button class="btn-card-demo" onclick="app.playGame('${g.gameUrl}', '${g.title}')">CHƠI THỬ</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // ===== Modal Đăng Bán =====
  togglePublishModal(show) {
    const modal = document.getElementById('modal-publish');
    if (modal) modal.classList.toggle('active', show);
  },

  handlePublishSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('pub-title').value.trim();
    const category = document.getElementById('pub-category').value;
    const price = parseFloat(document.getElementById('pub-price').value);
    const urlInput = document.getElementById('pub-url').value.trim();
    const desc = document.getElementById('pub-desc').value.trim();
    
    if (!title) {
      toast.show('Vui lòng nhập tên game!', 'error');
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.show('Giá không hợp lệ!', 'error');
      return;
    }
    if (urlInput) {
      try { new URL(urlInput); } 
      catch { 
        toast.show('URL game không hợp lệ!', 'error'); 
        return; 
      }
    }
    
    const fallbackUrl = "https://html-classic.itch.zone/html/18013330/index.html";
    
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
      gameUrl: urlInput || fallbackUrl
    };

    this.games.unshift(newGame);
    localStorage.setItem('nexus_games_v2', JSON.stringify(this.games));

    toast.show(`Đã đăng bán "${title}" thành công!`, "success");
    this.togglePublishModal(false);
    e.target.reset();

    filterModule.currentCategory = 'all';
    filterModule.currentNavFilter = 'all';
    filterModule.searchKeyword = '';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const discoverBtn = document.querySelector('.nav-item[data-filter="all"]');
    if (discoverBtn) discoverBtn.classList.add('active');

    this.switchView('store');
    this.renderCategoriesSidebar();
    this.renderCategoryCardsGrid();
    heroCarousel.init(this.games);
    this.applyFiltersAndRender();

    setTimeout(() => {
      const gridSection = document.getElementById('all-games-section');
      if (gridSection) {
        gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  },

  // ===== Nạp tiền ví =====
  depositMoney(amount) {
    let balance = parseFloat(localStorage.getItem('nexus_balance') || '0');
    balance += amount;
    localStorage.setItem('nexus_balance', balance.toFixed(2));
    
    const balanceEl = document.getElementById('profile-balance-display');
    if (balanceEl) balanceEl.innerText = `$${balance.toFixed(2)}`;
    
    toast.show(`Đã nạp thành công $${amount.toFixed(2)}! Số dư: $${balance.toFixed(2)}`, "success");
  },

  // ===== Đổi tên user =====
  changeUsername() {
    const current = localStorage.getItem('nexus_username') || 'CyberRider_99';
    const newName = prompt('Nhập tên hiển thị mới:', current);
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      localStorage.setItem('nexus_username', trimmed);
      const usernameEl = document.getElementById('profile-username');
      if (usernameEl) usernameEl.innerText = trimmed;
      this.updateAvatar();
      toast.show(`Đã đổi tên thành "${trimmed}"`, "success");
    }
  },

  // ===== Khác =====
  resetToHome() {
    filterModule.currentCategory = 'all';
    filterModule.currentNavFilter = 'all';
    filterModule.searchKeyword = '';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const discoverBtn = document.querySelector('.nav-item[data-filter="all"]');
    if (discoverBtn) discoverBtn.classList.add('active');
    this.switchView('store');
    this.applyFiltersAndRender();
  },

  toggleProfileDropdown() {
    const dd = document.getElementById('profile-dropdown');
    if (dd) dd.classList.toggle('open');
  }
};

// Khởi chạy
window.addEventListener('DOMContentLoaded', () => app.init());