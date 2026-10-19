// Xử lý logic Xem chi tiết Người dùng trong Admin
function showUserDetail(username) {
  document.getElementById('detail-user-name').innerText = username;
  
  // 1. MÔ PHỎNG SỐ DƯ VÍ (Ngẫu nhiên từ $50 - $300 tùy theo tên user)
  // Ví dụ: user1 có 50 + (5*37.5) = $237.5
  const mockBalance = (username.length * 37.5) + 50; 
  document.getElementById('detail-user-balance').innerText = `$${mockBalance.toFixed(2)}`;
  
  // 2. MÔ PHỎNG SỐ GAME SỞ HỮU (Từ 1 - 5 game)
  const mockGamesCount = (username.length % 5) + 1; 
  document.getElementById('detail-user-games').innerText = mockGamesCount;
  
  // 3. LẤY LỊCH SỬ (Nếu chưa có thì tự sinh dữ liệu mô phỏng)
  let tracking = JSON.parse(localStorage.getItem('nexus_tracking') || '{}');
  let userTrack = tracking[username];
  
  // Nếu chưa có lịch sử nào, tạo dữ liệu giả
  if (!userTrack || (userTrack.loginHistory.length === 0 && userTrack.playHistory.length === 0)) {
    userTrack = generateMockData(username);
  }
  
  // 4. HIỂN THỊ LỊCH SỬ ĐĂNG NHẬP
  const loginList = document.getElementById('detail-login-history');
  if (userTrack.loginHistory.length === 0) {
    loginList.innerHTML = '<li style="justify-content:center;">Chưa có dữ liệu</li>';
  } else {
    loginList.innerHTML = userTrack.loginHistory.map(time => `<li>Đăng nhập <span>${time}</span></li>`).join('');
  }
  
  // 5. HIỂN THỊ LỊCH SỬ CHƠI GAME
  const playList = document.getElementById('detail-play-history');
  if (userTrack.playHistory.length === 0) {
    playList.innerHTML = '<li style="justify-content:center;">Chưa có dữ liệu</li>';
  } else {
    playList.innerHTML = userTrack.playHistory.map(p => `<li>Chơi <strong>${p.title}</strong> <span>${p.time}</span></li>`).join('');
  }
  
  // 6. MỞ MODAL
  document.getElementById('user-detail-modal').classList.add('active');
}

// Hàm phụ: Tự động sinh dữ liệu mô phỏng
function generateMockData(username) {
  const loginHistory = [];
  const playHistory = [];
  
  // Danh sách game mẫu
  const mockGames = [
    "Cyberpunk Odyssey", "Traffic Rider", "Cozy Coco Catcher", 
    "Hazmob FPS", "Space Waves", "Chess Free", "Mine Clone"
  ];
  
  // Hàm tạo thời gian ngẫu nhiên trong 7 ngày qua
  const getRandomDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Lùi tối đa 7 ngày
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date.toLocaleString('vi-VN');
  };

  // Sinh 4 lần đăng nhập
  for (let i = 0; i < 4; i++) {
    loginHistory.push(getRandomDate());
  }
  
  // Sinh 4 lần chơi game
  for (let i = 0; i < 4; i++) {
    playHistory.push({
      title: mockGames[Math.floor(Math.random() * mockGames.length)],
      time: getRandomDate()
    });
  }
  
  return { loginHistory, playHistory };
}

function closeUserModal() {
  document.getElementById('user-detail-modal').classList.remove('active');
}