/**
 * js/app.js
 * Module điều phối chính: Render UI, Library, Spotlight CrazyGames, Modal & Player
 */

const app = {
  games: [],
  library: [],
  favorites: [],

  init() {
    // Khởi tạo Database vào LocalStorage
    if (!localStorage.getItem('nexus_games_v2')) {
      localStorage.setItem('nexus_games_v2', JSON.stringify(DEFAULT_GAMES_DATABASE));
    }
    this.games = JSON.parse(localStorage.getItem('nexus_games_v2'));
    this.library = JSON.parse(localStorage.getItem('nexus_library_v2')) || [];
    this.favorites = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];

    // Khởi tạo các module con
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
    hamburger.onclick = () => sidebar.classList.toggle('open');
  },

  // 2. Render Sidebar
  renderCategoriesSidebar() {
    const listEl = document.getElementById('category-list');
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

  // 5. Spotlight Section kiểu CrazyGames (1 Hero + 4 Side Cards)
  renderSpotlightSection() {
    const container = document.getElementById('popular-spotlight');
    const hotGames = this.games.filter(g => g.isHot);
    const topHero = hotGames[0] || this.games[0];
    const sideGames = hotGames.slice(1, 5);

    container.innerHTML = `
      <div class="spotlight-hero" style="background: ${topHero.coverColor};" onclick="app.openGameDetail('${topHero.id}')">
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
            <div class="game-thumb" style="background: ${g.coverColor}; height: 110px;">
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

  // 6. Grid Category Cards
  renderCategoryCardsGrid() {
    const grid = document.getElementById('category-cards-grid');
    const sampleCats = CATEGORIES_LIST.filter(c => c.slug !== 'all').slice(0, 6);

    grid.innerHTML = sampleCats.map(c => `
      <div class="category-card" onclick="filterModule.applyCategoryFilter('${c.slug}')">
        <div class="cat-card-icon">${c.icon}</div>
        <div class="cat-card-name">${c.name.split(' ')[0]}</div>
        <div class="cat-card-count">${this.games.filter(g => g.category === c.slug).length} Trò chơi</div>
      </div>
    `).join('');
  },

  // Lọc, sắp xếp và hiển thị ra Grid chính
  applyFiltersAndRender() {
    let result = [...this.games];

    // Lọc Sidebar Category
    if (filterModule.currentCategory !== 'all') {
      result = result.filter(g => g.category === filterModule.currentCategory);
    }

    // Lọc Navbar tab (Mới / Phổ biến)
    if (filterModule.currentNavFilter === 'isNew') {
      result = result.filter(g => g.isNew);
    } else if (filterModule.currentNavFilter === 'isHot') {
      result = result.filter(g => g.isHot);
    }

    // Tìm kiếm từ khóa realtime
    if (filterModule.searchKeyword) {
      result = result.filter(g => 
        g.title.toLowerCase().includes(filterModule.searchKeyword) ||
        g.category.toLowerCase().includes(filterModule.searchKeyword)
      );
    }

    // Sắp xếp
    if (filterModule.currentSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filterModule.currentSort === 'popular') {
      result.sort((a, b) => parseInt(b.playCount) - parseInt(a.playCount));
    } else if (filterModule.currentSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filterModule.currentSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    document.getElementById('results-count').innerText = `Tìm thấy ${result.length} trò chơi phù hợp`;
    this.renderGameGrid(result);
  },

  renderGameGrid(items) {
    const container = document.getElementById('game-grid');
    if (items.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Không tìm thấy tựa game nào phù hợp với yêu cầu.</p>';
      return;
    }

    container.innerHTML = items.map(g => `
      <div class="game-card" onclick="app.openGameDetail('${g.id}')">
        <div class="game-thumb" style="background: ${g.coverColor};">
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

    if (window.cursorEngine) {
      window.cursorEngine.bindHover();
    }
  },

  // 8. Modal Chi Tiết Game
  openGameDetail(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById('modal-detail');
    const headerCover = document.getElementById('detail-header-cover');
    headerCover.style.background = game.coverColor;

    document.getElementById('detail-title').innerText = game.title;
    document.getElementById('detail-category').innerText = `Thể loại: ${game.category}`;
    document.getElementById('detail-rating').innerText = `★ ${game.rating}`;
    document.getElementById('detail-plays').innerText = `👁 ${game.playCount} lượt chơi`;
    document.getElementById('detail-price').innerText = `$${game.price.toFixed(2)}`;
    document.getElementById('detail-desc').innerText = game.desc;

    // Screenshot gallery giả lập
    document.getElementById('detail-screenshots').innerHTML = [1, 2, 3].map(num => `
      <div class="screenshot-item" style="background: ${game.coverColor}; opacity: 0.85;">
        SCREENSHOT 0${num}
      </div>
    `).join('');

    // Nút hành động trong Modal
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
    document.getElementById('modal-detail').classList.remove('active');
  },

  // 9. Fullscreen Game Player
  playGame(url, title) {
    const player = document.getElementById('game-player');
    const iframe = document.getElementById('game-iframe');
    const titleEl = document.getElementById('player-game-title');
    const spinner = document.getElementById('player-spinner');

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
    iframe.src = '';
    player.classList.remove('active');
  },

  reloadPlayer() {
    const iframe = document.getElementById('game-iframe');
    iframe.src = iframe.src;
  },

  toggleFullScreen() {
    const player = document.getElementById('game-player');
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => toast.show("Không hỗ trợ fullscreen!", "error"));
    } else {
      document.exitFullscreen();
    }
  },

  // Mua game và cấp CD-Key vào Library
  handleBuy(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (this.library.some(item => item.gameId === gameId)) {
      toast.show("Bạn đã sở hữu tựa game này trong Thư viện!", "info");
      return;
    }

    const randomSeg = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    const cdKey = `NEXUS-${randomSeg()}-${randomSeg()}`;

    const newLicense = {
      libraryId: "lib-" + Date.now(),
      gameId: game.id,
      title: game.title,
      category: game.category,
      coverColor: game.coverColor,
      cdKey: cdKey,
      purchasedAt: new Date().toLocaleDateString('vi-VN')
    };

    this.library.unshift(newLicense);
    localStorage.setItem('nexus_library_v2', JSON.stringify(this.library));

    toast.show(`Mua thành công ${game.title}! CD-Key: ${cdKey}`, "success");
    this.closeDetailModal();
  },

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
    document.getElementById('btn-detail-fav').classList.toggle('active', this.favorites.includes(gameId));
  },

  // Chuyển đổi View giữa Store và Library
  switchView(viewName) {
    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    const libTitle = document.getElementById('library-title');

    if (viewName === 'store') {
      storeView.classList.add('active');
      libraryView.classList.remove('active');
      document.getElementById('tab-library-btn').classList.remove('active');
    } else {
      storeView.classList.remove('active');
      libraryView.classList.add('active');
      document.getElementById('tab-library-btn').classList.add('active');

      if (viewName === 'favorites') {
        libTitle.innerText = "DANH SÁCH GAME YÊU THÍCH";
        this.renderFavoritesGrid();
      } else {
        libTitle.innerText = "THƯ VIỆN BẢN QUYỀN CỦA BẠN";
        this.renderLibraryGrid();
      }
    }
  },

  renderLibraryGrid() {
    const container = document.getElementById('library-grid');
    if (this.library.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Thư viện chưa có game nào. Hãy dạo Store để sở hữu game đầu tiên!</p>';
      return;
    }

    container.innerHTML = this.library.map(item => `
      <div class="game-card">
        <div class="game-thumb" style="background: ${item.coverColor};">
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

  renderFavoritesGrid() {
    const container = document.getElementById('library-grid');
    const favGames = this.games.filter(g => this.favorites.includes(g.id));

    if (favGames.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Chưa có trò chơi nào trong mục yêu thích.</p>';
      return;
    }
    this.renderGameGrid(favGames);
  },

  // Modal Đăng bán game mới
  togglePublishModal(show) {
    document.getElementById('modal-publish').classList.toggle('active', show);
  },

  handlePublishSubmit(e) {
    e.preventDefault();
    const newGame = {
      id: "g-" + Date.now(),
      title: document.getElementById('pub-title').value,
      category: document.getElementById('pub-category').value,
      price: parseFloat(document.getElementById('pub-price').value),
      rating: 5.0,
      playCount: "1",
      coverColor: "linear-gradient(135deg, #00f0ff, #ff0055)",
      badge: "MỚI",
      isHot: false,
      isNew: true,
      desc: document.getElementById('pub-desc').value || "Mô tả trò chơi chưa cập nhật.",
      gameUrl: document.getElementById('pub-url').value || "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
    };

    this.games.unshift(newGame);
    localStorage.setItem('nexus_games_v2', JSON.stringify(this.games));

    toast.show("Đăng bán game thành công lên hệ thống!", "success");
    this.togglePublishModal(false);
    e.target.reset();
    this.applyFiltersAndRender();
  },

  resetToHome() {
    filterModule.currentCategory = 'all';
    filterModule.currentNavFilter = 'all';
    this.switchView('store');
    this.applyFiltersAndRender();
  },

  toggleProfileDropdown() {
    document.getElementById('profile-dropdown').classList.toggle('open');
  }
};

// Khởi chạy
window.addEventListener('DOMContentLoaded', () => app.init());