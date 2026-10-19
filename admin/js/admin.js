
// 1. Bảo mật
if (localStorage.getItem('nexus_role') !== 'admin') {
  window.location.href = "index.html";
}

// 2. Khai báo
let db_games = JSON.parse(localStorage.getItem('nexus_games_v2')) || DEFAULT_GAMES_DATABASE;
let db_accounts = JSON.parse(localStorage.getItem('nexus_accounts')) || {};
let db_library = JSON.parse(localStorage.getItem('nexus_library_v2')) || [];
let trafficChart = null;
let serverInterval = null;

let tmCharts = { cpu: null, ram: null, disk: null, net: null };
let tmData = {
  labels: Array(30).fill(''),
  cpu: Array(30).fill(20),
  ram: Array(30).fill(40),
  disk: Array(30).fill(5),
  net: Array(30).fill(10)
};

let processes = [
  { name: "System Idle Process", status: "OK", cpu: 85, ram: 8, net: 0 },
  { name: "node.exe (API Server)", status: "OK", cpu: 5, ram: 120, net: 12 },
  { name: "mysqld.exe (Database)", status: "OK", cpu: 2, ram: 450, net: 5 },
  { name: "nginx.exe (Web Server)", status: "OK", cpu: 1, ram: 45, net: 20 },
  { name: "redis-server.exe", status: "OK", cpu: 0, ram: 60, net: 2 },
  { name: "chrome.exe (Admin Session)", status: "OK", cpu: 6, ram: 320, net: 15 }
];

// ==================== HÀM TOAST ====================
function showToast(message, type = 'success') {
  let container = document.querySelector('.admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  const icon = type === 'error' ? '✖' : '✔';
  toast.innerHTML = `<strong>${icon}</strong> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== CHUYỂN TAB ====================
function switchTab(tabId) {
  if (serverInterval) {
    clearInterval(serverInterval);
    serverInterval = null;
  }

  document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
  document.querySelector(`.admin-menu li[data-tab="${tabId}"]`).classList.add('active');

  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');

  const titles = {
    'overview': 'Tổng Quan Hệ Thống',
    'users': 'Quản Lý Người Dùng',
    'games': 'Quản Lý Kho Game',
    'settings': 'Cài Đặt Hệ Thống',
    'server': 'Quản Lý Máy Chủ (Task Manager)'
  };

  document.getElementById('page-title').innerText = titles[tabId];

  if (tabId === 'overview') {
    updateKPIs();
    renderChart();
  } else if (tabId === 'users') {
    renderUsers();
  } else if (tabId === 'games') {
    renderGames();
  } else if (tabId === 'server') {
    startTaskManager();
  }
}

// ==================== KHỞI TẠO ====================
function initAdminDashboard() {
  document.getElementById('admin-name').innerText = localStorage.getItem('nexus_username') || 'Admin';
  updateKPIs();
  renderUsers();
  renderGames();
  renderChart();
}

function updateKPIs() {
  document.getElementById('kpi-users').innerText = Object.keys(db_accounts).length;
  document.getElementById('kpi-games').innerText = db_games.length;
  document.getElementById('kpi-sales').innerText = db_library.length;
}

// ==================== QUẢN LÝ NGƯỜI DÙNG ====================
function renderUsers() {
  const tbody = document.getElementById('admin-user-table');
  const users = Object.keys(db_accounts);

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#8b9bb4; padding: 2rem;">Chưa có người dùng nào</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr onclick="showUserDetail('${user}')" style="cursor: pointer;" onmouseover="this.style.background='rgba(0,240,255,0.05)'" onmouseout="this.style.background='transparent'">
      <td style="color: #00f0ff; font-weight: bold;">${user}</td>
      <td><span style="color: #2ecc71; font-weight: bold;">Đang hoạt động</span></td>
      <td><button class="btn-danger" onclick="event.stopPropagation(); deleteUser('${user}')">Xóa</button></td>
    </tr>
  `).join('');
}

