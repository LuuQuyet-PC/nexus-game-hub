function renderGameGrid(items) {
  const container = document.getElementById('game-grid');
  if (!container) return;
  
  if (items.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Không tìm thấy tựa game nào phù hợp.</p>';
    return;
  }

  container.innerHTML = items.map(g => `
    <div class="game-card" onclick="app.openGameDetail('${g.id}')">
      <div class="game-thumb" style="${buildThumbStyle(g)}">
        <span class="game-badge badge-${g.badge === 'HOT' ? 'hot' : g.badge === 'MỚI' ? 'new' : 'top'}">${g.badge}</span>
        ${g.title}
      </div>
      <div class="game-info">
        <div class="game-title">${g.title}</div>
        <div class="game-stats"><span>★ ${g.rating}</span><span>👁 ${g.playCount}</span></div>
        <div class="game-actions" onclick="event.stopPropagation()">
          <button class="btn-card-buy" onclick="event.stopPropagation(); app.requireLogin(() => app.handleBuy('${g.id}'))">MUA $${g.price.toFixed(2)}</button>
          <button class="btn-card-demo" onclick="app.playGame('${g.gameUrl}', '${g.title}')">CHƠI THỬ</button>
        </div>
      </div>
    </div>
  `).join('');
}