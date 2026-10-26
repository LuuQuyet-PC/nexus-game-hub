function playGame(url, title) {
  // 1. KIỂM TRA BẢO TRÌ
  const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
  
  // Nếu đang bảo trì VÀ không phải Admin -> Chặn
  if (settings.maintenance === true && localStorage.getItem('nexus_role') !== 'admin') {
    toast.show("Hệ thống đang bảo trì, không thể chơi game lúc này!", "error");
    return;
  }

  // 2. GHI NHẬN LỊCH SỬ CHƠI
  if (localStorage.getItem('nexus_is_logged_in') === 'true') {
    const user = localStorage.getItem('nexus_username');
    if (typeof trackingModule !== 'undefined') trackingModule.logPlay(user, title);
  }
  
  // 3. MỞ TRÌNH CHƠI GAME
  const player = document.getElementById('game-player');
  document.getElementById('player-game-title').innerText = title;
  document.getElementById('game-iframe').src = url;
  player.classList.add('active');
}

function closePlayer() {
  document.getElementById('game-player').classList.remove('active');
  document.getElementById('game-iframe').src = '';
}

function reloadPlayer() {
  const iframe = document.getElementById('game-iframe');
  iframe.src = iframe.src;
}

function toggleFullScreen() {
  const player = document.getElementById('game-player');
  if (!document.fullscreenElement) player.requestFullscreen().catch(() => toast.show("Lỗi fullscreen", "error"));
  else document.exitFullscreen();
}