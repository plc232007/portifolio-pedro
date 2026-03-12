document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  initMatrixBackground();
  initAvatarUpload();
  initRevealAnimations();
  initCardTilt();
  initBackToTop();
});

function initYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

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
  });
}

function initMatrixBackground() {
  const canvas = document.getElementById("matrix-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const chars = "01アイウエオカキクケコサシスセソタチツテトナ{}[]()<>/\\=+-_|;:".split("");

  let drops = [];
  let columns = 0;
  let lastDrawTime = 0;

  const fontSize = 14;
  const columnWidth = 20;
  const frameDelay = 60;

  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / columnWidth);
    drops = Array(columns).fill(1);
  }

  function draw(currentTime = 0) {
    if (currentTime - lastDrawTime >= frameDelay) {
      const isLightTheme = document.body.classList.contains("light-theme");

      ctx.fillStyle = isLightTheme ? "rgba(244,248,252,0.18)" : "rgba(5,11,20,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isLightTheme ? "rgba(0,119,204,0.35)" : "#00c8ff";
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      drops.forEach((y, index) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = index * columnWidth;
        const posY = y * columnWidth;

        ctx.fillText(char, x, posY);

        if (posY > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }

        drops[index]++;
      });

      lastDrawTime = currentTime;
    }

    window.requestAnimationFrame(draw);
  }

  setupCanvas();
  window.addEventListener("resize", setupCanvas);
  window.requestAnimationFrame(draw);
}

function initAvatarUpload() {
  const avatarInput = document.getElementById("avatar-input");
  const avatarPhoto = document.getElementById("avatar-photo");
  const avatarInitials = document.getElementById("avatar-initials");

  if (!avatarInput || !avatarPhoto || !avatarInitials) return;

  avatarInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      avatarPhoto.src = loadEvent.target?.result || "";
      avatarPhoto.style.display = "block";
      avatarInitials.style.display = "none";
    };

    reader.readAsDataURL(file);
  });
}

function initRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        const progressBars = entry.target.querySelectorAll(".bar-fill");
        progressBars.forEach((bar) => {
          const width = bar.dataset.width;
          if (width) {
            bar.style.width = `${width}%`;
          }
        });

        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initCardTilt() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll(
    ".skill-card, .exp-card, .edu-card, .fun-card, .proj-card:not(.placeholder)"
  );

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `
        perspective(700px)
        rotateX(${(-y * 7).toFixed(2)}deg)
        rotateY(${(x * 7).toFixed(2)}deg)
        translateY(-3px)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}