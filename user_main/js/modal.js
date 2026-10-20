function openDetailModal(gameId) {
  const game = app.games.find(g => g.id === gameId);
  if (!game) return;

  const modal = document.getElementById('modal-detail');
  const headerCover = document.getElementById('detail-header-cover');
  if (!modal || !headerCover) return;
  
  if (game.coverImage) {
    headerCover.style.backgroundImage = `url('${game.coverImage}')`;
    headerCover.style.backgroundSize = 'cover';
    headerCover.style.backgroundPosition = 'center';
  } else {
    headerCover.style.backgroundImage = 'none';
    headerCover.style.background = game.coverColor;
  }

  document.getElementById('detail-title').innerText = game.title;
  document.getElementById('detail-category').innerText = `Thể loại: ${game.category}`;
  document.getElementById('detail-rating').innerText = `★ ${game.rating}`;
  document.getElementById('detail-plays').innerText = `👁 ${game.playCount} lượt chơi`;
  document.getElementById('detail-price').innerText = `$${Number(game.price || 0).toFixed(2)}`;
  document.getElementById('detail-desc').innerText = game.desc;

  document.getElementById('detail-screenshots').innerHTML = [1, 2, 3].map(num => `
    <div class="screenshot-item" style="background: ${game.coverColor}; opacity: 0.85;">SCREENSHOT 0${num}</div>
  `).join('');

  document.getElementById('btn-detail-play').onclick = () => {
    closeDetailModal();
    app.playGame(game.gameUrl, game.title);
  };

  document.getElementById('btn-detail-buy').onclick = () => {
    app.requireLogin(() => app.handleBuy(game.id));
  };

  const favBtn = document.getElementById('btn-detail-fav');
  if (favBtn) {
    favBtn.classList.toggle('active', app.favorites.includes(game.id));
    favBtn.onclick = () => app.requireLogin(() => app.toggleFavorite(game.id));
  }

  modal.classList.add('active');
}

function closeDetailModal() {
  const modal = document.getElementById('modal-detail');
  if (modal) modal.classList.remove('active');
}

if (typeof app !== 'undefined') {
  app.openDetailModal = openDetailModal;
  app.closeDetailModal = closeDetailModal;
}