// ============================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  initParticles();
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
    
    // Reinicializar partículas com nova cor
    initParticles();
  });
}

// ============================================
// PARTÍCULAS DE FUNDO (Particles.js)
// ============================================
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  
  const isLight = document.body.classList.contains("light-theme");
  
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: isLight ? "#0077cc" : "#00c8ff"
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        }
      },
      opacity: {
        value: 0.3,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: isLight ? "#0077cc" : "#00c8ff",
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.5
          }
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  });
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
