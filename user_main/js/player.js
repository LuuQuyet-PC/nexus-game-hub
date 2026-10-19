function playGame(url, title) {
  // GỌI HÀM TRACKING Ở ĐÂY
  if (localStorage.getItem('nexus_is_logged_in') === 'true') {
    const user = localStorage.getItem('nexus_username');
    if (typeof trackingModule !== 'undefined') trackingModule.logPlay(user, title);
  }
  
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