// ==================== QUẢN LÝ GAME ====================
function renderGames() {
  const tbody = document.getElementById('admin-game-table');
  tbody.innerHTML = db_games.map(game => {
    const bgStyle = game.coverImage ? `background-image: url('${game.coverImage}');` : `background: ${game.coverColor};`;
    return `
      <tr>
        <td><div class="game-thumb-admin" style="${bgStyle}"></div></td>
        <td style="font-weight: 600;">${game.title}</td>
        <td><span style="background: rgba(0, 240, 255, 0.1); color: #00f0ff; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${game.category}</span></td>
        <td><input type="number" class="price-input" value="${game.price.toFixed(2)}" onchange="updateGamePrice('${game.id}', this.value)"></td>
        <td style="color: #f39c12; font-weight: bold;">★ ${game.rating}</td>
        <td><button class="btn-danger" onclick="deleteGame('${game.id}')">Xóa</button></td>
      </tr>
    `;
  }).join('');
}

function renderChart() {
  const ctx = document.getElementById('trafficChart').getContext('2d');
  if (trafficChart) trafficChart.destroy();

  trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
      datasets: [{
        label: 'Lượt truy cập (Nghìn)',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff0055',
        pointBorderColor: '#fff',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#8b9bb4' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#8b9bb4' },
          grid: { display: false }
        }
      }
    }
  });
}

