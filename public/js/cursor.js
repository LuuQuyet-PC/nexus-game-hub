/**
 * js/cursor.js
 * Water Ripple Cursor — Vòng tròn bao quanh chuột + hiệu ứng gợn sóng nước
 */

const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

// Cập nhật vị trí chuột thật
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Vòng tròn di chuyển mượt theo chuột (lerp)
function animateRing() {
  ringX += (mouseX - ringX) ;
  ringY += (mouseY - ringY) ;
  if (cursorRing) {
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateRing);
}
animateRing();

// Tạo hiệu ứng sóng nước khi click
document.addEventListener('click', (e) => {
  createWaterRipple(e.clientX, e.clientY, false);
  createWaterRipple(e.clientX, e.clientY, true);
});

function createWaterRipple(x, y, isDelayed) {
  const ripple = document.createElement('div');
  ripple.className = 'cursor-ripple' + (isDelayed ? ' delay' : '');
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 1000);
}

// Mở rộng vòng khi hover vào button, card, link
function bindCursorInteractions() {
  const targets = document.querySelectorAll('button, a, input, select, textarea, .game-card, .cat-item, .category-card');
  targets.forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';

    el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => cursorRing && cursorRing.classList.remove('hover-active'));
  });
}

document.addEventListener('DOMContentLoaded', bindCursorInteractions);