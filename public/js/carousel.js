/**
 * js/carousel.js
 * Hero carousel tự động chạy mỗi 5s, hỗ trợ pause on hover và indicators
 */
const heroCarousel = {
  currentIndex: 0,
  items: [],
  timer: null,
  track: document.getElementById('carousel-track'),
  indicators: document.getElementById('carousel-indicators'),

  init(games) {
    this.items = games.filter(g => g.isHot).slice(0, 5);
    if (this.items.length === 0) this.items = games.slice(0, 4);

    this.render();
    this.startAutoPlay();
    this.bindEvents();
  },

  // Helper: tạo style background cho slide (ảnh hoặc gradient)
  buildSlideStyle(item) {
    if (item.coverImage) {
      return `background-image: url('${item.coverImage}'); background-size: cover; background-position: center;`;
    }
    return `background: ${item.coverColor};`;
  },

  render() {
    this.track.innerHTML = this.items.map(item => `
      <div class="carousel-slide" style="${this.buildSlideStyle(item)}">
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <span class="slide-tag">${item.category} // POPULAR</span>
          <h2 class="slide-title">${item.title}</h2>
          <p class="slide-desc">${item.desc}</p>
          <div class="slide-actions">
            <button class="btn-play-large" onclick="app.playGame('${item.gameUrl}', '${item.title}')">▶ CHƠI NGAY</button>
            <button class="btn-secondary-large" onclick="app.openGameDetail('${item.id}')">XEM CHI TIẾT</button>
          </div>
        </div>
      </div>
    `).join('');

    this.indicators.innerHTML = this.items.map((_, i) => `
      <div class="indicator-dot ${i === 0 ? 'active' : ''}" onclick="heroCarousel.goTo(${i})"></div>
    `).join('');
  },

  goTo(index) {
    this.currentIndex = index;
    if (this.currentIndex >= this.items.length) this.currentIndex = 0;
    if (this.currentIndex < 0) this.currentIndex = this.items.length - 1;

    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    const dots = this.indicators.querySelectorAll('.indicator-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });
  },

  next() { this.goTo(this.currentIndex + 1); },
  prev() { this.goTo(this.currentIndex - 1); },

  startAutoPlay() {
    this.timer = setInterval(() => this.next(), 5000);
  },

  pause() { clearInterval(this.timer); },

  bindEvents() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (prevBtn) prevBtn.onclick = () => { this.prev(); this.pause(); this.startAutoPlay(); };
    if (nextBtn) nextBtn.onclick = () => { this.next(); this.pause(); this.startAutoPlay(); };

    const carouselEl = document.getElementById('hero-carousel');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', () => this.pause());
      carouselEl.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  }
};