/* ============================================================
   HERO CORE 3D — núcleo neural interativo (Three.js)
   Wireframe icosaédrico + anéis orbitais + nuvem de partículas.
   Reage a mouse, arraste e scroll. Pausa fora da viewport.
   ============================================================ */
(function () {
  "use strict";

  const PALETTE = {
    dark: { main: 0x00c8ff, alt: 0x00ffe0, warm: 0xff9500, node: 0x39ff8a },
    light: { main: 0x0077cc, alt: 0x00a6b8, warm: 0xd97706, node: 0x1f9d55 },
  };

  const POINT_VERT = `
    attribute float aScale;
    attribute float aSpeed;
    attribute float aPhase;
    uniform float uTime;
    uniform float uPulse;
    uniform float uSize;
    varying float vAlpha;
    void main() {
      vec3 dir = normalize(position);
      float t = uTime * aSpeed + aPhase;
      vec3 p = position + dir * (sin(t) * 0.14 + uPulse * 0.5);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = aScale * uSize * (1.0 / max(0.001, -mv.z));
      gl_Position = projectionMatrix * mv;
      vAlpha = 0.25 + 0.75 * (0.5 + 0.5 * sin(t * 1.6));
    }
  `;

  const POINT_FRAG = `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float soft = smoothstep(0.5, 0.05, d);
      gl_FragColor = vec4(uColor, soft * vAlpha * uOpacity);
    }
  `;

  const GLOW_VERT = `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `;

  const GLOW_FRAG = `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
      gl_FragColor = vec4(uColor, fresnel * uIntensity);
    }
  `;

  /* Especificação dos anéis orbitais. Inclinações escolhidas para se
     cruzarem em ângulos harmônicos — nada de rotação aleatória. */
  const RING_SPECS = [
    { r: 2.55, tilt: [1.28, 0.0, 0.0], speed: 0.42, opacity: 0.55, key: "main" },
    { r: 2.95, tilt: [1.28, 0.62, 0.0], speed: -0.3, opacity: 0.42, key: "alt" },
    { r: 3.35, tilt: [1.28, -0.62, 0.0], speed: 0.22, opacity: 0.3, key: "node" },
  ];

  function build(mount, opts) {
    const isLight = document.body.classList.contains("light-theme");
    let colors = isLight ? PALETTE.light : PALETTE.dark;
    const dim = (dark, light) => (isLight ? light : dark);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("hero-3d-canvas");

    const group = new THREE.Group();
    scene.add(group);

    /* ---- Gaiola geodésica ----
       Detalhe 0 (30 arestas): silhueta limpa e legível. Detalhes maiores
       viram uma teia de linhas que lê como ruído atrás do card. */
    const shellGeo = new THREE.IcosahedronGeometry(3.25, 0);
    const shellMat = new THREE.LineBasicMaterial({
      color: colors.main,
      transparent: true,
      opacity: dim(0.32, 0.26),
    });
    const shell = new THREE.LineSegments(new THREE.WireframeGeometry(shellGeo), shellMat);
    group.add(shell);

    /* ---- Vértices da gaiola ---- */
    const nodeMat = new THREE.MeshBasicMaterial({
      color: colors.alt,
      transparent: true,
      opacity: dim(0.75, 0.5),
    });
    const nodes = [];
    const seen = new Set();
    const shellPos = shellGeo.attributes.position;
    for (let i = 0; i < shellPos.count; i++) {
      const x = shellPos.getX(i);
      const y = shellPos.getY(i);
      const z = shellPos.getZ(i);
      const key = `${x.toFixed(2)}|${y.toFixed(2)}|${z.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), nodeMat);
      node.position.set(x, y, z);
      node.userData.phase = Math.random() * Math.PI * 2;
      group.add(node);
      nodes.push(node);
    }

    /* ---- Halo suave: descola o card do fundo ---- */
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(colors.main) },
        uIntensity: { value: dim(0.34, 0.16) },
      },
      transparent: true,
      blending: dim(THREE.AdditiveBlending, THREE.NormalBlending),
      depthWrite: false,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2.9, 40, 40), glowMat);
    group.add(glow);

    /* ---- Anéis orbitais com um ponto de luz viajando em cada ---- */
    const rings = RING_SPECS.map((spec) => {
      const pivot = new THREE.Group();
      pivot.rotation.set(spec.tilt[0], spec.tilt[1], spec.tilt[2]);
      group.add(pivot);

      const mat = new THREE.MeshBasicMaterial({
        color: colors[spec.key],
        transparent: true,
        opacity: dim(spec.opacity, spec.opacity * 0.7),
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.r, 0.009, 6, 200), mat);
      pivot.add(ring);

      // O viajante é filho do anel: girar o anel em Z já o leva pela órbita
      const traveller = new THREE.Mesh(
        new THREE.SphereGeometry(0.062, 14, 14),
        new THREE.MeshBasicMaterial({
          color: colors[spec.key],
          transparent: true,
          opacity: dim(1, 0.75),
        })
      );
      traveller.position.set(spec.r, 0, 0);
      ring.add(traveller);

      // Rastro luminoso ao redor do viajante
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 14),
        new THREE.MeshBasicMaterial({
          color: colors[spec.key],
          transparent: true,
          opacity: dim(0.28, 0.16),
          blending: dim(THREE.AdditiveBlending, THREE.NormalBlending),
          depthWrite: false,
        })
      );
      traveller.add(halo);

      return { pivot, ring, mat, traveller, halo, spec };
    });

    /* ---- Poeira estelar ---- */
    const COUNT = opts.pointCount;
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const radius = 2.2 + Math.pow(Math.random(), 0.65) * 2.6;
      positions[i * 3] = s * Math.cos(theta) * radius;
      positions[i * 3 + 1] = s * Math.sin(theta) * radius;
      positions[i * 3 + 2] = u * radius;
      scales[i] = 3.5 + Math.random() * 8;
      speeds[i] = 0.3 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    pointGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    pointGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const pointMat = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uSize: { value: 1 },
        uColor: { value: new THREE.Color(colors.main) },
        uOpacity: { value: dim(0.85, 0.4) },
      },
      transparent: true,
      depthWrite: false,
      blending: dim(THREE.AdditiveBlending, THREE.NormalBlending),
    });
    group.add(new THREE.Points(pointGeo, pointMat));

    return {
      scene, camera, renderer, group,
      shell, shellMat, nodes, nodeMat, glow, glowMat, rings, pointMat,
      applyTheme(light) {
        colors = light ? PALETTE.light : PALETTE.dark;
        const d = (dark, lite) => (light ? lite : dark);

        shellMat.color.setHex(colors.main);
        shellMat.opacity = d(0.32, 0.26);

        nodeMat.color.setHex(colors.alt);
        nodeMat.opacity = d(0.75, 0.5);

        glowMat.uniforms.uColor.value.setHex(colors.main);
        glowMat.uniforms.uIntensity.value = d(0.34, 0.16);
        glowMat.blending = d(THREE.AdditiveBlending, THREE.NormalBlending);
        glowMat.needsUpdate = true;

        rings.forEach((r) => {
          const hex = colors[r.spec.key];
          r.mat.color.setHex(hex);
          r.mat.opacity = d(r.spec.opacity, r.spec.opacity * 0.7);
          r.traveller.material.color.setHex(hex);
          r.traveller.material.opacity = d(1, 0.75);
          r.halo.material.color.setHex(hex);
          r.halo.material.opacity = d(0.28, 0.16);
          r.halo.material.blending = d(THREE.AdditiveBlending, THREE.NormalBlending);
          r.halo.material.needsUpdate = true;
        });

        pointMat.uniforms.uColor.value.setHex(colors.main);
        pointMat.uniforms.uOpacity.value = d(0.85, 0.4);
        pointMat.blending = d(THREE.AdditiveBlending, THREE.NormalBlending);
        pointMat.needsUpdate = true;
      },
    };
  }

  function initHeroCore() {
    const mount = document.getElementById("hero-3d");
    if (!mount || typeof THREE === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 700px)").matches;
    const pointCount = narrow ? 450 : 1300;

    let world;
    try {
      world = build(mount, { pointCount });
    } catch (err) {
      console.warn("Hero 3D indisponível:", err);
      mount.classList.add("is-unavailable");
      return;
    }

    mount.classList.add("is-ready");

    const { renderer, camera, scene, group } = world;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    function resize() {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // gl_PointSize é em pixels do framebuffer — acompanha altura e DPR
      world.pointMat.uniforms.uSize.value = (h * dpr) / 140;
    }
    resize();
    window.addEventListener("resize", resize);

    /* ---------- Estado de interação ---------- */
    const state = {
      pointer: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      spin: 0,
      spinVel: 0,
      dragging: false,
      lastDrag: { x: 0, y: 0 },
      dragTilt: 0,
      pulse: 0,
      pulseTarget: 0,
      scrollSpin: 0,
    };

    if (!reduced) {
      window.addEventListener(
        "pointermove",
        (e) => {
          const rect = mount.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          state.target.x = (e.clientX - cx) / (window.innerWidth / 2);
          state.target.y = (e.clientY - cy) / (window.innerHeight / 2);

          // Aproximação do cursor faz a nuvem "respirar"
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const reach = Math.max(rect.width, 360) * 0.85;
          state.pulseTarget = Math.max(0, 1 - dist / reach) * 0.6;
        },
        { passive: true }
      );

      mount.addEventListener("pointerdown", (e) => {
        state.dragging = true;
        state.lastDrag.x = e.clientX;
        state.lastDrag.y = e.clientY;
        mount.setPointerCapture?.(e.pointerId);
        mount.classList.add("is-dragging");
      });

      mount.addEventListener("pointermove", (e) => {
        if (!state.dragging) return;
        state.spinVel += (e.clientX - state.lastDrag.x) * 0.0012;
        state.dragTilt += (e.clientY - state.lastDrag.y) * 0.0009;
        state.dragTilt = Math.max(-0.8, Math.min(0.8, state.dragTilt));
        state.lastDrag.x = e.clientX;
        state.lastDrag.y = e.clientY;
      });

      const endDrag = () => {
        state.dragging = false;
        mount.classList.remove("is-dragging");
      };
      mount.addEventListener("pointerup", endDrag);
      mount.addEventListener("pointercancel", endDrag);
      mount.addEventListener("pointerleave", endDrag);

      let lastScroll = window.scrollY;
      window.addEventListener(
        "scroll",
        () => {
          const delta = window.scrollY - lastScroll;
          lastScroll = window.scrollY;
          state.scrollSpin += delta * 0.00035;
        },
        { passive: true }
      );
    }

    /* ---------- Loop ---------- */
    let visible = true;
    let running = true;
    let rafId = null;
    const clock = new THREE.Clock();
    let prevElapsed = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && running) start();
      },
      { threshold: 0 }
    );
    observer.observe(mount);

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running && visible) start();
    });

    function frame() {
      rafId = null;
      if (!visible || !running) return;

      const t = clock.getElapsedTime();
      // getDelta() logo após getElapsedTime() retorna ~0 — calcula na mão
      const dt = Math.min(Math.max(t - prevElapsed, 0), 0.05);
      prevElapsed = t;

      // Rotação base contínua + inércia do arraste + impulso do scroll
      state.spinVel += state.scrollSpin;
      state.scrollSpin *= 0.9;
      state.spin += state.spinVel;
      state.spinVel *= 0.94;

      state.pointer.x += (state.target.x - state.pointer.x) * 0.06;
      state.pointer.y += (state.target.y - state.pointer.y) * 0.06;
      state.pulse += (state.pulseTarget - state.pulse) * 0.07;
      state.pulseTarget *= 0.97;

      group.rotation.y = t * 0.085 + state.spin + state.pointer.x * 0.55;
      group.rotation.x = state.pointer.y * 0.4 + state.dragTilt + Math.sin(t * 0.22) * 0.08;
      group.position.x = state.pointer.x * 0.32;
      group.position.y = -state.pointer.y * 0.22 + Math.sin(t * 0.5) * 0.06;

      const light = document.body.classList.contains("light-theme");

      // A gaiola gira devagar no próprio eixo, contra o giro do grupo
      world.shell.rotation.y = -t * 0.06;

      const breath = 1 + Math.sin(t * 0.8) * 0.03 + state.pulse * 0.1;
      world.glow.scale.setScalar(breath);
      world.glowMat.uniforms.uIntensity.value =
        (light ? 0.16 : 0.34) + state.pulse * 0.28;

      world.rings.forEach(({ pivot, ring, spec, halo }, i) => {
        // Girar o anel em Z leva o ponto de luz pela órbita
        ring.rotation.z += spec.speed * dt;
        // O plano da órbita deriva devagar, sem sacudir
        pivot.rotation.y += dt * 0.05 * (i % 2 ? -1 : 1);
        halo.scale.setScalar(1 + Math.sin(t * 3 + i * 2) * 0.22 + state.pulse * 0.5);
      });

      world.nodes.forEach((node) => {
        const s = 1 + Math.sin(t * 1.6 + node.userData.phase) * 0.28 + state.pulse * 0.45;
        node.scale.setScalar(s);
      });

      world.pointMat.uniforms.uTime.value = t;
      world.pointMat.uniforms.uPulse.value = state.pulse;

      renderer.render(scene, camera);
      start();
    }

    function start() {
      if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    if (reduced) {
      // Sem movimento: renderiza um quadro estático bonito
      group.rotation.set(0.3, 0.6, 0);
      renderer.render(scene, camera);
    } else {
      start();
    }

    window.HeroCore = {
      setTheme(isLight) {
        world.applyTheme(isLight);
        if (reduced) renderer.render(scene, camera);
      },
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroCore);
  } else {
    initHeroCore();
  }
})();