// ==================== TASK MANAGER (SERVER) ====================
const tmChartConfig = {
  type: 'line',
  data: {
    labels: tmData.labels,
    datasets: [{
      data: [],
      borderColor: '#00f0ff',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: true,
      backgroundColor: 'rgba(0, 240, 255, 0.1)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 100 }
    }
  }
};

function startTaskManager() {
  try {
    if (!tmCharts.cpu) {
      const createChart = (ctxId, dataArray, color, bgColor, maxVal = 100) => {
        const canvas = document.getElementById(ctxId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const config = JSON.parse(JSON.stringify(tmChartConfig));
        config.data.datasets[0].data = [...dataArray];
        config.data.datasets[0].borderColor = color;
        config.data.datasets[0].backgroundColor = bgColor;
        config.options.scales.y.max = maxVal;

        return new Chart(ctx, config);
      };

      tmCharts.cpu = createChart('chart-cpu', tmData.cpu, '#00f0ff', 'rgba(0, 240, 255, 0.1)');
      tmCharts.ram = createChart('chart-ram', tmData.ram, '#ff0055', 'rgba(255, 0, 85, 0.1)');
      tmCharts.disk = createChart('chart-disk', tmData.disk, '#f39c12', 'rgba(243, 156, 18, 0.1)');
      tmCharts.net = createChart('chart-net', tmData.net, '#2ecc71', 'rgba(46, 204, 113, 0.1)', 150);
    }

    renderProcesses();

    serverInterval = setInterval(() => {
      const newCpu = Math.max(5, Math.min(100, tmData.cpu[tmData.cpu.length - 1] + (Math.random() * 20 - 10)));
      const newRam = Math.max(30, Math.min(90, tmData.ram[tmData.ram.length - 1] + (Math.random() * 10 - 5)));
      const newDisk = Math.max(0, Math.min(100, tmData.disk[tmData.disk.length - 1] + (Math.random() * 30 - 15)));
      const newNet = Math.max(0, Math.min(100, tmData.net[tmData.net.length - 1] + (Math.random() * 40 - 20)));

      tmData.cpu.push(newCpu); tmData.cpu.shift();
      tmData.ram.push(newRam); tmData.ram.shift();
      tmData.disk.push(newDisk); tmData.disk.shift();
      tmData.net.push(newNet); tmData.net.shift();

      if (tmCharts.cpu) {
        tmCharts.cpu.data.datasets[0].data = tmData.cpu;
        tmCharts.cpu.update();
      }
      if (tmCharts.ram) {
        tmCharts.ram.data.datasets[0].data = tmData.ram;
        tmCharts.ram.update();
      }
      if (tmCharts.disk) {
        tmCharts.disk.data.datasets[0].data = tmData.disk;
        tmCharts.disk.update();
      }
      if (tmCharts.net) {
        tmCharts.net.data.datasets[0].data = tmData.net;
        tmCharts.net.update();
      }

      document.getElementById('tm-cpu-val').innerText = `${Math.round(newCpu)}%`;
      document.getElementById('tm-ram-val').innerText = `${Math.round(newRam)}%`;
      document.getElementById('tm-disk-val').innerText = `${Math.round(newDisk)}%`;
      document.getElementById('tm-net-val').innerText = `${Math.round(newNet)} Mbps`;

      processes.forEach(p => {
        if (p.name !== "System Idle Process") {
          p.cpu = Math.max(0, p.cpu + (Math.random() * 2 - 1));
          p.ram = Math.max(10, p.ram + (Math.random() * 10 - 5));
        } else {
          p.cpu = 100 - newCpu;
        }
      });

      renderProcesses();
    }, 1000);
  } catch (e) {
    console.error("Lỗi Task Manager:", e);
  }
}

function renderProcesses() {
  const tbody = document.getElementById('tm-process-list');
  document.getElementById('tm-total-proc').innerText = processes.length;

  tbody.innerHTML = processes.map(p => {
    const cpuColor = p.cpu > 50 ? '#ff0055' : '#00f0ff';
    const ramColor = p.ram > 300 ? '#ff0055' : '#00f0ff';

    return `
      <tr>
        <td style="font-weight: 600;">${p.name}</td>
        <td><span class="tm-status-ok">${p.status}</span></td>
        <td>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 0.85rem;"><span>${p.cpu.toFixed(1)}%</span></div>
          <div class="tm-bar-bg"><div class="tm-bar-fill" style="width: ${p.cpu}%; background: ${cpuColor};"></div></div>
        </td>
        <td>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 0.85rem;"><span>${Math.round(p.ram)} MB</span></div>
          <div class="tm-bar-bg"><div class="tm-bar-fill" style="width: ${(p.ram/500)*100}%; background: ${ramColor};"></div></div>
        </td>
        <td style="font-family: monospace; font-size: 0.85rem;">${p.net > 0 ? p.net.toFixed(1) + ' Mbps' : '0'}</td>
      </tr>
    `;
  }).join('');
}

// ==================== XỬ LÝ SỰ KIỆN ====================
function deleteUser(username) {
  if (confirm(`Xóa tài khoản "${username}"?`)) {
    delete db_accounts[username];
    localStorage.setItem('nexus_accounts', JSON.stringify(db_accounts));
    renderUsers();
    updateKPIs();
    showToast(`Đã xóa tài khoản ${username}`);
  }
}

function deleteGame(gameId) {
  if (confirm(`Xóa tựa game này?`)) {
    db_games = db_games.filter(g => g.id !== gameId);
    localStorage.setItem('nexus_games_v2', JSON.stringify(db_games));
    renderGames();
    updateKPIs();
    showToast("Đã xóa game khỏi hệ thống");
  }
}

function updateGamePrice(gameId, newPrice) {
  const price = parseFloat(newPrice);

  if (isNaN(price) || price < 0) {
    showToast("Giá tiền không hợp lệ!", "error");
    renderGames();
    return;
  }

  const gameIndex = db_games.findIndex(g => g.id === gameId);

  if (gameIndex !== -1) {
    db_games[gameIndex].price = price;
    localStorage.setItem('nexus_games_v2', JSON.stringify(db_games));
    showToast(`Đã cập nhật giá thành $${price.toFixed(2)}`);
  }
}

function saveSettings() {
  const siteName = document.getElementById('set-site-name').value;
  const email = document.getElementById('set-email').value;
  const maintenance = document.getElementById('set-maintenance').checked;
  const allowReg = document.getElementById('set-register').checked;

  const settings = { siteName, email, maintenance, allowReg };

  localStorage.setItem('nexus_settings', JSON.stringify(settings));
  showToast("Đã lưu cấu hình hệ thống!");
}

function logoutAdmin() {
  localStorage.removeItem('nexus_is_logged_in');
  localStorage.removeItem('nexus_role');
  window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);
