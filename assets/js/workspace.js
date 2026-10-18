/* Workspace concept. Objects remain ordinary links without JavaScript. */
(() => {
  'use strict';
  const stage = document.getElementById('workspace-stage');
  const scene = document.getElementById('desk-scene');
  if (!stage || !scene) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const interactive = () => fine.matches && !reduced.matches;

  // Parallax com inércia: o ponteiro define um alvo e a cena se aproxima dele a cada frame (lerp).
  // O loop só roda enquanto há diferença entre posição atual e alvo.
  const REST = { rx: -5, ry: -13, lx: 50, ly: 30 };
  const current = { ...REST };
  const target = { ...REST };
  let raf = null;
  const apply = () => {
    scene.style.setProperty('--desk-rx', `${current.rx.toFixed(2)}deg`);
    scene.style.setProperty('--desk-ry', `${current.ry.toFixed(2)}deg`);
    scene.style.setProperty('--lx', `${current.lx.toFixed(1)}%`);
    scene.style.setProperty('--ly', `${current.ly.toFixed(1)}%`);
  };
  const tick = () => {
    let moving = false;
    for (const key of Object.keys(current)) {
      const delta = target[key] - current[key];
      if (Math.abs(delta) > 0.01) moving = true;
      current[key] += delta * 0.09;
    }
    apply();
    raf = moving ? requestAnimationFrame(tick) : null;
  };
  const run = () => { if (raf === null) raf = requestAnimationFrame(tick); };
  const reset = () => { Object.assign(target, REST); run(); };

  const updateHint = () => {
    document.getElementById('workspace-hint').textContent = interactive()
      ? 'Mova o mouse. Explore os objetos.'
      : 'Toque ou selecione os objetos para explorar.';
    reset();
  };
  updateHint();
  reduced.addEventListener('change', updateHint);
  fine.addEventListener('change', updateHint);
  stage.addEventListener('pointermove', (event) => {
    if (!interactive() || event.pointerType === 'touch') return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    target.ry = REST.ry + (x - 0.5) * 18;
    target.rx = REST.rx - (y - 0.5) * 11;
    target.lx = x * 100;
    target.ly = y * 100;
    run();
  });
  stage.addEventListener('pointerleave', reset);
  stage.addEventListener('pointercancel', reset);

  const resize = () => scene.style.setProperty('--scene-scale', Math.min(stage.clientWidth / 620, 1.08));
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);

  // Pausa as animações em CSS da cena quando o hero sai da tela.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      stage.classList.toggle('is-offscreen', !entry.isIntersecting);
    }).observe(stage);
  }

  // Monitor: primeiro a demo de visão computacional, depois os projetos em destaque.
  // Título e link vêm dos cards reais para o monitor nunca divergir da seção de projetos.
  const cards = [...document.querySelectorAll('#projetos .proj-card')];
  const featuredNames = ['LVM', 'Organizador de Contas', 'App dos Catequistas'];
  const summaries = [
    'Geometria interativa com exercícios gerados por semente e assistente de IA.',
    'Finanças pessoais em Next.js com dados isolados por usuário via RLS.',
    'Plataforma usada por cerca de 70 catequistas, com painel administrativo.'
  ];
  const projects = featuredNames
    .map((name, index) => ({ card: cards.find(card => card.querySelector('h3')?.textContent.includes(name)), summary: summaries[index] }))
    .filter(item => item.card);

  const monitor = document.getElementById('desk-monitor');
  const screen = document.getElementById('monitor-screen');
  const cvView = screen.querySelector('.screen-cv');
  const projectView = screen.querySelector('.screen-body');
  const path = document.getElementById('screen-path');
  const title = document.getElementById('screen-title');
  const description = document.getElementById('screen-description');
  const next = document.getElementById('workspace-next');
  const cvLabel = monitor.getAttribute('aria-label');
  let slide = 0;

  function showSlide() {
    const isCv = slide === 0;
    screen.dataset.mode = isCv ? 'cv' : 'project';
    cvView.hidden = !isCv;
    projectView.hidden = isCv;
    if (isCv) {
      path.textContent = 'yolo@cnt: ~/rodovias';
      monitor.href = '#exp-cnt';
      monitor.setAttribute('aria-label', cvLabel);
      return;
    }
    const { card, summary } = projects[slide - 1];
    const fullTitle = card.querySelector('h3').textContent.trim();
    path.textContent = 'pedro@portfolio: ~/projects';
    title.textContent = fullTitle.split(' — ')[0];
    description.textContent = summary;
    document.getElementById('screen-number').textContent = String(slide).padStart(2, '0');
    monitor.href = `#${card.id}`;
    monitor.setAttribute('aria-label', `Monitor: conhecer ${fullTitle}`);
  }

  next.hidden = projects.length === 0;
  screen.setAttribute('aria-live', 'polite');
  next.addEventListener('click', () => {
    slide = (slide + 1) % (projects.length + 1);
    showSlide();
  });
})();
