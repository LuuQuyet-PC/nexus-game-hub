// Xử lý lưu trữ lịch sử hoạt động của người dùng
const trackingModule = {
  // Ghi nhận lịch sử đăng nhập
  logLogin(username) {
    let tracking = JSON.parse(localStorage.getItem('nexus_tracking') || '{}');
    if (!tracking[username]) tracking[username] = { loginHistory: [], playHistory: [] };
    
    const now = new Date().toLocaleString('vi-VN');
    tracking[username].loginHistory.unshift(now);
    if (tracking[username].loginHistory.length > 10) tracking[username].loginHistory.pop();
    
    localStorage.setItem('nexus_tracking', JSON.stringify(tracking));
  },

  // Ghi nhận lịch sử chơi game
  logPlay(username, gameTitle) {
    let tracking = JSON.parse(localStorage.getItem('nexus_tracking') || '{}');
    if (!tracking[username]) tracking[username] = { loginHistory: [], playHistory: [] };
    
    const now = new Date().toLocaleString('vi-VN');
    tracking[username].playHistory.unshift({ title: gameTitle, time: now });
    if (tracking[username].playHistory.length > 10) tracking[username].playHistory.pop();
    
    localStorage.setItem('nexus_tracking', JSON.stringify(tracking));
  }
};