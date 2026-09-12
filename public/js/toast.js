/**
 * js/toast.js
 * Toast notification chuẩn Cyberpunk neon thay thế alert()
 */
const toast = {
  container: document.getElementById('toast-container'),

  show(message, type = 'success') {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    
    let icon = '✔';
    if (type === 'error') icon = '✖';
    if (type === 'info') icon = 'ℹ';

    toastEl.innerHTML = `<strong>${icon}</strong> ${message}`;
    this.container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(100%)';
      toastEl.style.transition = 'all 0.3s ease';
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  }
};