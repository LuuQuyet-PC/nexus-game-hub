/**
 * js/data.js
 * Kho mock data 30 tựa game phong phú tương tự catalogue CrazyGames.
 * Hỗ trợ URL game HTML5 iframe playable miễn phí.
 */

const DEFAULT_GAMES_DATABASE = [
  {
    id: "g-1",
    title: "Cyberpunk Odyssey 2088",
    category: "RPG",
    price: 49.99,
    rating: 4.9,
    playCount: "1.4M",
    coverColor: "linear-gradient(135deg, #ff0055, #7a00ff)",
    badge: "HOT",
    isHot: true,
    isNew: false,
    desc: "Khám phá thành phố ngầm tương lai với cơ chế chiến đấu nhanh và nâng cấp chip sinh học.",
    gameUrl: "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
  },
  {
    id: "g-2",
    title: "Shadow Blade: Shinobi",
    category: "Action",
    price: 29.99,
    rating: 4.8,
    playCount: "820K",
    coverColor: "linear-gradient(135deg, #00f0ff, #0044ff)",
    badge: "TOP",
    isHot: true,
    isNew: false,
    desc: "Võ thuật cận chiến tốc độ cao, né tránh shuriken và trảm tướng bóng đêm.",
    gameUrl: "https://html5.gamedistribution.com/6c429c362a4d467ea321d582ad658826/"
  },
  {
    id: "g-3",
    title: "Hyper Drift Neon",
    category: "Racing",
    price: 19.99,
    rating: 4.7,
    playCount: "2.1M",
    coverColor: "linear-gradient(135deg, #f39c12, #ff0055)",
    badge: "HOT",
    isHot: true,
    isNew: true,
    desc: "Đua xe trên đường cao tốc Synthwave neon, drift qua từng góc cua nghẹt thở.",
    gameUrl: "https://html5.gamedistribution.com/5f7ba1a062ff4a689b9d31ff47ea41a2/"
  },
  {
    id: "g-4",
    title: "Galactic Fleet Strike",
    category: "Strategy",
    price: 39.50,
    rating: 4.6,
    playCount: "340K",
    coverColor: "linear-gradient(135deg, #2ecc71, #16a085)",
    badge: "MỚI",
    isHot: false,
    isNew: true,
    desc: "Điều động tàu mẹ, triển khai tiêm kích không gian chiếm đóng các hành tinh năng lượng.",
    gameUrl: "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
  },
  {
    id: "g-5",
    title: "Vortex Arena .io",
    category: ".io",
    price: 0.00,
    rating: 4.5,
    playCount: "3.8M",
    coverColor: "linear-gradient(135deg, #8e44ad, #3498db)",
    badge: "TOP",
    isHot: true,
    isNew: false,
    desc: "Sinh tồn nhiều người chơi trực tuyến, hấp thụ khối lượng đối thủ để dẫn đầu bảng xếp hạng.",
    gameUrl: "https://html5.gamedistribution.com/6c429c362a4d467ea321d582ad658826/"
  },
  {
    id: "g-6",
    title: "Pixel Warzone 3D",
    category: "Shooting",
    price: 14.99,
    rating: 4.7,
    playCount: "950K",
    coverColor: "linear-gradient(135deg, #e74c3c, #c0392b)",
    badge: "HOT",
    isHot: true,
    isNew: false,
    desc: "Bắn súng góc nhìn thứ nhất đồ họa voxel cổ điển nhưng nhịp độ cực kỳ khốc liệt.",
    gameUrl: "https://html5.gamedistribution.com/5f7ba1a062ff4a689b9d31ff47ea41a2/"
  },
  {
    id: "g-7",
    title: "Quantum Maze Solver",
    category: "Puzzle",
    price: 9.99,
    rating: 4.4,
    playCount: "190K",
    coverColor: "linear-gradient(135deg, #1abc9c, #16a085)",
    badge: "MỚI",
    isHot: false,
    isNew: true,
    desc: "Giải đố không gian 4 chiều với các cổng dịch chuyển và thay đổi trọng lực.",
    gameUrl: "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
  },
  {
    id: "g-8",
    title: "Duo Fighter Arena",
    category: "2 Player",
    price: 24.99,
    rating: 4.8,
    playCount: "1.2M",
    coverColor: "linear-gradient(135deg, #e67e22, #d35400)",
    badge: "2P",
    isHot: true,
    isNew: false,
    desc: "Đối kháng 2 người trên cùng một bàn phím hoặc trực tuyến, nhiều combo đẹp mắt.",
    gameUrl: "https://html5.gamedistribution.com/6c429c362a4d467ea321d582ad658826/"
  },
  {
    id: "g-9",
    title: "Neon Soccer League",
    category: "Sports",
    price: 12.50,
    rating: 4.3,
    playCount: "410K",
    coverColor: "linear-gradient(135deg, #27ae60, #2ecc71)",
    badge: "MỚI",
    isHot: false,
    isNew: true,
    desc: "Bóng đá phong cách arcade tốc độ nhanh với các cú sút lửa và sân đấu phát sáng.",
    gameUrl: "https://html5.gamedistribution.com/5f7ba1a062ff4a689b9d31ff47ea41a2/"
  },
  {
    id: "g-10",
    title: "Midnight Asylum",
    category: "Horror",
    price: 18.00,
    rating: 4.6,
    playCount: "670K",
    coverColor: "linear-gradient(135deg, #2c3e50, #000000)",
    badge: "HOT",
    isHot: true,
    isNew: false,
    desc: "Thoát khỏi bệnh viện tâm thần bỏ hoang với chiếc đèn pin sắp cạn pin.",
    gameUrl: "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
  },
  {
    id: "g-11",
    title: "Cosmic Miner Idle",
    category: "Casual",
    price: 4.99,
    rating: 4.2,
    playCount: "520K",
    coverColor: "linear-gradient(135deg, #9b59b6, #8e44ad)",
    badge: "MỚI",
    isHot: false,
    isNew: true,
    desc: "Khai thác tiểu hành tinh tự động, nâng cấp trạm khoan và thu thập quặng quý.",
    gameUrl: "https://html5.gamedistribution.com/6c429c362a4d467ea321d582ad658826/"
  },
  {
    id: "g-12",
    title: "Sniper Ghost Protocol",
    category: "Shooting",
    price: 22.00,
    rating: 4.7,
    playCount: "890K",
    coverColor: "linear-gradient(135deg, #34495e, #1abc9c)",
    badge: "TOP",
    isHot: true,
    isNew: false,
    desc: "Tính toán sức gió, trọng lực và khoảng cách để thực hiện những phát bắn chuẩn xác.",
    gameUrl: "https://html5.gamedistribution.com/5f7ba1a062ff4a689b9d31ff47ea41a2/"
  }
];

