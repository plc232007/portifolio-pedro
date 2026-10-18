/* ============================================================
   INTERAÇÕES
   Revelação por scroll, progresso de scroll e navegação lateral.
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     REVELAÇÃO POR SCROLL
     Sem JS a classe .js-reveal nunca é aplicada e tudo permanece
     visível — o conteúdo jamais fica preso em opacity: 0.
     ============================================================ */
  const GROUPS = [
    { sel: ".section-head", stagger: 0 },
    { sel: ".about-box", stagger: 0 },
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

    const show = (el) => el.classList.add("is-in");

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
     TILT 3D NOS PROJETOS EM DESTAQUE
     Só com mouse e sem prefers-reduced-motion. O brilho do
     ::before segue o cursor pelas variáveis --mouse-x/--mouse-y.
     ============================================================ */
  function initCardTilt() {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    document.querySelectorAll(".proj-card--featured").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.classList.add("is-tilting");
        card.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg) translateY(-4px)`;
        card.style.setProperty("--mouse-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--mouse-y", `${(y * 100).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.classList.remove("is-tilting");
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initReveal();
    initScrollProgress();
    initSectionNav();
    initCardTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
