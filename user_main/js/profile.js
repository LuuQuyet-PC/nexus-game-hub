function updateAvatar() {
  const avatarEl = document.getElementById('profile-avatar');
  if (!avatarEl) return;
  const name = localStorage.getItem('nexus_username') || 'CyberRider_99';
  const initials = name.replace(/[^A-Za-z0-9]/g, '').substring(0, 2).toUpperCase() || 'NX';
  avatarEl.innerText = initials;
}

function depositMoney(amount) {
  let balance = parseFloat(localStorage.getItem('nexus_balance') || '0') + amount;
  localStorage.setItem('nexus_balance', balance.toFixed(2));
  document.getElementById('profile-balance-display').innerText = `$${balance.toFixed(2)}`;
  toast.show(`Đã nạp $${amount}`, "success");
}

function changeUsername() {
  const newName = prompt('Nhập tên mới:', localStorage.getItem('nexus_username'));
  if (newName) {
    localStorage.setItem('nexus_username', newName);
    document.getElementById('profile-username').innerText = newName;
    updateAvatar();
  }
}

function toggleProfileDropdown() {
  document.getElementById('profile-dropdown').classList.toggle('open');
}