// Sinh thêm 18 game nữa để đủ 30 game phong phú
const CATEGORIES_LIST = [
  { name: "Tất cả game", slug: "all", icon: "🔥" },
  { name: "Hành động (Action)", slug: "Action", icon: "⚔️" },
  { name: "Đua xe (Racing)", slug: "Racing", icon: "🏎️" },
  { name: "Bắn súng (Shooting)", slug: "Shooting", icon: "🎯" },
  { name: "Nhập vai (RPG)", slug: "RPG", icon: "🛡️" },
  { name: "Chiến thuật (Strategy)", slug: "Strategy", icon: "♟️" },
  { name: "Trí tuệ (Puzzle)", slug: "Puzzle", icon: "🧩" },
  { name: "Thể thao (Sports)", slug: "Sports", icon: "⚽" },
  { name: "Kinh dị (Horror)", slug: "Horror", icon: "👻" },
  { name: "2 Người chơi", slug: "2 Player", icon: "👥" },
  { name: ".io Games", slug: ".io", icon: "🌐" },
  { name: "Casual / Indie", slug: "Casual", icon: "🕹️" }
];

for (let i = 13; i <= 30; i++) {
  const catObj = CATEGORIES_LIST[1 + (i % (CATEGORIES_LIST.length - 1))];
  DEFAULT_GAMES_DATABASE.push({
    id: `g-${i}`,
    title: `Cyber Vanguard ${i}`,
    category: catObj.slug,
    price: Number((9.99 + (i * 1.5) % 35).toFixed(2)),
    rating: Number((4.1 + ((i * 3) % 9) / 10).toFixed(1)),
    playCount: `${(i * 47) % 900 + 100}K`,
    coverColor: `linear-gradient(135deg, hsl(${i * 32}, 85%, 50%), hsl(${(i * 32 + 60) % 360}, 85%, 35%))`,
    badge: i % 4 === 0 ? "HOT" : i % 5 === 0 ? "MỚI" : "TOP",
    isHot: i % 3 === 0,
    isNew: i % 2 === 0,
    desc: `Tựa game số ${i} mang lại trải nghiệm đỉnh cao trong thể loại ${catObj.name}.`,
    gameUrl: "https://html5.gamedistribution.com/b545f448b48842eb928bc17e80acda90/"
  });
}