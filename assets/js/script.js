// ============================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  initCodeBackground();
  initCustomCursor();
  
  // Garantir que o conteúdo seja visível mesmo se GSAP falhar
  setTimeout(() => {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP não carregado - conteúdo exibido sem animações');
      document.querySelectorAll('.reveal, .section').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      initGSAPAnimations();
    }
  }, 100);
  
  initVanillaTilt();
  initBackToTop();
  initHeaderScroll();
  initProjectCardGlow();
  initFABButtons();
});

// ============================================
// ANO NO FOOTER
// ============================================
function initYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ============================================
// TOGGLE DE TEMA
// ============================================
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;

  if (!themeToggle || !themeIcon) return;

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    body.classList.add("light-theme");
    themeIcon.textContent = "☀️";
  } else {
    themeIcon.textContent = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-theme");

    const isLight = body.classList.contains("light-theme");
    themeIcon.textContent = isLight ? "☀️" : "🌙";

    localStorage.setItem("theme", isLight ? "light" : "dark");
    
    // Reinicializar fundo com nova cor
    initCodeBackground();
  });
}

// ============================================
// MATRIX RAIN (Canvas)
// ============================================
let _codeAnimId = null;

function initCodeBackground() {
  if (_codeAnimId) {
    cancelAnimationFrame(_codeAnimId);
    _codeAnimId = null;
  }

  const container = document.getElementById('particles-js');
  if (!container) return;

  let canvas = container.querySelector('canvas.code-bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'code-bg-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    container.innerHTML = '';
    container.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const isLight = document.body.classList.contains('light-theme');

  // Caracteres: katakana + binário + símbolos de código
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0101{}()<>=/*#&@!?$%';

  const fontSize = 14;
  let cols, drops, glowDrops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -canvas.height / fontSize);
    // Algumas colunas têm brilho extra (cabeça da gota)
    glowDrops = new Set(
      Array.from({ length: Math.floor(cols * 0.3) }, () => Math.floor(Math.random() * cols))
    );
  }

  resize();
  window.addEventListener('resize', resize);

  // Cores base
  const colorMain   = isLight ? 'rgba(0,119,204,'  : 'rgba(0,200,255,';
  const colorBright  = isLight ? 'rgba(0,150,220,0.6)' : 'rgba(160,240,255,0.7)';
  const colorFade    = isLight ? 'rgba(244,248,252,' : 'rgba(5,11,20,';
  const fadeAlpha    = isLight ? '0.25)' : '0.20)';

  function draw() {
    // Rastro de desvanecimento — efeito clássico de caudas
    ctx.fillStyle = colorFade + fadeAlpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px 'Fira Code', monospace`;

    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      const isGlow = glowDrops.has(i);

      if (isGlow) {
        // Cabeça da gota: sutil com glow leve
        ctx.shadowColor = isLight ? '#0077cc' : '#00c8ff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = colorBright;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;
      } else {
        // Corpo da gota: opacidade bem reduzida
        const depthAlpha = Math.min(0.30, 0.05 + (drops[i] % 20) / 20 * 0.25);
        ctx.fillStyle = colorMain + depthAlpha + ')';
        ctx.fillText(char, x, y);
      }

      // Reinicia a coluna ao sair da tela, com offset aleatório
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
        // Aleatoriamente adiciona/remove brilho extra
        if (Math.random() > 0.6) glowDrops.add(i);
        else glowDrops.delete(i);
      }

      drops[i] += 0.12 + Math.random() * 0.10;
    }

    _codeAnimId = requestAnimationFrame(draw);
  }

  draw();
}


// ============================================
// CURSOR CUSTOMIZADO
// ============================================
function initCustomCursor() {
  const cursorDot = document.querySelector('[data-cursor-dot]');
  const cursorOutline = document.querySelector('[data-cursor-outline]');
  
  if (!cursorDot || !cursorOutline) return;
  
  // Detectar se é dispositivo touch
  if ('ontouchstart' in window) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorDot.classList.add('active');
    cursorOutline.classList.add('active');
  });

  // Animação suave do outline
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Efeito hover em elementos interativos
  const interactiveElements = document.querySelectorAll('a, button, .skill-card, .proj-card, .fun-card');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('hover');
    });
  });
}

// ============================================
// ANIMAÇÕES COM GSAP
// ============================================
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP não carregado, seções permanecerão visíveis');
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);

  // Animação do Hero
  gsap.from('.hero-badge', {
    opacity: 0,
    y: -30,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.hero-name', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.2,
    ease: 'power3.out'
  });

  gsap.from('.hero-role', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.4,
    ease: 'power3.out'
  });

  gsap.from('.hero-intro', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.hero-terminal', {
    opacity: 0,
    scale: 0.95,
    duration: 1,
    delay: 0.8,
    ease: 'back.out(1.7)'
  });

  gsap.from('.cta-group .btn', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    delay: 1,
    ease: 'power2.out'
  });

  gsap.from('.profile-card', {
    opacity: 0,
    x: 50,
    duration: 1,
    delay: 0.5,
    ease: 'power3.out'
  });

  // Animação das seções com ScrollTrigger (sem afetar visibilidade inicial)
  gsap.utils.toArray('.section').forEach((section, index) => {
    gsap.from(section.children, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  });

  // Animação dos cards de habilidades
  gsap.utils.toArray('.skill-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'back.out(1.7)'
    });
  });

  // Animação das barras de progresso
  gsap.utils.toArray('.bar-fill').forEach(bar => {
    const width = bar.dataset.width;
    
    gsap.to(bar, {
      scrollTrigger: {
        trigger: bar,
        start: 'top 85%',
      },
      width: `${width}%`,
      duration: 1.5,
      ease: 'power2.out'
    });
  });

  // Animação dos projetos
  gsap.utils.toArray('.proj-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      opacity: 0,
      y: 60,
      rotationX: -15,
      duration: 1,
      delay: index * 0.15,
      ease: 'power3.out'
    });
  });

  // Animação da timeline de experiência
  gsap.utils.toArray('.tl-entry').forEach((entry, index) => {
    gsap.from(entry, {
      scrollTrigger: {
        trigger: entry,
        start: 'top 85%',
      },
      opacity: 0,
      x: -50,
      duration: 0.8,
      delay: index * 0.2,
      ease: 'power2.out'
    });
  });

  // Animação dos fun cards
  gsap.utils.toArray('.fun-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      opacity: 0,
      scale: 0.8,
      rotation: -5,
      duration: 0.6,
      delay: index * 0.1,
      ease: 'back.out(2)'
    });
  });
}

// ============================================
// EFEITO 3D COM VANILLA TILT
// ============================================
function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Aplicar tilt nos cards
  VanillaTilt.init(document.querySelectorAll('.skill-card, .proj-card, .fun-card, .profile-card'), {
    max: 8,
    speed: 400,
    glare: true,
    'max-glare': 0.3,
    scale: 1.02
  });

  // Tilt mais suave para cards de experiência
  VanillaTilt.init(document.querySelectorAll('.exp-card, .edu-card'), {
    max: 5,
    speed: 400,
    glare: true,
    'max-glare': 0.2
  });
}

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================
function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      button.classList.add("show");
      
      if (typeof gsap !== 'undefined') {
        gsap.to(button, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      }
    } else {
      button.classList.remove("show");
      
      if (typeof gsap !== 'undefined') {
        gsap.to(button, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3
        });
      }
    }
  });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ============================================
// HEADER COM EFEITO DE SCROLL
// ============================================
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// ============================================
// EFEITO DE BRILHO NOS CARDS DE PROJETO
// ============================================
function initProjectCardGlow() {
  const cards = document.querySelectorAll('.proj-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

// ============================================
// FLOATING ACTION BUTTONS (PDF + WHATSAPP)
// ============================================
function initFABButtons() {
  const fabPdf = document.getElementById('fab-pdf');
  if (!fabPdf) return;

  fabPdf.addEventListener('click', () => {
    // Download direto — funciona local e hospedado
    const link = document.createElement('a');
    link.href = './assets/docs/curriculo-pedro-leite-campos.pdf';
    link.download = 'Pedro-Leite-Campos-Curriculo.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Animar entrada dos FABs
  const fabGroup = document.getElementById('fab-group');
  if (fabGroup && typeof gsap !== 'undefined') {
    gsap.fromTo(fabGroup.children, 
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.15, delay: 1.5, ease: 'back.out(1.7)' }
    );
  }
}
