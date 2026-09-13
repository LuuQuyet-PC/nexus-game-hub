/**
 * js/filter.js - ĐIỀU PHỐI TÌM KIẾM, FILTER SIDEBAR/NAV VÀ SORT
 */
const filterModule = {
  currentCategory: 'all',
  currentNavFilter: 'all',
  currentSort: 'featured',
  searchKeyword: '',
  searchDebounceTimer: null,

  init() {
    const searchInput = document.getElementById('inp-search');
    const clearBtn = document.getElementById('btn-clear-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        const val = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

        this.searchDebounceTimer = setTimeout(() => {
          this.searchKeyword = val.toLowerCase();
          app.applyFiltersAndRender();
        }, 250);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        clearBtn.style.display = 'none';
        this.searchKeyword = '';
        app.applyFiltersAndRender();
      });
    }

    // Gắn sự kiện click cho các tab điều hướng trên Header
    document.querySelectorAll('.nav-item[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyNavFilter(btn.getAttribute('data-filter'));
      });
    });
  },

  // 1. Lọc theo thể loại (Sidebar hoặc Card thể loại)
  applyCategoryFilter(catSlug) {
    // 1. Cập nhật state
    this.currentCategory = catSlug;
    this.currentNavFilter = 'all';  // Reset nav filter khi chọn danh mục cụ thể
    this.currentSort = 'featured';   // Reset sort về mặc định

    // 2. Reset active trạng thái nav header về "Khám Phá"
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const discoverBtn = document.querySelector('.nav-item[data-filter="all"]');
    if (discoverBtn) discoverBtn.classList.add('active');

    // 3. Đổi active state cho danh mục sidebar
    document.querySelectorAll('.cat-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-cat') === catSlug);
    });

    // 4. Đảm bảo giao diện đang ở Store View
    app.switchView('store');

    // 5. Cập nhật tiêu đề section + ô chọn Sort
    const catObj = typeof CATEGORIES_LIST !== 'undefined' ? CATEGORIES_LIST.find(c => c.slug === catSlug) : null;
    const titleEl = document.getElementById('main-grid-title');
    if (titleEl) {
      titleEl.innerText = catSlug === 'all'
        ? 'TẤT CẢ TRÒ CHƠI'
        : `THỂ LOẠI: ${catObj ? catObj.name.toUpperCase() : catSlug.toUpperCase()}`;
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    // 6. Kích hoạt render lại grid game
    app.applyFiltersAndRender();

    // 7. Scroll mượt đến khu vực grid game
    const gridSection = document.getElementById('all-games-section');
    if (gridSection) {
      setTimeout(() => {
        gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    // 8. Tự động đóng sidebar trên mobile/tablet
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1200 && sidebar) {
      sidebar.classList.remove('open');
    }
  },

  // 2. Lọc theo Tab Nav (Mới Nhất / Phổ Biến / Khám Phá)
  applyNavFilter(navType) {
    this.currentNavFilter = navType;
    this.currentCategory = 'all';   // Reset category khi bấm tab điều hướng
    this.currentSort = 'featured';   // Reset sort

    // Reset sidebar active về "Tất cả"
    document.querySelectorAll('.cat-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-cat') === 'all');
    });

    app.switchView('store');

    const titleEl = document.getElementById('main-grid-title');
    if (titleEl) {
      const titles = {
        'all': 'TẤT CẢ TRÒ CHƠI',
        'isNew': 'TRÒ CHƠI MỚI NHẤT',
        'isHot': 'TRÒ CHƠI PHỔ BIẾN NHẤT'
      };
      titleEl.innerText = titles[navType] || 'TẤT CẢ TRÒ CHƠI';
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    app.applyFiltersAndRender();

    const gridSection = document.getElementById('all-games-section');
    if (gridSection && navType !== 'all') {
      setTimeout(() => {
        gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1200 && sidebar) {
      sidebar.classList.remove('open');
    }
  },

  handleSort(sortType) {
    this.currentSort = sortType;
    app.applyFiltersAndRender();
  }
};

window.filterModule = filterModule;