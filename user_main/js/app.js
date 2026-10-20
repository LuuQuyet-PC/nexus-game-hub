const app = {
  games: [],
  library: [],
  favorites: [],

  init() {
    if (!localStorage.getItem('nexus_accounts')) {
      if (typeof DEFAULT_ACCOUNTS !== 'undefined') {
        localStorage.setItem('nexus_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      }
    }

  
    if (typeof DEFAULT_GAMES_DATABASE !== 'undefined') this.games = DEFAULT_GAMES_DATABASE;
    this.library = JSON.parse(localStorage.getItem('nexus_library_v2')) || [];
    this.favorites = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];
    
    if (!localStorage.getItem('nexus_balance')) localStorage.setItem('nexus_balance', '128.50');
    if (!localStorage.getItem('nexus_username')) localStorage.setItem('nexus_username', 'Khách');

    
    
    // Kiểm tra đăng nhập và TỰ ĐỘNG MỞ FORM NẾU CHƯA ĐĂNG NHẬP
    if (typeof window.authModule !== 'undefined') {
      window.authModule.checkLogin();
      if (localStorage.getItem('nexus_is_logged_in') !== 'true') {
        // Đợi 0.5s để DOM load xong hoàn toàn rồi mới bật form
        setTimeout(() => window.authModule.toggleModal(true), 500);
      }
    }

    renderSidebar();
    renderSpotlight();
    renderCategoryCards();
    this.applyFiltersAndRender(); // hàm học và vẽ grid
    
    if (typeof heroCarousel !== 'undefined') heroCarousel.init(this.games);
    filterModule.init();

    // Bắt sự kiện tìm kiếm
    const searchInput = document.getElementById('inp-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          filterModule.searchKeyword = e.target.value.trim().toLowerCase();
          this.applyFiltersAndRender();
        }, 300);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePlayer(); closeDetailModal(); }
    });
  },

  // HÀM MỚI: Kiểm tra đăng nhập trước khi thực hiện hành động
  requireLogin(callback) {
    if (localStorage.getItem('nexus_is_logged_in') === 'true') {
      if (callback) callback();
      return true;
    } else {
      if (typeof window.authModule !== 'undefined') {
        window.authModule.toggleModal(true);
      }
      // Hiện thông báo nhỏ
      if (typeof toast !== 'undefined') toast.show("Vui lòng đăng nhập để thực hiện chức năng này!", "error");
      return false;
    }
  },

  scrollToGames() {
    const gridSection = document.getElementById('all-games-section');
    if (gridSection) setTimeout(() => gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  },

    applyFiltersAndRender() {
    let result = [...this.games];
    
    // Lọc theo thể loại (Sidebar)
    if (filterModule.currentCategory !== 'all') {
      result = result.filter(g => g.category === filterModule.currentCategory);
    }
    
    // Lọc theo Navbar (Mới nhất, Phổ biến)
    if (filterModule.currentNavFilter === 'isNew') result = result.filter(g => g.isNew);
    else if (filterModule.currentNavFilter === 'isHot') result = result.filter(g => g.isHot);
    
    // ==========================================
    // NÂNG CẤP TÌM KIẾM MỜ (FUZZY SEARCH)
    // ==========================================
    if (filterModule.searchKeyword) {
      const keyword = filterModule.searchKeyword;
      
      // Từ điển ánh xạ tiếng Việt sang tiếng Anh
      const categoryMap = {
        'bắn súng': 'Shooting', 'súng': 'Shooting', 'bắn': 'Shooting',
        'hành động': 'Action', 'hành': 'Action', 'chiến đấu': 'Action',
        'đua xe': 'Racing', 'đua': 'Racing', 'xe': 'Racing', 'tốc độ': 'Racing',
        'nhập vai': 'RPG', 'vai': 'RPG', 'nhập': 'RPG',
        'chiến thuật': 'Strategy', 'thuật': 'Strategy',
        'trí tuệ': 'Puzzle', 'giải đố': 'Puzzle', 'đố': 'Puzzle',
        'thể thao': 'Sports', 'thao': 'Sports', 'bóng đá': 'Sports', 'bóng': 'Sports',
        'kinh dị': 'Horror', 'sợ': 'Horror', 'ma': 'Horror', 'quái': 'Horror',
        '2 người': '2 Player', '2p': '2 Player',
        'casual': 'Casual', 'giải trí': 'Casual', 'nhẹ nhàng': 'Casual',
        'io': '.io'
      };

      // 1. Tìm xem từ khóa mày gõ có khớp với từ điển không
      let searchCategory = '';
      for (const [viKey, enCategory] of Object.entries(categoryMap)) {
        if (keyword.includes(viKey)) {
          searchCategory = enCategory;
          break;
        }
      }

      // 2. Tiến hành lọc mờ: Tách từ khóa thành các từ nhỏ và tìm
      const searchTerms = keyword.split(' '); 

      result = result.filter(g => {
        const title = g.title.toLowerCase();
        const cat = g.category.toLowerCase();
        
        // Khớp theo tên hoặc thể loại tiếng Anh
        const matchTitleOrCat = searchTerms.some(term => title.includes(term) || cat.includes(term));
        
        // Khớp theo từ điển tiếng Việt
        const matchViCat = searchCategory && g.category === searchCategory;

        return matchTitleOrCat || matchViCat;
      });
    }
    // ==========================================

    // Sắp xếp
    if (filterModule.currentSort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (filterModule.currentSort === 'popular') result.sort((a, b) => parseInt(b.playCount) - parseInt(a.playCount));
    else if (filterModule.currentSort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filterModule.currentSort === 'price-desc') result.sort((a, b) => b.price - a.price);

    const countEl = document.getElementById('results-count');
    if (countEl) countEl.innerText = `Tìm thấy ${result.length} trò chơi phù hợp`;
    
    renderGameGrid(result);
  },

  handleBuy(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game || this.library.some(item => item.gameId === gameId)) { toast.show("Bạn đã sở hữu tựa game này!", "info"); return; }
    
    if (game.price > 0) {
      let balance = parseFloat(localStorage.getItem('nexus_balance') || '0');
      if (balance < game.price) { toast.show(`Số dư không đủ!`, "error"); return; }
      balance -= game.price; localStorage.setItem('nexus_balance', balance.toFixed(2));
      document.getElementById('profile-balance-display').innerText = `$${balance.toFixed(2)}`;
    }

    const cdKey = `NEXUS-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.library.unshift({ libraryId: "lib-" + Date.now(), gameId: game.id, title: game.title, coverImage: game.coverImage || "", coverColor: game.coverColor, cdKey: cdKey });
    localStorage.setItem('nexus_library_v2', JSON.stringify(this.library));
    
    toast.show(`Mua thành công!`, "success");
    closeDetailModal();
  },

  switchView(viewName) {
    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    
    if (viewName === 'store') {
      storeView.classList.add('active'); libraryView.classList.remove('active');
    } else {
      storeView.classList.remove('active'); libraryView.classList.add('active');
      document.getElementById('library-title').innerText = viewName === 'favorites' ? "GAME YÊU THÍCH" : "THƯ VIỆN";
      const container = document.getElementById('library-grid');
      const items = viewName === 'favorites' ? this.games.filter(g => this.favorites.includes(g.id)) : this.library;
      container.innerHTML = items.length ? items.map(item => `
        <div class="game-card"><div class="game-thumb" style="${item.coverImage ? `background-image:url('${item.coverImage}')` : `background:${item.coverColor}`}">${item.title}</div><div class="game-info"><div class="game-title">${item.title}</div></div></div>
      `).join('') : '<p style="text-align:center; grid-column:1/-1;">Trống.</p>';
    }
  },
  
  resetToHome() {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-filter="all"]').forEach(b => b.classList.add('active'));
    this.switchView('store');
    filterModule.applyCategoryFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  },

  togglePublishModal: (show) => document.getElementById('modal-publish').classList.toggle('active', show),
  handlePublishSubmit: (e) => { e.preventDefault(); toast.show("Đang phát triển", "info"); app.togglePublishModal(false); },
  handleAvatarClick: () => { if(localStorage.getItem('nexus_is_logged_in') === 'true') toggleProfileDropdown(); else authModule.toggleModal(true); },
  toggleAuthModal: (show) => authModule.toggleModal(show),
  switchAuthTab: (tab) => authModule.switchTab(tab),
  handleLogin: (e) => authModule.handleLogin(e),
  handleRegister: (e) => authModule.handleRegister(e),
  
  // Nối các hàm từ file khác vào object app để HTML gọi được
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