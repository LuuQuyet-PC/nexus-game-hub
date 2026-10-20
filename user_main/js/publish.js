function togglePublishModal(show) {
  const modal = document.getElementById('modal-publish');
  if (modal) modal.classList.toggle('active', show);
}

function handlePublishSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('pub-title').value.trim();
  const category = document.getElementById('pub-category').value;
  const price = parseFloat(document.getElementById('pub-price').value);
  const urlInput = document.getElementById('pub-url').value.trim();
  const desc = document.getElementById('pub-desc').value.trim();
  
  if (!title) { toast.show('Vui lòng nhập tên game!', 'error'); return; }
  if (isNaN(price) || price < 0) { toast.show('Giá không hợp lệ!', 'error'); return; }
  
  const newGame = {
    id: "g-" + Date.now(),
    title: title,
    category: category,
    price: price,
    rating: 5.0,
    playCount: "1",
    coverColor: "linear-gradient(135deg, #00f0ff, #ff0055)",
    badge: "MỚI",
    isHot: false,
    isNew: true,
    desc: desc || "Mô tả trò chơi chưa cập nhật.",
    gameUrl: urlInput || "https://html-classic.itch.zone/html/18013330/index.html"
  };

  // 1. Lưu game mới vào kho game chung (LocalStorage)
  app.games.unshift(newGame);
  localStorage.setItem('nexus_games_v2', JSON.stringify(app.games));

  // 2. TỰ ĐỘNG LƯU VÀO YÊU THÍCH CỦA USER HIỆN TẠI
  // Lấy danh sách yêu thích trực tiếp từ LocalStorage để chắc chắn không lỗi
  let currentFavs = JSON.parse(localStorage.getItem('nexus_favs_v2')) || [];
  
  // Thêm ID game mới vào mảng yêu thích
  currentFavs.push(newGame.id);
  
  // Cập nhật lại vào LocalStorage
  localStorage.setItem('nexus_favs_v2', JSON.stringify(currentFavs));
  
  // Cập nhật lại biến toàn cục app
  app.favorites = currentFavs;

  toast.show(`Đã đăng bán "${title}" và thêm vào Yêu thích!`, "success");
  togglePublishModal(false);
  e.target.reset();

  // 3. Vẽ lại toàn bộ giao diện
  filterModule.currentCategory = 'all';
  filterModule.currentNavFilter = 'all';
  filterModule.searchKeyword = '';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const discoverBtn = document.querySelector('.nav-item[data-filter="all"]');
  if (discoverBtn) discoverBtn.classList.add('active');

  app.switchView('store');
  renderSidebar();
  renderCategoryCards();
  heroCarousel.init(app.games);
  app.applyFiltersAndRender();

  setTimeout(() => {
    const gridSection = document.getElementById('all-games-section');
    if (gridSection) gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

// Gán hàm vào object app để HTML gọi được
if (typeof app !== 'undefined') {
  app.handlePublishSubmit = handlePublishSubmit;
  app.togglePublishModal = togglePublishModal;
}