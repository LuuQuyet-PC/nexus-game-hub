const menuButton = document.getElementById('btn-hamburger');
const sideBar = document.getElementById('sidebar');

if (menuButton && sideBar) {
  menuButton.addEventListener('click', () => sideBar.classList.toggle('open'));
}

function renderSidebar() {
  const listEl = document.getElementById('category-list');
  if (!listEl || typeof CATEGORIES_LIST === 'undefined') return;
  
  listEl.innerHTML = CATEGORIES_LIST.map(cat => {
    const count = cat.slug === 'all' ? app.games.length : app.games.filter(g => g.category === cat.slug).length;
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
}