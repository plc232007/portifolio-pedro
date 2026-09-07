/* Workspace concept. Objects remain ordinary links without JavaScript. */
(() => {
  'use strict';
  const stage = document.getElementById('workspace-stage');
  const scene = document.getElementById('desk-scene');
  if (!stage || !scene) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const reset = () => {
    scene.style.removeProperty('--desk-rx');
    scene.style.removeProperty('--desk-ry');
  };
  const updateHint = () => {
    document.getElementById('workspace-hint').textContent = fine.matches && !reduced.matches
      ? 'Mova o mouse. Explore os objetos.'
      : 'Toque ou selecione os objetos para explorar.';
    reset();
  };
  updateHint();
  reduced.addEventListener('change', updateHint);
  fine.addEventListener('change', updateHint);
  stage.addEventListener('pointermove', (event) => {
    if (reduced.matches || !fine.matches || event.pointerType === 'touch') return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    scene.style.setProperty('--desk-ry', `${-13 + x * 16}deg`);
    scene.style.setProperty('--desk-rx', `${-5 - y * 10}deg`);
  });
  stage.addEventListener('pointerleave', reset);
  stage.addEventListener('pointercancel', reset);
  const resize = () => scene.style.setProperty('--scene-scale', Math.min(stage.clientWidth / 620, 1.08));
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);

  // Reuse portfolio content so the monitor stays aligned with the project cards.
  const cards = [...document.querySelectorAll('#projetos .proj-card')];
  const featuredNames = ['App dos Catequistas', 'Organizador de Contas', 'Leite Campos Consultoria'];
  const featured = featuredNames.map(name => cards.find(card => card.querySelector('h4')?.textContent.includes(name))).filter(Boolean);
  const monitor = document.getElementById('desk-monitor');
  const title = document.getElementById('screen-title');
  const description = document.getElementById('screen-description');
  const next = document.getElementById('workspace-next');
  const summaries = [
    'Uma plataforma para conectar cerca de 70 catequistas.',
    'Receitas, despesas e uma visão clara das finanças pessoais.',
    'Soluções digitais para necessidades de negócios reais.'
  ];
  let current = 0;
  featured.forEach((card, index) => { if (!card.id) card.id = `workspace-project-${index + 1}`; });
  function showProject() {
    const card = featured[current];
    if (!card) return;
    const fullTitle = card.querySelector('h4').textContent.trim();
    title.textContent = fullTitle.split(' — ')[0];
    description.textContent = summaries[featuredNames.findIndex(name => fullTitle.includes(name))];
    document.getElementById('screen-number').textContent = String(current + 1).padStart(2, '0');
    monitor.href = `#${card.id}`;
    monitor.setAttribute('aria-label', `Monitor: conhecer ${fullTitle}`);
  }
  showProject();
  next.hidden = featured.length < 2;
  title.setAttribute('aria-live', 'polite');
  next.addEventListener('click', () => { current = (current + 1) % featured.length; showProject(); });
})();
