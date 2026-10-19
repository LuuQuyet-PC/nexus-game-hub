
function openDetailModal(gameId) {
  const game = app.games.find(g => g.id === gameId);
  if (!game) return;

  const modal = document.getElementById('modal-detail');
  const headerCover = document.getElementById('detail-header-cover');

  if (!modal || !headerCover) return;

  // Hiển thị ảnh bìa game
  if (game.coverImage) {
    headerCover.style.backgroundImage = `url('${game.coverImage}')`;
    headerCover.style.backgroundSize = 'cover';
    headerCover.style.backgroundPosition = 'center';
  } else {
    headerCover.style.backgroundImage = 'none';
    headerCover.style.background = game.coverColor || '#222';
  }

  // Cập nhật thông tin game
  const title = document.getElementById('detail-title');
  const category = document.getElementById('detail-category');
  const rating = document.getElementById('detail-rating');
  const plays = document.getElementById('detail-plays');
  const price = document.getElementById('detail-price');
  const desc = document.getElementById('detail-desc');

  if (title) title.innerText = game.title;
  if (category) category.innerText = game.category;
  if (rating) rating.innerText = `★ ${game.rating}`;
  if (plays) plays.innerText = `👁 ${game.playCount}`;
  if (price) price.innerText = `$${Number(game.price || 0).toFixed(2)}`;
  if (desc) desc.innerText = game.desc || '';

  // Nút chơi game
  const playBtn = document.getElementById('btn-detail-play');

  if (playBtn) {
    playBtn.onclick = () => {
      closeDetailModal();
      app.playGame(game.gameUrl, game.title);
    };
  }

  // Nút mua game: yêu cầu đăng nhập
  const buyBtn = document.getElementById('btn-detail-buy');

  if (buyBtn) {
    buyBtn.onclick = () => {
      app.requireLogin(() => {
        app.handleBuy(game.id);
      });
    };
  }

  // Nút yêu thích: yêu cầu đăng nhập
  const favBtn = document.getElementById('btn-detail-fav');

  if (favBtn) {
    favBtn.onclick = () => {
      app.requireLogin(() => {
        app.toggleFavorite(game.id);
      });
    };
  }

  // Hiển thị modal
  modal.classList.add('active');
}


// Đóng modal chi tiết game
function closeDetailModal() {
  const modal = document.getElementById('modal-detail');

  if (modal) {
    modal.classList.remove('active');
  }
}


// Gắn các hàm vào app để những file khác có thể gọi
if (typeof app !== 'undefined') {
  app.openDetailModal = openDetailModal;
  app.closeDetailModal = closeDetailModal;
}
