/**
 * TOPMANSHOPWORLD Interactive Experience layer
 * Progressive enhancement: works without WebGL; respects prefers-reduced-motion.
 * Stylized procedural vehicle — original meshes, not a licensed CAD model.
 */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("hero-canvas");
  const root = document.documentElement;

  /* ---------- Zone UI (shared) ---------- */
  function bindZones() {
    const tabs = document.querySelectorAll("[data-zone-tab]");
    const spots = document.querySelectorAll("[data-zone]");
    const title = document.getElementById("zone-title");
    const copy = document.getElementById("zone-copy");
    const link = document.getElementById("zone-shop-link");
    const glows = document.querySelectorAll(".zone-glow");
    const car = document.querySelector(".stage-car");

    const data = {
      lighting: {
        title: "Lighting",
        copy: "Shape presence after dark — projectors, DRLs, ambient rails. Highlight the optical zone, then open the Lighting catalogue.",
        href: "https://topmanshopworld.clan.su/shop/lighting",
      },
      body: {
        title: "Body",
        copy: "Aero lips, mirror caps, grille accents. Isolate the shell silhouette and jump into Body upgrades.",
        href: "https://topmanshopworld.clan.su/shop/body",
      },
      multimedia: {
        title: "Multimedia",
        copy: "Head units, cameras, HUD. Activate the cabin interface zone and browse Multimedia.",
        href: "https://topmanshopworld.clan.su/shop/multimedia",
      },
    };

    function setZone(zone) {
      const d = data[zone];
      if (!d) return;
      tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.zoneTab === zone)));
      spots.forEach((s) => s.setAttribute("aria-pressed", String(s.dataset.zone === zone)));
      glows.forEach((g) => g.classList.toggle("is-on", g.classList.contains(zone)));
      if (title) title.textContent = d.title;
      if (copy) copy.textContent = d.copy;
      if (link) {
        link.href = d.href;
        link.textContent = "Open " + d.title + " catalogue";
      }
      if (car) {
        car.style.filter =
          zone === "lighting"
            ? "drop-shadow(0 0 28px rgba(110,200,255,0.35))"
            : zone === "body"
              ? "drop-shadow(0 0 22px rgba(196,165,116,0.3))"
              : "drop-shadow(0 0 22px rgba(93,206,160,0.28))";
      }
    }

    tabs.forEach((t) => t.addEventListener("click", () => setZone(t.dataset.zoneTab)));
    spots.forEach((s) => s.addEventListener("click", () => setZone(s.dataset.zone)));
    setZone("lighting");
  }

  /* ---------- Product gallery ---------- */
  function bindGallery() {
    const main = document.getElementById("gallery-main");
    const thumbs = document.querySelectorAll("[data-gallery]");
    if (!main || !thumbs.length) return;
    thumbs.forEach((btn) => {
      btn.addEventListener("click", () => {
        thumbs.forEach((b) => b.setAttribute("aria-current", "false"));
        btn.setAttribute("aria-current", "true");
        main.textContent = btn.dataset.gallery;
      });
    });
  }

  /* ---------- Compat form (demo only — live site uses uCoz mail/shop) ---------- */
  function bindCompat() {
    const form = document.getElementById("compat-form");
    const out = document.getElementById("compat-result");
    if (!form || !out) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const make = fd.get("make");
      const model = fd.get("model");
      const year = fd.get("year");
      out.hidden = false;
      out.innerHTML =
        "<strong>Request queued (demo).</strong> On production this posts through uCoz mail/shop flow for " +
        make +
        " " +
        model +
        " (" +
        year +
        "). No charge until a staffer confirms fitment.";
    });
  }

  /* ---------- Three.js hero ---------- */
  function initHero() {
    if (!canvas || reduced) {
      root.classList.add("no-webgl");
      return;
    }
    if (typeof THREE === "undefined") {
      root.classList.add("no-webgl");
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (err) {
      root.classList.add("no-webgl");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.Fog(0x07080a, 8, 22);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3.6, 1.35, 5.2);

    const hemi = new THREE.HemisphereLight(0x9eb6d4, 0x12151a, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(4, 6, 2);
    key.castShadow = false;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ec8ff, 0.55);
    rim.position.set(-5, 2, -3);
    scene.add(rim);
    const accent = new THREE.SpotLight(0xc4a574, 1.1, 20, Math.PI / 7, 0.45);
    accent.position.set(-2, 5, 4);
    scene.add(accent);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshStandardMaterial({ color: 0x0c0e12, metalness: 0.7, roughness: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    scene.add(floor);

    const vehicle = buildStylizedVehicle();
    scene.add(vehicle);

    const pointer = { x: 0, y: 0 };
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const clock = new THREE.Clock();
    function tick() {
      raf = 0;
      if (!visible) return;
      const t = clock.getElapsedTime();
      const scroll = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      vehicle.rotation.y = -0.35 + pointer.x * 0.18 + scroll * 0.55;
      vehicle.position.y = Math.sin(t * 0.7) * 0.02;
      camera.position.x = 3.6 + pointer.x * 0.25;
      camera.position.y = 1.35 + pointer.y * -0.12 + scroll * 0.35;
      camera.lookAt(0, 0.15, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function buildStylizedVehicle() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a2030,
      metalness: 0.85,
      roughness: 0.28,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x9ec9ff,
      metalness: 0.2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
    });
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0x6ec8ff,
      emissive: 0x3a8ec4,
      emissiveIntensity: 0.8,
      metalness: 0.4,
      roughness: 0.2,
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.6, roughness: 0.45 });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 3.6), bodyMat);
    cabin.position.set(0, 0.15, 0);
    g.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 1.9), glassMat);
    roof.position.set(0, 0.58, -0.15);
    g.add(roof);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.18, 1.1), bodyMat);
    hood.position.set(0, 0.28, 1.55);
    hood.rotation.x = -0.12;
    g.add(hood);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.9), bodyMat);
    trunk.position.set(0, 0.28, -1.7);
    g.add(trunk);

    [-1, 1].forEach((side) => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), lightMat);
      lamp.position.set(side * 0.65, 0.22, 2.05);
      g.add(lamp);
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 24), darkMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.95, -0.28, 1.15);
      g.add(wheel);
      const wheel2 = wheel.clone();
      wheel2.position.z = -1.15;
      g.add(wheel2);
    });

    g.position.y = 0.05;
    return g;
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindZones();
    bindGallery();
    bindCompat();
    initHero();
  });
})();
