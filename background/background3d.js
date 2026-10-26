/**
 * js/background3d.js
 * Không gian hạt 3D Three.js. Tự động giảm số lượng hạt trên Mobile để giữ 60 FPS.
 */
(() => {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;

  // 1. Khởi tạo Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // 2. Cấu hình số lượng hạt (Mobile thì ít hơn để đỡ lag)
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 800 : 2000;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Màu neon: Xanh Cyan và Đỏ Magenta
  const cyan = new THREE.Color('#00f0ff');
  const magenta = new THREE.Color('#ff0055');

  // 3. Tạo vị trí và màu ngẫu nhiên cho từng hạt
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 26;     // X
    positions[i + 1] = (Math.random() - 0.5) * 26; // Y
    positions[i + 2] = (Math.random() - 0.5) * 20; // Z

    const chosenColor = Math.random() > 0.4 ? cyan : magenta; // 60% Cyan, 40% Magenta
    colors[i] = chosenColor.r;
    colors[i + 1] = chosenColor.g;
    colors[i + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 4. Tạo Material cho hạt
  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.04 : 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending // Hiệu ứng phát sáng
  });

  const particleMesh = new THREE.Points(geometry, material);
  scene.add(particleMesh);

  // 5. Hiệu ứng Parallax (Camera di chuyển theo chuột)
  let targetCamX = 0, targetCamY = 0;
  window.addEventListener('mousemove', (e) => {
    targetCamX = (e.clientX / window.innerWidth - 0.5) * 1.8;
    targetCamY = (e.clientY / window.innerHeight - 0.5) * 1.8;
  });

  // 6. Vòng lặp Animation
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Xoay nhẹ khối hạt theo thời gian
    particleMesh.rotation.y = elapsed * 0.03;
    particleMesh.rotation.x = elapsed * 0.015;

    // Camera di chuyển mượt (lerp) theo vị trí chuột
    camera.position.x += (targetCamX - camera.position.x) * 0.035;
    camera.position.y += (-targetCamY - camera.position.y) * 0.035;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // 7. Xử lý khi resize màn hình
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();