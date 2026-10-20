const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// CẤU HÌNH LƯU TRỮ FILE JSON (Không mất data)
// ==========================================
const DB_FILE = path.join(__dirname, 'database.json');

// Hàm đọc/ghi Database
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error("Lỗi đọc DB:", e);
    }
  }
  // Nếu chưa có file, tạo dữ liệu mặc định
  return {
    accounts: {
      "user1": "1234", "user2": "1234", "user3": "1234", "user4": "1234", "user5": "1234",
      "user6": "1234", "user7": "1234", "user8": "1234", "user9": "1234", "user10": "1234",
      "admin": "Admin123"
    },
    balances: {},
    library: [],
    tracking: {},
    settings: {
      siteName: "NEXUS//PLAY",
      email: "support@nexusplay.vn",
      maintenance: false,
      allowRegister: true
    },
    games: [
      // Mày copy toàn bộ 33 game từ data.js vào đây
      { id: "g-1", title: "Cozy Coco Catcher", category: "Casual", price: 0, rating: 4.8, playCount: "1.2M", coverColor: "linear-gradient(135deg, #4ecdc4, #f7b731)", coverImage: "assets/covers/CozyCocoCatcher.jpg", badge: "HOT", isHot: true, isNew: false, desc: "Game thu hoạch dừa thư giãn.", gameUrl: "https://html-classic.itch.zone/html/18013330/index.html" },
      { id: "g-2", title: "Traffic Rider", category: "Racing", price: 0, rating: 4.6, playCount: "2.8M", coverColor: "linear-gradient(135deg, #f39c12, #ff0055)", coverImage: "assets/covers/TrafficRider.jpg", badge: "HOT", isHot: true, isNew: true, desc: "Đua xe mô tô.", gameUrl: "https://games.crazygames.com/vi_VN/traffic-rider-vvq/index.html" }
      // ... 31 game còn lại
    ]
  };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Khởi tạo DB
let db = loadDB();
// Tự động tạo ví mặc định cho user nếu chưa có
Object.keys(db.accounts).forEach(u => {
  if (db.balances[u] === undefined) db.balances[u] = 128.50;
});
saveDB(db);

// ==========================================
// PHỤC VỤ FILE TĨNH (Đọc trực tiếp từ thư mục gốc)
// ==========================================
app.use(express.static(__dirname));

// ==========================================
// API XÁC THỰC (AUTH)
// ==========================================

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  if (!db.settings.allowRegister) return res.status(403).json({ success: false, message: "Hệ thống đang tắt đăng ký" });
  if (db.accounts[username]) return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại" });

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passRegex.test(password)) {
    return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ HOA, chữ thường và số!" });
  }

  db.accounts[username] = password;
  db.balances[username] = 128.50;
  saveDB(db);
  res.json({ success: true, message: "Đăng ký thành công", username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (db.settings.maintenance && username !== 'admin') {
    return res.status(503).json({ success: false, message: "Hệ thống đang bảo trì" });
  }
  if (!db.accounts[username] || db.accounts[username] !== password) {
    return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  }

  const role = username === 'admin' ? 'admin' : 'user';
  
  if (!db.tracking[username]) db.tracking[username] = { loginHistory: [], playHistory: [] };
  db.tracking[username].loginHistory.unshift(new Date().toLocaleString('vi-VN'));
  if (db.tracking[username].loginHistory.length > 10) db.tracking[username].loginHistory.pop();
  saveDB(db);

  res.json({ success: true, username, role, balance: db.balances[username] || 0 });
});

// ==========================================
// API GAME
// ==========================================

app.get('/api/games', (req, res) => {
  res.json({ success: true, data: db.games });
});

app.post('/api/games', (req, res) => {
  const { title, category, price, desc, gameUrl, coverColor, coverImage } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Thiếu tên game" });

  const newGame = {
    id: "g-" + Date.now(),
    title, category: category || "Casual", price: parseFloat(price) || 0,
    rating: 5.0, playCount: "1",
    coverColor: coverColor || "linear-gradient(135deg, #00f0ff, #ff0055)",
    coverImage: coverImage || "",
    badge: "MỚI", isHot: false, isNew: true,
    desc: desc || "Chưa có mô tả",
    gameUrl: gameUrl || "https://html-classic.itch.zone/html/18013330/index.html"
  };

  db.games.unshift(newGame);
  saveDB(db);
  res.json({ success: true, data: newGame });
});

app.delete('/api/games/:id', (req, res) => {
  const before = db.games.length;
  db.games = db.games.filter(g => g.id !== req.params.id);
  if (db.games.length === before) return res.status(404).json({ success: false, message: "Không tìm thấy game" });
  saveDB(db);
  res.json({ success: true });
});

app.put('/api/games/:id/price', (req, res) => {
  const game = db.games.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ success: false, message: "Không tìm thấy game" });
  game.price = parseFloat(req.body.price) || 0;
  saveDB(db);
  res.json({ success: true, data: game });
});

// ==========================================
// API VÍ & MUA GAME
// ==========================================

