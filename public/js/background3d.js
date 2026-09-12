/**
 * js/background3d.js
 * Không gian hạt 3D Three.js. Tự động giảm số lượng hạt trên Mobile để giữ 60 FPS
 * Hỗ trợ các đường kết nối Line Segment khi camera di chuyển theo tọa độ chuột.
 */
(() => {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Giảm bớt số lượng hạt nếu là màn hình điện thoại / máy tính bảng
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 800 : 2000;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const cyan = new THREE.Color('#00f0ff');
  const magenta = new THREE.Color('#ff0055');

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 26;
    positions[i + 1] = (Math.random() - 0.5) * 26;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    const chosenColor = Math.random() > 0.4 ? cyan : magenta;
    colors[i] = chosenColor.r;
    colors[i + 1] = chosenColor.g;
    colors[i + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.04 : 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(geometry, material);
  scene.add(particleMesh);

  // Parallax 3D theo chuyển động chuột
  let targetCamX = 0, targetCamY = 0;
  window.addEventListener('mousemove', (e) => {
    targetCamX = (e.clientX / window.innerWidth - 0.5) * 1.8;
    targetCamY = (e.clientY / window.innerHeight - 0.5) * 1.8;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    particleMesh.rotation.y = elapsed * 0.03;
    particleMesh.rotation.x = elapsed * 0.015;

    camera.position.x += (targetCamX - camera.position.x) * 0.035;
    camera.position.y += (-targetCamY - camera.position.y) * 0.035;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();