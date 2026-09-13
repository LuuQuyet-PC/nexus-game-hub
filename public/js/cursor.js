const cursorBubble = document.getElementById('cursor-bubble');
const cursorDot = document.getElementById('cursor-dot');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let bubbleX = mouseX;
let bubbleY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

// Thuật toán nội suy tuyến tính (Lerp) tạo quán tính bong bóng
function animateCursor() {
  bubbleX += (mouseX - bubbleX) * 0.5;
  bubbleY += (mouseY - bubbleY) * 0.5;
  cursorBubble.style.transform = `translate(${bubbleX}px, ${bubbleY}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Mở rộng bong bóng khi hover vào các thẻ tương tác
function bindCursorInteractions() {
  const targets = document.querySelectorAll('button, a, input, select, textarea, .game-card');
  targets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursorBubble.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => cursorBubble.classList.remove('hover-active'));
  });
}