/**
 * Dynamic Theme Manager & Animated Background Canvas
 * Provides 7 curated aesthetic themes with animated floating gradient glow orbs.
 */

const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    primary: '#00f2fe',
    secondary: '#06d6a0',
    orbs: ['#00f2fe', '#06d6a0', '#4facfe', '#1b4d3e']
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#ff6a88',
    secondary: '#ff9a9e',
    orbs: ['#ff0844', '#ffb199', '#f77062', '#44103c']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primary: '#00f7ff',
    secondary: '#ff007f',
    orbs: ['#00f7ff', '#ff007f', '#7928ca', '#100b2b']
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    primary: '#a78bfa',
    secondary: '#38bdf8',
    orbs: ['#a78bfa', '#38bdf8', '#8b5cf6', '#1c1445']
  },
  {
    id: 'emerald',
    name: 'Emerald Lush',
    primary: '#00f2a9',
    secondary: '#ffd166',
    orbs: ['#00f2a9', '#083827', '#10b981', '#059669']
  },
  {
    id: 'pastel',
    name: 'Pastel Bliss',
    primary: '#ffd6e0',
    secondary: '#c1fba4',
    orbs: ['#ffd6e0', '#c1fba4', '#b8a5fe', '#70587c']
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    primary: '#ffd700',
    secondary: '#ff7b54',
    orbs: ['#ffd700', '#d4af37', '#ff7b54', '#3b3223']
  }
];

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('tictactoe_theme') || 'aurora';
    this.canvas = document.getElementById('bg-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.orbs = [];
    this.animationId = null;

    this.init();
  }

  init() {
    // Apply current theme
    this.applyTheme(this.currentTheme, false);

    // Build theme chips UI
    this.renderThemeChips();

    // Setup interactive toggle drawer
    const themeBtn = document.getElementById('theme-btn');
    const themeDrawer = document.getElementById('theme-selector');
    if (themeBtn && themeDrawer) {
      themeBtn.addEventListener('click', () => {
        themeDrawer.classList.toggle('closed');
        window.soundEngine.playClickSound();
      });
    }

    // Setup background canvas orbs
    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
      this.initOrbs();
      this.animateBackground();
    }
  }

  renderThemeChips() {
    const container = document.getElementById('theme-chips');
    if (!container) return;

    container.innerHTML = '';
    THEMES.forEach(theme => {
      const chip = document.createElement('button');
      chip.className = `theme-chip ${theme.id === this.currentTheme ? 'active' : ''}`;
      chip.dataset.themeId = theme.id;
      chip.setAttribute('type', 'button');

      chip.innerHTML = `
        <span class="color-preview" style="background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});"></span>
        <span>${theme.name}</span>
      `;

      chip.addEventListener('click', () => {
        this.applyTheme(theme.id, true);
        window.soundEngine.playClickSound();
      });

      container.appendChild(chip);
    });
  }

  applyTheme(themeId, userTriggered = true) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    this.currentTheme = theme.id;
    document.body.setAttribute('data-theme', theme.id);
    localStorage.setItem('tictactoe_theme', theme.id);

    // Update active chip state
    const chips = document.querySelectorAll('.theme-chip');
    chips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.themeId === theme.id);
    });

    // Refresh ambient orbs for new color scheme
    this.initOrbs();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initOrbs() {
    if (!this.canvas) return;
    const theme = THEMES.find(t => t.id === this.currentTheme) || THEMES[0];
    this.orbs = [];

    const orbColors = theme.orbs;
    const count = 5;

    for (let i = 0; i < count; i++) {
      this.orbs.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: (Math.min(this.canvas.width, this.canvas.height) * 0.28) + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        color: orbColors[i % orbColors.length]
      });
    }
  }

  animateBackground() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ambient floating orbs
    this.orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Wrap around gently
      if (orb.x < -orb.radius) orb.x = this.canvas.width + orb.radius;
      if (orb.x > this.canvas.width + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = this.canvas.height + orb.radius;
      if (orb.y > this.canvas.height + orb.radius) orb.y = -orb.radius;

      const gradient = this.ctx.createRadialGradient(
        orb.x, orb.y, 0,
        orb.x, orb.y, orb.radius
      );
      gradient.addColorStop(0, orb.color + '33'); // ~20% alpha
      gradient.addColorStop(0.6, orb.color + '12'); // ~7% alpha
      gradient.addColorStop(1, orb.color + '00'); // 0% alpha

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animateBackground());
  }
}

window.themeManager = new ThemeManager();
