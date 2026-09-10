let activeView = 'store';

// Lấy danh sách game từ Backend
async function fetchStoreGames() {
  try {
    const res = await fetch('/api/games');
    const data = await res.json();
    renderStore(data.data);
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Store:", err);
  }
}

// Lấy danh sách Thư viện từ Backend
async function fetchUserLibrary() {
  try {
    const res = await fetch('/api/library');
    const data = await res.json();
    renderLibrary(data.data);
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Library:", err);
  }
}

function renderStore(games) {
  const container = document.getElementById('game-grid');
  container.innerHTML = games.map(g => `
    <div class="game-card">
      <div class="game-thumb" style="background: ${g.coverColor};">
        <span class="game-tag">${g.tag}</span>
        ${g.title}
      </div>
      <div class="game-info">
        <div class="game-title">${g.title}</div>
        <div class="game-desc">${g.desc}</div>
        <div class="game-footer">
          <div class="game-price">$${g.price.toFixed(2)}</div>
          <button class="btn-buy" onclick="handleBuyGame('${g.id}')">MUA NGAY</button>
        </div>
      </div>
    </div>
  `).join('');
  bindCursorInteractions();
}

function renderLibrary(items) {
  const container = document.getElementById('game-grid');
  if (items.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Thư viện chưa có game nào. Hãy ghé qua Cửa hàng để sở hữu game đầu tiên!</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="game-card">
      <div class="game-thumb" style="background: ${item.coverColor};">
        <span class="game-tag">ĐÃ MUA</span>
        ${item.title}
      </div>
      <div class="game-info">
        <div class="game-title">${item.title}</div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">Mã kích hoạt CD-Key:</p>
        <div class="cd-key-badge">${item.cdKey}</div>
        <div class="game-footer" style="margin-top: 1rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Ngày mua: ${item.purchasedAt}</span>
          <button class="btn-primary" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;">TẢI VỀ</button>
        </div>
      </div>
    </div>
  `).join('');
  bindCursorInteractions();
}

// Xử lý Mua Game
async function handleBuyGame(gameId) {
  try {
    const res = await fetch('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Đã cấp bản quyền thành công: ${result.data.title}\nCD-Key: ${result.data.cdKey}`);
      switchView('library');
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Không thể kết nối đến máy chủ.");
  }
}

// Chuyển đổi tab Store / Library
function switchView(view) {
  activeView = view;
  document.getElementById('tab-store').classList.toggle('active', view === 'store');
  document.getElementById('tab-library').classList.toggle('active', view === 'library');

  const title = document.getElementById('view-title');
  if (view === 'store') {
    title.innerText = "DANH MỤC TRÒ CHƠI";
    fetchStoreGames();
  } else {
    title.innerText = "BỘ SƯU TẬP CỦA TÔI";
    fetchUserLibrary();
  }
}

// Modal Control
const modal = document.getElementById('modal-publish');
function toggleModal(show) {
  modal.classList.toggle('active', show);
  if (show) bindCursorInteractions();
}

// Submit Đăng bán Game mới
async function submitNewGame(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('inp-title').value,
    tag: document.getElementById('inp-tag').value,
    price: document.getElementById('inp-price').value,
    desc: document.getElementById('inp-desc').value
  };

  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert("Đăng bán game thành công!");
      toggleModal(false);
      e.target.reset();
      switchView('store');
    }
  } catch (err) {
    alert("Đăng game thất bại.");
  }
}

// Khởi chạy
fetchStoreGames()