/* ============================================================
   INTERAÇÕES — camada criativa
   Boot screen, progresso de scroll, navegação lateral, botões
   magnéticos, esfera 3D de tecnologias, contadores e scramble.
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ============================================================
     REVELAÇÃO POR SCROLL
     Sem JS a classe .js-reveal nunca é aplicada e tudo permanece
     visível — o conteúdo jamais fica preso em opacity: 0.
     ============================================================ */
  const GROUPS = [
    { sel: ".section-head", stagger: 0 },
    { sel: ".about-box", stagger: 0 },
    { sel: ".fun-card", stagger: 70 },
    { sel: ".skill-card", stagger: 110 },
    { sel: ".tl-entry", stagger: 140 },
    { sel: ".edu-card", stagger: 110 },
    { sel: ".projects-subsection-header", stagger: 0 },
    { sel: ".proj-card", stagger: 90 },
    { sel: ".contact-wrap", stagger: 0 },
  ];

  function initReveal() {
    document.documentElement.classList.add("js-reveal");

    const items = [];
    GROUPS.forEach(({ sel, stagger }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add("reveal-item");
        if (stagger) el.style.setProperty("--reveal-delay", `${(i % 6) * stagger}ms`);
        items.push(el);
      });
    });

    const show = (el) => {
      el.classList.add("is-in");
      // Barras de habilidade preenchem junto com o card
      el.querySelectorAll?.(".bar-fill[data-width]").forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = `${bar.dataset.width}%`;
        }, 200 + i * 90);
      });
    };

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    items.forEach((el) => io.observe(el));

    // Rede de segurança: qualquer item ainda escondido após 6s aparece
    setTimeout(() => items.forEach(show), 6000);
  }

  /* ============================================================
     BOOT SCREEN — sequência de inicialização
     ============================================================ */
  function initBoot() {
    const boot = document.getElementById("boot");
    if (!boot) return;

    const close = () => {
      if (boot.dataset.done) return;
      boot.dataset.done = "1";
      boot.classList.add("is-hidden");
      document.body.classList.remove("is-booting");
      setTimeout(() => boot.remove(), 900);
    };

    // Failsafe: nunca deixa a tela presa
    setTimeout(close, 4200);
    window.addEventListener("load", () => setTimeout(close, 1400));
    boot.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Enter") close();
    });

    if (reduced) {
      close();
      return;
    }

    const lines = Array.from(boot.querySelectorAll(".boot-line"));
    const bar = boot.querySelector(".boot-bar-fill");
    let i = 0;

    const step = () => {
      if (i < lines.length) {
        lines[i].classList.add("is-visible");
        if (bar) bar.style.width = `${((i + 1) / lines.length) * 100}%`;
        i++;
        setTimeout(step, 150 + Math.random() * 120);
      } else {
        setTimeout(close, 420);
      }
    };
    setTimeout(step, 180);
  }

  /* ============================================================
     BARRA DE PROGRESSO DE SCROLL
     ============================================================ */
  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    const grid = reduced ? null : document.getElementById("bg-grid");
    if (!bar && !grid) return;

    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, pct / 100)})`;

      // A malha desliza bem devagar — dá profundidade sem chamar atenção
      if (grid) {
        grid.style.setProperty("--grid-shift", `${(-window.scrollY * 0.04).toFixed(1)}px`);
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ============================================================
     NAVEGAÇÃO LATERAL EM PONTOS
     ============================================================ */
  function initSectionNav() {
    const nav = document.getElementById("section-nav");
    if (!nav) return;

    const sections = Array.from(document.querySelectorAll("main section[id]"));
    if (!sections.length) return;

    const dots = sections.map((section) => {
      const label = section.dataset.navLabel || section.id;
      const dot = document.createElement("a");
      dot.className = "section-dot";
      dot.href = `#${section.id}`;
      dot.setAttribute("aria-label", `Ir para ${label}`);
      dot.innerHTML = `<span class="section-dot-mark"></span><span class="section-dot-label">${label}</span>`;
      nav.appendChild(dot);
      return dot;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sections.indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ============================================================
     BOTÕES MAGNÉTICOS
     ============================================================ */
  function initMagnetic() {
    if (reduced || coarse) return;

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.32;
      let raf = null;
      let cur = { x: 0, y: 0 };
      let goal = { x: 0, y: 0 };

      const tick = () => {
        cur.x += (goal.x - cur.x) * 0.18;
        cur.y += (goal.y - cur.y) * 0.18;
        el.style.setProperty("--mag-x", `${cur.x.toFixed(2)}px`);
        el.style.setProperty("--mag-y", `${cur.y.toFixed(2)}px`);
        if (Math.abs(goal.x - cur.x) > 0.1 || Math.abs(goal.y - cur.y) > 0.1) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      };
      const run = () => {
        if (raf === null) raf = requestAnimationFrame(tick);
      };

      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        goal.x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        goal.y = (e.clientY - (rect.top + rect.height / 2)) * strength;
        run();
      });
      el.addEventListener("pointerleave", () => {
        goal.x = 0;
        goal.y = 0;
        run();
      });
    });
  }

  /* ============================================================
     ESFERA 3D DE TECNOLOGIAS
     ============================================================ */
  function initTechSphere() {
    const mount = document.getElementById("tech-sphere");
    if (!mount) return;

    const nodes = Array.from(mount.querySelectorAll(".tech-node"));
    if (!nodes.length) return;

    const n = nodes.length;
    const items = nodes.map((el, i) => {
      // Distribuição por espiral de Fibonacci — espaçamento uniforme
      const phi = Math.acos(-1 + (2 * i + 1) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      return {
        el,
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
      };
    });

    let radius = 0;
    const measure = () => {
      const box = mount.getBoundingClientRect();
      // Desconta a perspectiva (até ~1.55x) e a metade da largura de um rótulo,
      // para que nenhum nó vaze da caixa
      radius = Math.min(box.width, box.height) / 2 - 76;
      radius = Math.max(76, radius);
    };
    measure();
    window.addEventListener("resize", measure);

    const state = { rx: -0.25, ry: 0, vx: 0, vy: 0.0035, dragging: false, last: { x: 0, y: 0 }, hover: false };

    if (!reduced) {
      mount.addEventListener("pointermove", (e) => {
        const box = mount.getBoundingClientRect();
        const nx = (e.clientX - (box.left + box.width / 2)) / (box.width / 2);
        const ny = (e.clientY - (box.top + box.height / 2)) / (box.height / 2);

        if (state.dragging) {
          state.vy += (e.clientX - state.last.x) * 0.00022;
          state.vx += (e.clientY - state.last.y) * 0.00018;
          state.last.x = e.clientX;
          state.last.y = e.clientY;
        } else {
          state.vy += nx * 0.00055;
          state.vx += ny * 0.00045;
        }
      });

      mount.addEventListener("pointerdown", (e) => {
        state.dragging = true;
        state.last.x = e.clientX;
        state.last.y = e.clientY;
        mount.setPointerCapture?.(e.pointerId);
        mount.classList.add("is-dragging");
      });
      const stop = () => {
        state.dragging = false;
        mount.classList.remove("is-dragging");
      };
      mount.addEventListener("pointerup", stop);
      mount.addEventListener("pointercancel", stop);
      mount.addEventListener("pointerleave", stop);
      mount.addEventListener("mouseenter", () => (state.hover = true));
      mount.addEventListener("mouseleave", () => (state.hover = false));
    }

    let running = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) loop();
      },
      { threshold: 0 }
    );
    io.observe(mount);

    let rafId = null;
    function render() {
      rafId = null;
      if (!running) return;

      if (!reduced) {
        state.ry += state.vy;
        state.rx += state.vx;
        state.vy = state.vy * 0.955 + (state.hover ? 0 : 0.00016);
        state.vx *= 0.94;
        state.rx = Math.max(-0.85, Math.min(0.85, state.rx));
      }

      const cy = Math.cos(state.ry);
      const sy = Math.sin(state.ry);
      const cx = Math.cos(state.rx);
      const sx = Math.sin(state.rx);

      for (const it of items) {
        // Rotação Y depois X
        const x1 = it.x * cy - it.z * sy;
        const z1 = it.x * sy + it.z * cy;
        const y2 = it.y * cx - z1 * sx;
        const z2 = it.y * sx + z1 * cx;

        const depth = 2.8 / (2.8 - z2); // perspectiva
        const px = x1 * radius * depth;
        const py = y2 * radius * depth;
        const opacity = Math.max(0.16, Math.min(1, (z2 + 1.15) / 2));

        it.el.style.transform = `translate3d(calc(${px.toFixed(1)}px - 50%), calc(${py.toFixed(
          1
        )}px - 50%), 0) scale(${depth.toFixed(3)})`;
        it.el.style.opacity = opacity.toFixed(3);
        it.el.style.zIndex = String(Math.round(depth * 100));
        it.el.style.filter = z2 < -0.1 ? `blur(${Math.min(1.6, -z2 * 1.8).toFixed(2)}px)` : "none";
      }

      if (!reduced) loop();
    }
    function loop() {
      if (rafId === null) rafId = requestAnimationFrame(render);
    }
    render();
  }

  /* ============================================================
     RADAR DE COMPETÊNCIAS — leitura ao passar o cursor
     ============================================================ */
  function initRadar() {
    const readout = document.getElementById("radar-readout");
    const svg = document.querySelector(".radar");
    if (!readout || !svg) return;

    const nameEl = readout.querySelector(".radar-readout-name");
    const lvlEl = readout.querySelector(".radar-readout-lvl");
    const idle = { name: nameEl.textContent, lvl: lvlEl.textContent };

    const setActive = (i) => {
      svg.querySelectorAll(".radar-vertex, .radar-label").forEach((el) => {
        el.classList.toggle("is-active", el.dataset.i === i);
      });
    };

    svg.querySelectorAll(".radar-hit").forEach((hit) => {
      const enter = () => {
        nameEl.textContent = hit.dataset.name;
        lvlEl.textContent = `${hit.dataset.level} · ${hit.dataset.value}%`;
        readout.classList.add("is-live");
        setActive(hit.dataset.i);
      };
      const leave = () => {
        nameEl.textContent = idle.name;
        lvlEl.textContent = idle.lvl;
        readout.classList.remove("is-live");
        setActive(null);
      };
      hit.addEventListener("pointerenter", enter);
      hit.addEventListener("pointerleave", leave);
      hit.addEventListener("focus", enter);
      hit.addEventListener("blur", leave);
      hit.setAttribute("tabindex", "0");
      hit.setAttribute("role", "img");
      hit.setAttribute(
        "aria-label",
        `${hit.dataset.name}: ${hit.dataset.level}, ${hit.dataset.value} por cento`
      );
    });
  }

  /* ============================================================
     RELÓGIO DE STATUS NO HEADER
     ============================================================ */
  function initStatusChip() {
    const el = document.getElementById("status-clock");
    if (!el) return;

    const fmt = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    const tick = () => {
      el.textContent = fmt.format(new Date());
    };
    tick();
    setInterval(tick, 20000);
  }

  /* ============================================================
     CONTADORES ANIMADOS
     ============================================================ */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.countSuffix || "";
      if (Number.isNaN(target)) return;
      if (reduced) {
        el.textContent = target + suffix;
        return;
      }
      const dur = 1200;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.counted) return;
          entry.target.dataset.counted = "1";
          run(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ============================================================
     SCRAMBLE — títulos "decodificam" ao entrar em cena
     ============================================================ */
  function initScramble() {
    const targets = document.querySelectorAll("[data-scramble]");
    if (!targets.length || reduced) return;

    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/<>{}[]*+=";

    const scramble = (el) => {
      const final = el.textContent;
      const chars = final.split("");
      let frame = 0;
      const total = chars.length * 2 + 12;

      const tick = () => {
        const revealed = Math.floor((frame / total) * chars.length * 1.35);
        el.textContent = chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < revealed) return c;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        frame++;
        if (frame <= total) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = final;
        }
      };
      tick();
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.scrambled) return;
          entry.target.dataset.scrambled = "1";
          scramble(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ============================================================
     SPOTLIGHT — brilho seguindo o cursor em cards
     ============================================================ */
  function initSpotlight() {
    if (coarse) return;
    const cards = document.querySelectorAll("[data-spotlight]");
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--sx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty("--sy", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
    });
  }

  /* ============================================================
     TERMINAL DO HERO — digitação de comandos rotativos
     ============================================================ */
  function initTypedCommand() {
    const el = document.getElementById("typed-cmd");
    if (!el) return;

    const cmds = [
      "cat perfil.json",
      "git log --oneline -3",
      "python factoryflow.py --run",
      "npm run build && deploy",
    ];
    if (reduced) {
      el.textContent = cmds[0];
      return;
    }

    let ci = 0;
    let pos = 0;
    let deleting = false;

    const tick = () => {
      const cmd = cmds[ci];
      pos += deleting ? -1 : 1;
      el.textContent = cmd.slice(0, pos);

      let delay = deleting ? 28 : 62;
      if (!deleting && pos === cmd.length) {
        delay = 2200;
        deleting = true;
      } else if (deleting && pos === 0) {
        deleting = false;
        ci = (ci + 1) % cmds.length;
        delay = 420;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1400);
  }

  /* ============================================================
     CARDS COM VIRADA 3D — acessível via teclado
     ============================================================ */
  function initFlipCards() {
    document.querySelectorAll(".fun-card").forEach((card) => {
      card.setAttribute("tabindex", "0");
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("is-flipped");
        }
      });
    });
  }

  /* ============================================================
     BOOT + INIT
     ============================================================ */
  function init() {
    initReveal();
    initBoot();
    initScrollProgress();
    initSectionNav();
    initMagnetic();
    initTechSphere();
    initRadar();
    initStatusChip();
    initCounters();
    initScramble();
    initSpotlight();
    initTypedCommand();
    initFlipCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
