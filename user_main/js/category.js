function renderCategoryCards() {
  const grid = document.getElementById('category-cards-grid');
  if (!grid) return;
  const sampleCats = CATEGORIES_LIST.filter(c => c.slug !== 'all').slice(0, 6);
  grid.innerHTML = sampleCats.map(c => `
    <div class="category-card" onclick="filterModule.applyCategoryFilter('${c.slug}')">
      <div class="cat-card-icon">${c.icon}</div>
      <div class="cat-card-name">${c.name.split(' ')[0]}</div>
      <div class="cat-card-count">${app.games.filter(g => g.category === c.slug).length} Trò chơi</div>
    </div>
  `).join('');
}