app.get('/api/balance/:username', (req, res) => {
  res.json({ success: true, balance: db.balances[req.params.username] || 0 });
});

app.post('/api/deposit', (req, res) => {
  const { username, amount } = req.body;
  if (!db.balances[username] && db.balances[username] !== 0) return res.status(404).json({ success: false, message: "User không tồn tại" });
  db.balances[username] += parseFloat(amount) || 0;
  saveDB(db);
  res.json({ success: true, balance: db.balances[username] });
});

app.post('/api/buy', (req, res) => {
  const { username, gameId } = req.body;
  const game = db.games.find(g => g.id === gameId);
  
  if (!game) return res.status(404).json({ success: false, message: "Game không tồn tại" });
  if (db.balances[username] === undefined) return res.status(404).json({ success: false, message: "User không tồn tại" });
  
  const owned = db.library.some(l => l.username === username && l.gameId === gameId);
  if (owned) return res.status(400).json({ success: false, message: "Bạn đã sở hữu game này" });
  
  if (db.balances[username] < game.price) {
    return res.status(400).json({ success: false, message: "Số dư không đủ" });
  }

  db.balances[username] -= game.price;
  
  const rand = () => Math.random().toString(36).substring(2, 7).toUpperCase();
  const cdKey = `NEXUS-${rand()}-${rand()}`;

  const entry = {
    id: "lib-" + Date.now(), username, gameId: game.id,
    title: game.title, coverColor: game.coverColor, coverImage: game.coverImage || "",
    cdKey, purchasedAt: new Date().toLocaleString('vi-VN')
  };
  db.library.unshift(entry);
  saveDB(db);
  
  res.json({ success: true, data: entry, balance: db.balances[username] });
});

app.get('/api/library/:username', (req, res) => {
  const data = db.library.filter(l => l.username === req.params.username);
  res.json({ success: true, data });
});

// ==========================================
// API TRACKING
// ==========================================

app.post('/api/tracking/play', (req, res) => {
  const { username, gameTitle } = req.body;
  if (!db.tracking[username]) db.tracking[username] = { loginHistory: [], playHistory: [] };
  db.tracking[username].playHistory.unshift({ title: gameTitle, time: new Date().toLocaleString('vi-VN') });
  if (db.tracking[username].playHistory.length > 10) db.tracking[username].playHistory.pop();
  saveDB(db);
  res.json({ success: true });
});

// ==========================================
// API ADMIN
// ==========================================

app.get('/api/admin/users', (req, res) => {
  const users = Object.keys(db.accounts).map(u => ({
    username: u,
    balance: db.balances[u] || 0,
    isAdmin: u === 'admin',
    tracking: db.tracking[u] || { loginHistory: [], playHistory: [] },
    gamesOwned: db.library.filter(l => l.username === u).length
  }));
  res.json({ success: true, data: users });
});

app.delete('/api/admin/users/:username', (req, res) => {
  const u = req.params.username;
  if (u === 'admin') return res.status(400).json({ success: false, message: "Không thể xóa admin" });
  if (!db.accounts[u]) return res.status(404).json({ success: false, message: "User không tồn tại" });
  
  delete db.accounts[u];
  delete db.balances[u];
  delete db.tracking[u];
  db.library = db.library.filter(l => l.username !== u);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: Object.keys(db.accounts).length,
      totalGames: db.games.length,
      totalSales: db.library.length,
      totalRevenue: db.library.reduce((sum, l) => {
        const game = db.games.find(g => g.id === l.gameId);
        return sum + (game ? game.price : 0);
      }, 0)
    }
  });
});

app.get('/api/admin/server-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      cpu: Math.round(20 + Math.random() * 60),
      ram: Math.round(40 + Math.random() * 40),
      disk: Math.round(5 + Math.random() * 30),
      net: Math.round(10 + Math.random() * 80),
      processes: [
        { name: "System Idle Process", status: "OK", cpu: 85, ram: 8, net: 0 },
        { name: "node.exe (API Server)", status: "OK", cpu: Math.round(5 + Math.random() * 10), ram: 120, net: 12 },
        { name: "mysqld.exe (Database)", status: "OK", cpu: Math.round(2 + Math.random() * 5), ram: 450, net: 5 },
        { name: "nginx.exe (Web Server)", status: "OK", cpu: Math.round(1 + Math.random() * 3), ram: 45, net: 20 },
        { name: "redis-server.exe", status: "OK", cpu: 0, ram: 60, net: 2 },
        { name: "chrome.exe (Admin Session)", status: "OK", cpu: Math.round(4 + Math.random() * 6), ram: 320, net: 15 }
      ]
    }
  });
});

app.get('/api/settings', (req, res) => res.json({ success: true, data: db.settings }));
app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true, data: db.settings });
});

// ==========================================
// FALLBACK ROUTE (Quan trọng để chạy SPA)
// ==========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 NEXUS//PLAY Backend chạy tại http://localhost:${PORT}`);
  console.log(`📦 Đã nạp ${db.games.length} game`);
  console.log(`👥 Đã nạp ${Object.keys(db.accounts).length} tài khoản`);
});