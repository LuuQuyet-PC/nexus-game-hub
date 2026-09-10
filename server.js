const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Phục vụ các file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Database tạm thời trong RAM (In-Memory)
let games = [
  {
    id: "g-1",
    title: "Cyberpunk Odyssey 2088",
    tag: "Sci-Fi RPG",
    price: 49.99,
    coverColor: "linear-gradient(135deg, #ff0055, #7a00ff)",
    desc: "Thế giới mở tương lai tăm tối kết hợp cơ chế chiến đấu nhanh."
  },
  {
    id: "g-2",
    title: "Shadow Blade: Shinobi",
    tag: "Action",
    price: 29.99,
    coverColor: "linear-gradient(135deg, #00f0ff, #0044ff)",
    desc: "Hóa thân thành ninja bóng đêm với các đòn thế võ thuật tốc độ cao."
  },
  {
    id: "g-3",
    title: "Galactic Fleet",
    tag: "Strategy",
    price: 39.50,
    coverColor: "linear-gradient(135deg, #f39c12, #d35400)",
    desc: "Chỉ huy hạm đội không gian và xây dựng đế chế liên hành tinh."
  }
];

let library = [];

// API: Lấy danh sách game
app.get('/api/games', (req, res) => {
  res.json({ success: true, data: games });
});

// API: Đăng bán game mới
app.post('/api/games', (req, res) => {
  const { title, tag, price, desc, coverColor } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  const newGame = {
    id: "g-" + Date.now(),
    title,
    tag: tag || "Indie",
    price: parseFloat(price),
    coverColor: coverColor || "linear-gradient(135deg, #00f0ff, #7a00ff)",
    desc: desc || "Chưa có mô tả chi tiết."
  };

  games.unshift(newGame);
  res.status(201).json({ success: true, data: newGame });
});

// API: Mua game (Cấp key đưa vào thư viện)
app.post('/api/buy', (req, res) => {
  const { gameId } = req.body;
  const game = games.find(g => g.id === gameId);

  if (!game) {
    return res.status(404).json({ success: false, message: "Game không tồn tại" });
  }

  const alreadyOwned = library.some(item => item.gameId === gameId);
  if (alreadyOwned) {
    return res.status(400).json({ success: false, message: "Game đã có trong thư viện của bạn" });
  }

  const randomKeyPart = () => Math.random().toString(36).substring(2, 7).toUpperCase();
  const cdKey = `NEXUS-${randomKeyPart()}-${randomKeyPart()}`;

  const entry = {
    libraryId: "lib-" + Date.now(),
    gameId: game.id,
    title: game.title,
    tag: game.tag,
    coverColor: game.coverColor,
    cdKey: cdKey,
    purchasedAt: new Date().toLocaleDateString('vi-VN')
  };

  library.unshift(entry);
  res.json({ success: true, data: entry });
});

// API: Lấy thư viện cá nhân
app.get('/api/library', (req, res) => {
  res.json({ success: true, data: library });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});