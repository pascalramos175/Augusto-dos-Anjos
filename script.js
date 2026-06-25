/* ══════════════════════════════════════════════
   AUGUSTO DOS ANJOS – APRESENTAÇÃO
   script.js · Lógica de navegação e animações
══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONSTANTES ────────────────────────────
  const TOTAL_SLIDES = 15;

  // ── ESTADO ────────────────────────────────
  let currentSlide = 1;
  const visitedSlides = new Set([1]);

  // ── REFERÊNCIAS DOM ───────────────────────
  const slidesEl      = document.querySelectorAll('.slide');
  const btnPrev       = document.getElementById('btn-prev');
  const btnNext       = document.getElementById('btn-next');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const progressBar   = document.getElementById('progress-bar');
  const currentNum    = document.getElementById('current-slide-num');
  const totalNum      = document.getElementById('total-slides-num');
  const slideNav      = document.getElementById('slide-nav');

  // Inicializa total de slides no DOM
  totalNum.textContent = TOTAL_SLIDES;

  // ══════════════════════════════════════════
  // GERAÇÃO DO MENU LATERAL (NAV DOTS)
  // ══════════════════════════════════════════
  function buildNavDots () {
    const labels = [
      'Capa', 'Contexto', 'Biografia', 'Influências',
      'Obras', 'Características', '"EU"', 'Poema I',
      'Análise I', 'Poema II', 'Análise II', 'Legado',
      'Curiosidades', 'Resumo', 'Conclusão'
    ];
    labels.forEach((label, idx) => {
      const n = idx + 1;
      const btn = document.createElement('button');
      btn.className = 'nav-dot' + (n === 1 ? ' active visited' : '');
      btn.setAttribute('data-slide', n);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', `Ir para slide ${n}: ${label}`);
      btn.textContent = n;
      btn.addEventListener('click', () => goToSlide(n));
      slideNav.appendChild(btn);
    });
  }

  // ══════════════════════════════════════════
  // NAVEGAÇÃO PRINCIPAL
  // ══════════════════════════════════════════
  function goToSlide (target) {
    if (target < 1 || target > TOTAL_SLIDES || target === currentSlide) return;

    const from = document.getElementById(`slide-${currentSlide}`);
    const to   = document.getElementById(`slide-${target}`);

    // Anima saída
    from.classList.remove('fade-in');
    from.classList.add('fade-out');

    setTimeout(() => {
      from.classList.add('hidden');
      from.classList.remove('fade-out');

      // Reinicia animações de cards no novo slide
      resetCardAnimations(to);

      to.classList.remove('hidden');
      to.classList.add('fade-in');
      to.scrollTop = 0;

      currentSlide = target;
      visitedSlides.add(target);
      updateUI();
    }, 280);
  }

  // ── Reiniciar animações de cards (slide 6) ─
  function resetCardAnimations (slideEl) {
    const cards = slideEl.querySelectorAll('.animate-card');
    cards.forEach(c => {
      c.style.animation = 'none';
      // Force reflow
      void c.offsetWidth;
      c.style.animation = '';
    });
  }

  // ── Botões Prev / Next ─────────────────────
  btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));

  // ── Teclado ───────────────────────────────
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        goToSlide(currentSlide + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goToSlide(currentSlide - 1);
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(TOTAL_SLIDES);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  });

  // ── Touch / Swipe ─────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  }, { passive: true });

  // ══════════════════════════════════════════
  // ATUALIZAÇÃO DA UI
  // ══════════════════════════════════════════
  function updateUI () {
    // Indicador de número
    currentNum.textContent = currentSlide;

    // Barra de progresso
    const pct = ((currentSlide - 1) / (TOTAL_SLIDES - 1)) * 100;
    progressBar.style.width = pct + '%';

    // Botões habilitados
    btnPrev.disabled = (currentSlide === 1);
    btnNext.disabled = (currentSlide === TOTAL_SLIDES);

    // Ícone fullscreen
    const isFS = !!document.fullscreenElement;
    btnFullscreen.querySelector('i').className = isFS
      ? 'fa-solid fa-compress'
      : 'fa-solid fa-expand';

    // Nav dots
    document.querySelectorAll('.nav-dot').forEach(dot => {
      const n = parseInt(dot.dataset.slide);
      dot.classList.toggle('active', n === currentSlide);
      dot.classList.toggle('visited', visitedSlides.has(n));
    });

    // Scroll do nav para manter dot visível
    const activeDot = slideNav.querySelector('.nav-dot.active');
    if (activeDot) {
      activeDot.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // ══════════════════════════════════════════
  // TELA CHEIA
  // ══════════════════════════════════════════
  function toggleFullscreen () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  btnFullscreen.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateUI);

  // ══════════════════════════════════════════
  // PARTÍCULAS (canvas)
  // ══════════════════════════════════════════
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');

  const PARTICLE_COUNT = 60;
  const particles = [];

  function resizeCanvas () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor () { this.reset(true); }

    reset (initial = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.r  = Math.random() * 1.8 + .4;
      this.vy = -(Math.random() * .4 + .1);
      this.vx = (Math.random() - .5) * .15;
      this.alpha = Math.random() * .4 + .05;
      this.color = Math.random() > .6
        ? `rgba(202,233,255,${this.alpha})`
        : `rgba(212,175,55,${this.alpha * .6})`;
      this.life = 0;
      this.maxLife = 600 + Math.random() * 400;
    }

    update () {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      // Fade in/out
      const ratio = this.life / this.maxLife;
      const fade  = ratio < .15 ? ratio / .15 : ratio > .85 ? (1 - ratio) / .15 : 1;
      this.currentAlpha = this.alpha * fade;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }

    draw () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.currentAlpha})`);
      ctx.fill();
    }
  }

  function initParticles () {
    resizeCanvas();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  let rafId;
  function animateParticles () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    cancelAnimationFrame(rafId);
    animateParticles();
  });

  // Pausa partículas quando a aba fica inativa (economia de CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animateParticles();
    }
  });

  // ══════════════════════════════════════════
  // INICIALIZAÇÃO
  // ══════════════════════════════════════════
  function init () {
    buildNavDots();
    updateUI();
    initParticles();
    animateParticles();

    // Esconde todos exceto slide 1
    slidesEl.forEach(s => {
      if (parseInt(s.dataset.slide) !== 1) {
        s.classList.add('hidden');
      }
    });

    // Anima entrada do slide 1
    const first = document.getElementById('slide-1');
    first.classList.add('fade-in');
  }

  // Aguarda DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
