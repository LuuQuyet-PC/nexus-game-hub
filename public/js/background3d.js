// Khởi tạo Canvas Three.js
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tạo mảng hạt phát sáng (Particles Nebula)
const particleCount = 2200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorCyan = new THREE.Color('#00f0ff');
const colorMagenta = new THREE.Color('#ff0055');

for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 24;
  positions[i + 1] = (Math.random() - 0.5) * 24;
  positions[i + 2] = (Math.random() - 0.5) * 18;

  const particleColor = Math.random() > 0.35 ? colorCyan : colorMagenta;
  colors[i] = particleColor.r;
  colors[i + 1] = particleColor.g;
  colors[i + 2] = particleColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.045,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Tương tác chuột góc quay 3D
let targetMouseX = 0, targetMouseY = 0;
window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
});

// Vòng lặp render
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const time = clock.getElapsedTime();

  particles.rotation.y = time * 0.035;
  particles.rotation.x = time * 0.015;

  // Di chuyển camera mềm theo quán tính (Lerp)
  camera.position.x += (targetMouseX - camera.position.x) * 0.03;
  camera.position.y += (-targetMouseY - camera.position.y) * 0.03;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}
loop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});