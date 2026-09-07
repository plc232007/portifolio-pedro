/* One workspace across the page. CSS objects progressively enhance real content. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const text = (selector, value) => { $(selector).textContent = value; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const depthObjects = all('[data-depth]');
  const resetDepth = element => {
    element.style.removeProperty('--depth-x');
    element.style.removeProperty('--depth-y');
  };
  depthObjects.forEach(element => {
    element.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--depth-x', `${-((event.clientY - rect.top) / rect.height - .5) * 7}deg`);
      element.style.setProperty('--depth-y', `${((event.clientX - rect.left) / rect.width - .5) * 10}deg`);
    });
    element.addEventListener('pointerleave', () => resetDepth(element));
    element.addEventListener('pointercancel', () => resetDepth(element));
  });
  const resetAll = () => depthObjects.forEach(resetDepth);
  reduced.addEventListener('change', resetAll);
  fine.addEventListener('change', resetAll);

  const identity = $('#identity-switch');
  identity.hidden = false;
  identity.addEventListener('click', () => {
    const illustrated = identity.getAttribute('aria-pressed') !== 'true';
    identity.setAttribute('aria-pressed', String(illustrated));
    identity.textContent = illustrated ? 'Foto original ↻' : 'Versão ilustrada ↻';
    $('#identity-photo').classList.toggle('show-illustrated', illustrated);
  });

  const projects = all('#projetos .proj-card');
  projects.forEach((card, index) => { if (!card.id) card.id = `project-detail-${index + 1}`; });
  const projectFor = name => projects.find(card => card.querySelector('h4').textContent.includes(name));
  const boardData = {
    frontend: ['01 / FRONTEND', 'Interfaces que conectam pessoas.', 'React · Next.js · JavaScript · TypeScript · HTML · CSS', 'App dos Catequistas'],
    backend: ['02 / BACKEND', 'Regras claras. Sistemas conectados.', 'Python · Flask · PHP · Laravel · Node.js · APIs REST', 'Task Manager API'],
    data: ['03 / DADOS', 'Informação bem estruturada.', 'PostgreSQL · Supabase · SQL · Modelagem de dados', 'Organizador de Contas']
  };
  function selectChip(key) {
    const [label, title, stack, name] = boardData[key];
    $('#motherboard').dataset.active = key;
    all('[data-chip]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chip === key)));
    text('#board-readout > span', label);
    text('#board-readout h5', title);
    text('#board-readout p', stack);
    const card = projectFor(name);
    $('#board-readout a').href = card ? `#${card.id}` : '#projetos';
    text('#board-readout a', `${name} ↗`);
  }
  all('[data-chip]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => selectChip(button.dataset.chip));
  });
  selectChip('frontend');

  const experiences = all('#experiencia .exp-card');
  let chapter = 0;
  experiences.forEach((card, index) => { if (!card.id) card.id = `experience-detail-${index + 1}`; });
  function showChapter() {
    const card = experiences[chapter];
    text('#journal-number', `CAPÍTULO / ${String(chapter + 1).padStart(2, '0')}`);
    text('#journal-title', card.querySelector('h4').textContent);
    text('#journal-period', `${card.querySelector('.exp-company').textContent} · ${card.querySelector('.exp-period').textContent}`);
    $('#journal-link').href = `#${card.id}`;
    if (!reduced.matches) $('#journal-page').animate([{ transform: 'rotateY(-18deg)', opacity: .6 }, { transform: 'rotateY(0)', opacity: 1 }], { duration: 450, easing: 'ease-out' });
  }
  if (experiences.length) {
    $('#journal-feature').hidden = false;
    $('#journal-page').setAttribute('aria-live', 'polite');
    showChapter();
    $('#journal-next').hidden = experiences.length < 2;
    $('#journal-next').addEventListener('click', () => { chapter = (chapter + 1) % experiences.length; showChapter(); });
  }

  const certs = all('.cert-entry');
  certs.forEach((entry, index) => $('#archive-select').add(new Option(entry.querySelector('.cert-name').textContent, index)));
  function showCertificate() {
    const index = Number($('#archive-select').value);
    const entry = certs[index];
    text('#archive-number', `MODULE / ${String(index + 1).padStart(2, '0')}`);
    text('#archive-title', entry.querySelector('.cert-name').textContent);
    text('#archive-source', entry.querySelector('.cert-src').textContent);
    text('#archive-status', entry.querySelector('.cert-tag-wip')?.textContent || 'Certificação');
  }
  if (certs.length) {
    $('#archive-feature').hidden = false;
    showCertificate();
    $('#archive-select').addEventListener('change', showCertificate);
  }

  projects.forEach((card, index) => $('#project-select').add(new Option(card.querySelector('h4').textContent, index)));
  const showcase = $('#project-showcase');
  function showProject() {
    const card = projects[Number($('#project-select').value)];
    const title = card.querySelector('h4').textContent.trim();
    const description = card.querySelector('.proj-description').textContent.trim().replace(/\s+/g, ' ');
    const tech = [...card.querySelectorAll('.tech-pill')].slice(0, 4).map(item => item.textContent).join(' · ');
    text('#device-title', title);
    text('#device-tech', tech);
    text('#device-summary', description);
    for (const link of [$('#project-device'), $('#device-detail')]) link.href = `#${card.id}`;
    $('#project-device').setAttribute('aria-label', `Conhecer ${title}`);
    // These are presentation frames, not claims about screenshots or native apps.
    showcase.dataset.device = /Organizador|Catálogo/.test(title) ? 'phone' : /API|Linguagem C/.test(title) ? 'terminal' : 'laptop';
  }
  if (projects.length) {
    showcase.hidden = false;
    const preferred = projectFor('App dos Catequistas');
    $('#project-select').value = String(Math.max(0, projects.indexOf(preferred)));
    showProject();
    $('#project-select').addEventListener('change', showProject);
    $('#device-zoom').addEventListener('click', () => {
      const zoomed = showcase.classList.toggle('is-zoomed');
      $('#device-zoom').setAttribute('aria-pressed', String(zoomed));
      text('#device-zoom', zoomed ? 'Recuar tela ⤡' : 'Aproximar tela ⤢');
    });
    showcase.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      showcase.classList.remove('is-zoomed');
      $('#device-zoom').setAttribute('aria-pressed', 'false');
      text('#device-zoom', 'Aproximar tela ⤢');
    });
  }

  // A small command palette: never executes code, sends messages, or opens tabs automatically.
  const output = $('#console-output');
  const email = 'pleitecampos@gmail.com';
  function outputLink(message, label, href) {
    output.replaceChildren(document.createTextNode(`${message} `));
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    if (href.startsWith('https://')) { link.target = '_blank'; link.rel = 'noreferrer'; }
    output.append(link);
  }
  $('#contact-command').hidden = false;
  output.textContent = 'Digite ajuda para conhecer os comandos ou escolha um atalho.';
  $('#contact-command').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#console-command');
    const command = input.value.trim().toLowerCase();
    if (command === 'email') outputLink('Vamos conversar:', email, `mailto:${email}`);
    else if (command === 'github') outputLink('Explore meu código:', 'github.com/plc232007 ↗', 'https://github.com/plc232007');
    else if (command === 'projetos') outputLink('Do conceito à entrega:', 'Ver projetos ↑', '#projetos');
    else if (command === 'sobre') outputLink('Prazer, Pedro Campos.', 'Conheça minha trajetória ↑', '#sobre');
    else if (command === 'limpar' || command === 'clear') output.textContent = 'Terminal pronto. Digite ajuda para explorar.';
    else if (command === 'ajuda' || command === 'help' || !command) output.textContent = 'Comandos: email · github · projetos · sobre · limpar. Escolha um comando e pressione Enter.';
    else output.textContent = 'Comando não reconhecido. Digite ajuda para ver as opções.';
    input.value = '';
  });
  if (navigator.clipboard?.writeText) {
    $('#console-copy').hidden = false;
    $('#console-copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(email); output.textContent = `Email copiado: ${email}`; }
      catch { output.textContent = `Copie o email: ${email}`; }
    });
  }
})();
