/* =====================================================================
   Tasksmith · Casa 3D interactiva del hero
   - Arrastra para girar (con inercia), pasa el cursor por un objeto para
     ver el oficio, clic para pedir un especialista de ese oficio.
   - En táctil: primer toque muestra el oficio, segundo toque lo pide.
   Requiere Three.js r128 (global THREE).
   ===================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-house3d]');
  if (!root) return;

  var TRADES = {
    'Plomería':          { label: 'Plomería',          desc: 'Fugas, grifos y tuberías',   color: '#2F7FC1' },
    'Electrodomésticos': { label: 'Electrodomésticos', desc: 'Neveras y lavadoras',        color: '#3BA99C' },
    'Carpintería':       { label: 'Carpintería',       desc: 'Puertas, closets y muebles', color: '#D9822B' },
    'Electricidad':      { label: 'Electricidad',      desc: 'Cortos, breakers y tomas',   color: '#F2B33D' },
    'Aseo':              { label: 'Aseo',              desc: 'Limpieza integral del hogar', color: '#5FA36A' },
    'Pintura':           { label: 'Pintura & Drywall', desc: 'Humedades y retoques',       color: '#E2654F' }
  };

  var chips = root.querySelectorAll('.h3d-chip');
  var tip = root.querySelector('.h3d-tip');
  var tipTitle = tip.querySelector('strong');
  var tipDesc = tip.querySelector('small');
  var tipDot = tip.querySelector('.h3d-tip-dot');
  var hint = root.querySelector('.h3d-hint');
  var stage = root.querySelector('.h3d-stage');

  function book(trade) {
    if (typeof window.openBookingModal === 'function') window.openBookingModal(trade);
  }

  // Los chips funcionan aunque WebGL no esté disponible
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { book(chip.dataset.trade); });
  });

  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (typeof THREE === 'undefined' || !webglOK()) {
    root.classList.add('is-fallback');
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Renderer, escena y cámara ---------------- */
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'h3d-canvas';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Casa en 3D con los oficios de Tasksmith. Arrastra para girarla y pasa el cursor por cada objeto para ver el oficio.');
  stage.insertBefore(renderer.domElement, stage.firstChild);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  var LOOK = new THREE.Vector3(0, 1.85, 0);

  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xD9C6B0, 0.72));
  var sun = new THREE.DirectionalLight(0xFFF4E2, 0.62);
  sun.position.set(4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -4; sun.shadow.camera.right = 4;
  sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -3;
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0xCFE6FF, 0.18);
  fill.position.set(-5, 3, 4);
  scene.add(fill);

  var world = new THREE.Group();
  scene.add(world);

  /* ---------------- Utilidades de geometría ---------------- */
  function mat(hex, extra) {
    var o = { color: hex, roughness: 0.62, metalness: 0.02 };
    if (extra) for (var k in extra) o[k] = extra[k];
    return new THREE.MeshStandardMaterial(o);
  }

  function mesh(geo, material, x, y, z, parent, opts) {
    var m = new THREE.Mesh(geo, material);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = !(opts && opts.noCast);
    m.receiveShadow = true;
    (parent || world).add(m);
    return m;
  }

  function box(w, h, d, material, x, y, z, parent, opts) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent, opts);
  }

  function rbox(w, h, d, r, material, x, y, z, parent) {
    var s = new THREE.Shape();
    var hw = w / 2 - r, hh = h / 2 - r;
    s.moveTo(-hw, -h / 2);
    s.lineTo(hw, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -hh);
    s.lineTo(w / 2, hh);
    s.quadraticCurveTo(w / 2, h / 2, hw, h / 2);
    s.lineTo(-hw, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, hh);
    s.lineTo(-w / 2, -hh);
    s.quadraticCurveTo(-w / 2, -h / 2, -hw, -h / 2);
    var bevel = Math.min(0.03, d / 4);
    var geo = new THREE.ExtrudeGeometry(s, {
      depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel,
      bevelSize: bevel, bevelSegments: 3, curveSegments: 8
    });
    geo.translate(0, 0, -(d - bevel * 2) / 2);
    return mesh(geo, material, x, y, z, parent);
  }

  function cyl(rt, rb, h, material, x, y, z, parent, seg, open) {
    return mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open), material, x, y, z, parent);
  }

  /* ---------------- La casa ---------------- */
  var C = {
    grass: 0x8CC084, soil: 0xC4A88E, wallOut: 0xFFF8EC, wallLow: 0xF6E3C6, wallUp: 0xE3EEF8,
    floor: 0xE2C29C, slab: 0x856247, roof: 0x5B9BD5, ink: 0x4D4645, white: 0xFFFFFF
  };

  // Isla de césped
  var island = cyl(2.55, 2.7, 0.26, mat(C.soil), 0, -0.2, 0, world, 48);
  island.castShadow = false;
  var lawn = cyl(2.6, 2.6, 0.12, mat(C.grass, { roughness: 0.85 }), 0, -0.04, 0, world, 48);
  lawn.castShadow = false;

  // Camino de piedras hacia la puerta
  [[-2.15, 0.55], [-2.3, 1.0], [-2.1, 1.45]].forEach(function (p) {
    var s = cyl(0.14, 0.14, 0.04, mat(0xF2EADF), p[0], 0.03, p[1], world, 16);
    s.castShadow = false;
  });

  // Arbusto y árbol para dar vida
  var bushMat = mat(0x6FA866, { roughness: 0.9 });
  mesh(new THREE.SphereGeometry(0.26, 16, 12), bushMat, 2.1, 0.2, 1.1);
  mesh(new THREE.SphereGeometry(0.2, 16, 12), bushMat, 2.35, 0.14, 0.8);
  cyl(0.06, 0.08, 0.6, mat(0x856247), 2.05, 0.3, -1.25, world, 10);
  mesh(new THREE.SphereGeometry(0.42, 18, 14), mat(0x79B46F, { roughness: 0.9 }), 2.05, 0.95, -1.25);

  // Pisos y muros (casa abierta por el frente y la derecha, como casa de muñecas)
  var W = 3.6, D = 2.4, H = 1.5;
  box(W + 0.12, 0.1, D + 0.12, mat(C.floor), 0, 0.05, 0);
  box(W, 1.5, 0.12, mat(C.wallLow), 0, 0.85, -D / 2 - 0.06);
  box(W, 1.5, 0.12, mat(C.wallUp), 0, 0.85 + H, -D / 2 - 0.06);
  box(0.12, 3.0, D + 0.12, mat(C.wallOut), -W / 2 - 0.06, 1.6, 0);
  var slab = box(W + 0.24, 0.12, D + 0.24, mat(C.floor), 0, 0.1 + H, 0.0);
  box(W + 0.26, 0.04, D + 0.26, mat(C.slab), 0, 0.03 + H, 0.0);
  box(W + 0.24, 0.1, D + 0.24, mat(C.wallOut), 0, 3.12, 0); // techo interior

  // Ventanas en el muro trasero
  function windowAt(x, y, w, h) {
    box(w + 0.1, h + 0.1, 0.05, mat(C.white), x, y, -D / 2 + 0.01);
    box(w, h, 0.04, mat(0x9ED8FF, { roughness: 0.2, metalness: 0.1 }), x, y, -D / 2 + 0.03);
    box(0.04, h, 0.05, mat(C.white), x, y, -D / 2 + 0.05);
  }
  windowAt(-0.25, 2.45, 0.6, 0.5);
  windowAt(0.6, 1.05, 0.5, 0.42);

  // Puerta y ventana en el muro izquierdo
  rbox(0.62, 1.05, 0.06, 0.05, mat(0x255886), -W / 2 - 0.13, 0.62, 0.55).rotation.y = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.035, 12, 10), mat(0xFFD34E, { metalness: 0.4, roughness: 0.3 }), -W / 2 - 0.17, 0.62, 0.35);
  var sideWin = box(0.05, 0.45, 0.55, mat(0x9ED8FF, { roughness: 0.2 }), -W / 2 - 0.13, 2.35, -0.2);
  box(0.04, 0.55, 0.65, mat(C.white), -W / 2 - 0.11, 2.35, -0.2);

  // Techo a dos aguas con las franjas del logo
  var roofGroup = new THREE.Group();
  world.add(roofGroup);
  var rise = 1.15, run = 1.55;
  var slope = Math.atan2(rise, run), len = Math.sqrt(rise * rise + run * run) + 0.12;
  [1, -1].forEach(function (side) {
    var plane = box(W + 0.5, 0.14, len, mat(C.roof), 0, 3.17 + rise / 2 + 0.04, side * run / 2, roofGroup);
    plane.rotation.x = side * slope;
    for (var i = -2; i <= 2; i++) {
      box(0.1, 0.02, len - 0.25, mat(C.white, { roughness: 0.4 }), i * 0.68 + 0.2, 0.08, 0, plane);
    }
  });
  // Hastial izquierdo (triángulo) con ventana redonda
  var tri = new THREE.Shape();
  tri.moveTo(-D / 2 - 0.06, 0); tri.lineTo(D / 2 + 0.06, 0); tri.lineTo(0, rise - 0.02); tri.lineTo(-D / 2 - 0.06, 0);
  var gable = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.12, bevelEnabled: false }), mat(C.wallOut), -W / 2 - 0.12, 3.17, 0);
  gable.rotation.y = Math.PI / 2;
  var oculus = mesh(new THREE.TorusGeometry(0.17, 0.035, 10, 28), mat(C.white), -W / 2 - 0.13, 3.55, 0);
  oculus.rotation.y = Math.PI / 2;
  var oculusGlass = cyl(0.15, 0.15, 0.03, mat(0x9ED8FF, { roughness: 0.2 }), -W / 2 - 0.13, 3.55, 0, world, 24);
  oculusGlass.rotation.z = Math.PI / 2;
  // Chimenea
  box(0.32, 0.8, 0.32, mat(0xC9785A), 0.95, 3.95, -0.65);
  box(0.4, 0.08, 0.4, mat(0xA85F45), 0.95, 4.37, -0.65);

  /* ---------------- Objetos de los oficios ---------------- */
  var crafts = [];
  function craft(trade, x, y, z) {
    var g = new THREE.Group();
    g.position.set(x, y, z);
    g.userData = { trade: trade, baseY: y, lift: 0, scale: 0.0, hover: 0 };
    world.add(g);
    crafts.push(g);
    return g;
  }

  var FLOOR0 = 0.1, FLOOR1 = 0.16 + H;

  // Plomería: mueble de cocina con grifo que gotea
  var plumb = craft('Plomería', -1.12, FLOOR0, -0.78);
  rbox(0.9, 0.7, 0.52, 0.05, mat(0x2F7FC1), 0, 0.35, 0, plumb);
  box(0.02, 0.56, 0.02, mat(0x255886), 0, 0.35, 0.27, plumb);
  [-0.08, 0.08].forEach(function (dx) {
    mesh(new THREE.SphereGeometry(0.028, 10, 8), mat(0xFFD34E, { metalness: 0.4 }), dx, 0.38, 0.28, plumb);
  });
  box(1.0, 0.06, 0.6, mat(C.white, { roughness: 0.35 }), 0, 0.73, 0.02, plumb);
  box(0.46, 0.02, 0.3, mat(0xB8E4FF, { roughness: 0.15 }), 0, 0.765, 0.02, plumb);
  var chrome = mat(0xC9D4DE, { metalness: 0.75, roughness: 0.25 });
  cyl(0.03, 0.035, 0.26, chrome, 0, 0.88, -0.2, plumb, 14);
  var spout = cyl(0.026, 0.026, 0.2, chrome, 0, 1.0, -0.1, plumb, 14);
  spout.rotation.x = Math.PI / 2;
  cyl(0.026, 0.02, 0.06, chrome, 0, 0.98, 0.0, plumb, 14);
  box(0.16, 0.03, 0.04, chrome, 0, 1.03, -0.2, plumb);
  var drip = mesh(new THREE.SphereGeometry(0.03, 12, 10), mat(0x5BB4F0, { roughness: 0.1, emissive: 0x0A3D66 }), 0, 0.93, 0.0, plumb, { noCast: true });

  // Electrodomésticos: lavadora con el tambor girando
  var appl = craft('Electrodomésticos', 0.0, FLOOR0, -0.82);
  rbox(0.7, 0.76, 0.62, 0.06, mat(C.white, { roughness: 0.4 }), 0, 0.38, 0, appl);
  box(0.66, 0.14, 0.02, mat(0x3BA99C), 0, 0.66, 0.31, appl);
  [-0.22, -0.12].forEach(function (dx) {
    var k = cyl(0.03, 0.03, 0.03, mat(C.white), dx, 0.66, 0.33, appl, 14);
    k.rotation.x = Math.PI / 2;
  });
  box(0.14, 0.05, 0.02, mat(0x0E3A5B, { emissive: 0x3BA99C, emissiveIntensity: 0.6 }), 0.18, 0.66, 0.325, appl);
  var ring = mesh(new THREE.TorusGeometry(0.2, 0.035, 12, 32), mat(0x3BA99C), 0, 0.3, 0.315, appl);
  var drum = new THREE.Group();
  drum.position.set(0, 0.3, 0.29);
  appl.add(drum);
  var drumDisc = cyl(0.18, 0.18, 0.02, mat(0x255886), 0, 0, 0, drum, 28);
  drumDisc.rotation.x = Math.PI / 2;
  [[0xA9D3F2, 0.08, 0.04], [0xF2B33D, -0.07, -0.05], [0xE2654F, 0.02, -0.1]].forEach(function (s) {
    rbox(0.11, 0.07, 0.03, 0.02, mat(s[0]), s[1], s[2], 0.02, drum);
  });
  var glass = cyl(0.17, 0.17, 0.015, mat(0xBDEBFF, { transparent: true, opacity: 0.35, roughness: 0.05 }), 0, 0.3, 0.325, appl, 28);
  glass.rotation.x = Math.PI / 2;
  glass.castShadow = false;

  // Carpintería: banco de trabajo con martillo
  var carp = craft('Carpintería', 1.12, FLOOR0, -0.55);
  var benchMat = mat(0xD9822B);
  box(1.05, 0.08, 0.58, benchMat, 0, 0.7, 0, carp);
  [[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]].forEach(function (p) {
    box(0.07, 0.66, 0.07, mat(0xA8611F), p[0], 0.33, p[1], carp);
  });
  box(0.92, 0.04, 0.46, mat(0xA8611F), 0, 0.2, 0, carp);
  box(0.6, 0.07, 0.22, mat(0xF1D3A6), -0.1, 0.775, 0.02, carp);
  box(0.26, 0.05, 0.14, mat(0xF1D3A6), 0.3, 0.27, 0.0, carp);
  var hammerPivot = new THREE.Group();
  hammerPivot.position.set(0.42, 0.76, 0.05);
  carp.add(hammerPivot);
  var handle = cyl(0.025, 0.03, 0.42, mat(0x856247), -0.05, 0.19, 0, hammerPivot, 12);
  handle.rotation.z = 0.25;
  var head = box(0.22, 0.08, 0.08, mat(0x4D4645, { metalness: 0.6, roughness: 0.3 }), -0.1, 0.4, 0, hammerPivot);
  head.rotation.z = 0.25;
  hammerPivot.rotation.z = 0.15;

  // Electricidad: lámpara colgante encendida
  var elec = craft('Electricidad', -1.1, 3.07, -0.25);
  var lampPivot = new THREE.Group();
  elec.add(lampPivot);
  cyl(0.012, 0.012, 0.42, mat(C.ink), 0, -0.21, 0, lampPivot, 8);
  var shade = cyl(0.07, 0.24, 0.22, mat(0xF2B33D, { side: THREE.DoubleSide }), 0, -0.5, 0, lampPivot, 28, true);
  cyl(0.05, 0.07, 0.04, mat(0xF2B33D), 0, -0.39, 0, lampPivot, 20);
  var bulbMat = mat(0xFFF3C4, { emissive: 0xF2B33D, emissiveIntensity: 1.0 });
  var bulb = mesh(new THREE.SphereGeometry(0.075, 16, 12), bulbMat, 0, -0.6, 0, lampPivot, { noCast: true });
  var lampLight = new THREE.PointLight(0xFFC65A, 0.9, 2.6, 2);
  lampLight.position.set(0, -0.68, 0);
  lampPivot.add(lampLight);
  // Tomacorriente en el muro
  box(0.14, 0.2, 0.03, mat(C.white), -0.4, -0.95, -0.93, elec);
  box(0.06, 0.1, 0.035, mat(0xF2B33D), -0.4, -0.95, -0.92, elec);
  // zona de impacto invisible para que la lámpara sea fácil de señalar
  var elecHit = box(0.6, 0.8, 0.6, new THREE.MeshBasicMaterial({ visible: false }), 0, -0.45, 0, elec, { noCast: true });
  elecHit.castShadow = false;

  // Aseo: balde con burbujas y escoba
  var clean = craft('Aseo', -0.05, FLOOR1, -0.55);
  var bucket = cyl(0.19, 0.14, 0.32, mat(0x5FA36A), 0, 0.16, 0, clean, 28);
  cyl(0.17, 0.17, 0.02, mat(0xE6F7FF, { roughness: 0.2 }), 0, 0.29, 0, clean, 24);
  var bHandle = mesh(new THREE.TorusGeometry(0.18, 0.012, 8, 24, Math.PI), mat(C.ink), 0, 0.3, 0, clean);
  bHandle.rotation.y = Math.PI / 2;
  bHandle.rotation.z = 0.35;
  var bubbles = [];
  [[0.04, 0.4, 0.02, 0.05], [-0.07, 0.48, -0.03, 0.035], [0.08, 0.55, 0.05, 0.028]].forEach(function (b, i) {
    var s = mesh(new THREE.SphereGeometry(b[3], 14, 10), mat(0xFFFFFF, { transparent: true, opacity: 0.85, roughness: 0.1, emissive: 0xBFE3C4, emissiveIntensity: 0.3 }), b[0], b[1], b[2], clean, { noCast: true });
    s.userData = { y: b[1], phase: i * 1.7 };
    bubbles.push(s);
  });
  box(0.95, 1.2, 0.7, new THREE.MeshBasicMaterial({ visible: false }), 0.15, 0.6, 0, clean, { noCast: true }).castShadow = false;
  var broom = new THREE.Group();
  broom.position.set(0.42, 0, -0.18);
  broom.rotation.z = -0.22;
  clean.add(broom);
  cyl(0.022, 0.022, 1.15, mat(0x856247), 0, 0.68, 0, broom, 10);
  rbox(0.26, 0.2, 0.09, 0.03, mat(0xF2B33D, { roughness: 0.9 }), 0, 0.1, 0, broom);
  box(0.24, 0.05, 0.1, mat(0x856247), 0, 0.22, 0, broom);

  // Pintura: pared a medio pintar con rodillo
  var paint = craft('Pintura', 1.1, FLOOR1, -1.1);
  var paintMat = mat(0xE2654F, { roughness: 0.75 });
  box(0.24, 1.3, 0.01, paintMat, -0.42, 0.66, 0, paint, { noCast: true }).castShadow = false;
  var stripe = box(0.42, 1.0, 0.01, paintMat, -0.06, 0.5, 0, paint, { noCast: true });
  stripe.geometry.translate(0, 0.5, 0);
  stripe.position.y = 0;
  stripe.scale.y = 0.55;
  var roller = new THREE.Group();
  roller.position.set(-0.06, 0.62, 0.1);
  paint.add(roller);
  var rollCyl = cyl(0.075, 0.075, 0.44, mat(0xE2654F, { roughness: 0.9 }), 0, 0, 0, roller, 20);
  rollCyl.rotation.z = Math.PI / 2;
  var frameMat = mat(0xC9D4DE, { metalness: 0.6, roughness: 0.3 });
  var f1 = cyl(0.012, 0.012, 0.28, frameMat, 0.25, -0.0, 0.0, roller, 8);
  f1.rotation.z = Math.PI / 2; f1.position.x = 0.32;
  cyl(0.012, 0.012, 0.3, frameMat, 0.46, -0.15, 0.04, roller, 8);
  cyl(0.026, 0.026, 0.3, mat(0x4D4645), 0.46, -0.42, 0.04, roller, 12);
  // Bandeja de pintura
  var tray = box(0.4, 0.06, 0.3, mat(0xC9D4DE, { metalness: 0.3 }), 0.45, 0.03, 0.6, paint);
  box(0.32, 0.02, 0.22, paintMat, 0.45, 0.065, 0.6, paint);
  // Lata
  cyl(0.11, 0.11, 0.2, mat(0xFFFFFF), 0.1, 0.1, 0.7, paint, 20);
  cyl(0.112, 0.112, 0.07, paintMat, 0.1, 0.13, 0.7, paint, 20);

  /* ---------------- Interacción ---------------- */
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var hovered = null;     // oficio bajo el cursor
  var chipHover = null;   // oficio señalado desde un chip
  var active = null;      // oficio seleccionado por toque
  var BASE_YAW = -0.3;
  var yaw = BASE_YAW, yawTarget = BASE_YAW, yawVel = 0;
  var pitch = 0, pitchTarget = 0;
  var dragging = false, dragMoved = false, downX = 0, downY = 0, lastX = 0, lastT = 0;
  var lastInteract = 0;
  var MIN_YAW = -1.45, MAX_YAW = 0.95;

  function tradeFromHit(obj) {
    while (obj && obj !== world) {
      if (obj.userData && obj.userData.trade) return obj.userData.trade;
      obj = obj.parent;
    }
    return null;
  }

  function pick(clientX, clientY) {
    var r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(crafts, true);
    return hits.length ? tradeFromHit(hits[0].object) : null;
  }

  var canvas = renderer.domElement;

  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (dragging) return; // ignora un segundo dedo
    dragging = true; dragMoved = false;
    downX = lastX = e.clientX; downY = e.clientY; lastT = performance.now();
    yawVel = 0;
    canvas.setPointerCapture(e.pointerId);
    lastInteract = performance.now();
  });

  canvas.addEventListener('pointermove', function (e) {
    if (dragging) {
      var dx = e.clientX - lastX;
      if (!dragMoved && Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) {
        dragMoved = true;
        root.classList.add('is-dragging');
        if (hint) hint.classList.add('is-hidden');
      }
      if (dragMoved) {
        var now = performance.now();
        var w = canvas.clientWidth || 1;
        var delta = (dx / w) * 3.2;
        // fricción al pasar los límites
        if ((yawTarget < MIN_YAW && delta < 0) || (yawTarget > MAX_YAW && delta > 0)) delta *= 0.3;
        yawTarget += delta;
        yawVel = delta / Math.max(16, now - lastT) * 16;
        pitchTarget = Math.max(-0.08, Math.min(0.12, pitchTarget + (e.movementY || 0) / w * 0.6));
        lastT = now;
      }
      lastX = e.clientX;
      lastInteract = performance.now();
      return;
    }
    if (e.pointerType === 'mouse') {
      hovered = pick(e.clientX, e.clientY);
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
    }
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (!dragMoved) {
      var t = pick(e.clientX, e.clientY);
      if (e.pointerType === 'mouse') {
        if (t) book(t);
      } else {
        if (t && active === t) { book(t); active = null; }
        else active = t;
      }
    }
    lastInteract = performance.now();
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', function (e) { dragging = false; root.classList.remove('is-dragging'); });
  canvas.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse' && !dragging) hovered = null;
  });

  document.addEventListener('pointerdown', function (e) {
    if (!root.contains(e.target)) active = null;
  });

  chips.forEach(function (chip) {
    chip.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') chipHover = chip.dataset.trade; });
    chip.addEventListener('pointerleave', function () { chipHover = null; });
    chip.addEventListener('focus', function () { chipHover = chip.dataset.trade; });
    chip.addEventListener('blur', function () { chipHover = null; });
  });

  /* ---------------- Tamaño responsive ---------------- */
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // aleja la cámara en contenedores angostos para que la casa siempre quepa
    var dist = 12.8 * Math.max(1, 1.02 / camera.aspect);
    camera.position.set(0, LOOK.y + dist * 0.2, dist);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  resize();

  /* ---------------- Bucle de animación ---------------- */
  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) requestAnimationFrame(loop);
    }, { rootMargin: '100px' }).observe(root);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) requestAnimationFrame(loop);
  });

  var clock = new THREE.Clock();
  var start = performance.now();
  var tmpBox = new THREE.Box3();
  var tmpV = new THREE.Vector3();
  var shownTrade = null;
  var running = false;

  function damp(cur, target, lambda, dt) {
    return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
  }

  function updateTip(trade) {
    if (trade !== shownTrade) {
      shownTrade = trade;
      if (trade) {
        var info = TRADES[trade];
        tipTitle.textContent = info.label;
        tipDesc.textContent = info.desc;
        tipDot.style.background = info.color;
        tip.classList.add('is-visible');
      } else {
        tip.classList.remove('is-visible');
      }
      chips.forEach(function (c) { c.classList.toggle('is-active', c.dataset.trade === trade); });
    }
    if (!trade) return;
    var g = crafts.filter(function (c) { return c.userData.trade === trade; })[0];
    tmpBox.setFromObject(g);
    tmpV.set((tmpBox.min.x + tmpBox.max.x) / 2, tmpBox.max.y, (tmpBox.min.z + tmpBox.max.z) / 2);
    tmpV.project(camera);
    var x = (tmpV.x * 0.5 + 0.5) * stage.clientWidth;
    var y = (-tmpV.y * 0.5 + 0.5) * stage.clientHeight;
    // mantener dentro del contenedor
    var half = tip.offsetWidth / 2 + 8;
    x = Math.max(half, Math.min(stage.clientWidth - half, x));
    y = Math.max(tip.offsetHeight + 8, y);
    tip.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
  }

  function loop() {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = (performance.now() - start) / 1000;
    var focus = dragging && dragMoved ? null : (active || hovered || chipHover);

    // giro con inercia y regreso suave a los límites
    if (!dragging) {
      yawTarget += yawVel;
      yawVel *= Math.pow(0.9, dt * 60);
      if (yawTarget < MIN_YAW) yawTarget = damp(yawTarget, MIN_YAW, 10, dt);
      if (yawTarget > MAX_YAW) yawTarget = damp(yawTarget, MAX_YAW, 10, dt);
      pitchTarget = damp(pitchTarget, 0, 2, dt);
      var idle = performance.now() - lastInteract > 3500 && !focus;
      if (idle && !reduceMotion) {
        yawTarget = damp(yawTarget, BASE_YAW + Math.sin(t * 0.35) * 0.22, 0.8, dt);
      }
    }
    yaw = damp(yaw, yawTarget, 14, dt);
    pitch = damp(pitch, pitchTarget, 10, dt);
    world.rotation.y = yaw;
    world.rotation.x = pitch;

    // entrada escalonada y realce al pasar el cursor
    crafts.forEach(function (g, i) {
      var d = g.userData;
      var appear = Math.max(0, Math.min(1, (t - 0.35 - i * 0.07) / 0.45));
      var isFocus = focus === d.trade;
      d.hover = damp(d.hover, isFocus ? 1 : 0, 16, dt);
      var s = (0.82 + 0.18 * (1 - Math.pow(1 - appear, 3))) * (1 + 0.08 * d.hover);
      g.scale.setScalar(s);
      g.position.y = d.baseY + 0.1 * d.hover;
    });

    // vida ambiental
    var motion = reduceMotion ? 0 : 1;
    var dripCycle = (t % 1.8) / 1.8;
    drip.position.y = 0.93 - Math.pow(dripCycle, 2) * 0.16 * motion;
    drip.scale.setScalar(dripCycle > 0.85 ? (1 - (dripCycle - 0.85) / 0.15) : 1);
    var hPlumb = plumb.userData.hover;
    drip.visible = motion ? true : hPlumb > 0.5;

    drum.rotation.z -= dt * (1.2 + appl.userData.hover * 6) * (motion || appl.userData.hover);

    var hElec = elec.userData.hover;
    lampPivot.rotation.z = (Math.sin(t * 1.4) * 0.03 * motion) + Math.sin(t * 5) * 0.08 * hElec * motion;
    lampLight.intensity = 0.8 + 0.7 * hElec + Math.sin(t * 2) * 0.05 * motion;
    bulbMat.emissiveIntensity = 0.9 + 0.8 * hElec;

    var hClean = clean.userData.hover;
    bubbles.forEach(function (b) {
      var u = b.userData;
      b.position.y = u.y + Math.sin(t * 1.6 + u.phase) * 0.04 * motion + hClean * 0.12;
    });
    broom.rotation.z = -0.22 + Math.sin(t * 6) * 0.12 * hClean * motion;

    var hPaint = paint.userData.hover;
    var stroke = (Math.sin(t * 3.2) * 0.5 + 0.5) * hPaint;
    roller.position.y = 0.62 + stroke * 0.55 * motion;
    stripe.scale.y = 0.55 + hPaint * 0.75;

    var hCarp = carp.userData.hover;
    hammerPivot.rotation.z = 0.15 + Math.max(0, Math.sin(t * 9)) * 0.55 * hCarp * motion;

    updateTip(dragging && dragMoved ? null : focus);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(function () {
    root.classList.add('is-ready');
    loop();
  });
})();
