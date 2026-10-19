document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.querySelector('#resultsCount');
  if (countEl && typeof GAMES_DATA !== 'undefined') {
    countEl.innerText = `Tìm thấy ${GAMES_DATA.length} trò chơi`;
  }
});