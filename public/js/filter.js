/**
 * js/filter.js
 * Xử lý Debounce Search, lọc theo Category, và sắp xếp Sort
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

    searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchDebounceTimer);
      const val = e.target.value.trim();
      clearBtn.style.display = val ? 'block' : 'none';

      this.searchDebounceTimer = setTimeout(() => {
        this.searchKeyword = val.toLowerCase();
        app.applyFiltersAndRender();
      }, 300);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      this.searchKeyword = '';
      app.applyFiltersAndRender();
    });

    document.querySelectorAll('.nav-item[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyNavFilter(btn.getAttribute('data-filter'));
      });
    });
  },

  applyCategoryFilter(catSlug) {
    this.currentCategory = catSlug;
    document.querySelectorAll('.cat-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-cat') === catSlug);
    });
    app.switchView('store');
    app.applyFiltersAndRender();
  },

  applyNavFilter(navType) {
    this.currentNavFilter = navType;
    app.switchView('store');
    app.applyFiltersAndRender();
  },

  handleSort(sortType) {
    this.currentSort = sortType;
    app.applyFiltersAndRender();
  }
};