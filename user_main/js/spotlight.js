function renderSpotlight() {
  const container = document.getElementById('popular-spotlight');
  if (!container) return;
  
  const hotGames = app.games.filter(g => g.isHot);
  const topHero = hotGames[0] || app.games[0];
  if (!topHero) return;
  const sideGames = hotGames.slice(1, 5);

  container.innerHTML = `
    <div class="spotlight-hero" style="${buildThumbStyle(topHero)}" onclick="app.openGameDetail('${topHero.id}')">
      <span class="game-badge badge-top" style="position: absolute; top: 15px; left: 15px;">TOP 1 THỊNH HÀNH</span>
      <h3 style="font-family: 'Orbitron'; font-size: 1.6rem; margin-bottom: 0.4rem;">${topHero.title}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${topHero.desc}</p>
      <div style="display: flex; gap: 0.8rem;">
        <button class="btn-play-large" onclick="event.stopPropagation(); app.playGame('${topHero.gameUrl}', '${topHero.title}')">▶ CHƠI</button>
      </div>
    </div>
    <div class="spotlight-side-grid">
      ${sideGames.map(g => `
        <div class="game-card" onclick="app.openGameDetail('${g.id}')">
          <div class="game-thumb" style="${buildThumbStyle(g, '110px')}">
            <span class="game-badge badge-hot">HOT</span>${g.title}
          </div>
          <div class="game-info">
            <div class="game-title">${g.title}</div>
            <div class="game-stats"><span>★ ${g.rating}</span></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}