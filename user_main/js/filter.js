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

    document.querySelectorAll('.nav-item[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyNavFilter(btn.getAttribute('data-filter'));
      });
    });
  },

  applyCategoryFilter(catSlug) {
    this.currentCategory = catSlug;
    this.currentNavFilter = 'all';
    this.currentSort = 'featured';

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cat-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-cat') === catSlug);
    });

    app.switchView('store');

    const catObj = typeof CATEGORIES_LIST !== 'undefined' ? CATEGORIES_LIST.find(c => c.slug === catSlug) : null;
    const titleEl = document.getElementById('main-grid-title');
    if (titleEl) {
      titleEl.innerText = catSlug === 'all' ? 'TẤT CẢ TRÒ CHƠI' : `THỂ LOẠI: ${catObj ? catObj.name.toUpperCase() : catSlug.toUpperCase()}`;
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    app.applyFiltersAndRender();
    app.scrollToGames();
    if (window.innerWidth < 1200) document.getElementById('sidebar').classList.remove('open');
  },

  applyNavFilter(navType) {
    this.currentNavFilter = navType;
    this.currentCategory = 'all';
    this.currentSort = 'featured';

    document.querySelectorAll('.cat-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-cat') === 'all');
    });

    app.switchView('store');

    const titleEl = document.getElementById('main-grid-title');
    if (titleEl) {
      const titles = { 'all': 'TẤT CẢ TRÒ CHƠI', 'isNew': 'TRÒ CHƠI MỚI NHẤT', 'isHot': 'TRÒ CHƠI PHỔ BIẾN NHẤT' };
      titleEl.innerText = titles[navType] || 'TẤT CẢ TRÒ CHƠI';
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    app.applyFiltersAndRender();
    app.scrollToGames();
    if (window.innerWidth < 1200) document.getElementById('sidebar').classList.remove('open');
  },

  handleSort(sortType) {
    this.currentSort = sortType;
    app.applyFiltersAndRender();
  }
};

window.filterModule = filterModule;