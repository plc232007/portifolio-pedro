// ============================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  initBackToTop();
  initHeaderScroll();
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

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    // Storage bloqueado (modo privado): segue com o tema padrão.
  }

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

    try {
      localStorage.setItem("theme", isLight ? "light" : "dark");
    } catch {
      // Sem persistência; o tema vale só para esta visita.
    }
  });
}

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================
function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  window.addEventListener(
    "scroll",
    () => {
      button.classList.toggle("show", window.scrollY > 400);
    },
    { passive: true }
  );

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ============================================
// HEADER COM EFEITO DE SCROLL
// ============================================
function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!header) return;

  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 100);
    },
    { passive: true }
  );
}
