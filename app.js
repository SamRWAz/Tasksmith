/**
 * Tasksmith — Core Interactive Application
 * Includes: Aesthetic Minimal 3D Scene (Three.js), Local Auth State,
 * Technical Skills Assessment (Interactive Exam), and Modal Systems.
 */

(function () {
  'use strict';

  // State Management
  const STATE_KEY_USER = 'tasksmith_user_session';
  const STATE_KEY_CERT = 'tasksmith_certified_smiths';

  let currentUser = JSON.parse(localStorage.getItem(STATE_KEY_USER)) || null;

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initAuthUI();
    initThreeScene();
    initAudioSimulator();
    initPracticalVerificationModule();
    initExamModule();
    setupModals();
    initCertificationWizard();
  });

  /* ================= 1. NAVBAR & SCROLL ================= */
  function initNavbar() {
    const header = document.querySelector('.header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 15) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });

      document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => mobileNav.classList.remove('open'));
      });
    }

    // Set active link based on current path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });
  }

  /* ================= 2. USER AUTHENTICATION & SESSIONS (EMAIL + PASSWORD) ================= */
  const STATE_KEY_USERS_DB = 'tasksmith_registered_users';
  let registeredUsers = JSON.parse(localStorage.getItem(STATE_KEY_USERS_DB)) || [
    { email: 'luis@tasksmith.co', password: '123', name: 'Luis Rodríguez', phone: '312 456 7890', role: 'smith', trade: 'Plomería', certified: true, rate: '70000', zone: 'Chapinero, Cedritos, Usaquén' },
    { email: 'carlos@gmail.com', password: '123', name: 'Carlos Mendoza', phone: '310 987 6543', role: 'hogar', trade: null, certified: false, address: 'Chapinero Alto' }
  ];

  function initAuthUI() {
    updateNavUserSlot();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    const smithConfigForm = document.getElementById('smithConfigForm');
    if (smithConfigForm) smithConfigForm.addEventListener('submit', handleSmithConfigSubmit);
  }

  function updateNavUserSlot() {
    const navActions = document.getElementById('navActionsContainer');
    const mobileAuthSlot = document.getElementById('mobileAuthSlot');

    if (currentUser) {
      if (currentUser.role === 'smith') {
        const actionHtml = `
          <button class="user-profile-badge" onclick="openUserProfileModal()">
            <span class="user-avatar-dot"></span>
            <span>🔨 ${currentUser.name.split(' ')[0]} (Maestro)</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="openUserProfileModal()">
            Mi Perfil
          </button>
          <button class="mobile-toggle" aria-label="Abrir menú">☰</button>
        `;
        if (navActions) navActions.innerHTML = actionHtml;
        if (mobileAuthSlot) {
          mobileAuthSlot.innerHTML = `
            <button class="btn btn-primary full" onclick="openUserProfileModal()">Mi Perfil de Maestro (🔨)</button>
          `;
        }
      } else {
        const actionHtml = `
          <button class="user-profile-badge" onclick="openUserProfileModal()">
            <span class="user-avatar-dot"></span>
            <span>👤 ${currentUser.name.split(' ')[0]}</span>
          </button>
          <button class="btn btn-primary btn-sm" data-open-booking>
            Pedir un Especialista
          </button>
          <button class="mobile-toggle" aria-label="Abrir menú">☰</button>
        `;
        if (navActions) navActions.innerHTML = actionHtml;
        if (mobileAuthSlot) {
          mobileAuthSlot.innerHTML = `
            <button class="btn btn-ghost full" onclick="openUserProfileModal()" style="margin-bottom:8px;">Mi Perfil (👤 ${currentUser.name.split(' ')[0]})</button>
            <button class="btn btn-primary full" data-open-booking>Pedir un Especialista</button>
          `;
        }
      }
    } else {
      const actionHtml = `
        <button class="btn btn-ghost btn-sm" onclick="openLoginModal()" id="btnNavLogin">Ingresar</button>
        <button class="btn btn-primary btn-sm" onclick="openRegisterModal()" id="btnNavRegister">Registro</button>
        <button class="mobile-toggle" aria-label="Abrir menú">☰</button>
      `;
      if (navActions) navActions.innerHTML = actionHtml;
      if (mobileAuthSlot) {
        mobileAuthSlot.innerHTML = `
          <button class="btn btn-ghost" onclick="openLoginModal()" style="flex:1;">Ingresar</button>
          <button class="btn btn-primary" onclick="openRegisterModal()" style="flex:1;">Registro</button>
        `;
      }
    }

    // Reattach mobile drawer toggle
    const toggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.onclick = () => mobileNav.classList.toggle('open');
    }

    // Reattach booking buttons
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const tradePreset = btn.getAttribute('data-trade-preset') || '';
        if (!currentUser) {
          showToast('Inicia sesión o regístrate para solicitar un especialista verificado con garantía.', 'normal');
          openLoginModal();
        } else {
          openBookingModal(tradePreset);
        }
      };
    });

    if (typeof updateSmithGatekeeperUI === 'function') {
      updateSmithGatekeeperUI();
    }
  }

  window.openLoginModal = function () {
    closeAllModals();
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('open');
  };

  window.openRegisterModal = function (defaultRole = 'hogar') {
    closeAllModals();
    const modal = document.getElementById('registerModal');
    if (!modal) return;
    setRegisterRole(defaultRole);
    modal.classList.add('open');
  };

  window.setRegisterRole = function (role) {
    const tabHogar = document.getElementById('tabRegHogar');
    const tabSmith = document.getElementById('tabRegSmith');
    const smithFields = document.getElementById('regSmithFields');
    const submitBtn = document.getElementById('btnRegSubmit');
    const roleInput = document.getElementById('regRoleInput');

    if (roleInput) roleInput.value = role;

    if (role === 'smith') {
      tabSmith?.classList.add('active');
      tabHogar?.classList.remove('active');
      if (smithFields) smithFields.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Registrarme como Maestro de Oficio →';
    } else {
      tabHogar?.classList.add('active');
      tabSmith?.classList.remove('active');
      if (smithFields) smithFields.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Crear Cuenta de Hogar';
    }
  };

  function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmailInput')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPasswordInput')?.value.trim();

    if (!email || !password) {
      showToast('Por favor ingresa tu correo y contraseña.', 'error');
      return;
    }

    const found = registeredUsers.find(u => u.email === email && u.password === password);
    if (found) {
      currentUser = { ...found, loginAt: new Date().toISOString() };
    } else {
      // Mock instant login if not pre-registered
      const isSmith = email.includes('maestro') || email.includes('smith');
      currentUser = {
        email,
        password,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        phone: '310 000 0000',
        role: isSmith ? 'smith' : 'hogar',
        trade: isSmith ? 'Plomería' : null,
        certified: false,
        loginAt: new Date().toISOString()
      };
      registeredUsers.push(currentUser);
      localStorage.setItem(STATE_KEY_USERS_DB, JSON.stringify(registeredUsers));
    }

    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
    updateNavUserSlot();
    closeAllModals();

    if (currentUser.role === 'smith') {
      showToast(`¡Bienvenido maestro ${currentUser.name}! Ya tienes acceso a tu perfil y portafolio.`, 'success');
    } else {
      showToast(`¡Hola, ${currentUser.name}! Ya puedes solicitar un especialista con garantía.`, 'success');
    }
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    const role = document.getElementById('regRoleInput')?.value || 'hogar';
    const name = document.getElementById('regNameInput')?.value.trim();
    const email = document.getElementById('regEmailInput')?.value.trim().toLowerCase();
    const phone = document.getElementById('regPhoneInput')?.value.trim();
    const password = document.getElementById('regPasswordInput')?.value.trim();
    const trade = document.getElementById('regTradeSelect')?.value || 'Plomería';

    if (!name || !email || !password) {
      showToast('Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    currentUser = {
      name,
      email,
      phone,
      password,
      role,
      trade: role === 'smith' ? trade : null,
      certified: false,
      rate: '65000',
      zone: 'Bogotá (Norte y Centro)',
      loginAt: new Date().toISOString()
    };

    registeredUsers = registeredUsers.filter(u => u.email !== email);
    registeredUsers.push(currentUser);
    localStorage.setItem(STATE_KEY_USERS_DB, JSON.stringify(registeredUsers));
    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));

    updateNavUserSlot();
    closeAllModals();

    if (role === 'smith') {
      showToast(`¡Registro exitoso, maestro ${name}! Tu perfil está creado. Puedes ver tu portafolio o certificar tu oficio.`, 'success');
      setTimeout(() => openUserProfileModal(), 800);
    } else {
      showToast(`¡Bienvenido a Tasksmith, ${name}! Tu cuenta de hogar ha sido creada.`, 'success');
    }
  }

  function handleSmithConfigSubmit(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'smith') return;

    const phone = document.getElementById('smithCfgPhone')?.value.trim();
    const rate = document.getElementById('smithCfgRate')?.value.trim();
    const zone = document.getElementById('smithCfgZone')?.value.trim();

    currentUser.phone = phone;
    currentUser.rate = rate;
    currentUser.zone = zone;

    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
    showToast('✓ Configuración del perfil de maestro guardada.', 'success');
  }

  window.openUserProfileModal = function () {
    closeAllModals();
    if (!currentUser) {
      openLoginModal();
      return;
    }

    if (currentUser.role === 'smith') {
      const modal = document.getElementById('profileModalSmith');
      if (!modal) return;

      const nameEl = document.getElementById('smithProfileName');
      const tradeEl = document.getElementById('smithProfileTrade');
      const badgeEl = document.getElementById('smithProfileCertBadge');
      const phoneInp = document.getElementById('smithCfgPhone');
      const rateInp = document.getElementById('smithCfgRate');
      const zoneInp = document.getElementById('smithCfgZone');

      if (nameEl) nameEl.textContent = currentUser.name;
      if (tradeEl) tradeEl.textContent = `Especialista en ${currentUser.trade || 'Oficio'}`;
      if (badgeEl) {
        if (currentUser.certified) {
          badgeEl.className = 'live-badge';
          badgeEl.textContent = '✓ Examen Técnico Aprobado';
          badgeEl.style.color = 'var(--green-verified)';
        } else {
          badgeEl.className = 'live-badge';
          badgeEl.textContent = '⚠️ Certificación Pendiente';
          badgeEl.style.color = 'var(--wood-primary)';
        }
      }

      if (phoneInp) phoneInp.value = currentUser.phone || '';
      if (rateInp) rateInp.value = currentUser.rate || '65000';
      if (zoneInp) zoneInp.value = currentUser.zone || 'Bogotá';

      switchSmithProfileTab('portafolio');
      modal.classList.add('open');
    } else {
      const modal = document.getElementById('profileModalHogar');
      if (!modal) return;

      const nameEl = document.getElementById('hogarProfileName');
      const emailEl = document.getElementById('hogarProfileEmail');
      const phoneEl = document.getElementById('hogarProfilePhone');

      if (nameEl) nameEl.textContent = currentUser.name;
      if (emailEl) emailEl.textContent = currentUser.email || '';
      if (phoneEl) phoneEl.textContent = currentUser.phone || '';

      modal.classList.add('open');
    }
  };

  window.switchSmithProfileTab = function (tabName) {
    document.querySelectorAll('.profile-subtab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.smith-subtab-pane').forEach(p => p.style.display = 'none');

    const activeBtn = document.getElementById(`tabBtn_${tabName}`);
    const activePane = document.getElementById(`tabPane_${tabName}`);

    activeBtn?.classList.add('active');
    if (activePane) activePane.style.display = 'block';
  };

  window.simularSubirFotoPortafolio = function () {
    const desc = prompt('Describe brevemente este trabajo realizado:\n(Ej: "Instalación de grifería y sello de fuga en Cedritos")');
    if (!desc) return;

    const grid = document.getElementById('smithPortfolioGrid');
    if (!grid) return;

    const item = document.createElement('div');
    item.className = 'portfolio-item';
    item.innerHTML = `
      <img src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=75" alt="Trabajo">
      <span class="portfolio-item-label">${desc}</span>
    `;
    grid.prepend(item);
    showToast('✓ Nueva foto añadida a tu portafolio público.', 'success');
  };

  window.logoutUser = function () {
    currentUser = null;
    localStorage.removeItem(STATE_KEY_USER);
    updateNavUserSlot();
    closeAllModals();
    showToast('Has cerrado sesión correctamente.', 'normal');
  };

  /* ================= 3. BALANCED NATURAL CRAFT DIORAMA 3D (THREE.JS) ================= */
  function initThreeScene() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const container = canvas.parentElement;
    const scene = new THREE.Scene();

    // Camera setup centered on the diorama
    const camera = new THREE.PerspectiveCamera(37, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 3.3, 6.6);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Natural Balanced Studio Lighting (Clean, Warm & Clear)
    const ambientLight = new THREE.AmbientLight(0xFFFAF2, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF1DC, 1.85);
    sunLight.position.set(4.5, 7.5, 4.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0006;
    scene.add(sunLight);

    const skyLight = new THREE.DirectionalLight(0xB0D4F1, 0.95);
    skyLight.position.set(-4.5, 3.5, -3);
    scene.add(skyLight);

    // Warm interior house pointlight
    const houseGlow = new THREE.PointLight(0xFFA726, 1.8, 4.0);
    houseGlow.position.set(0, 0.8, 0.6);
    scene.add(houseGlow);

    // Master Group (Diorama World)
    const world = new THREE.Group();
    scene.add(world);

    // Helper Materials Factory
    const mat = (col, extra = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.05, ...extra });
    const metalMat = (col, extra = {}) => new THREE.MeshStandardMaterial({ color: col, metalness: 0.82, roughness: 0.28, ...extra });
    const woodMat = mat(0x5E3D26, { roughness: 0.5 }); // Natural warm timber

    // 1. FLOATING NATURAL ISLAND (Natural Grass + Earth Stone Plinth)
    const islandGroup = new THREE.Group();
    world.add(islandGroup);

    // Natural garden grass (Healthy, vibrant yet calm green)
    const lawnGeo = new THREE.CylinderGeometry(2.28, 2.42, 0.32, 48);
    const lawn = new THREE.Mesh(lawnGeo, mat(0x5EA048, { roughness: 0.7 }));
    lawn.position.y = -0.15;
    lawn.receiveShadow = true;
    islandGroup.add(lawn);

    // Warm natural sandstone base layer
    const stoneGeo = new THREE.CylinderGeometry(2.42, 1.85, 0.5, 48);
    const stoneBase = new THREE.Mesh(stoneGeo, mat(0x8C7765, { roughness: 0.8 }));
    stoneBase.position.y = -0.55;
    stoneBase.receiveShadow = true;
    islandGroup.add(stoneBase);

    // Warm bronze trim ring
    const trimGeo = new THREE.TorusGeometry(2.44, 0.03, 16, 64);
    const trimMesh = new THREE.Mesh(trimGeo, mat(0xC5A059, { metalness: 0.7, roughness: 0.3 }));
    trimMesh.rotation.x = Math.PI / 2;
    trimMesh.position.y = -0.31;
    islandGroup.add(trimMesh);

    // Cobblestone walkway to the front door
    for (let i = 0; i < 4; i++) {
      const pathStone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 - i * 0.02, 0.24 - i * 0.02, 0.05, 12),
        mat(0xD5C9BD, { roughness: 0.85 })
      );
      pathStone.position.set(0 + (i % 2 === 0 ? 0.04 : -0.04), 0.03, 0.88 + i * 0.31);
      pathStone.receiveShadow = true;
      islandGroup.add(pathStone);
    }

    // 2. COZY MODERN HOME (El Hogar)
    const houseGroup = new THREE.Group();
    world.add(houseGroup);

    // Clean warm off-white stucco walls
    const houseBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 1.38, 1.75),
      mat(0xFFFDF8, { roughness: 0.5 })
    );
    houseBody.position.y = 0.7;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Timber plinth / zócalo
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.1, 1.85),
      woodMat
    );
    plinth.position.y = 0.05;
    houseGroup.add(plinth);

    // Traditional Warm Terracotta Clay Roof (Normal warm brick/terracotta tile)
    const terracottaMat = mat(0xBA5A3A, { roughness: 0.5 });

    const roofLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.11, 2.05),
      terracottaMat
    );
    roofLeft.position.set(-0.54, 1.72, 0);
    roofLeft.rotation.z = Math.PI / 5.6;
    roofLeft.castShadow = true;
    houseGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.11, 2.05),
      terracottaMat
    );
    roofRight.position.set(0.54, 1.72, 0);
    roofRight.rotation.z = -Math.PI / 5.6;
    roofRight.castShadow = true;
    houseGroup.add(roofRight);

    // Front & Back Timber Gables
    const gableGeo = new THREE.BufferGeometry();
    const gableVertices = new Float32Array([
      -0.97, 1.39, 0.88,
       0.97, 1.39, 0.88,
       0.0,  2.01, 0.88,
      -0.97, 1.39, -0.88,
       0.0,  2.01, -0.88,
       0.97, 1.39, -0.88
    ]);
    gableGeo.setAttribute('position', new THREE.BufferAttribute(gableVertices, 3));
    gableGeo.computeVertexNormals();
    const gableMesh = new THREE.Mesh(gableGeo, woodMat);
    gableMesh.castShadow = true;
    houseGroup.add(gableMesh);

    // Natural Wood Front Door with Brass Doorknob
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.92, 0.07),
      woodMat
    );
    door.position.set(0, 0.48, 0.91);
    houseGroup.add(door);

    const doorHandle = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 16, 16),
      metalMat(0xD4AF37) // Polished brass
    );
    doorHandle.position.set(0.18, 0.48, 0.96);
    houseGroup.add(doorHandle);

    // Warm Glowing Circular Window (Friendly natural golden interior glow)
    const windowFrame = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.04, 16, 32),
      woodMat
    );
    windowFrame.position.set(0, 1.42, 0.91);
    houseGroup.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 32),
      new THREE.MeshStandardMaterial({
        color: 0xFFD56B,
        emissive: 0xFFA726,
        emissiveIntensity: 0.75,
        roughness: 0.25
      })
    );
    windowGlass.position.set(0, 1.42, 0.92);
    houseGroup.add(windowGlass);

    // Side window with warm ambient light
    const sideWinFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.56, 0.56),
      woodMat
    );
    sideWinFrame.position.set(1.0, 0.76, 0);
    houseGroup.add(sideWinFrame);

    const sideWinGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.48, 0.48),
      new THREE.MeshStandardMaterial({
        color: 0xFFD56B,
        emissive: 0xFFA726,
        emissiveIntensity: 0.7,
        roughness: 0.25
      })
    );
    sideWinGlass.position.set(1.01, 0.76, 0);
    houseGroup.add(sideWinGlass);

    // Clay brick chimney
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.85, 0.32),
      mat(0x8A6250, { roughness: 0.7 })
    );
    chimney.position.set(-0.58, 1.9, -0.3);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // 3. NATURAL GARDEN TREE (Friendly, Lush Foliage)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(1.38, 0, -0.75);
    world.add(treeGroup);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.78, 12),
      mat(0x543924, { roughness: 0.8 })
    );
    trunk.position.y = 0.39;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const canopy1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 20, 20),
      mat(0x4D8C3E, { roughness: 0.65 }) // Healthy lush green
    );
    canopy1.position.y = 0.88;
    canopy1.castShadow = true;
    treeGroup.add(canopy1);

    const canopy2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 16, 16),
      mat(0x5DA54C, { roughness: 0.65 })
    );
    canopy2.position.set(0.1, 1.2, 0.06);
    canopy2.castShadow = true;
    treeGroup.add(canopy2);

    // 4. FLOATING WORKSHOP CRAFT TOOLS (Natural recognizable materials)
    const tools = [];
    function registerTool(group, baseY, speed, amp) {
      world.add(group);
      tools.push({ group, baseY, speed, amp, rotSpeed: 0.008 });
    }

    // A) Llave de Fontanero (Wrench - Chrome & Tasksmith Blue)
    {
      const wrenchGroup = new THREE.Group();
      wrenchGroup.position.set(-1.8, 1.1, 1.0);

      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.065, 0.92, 16),
        mat(0x255886, { roughness: 0.35 }) // Tasksmith blue handle
      );
      wrenchGroup.add(handle);

      const head = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.06, 16, 24, Math.PI * 1.5),
        metalMat(0xDDE2E8) // Polished chrome
      );
      head.position.y = 0.48;
      head.rotation.z = Math.PI / 4;
      wrenchGroup.add(head);

      wrenchGroup.rotation.z = 0.32;
      registerTool(wrenchGroup, 1.1, 1.1, 0.1);
    }

    // B) Martillo de Carpintero (Hammer - Beech Wood & Forged Steel)
    {
      const hammerGroup = new THREE.Group();
      hammerGroup.position.set(1.8, 1.25, 0.8);

      const hHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.0, 16),
        mat(0xB58054, { roughness: 0.45 }) // Warm natural beechwood
      );
      hammerGroup.add(hHandle);

      const hHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.2, 0.2),
        metalMat(0x434E5B) // Forged steel
      );
      hHead.position.y = 0.48;
      hammerGroup.add(hHead);

      const claw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.09, 0.26, 12),
        metalMat(0x434E5B)
      );
      claw.position.set(-0.22, 0.43, 0);
      claw.rotation.z = Math.PI / 3;
      hammerGroup.add(claw);

      hammerGroup.rotation.z = -0.38;
      registerTool(hammerGroup, 1.25, 1.0, 0.09);
    }

    // C) Rodillo de Pintor (Paint Roller - Warm Terracotta Paint)
    {
      const rollerGroup = new THREE.Group();
      rollerGroup.position.set(-1.75, 1.6, -0.85);

      const roll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.6, 24),
        mat(0xD9703E, { roughness: 0.6 }) // Warm terracotta paint roll
      );
      roll.rotation.z = Math.PI / 2;
      rollerGroup.add(roll);

      const wire = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.022, 12, 24, Math.PI),
        metalMat(0xC5A059) // Brass wire
      );
      wire.position.set(0.34, -0.14, 0);
      rollerGroup.add(wire);

      const rGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.4, 16),
        woodMat
      );
      rGrip.position.set(0.34, -0.5, 0);
      rollerGroup.add(rGrip);

      rollerGroup.rotation.x = 0.35;
      registerTool(rollerGroup, 1.6, 1.3, 0.11);
    }

    // D) Bombilla Encendida (Glowing Lightbulb - Electricidad)
    {
      const bulbGroup = new THREE.Group();
      bulbGroup.position.set(1.45, 1.95, -0.65);

      const bulbGlass = new THREE.Mesh(
        new THREE.SphereGeometry(0.21, 22, 22),
        new THREE.MeshStandardMaterial({
          color: 0xFFE082,
          emissive: 0xFFB300,
          emissiveIntensity: 0.75,
          roughness: 0.2,
          metalness: 0.08
        })
      );
      bulbGroup.add(bulbGlass);

      const bulbBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.11, 0.14, 16),
        metalMat(0xC5A059) // Brass socket
      );
      bulbBase.position.y = -0.23;
      bulbGroup.add(bulbBase);

      registerTool(bulbGroup, 1.95, 1.2, 0.11);
    }

    // Responsive Canvas Resizing
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // Interactive Drag and Mouse Parallax (Smooth and Natural)
    let isDragging = false;
    let prevMouseX = 0;
    let dragVelocity = 0;
    let mouseParallaxX = 0;
    let mouseParallaxY = 0;

    canvas.style.cursor = 'grab';

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        world.rotation.y += deltaX * 0.0075;
        dragVelocity = deltaX * 0.0035;
        prevMouseX = e.clientX;
      }

      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseParallaxX = nx * 0.35;
      mouseParallaxY = -ny * 0.18;
    });

    // Main Render & Animation Loop
    const clock = new THREE.Clock();
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      const elapsed = clock.getElapsedTime();

      // Gentle auto-rotation when idle
      if (!isDragging) {
        world.rotation.y += 0.0022 + dragVelocity;
        dragVelocity *= 0.94; // inertia damping
      }

      // Smooth camera parallax
      currentParallaxX += (mouseParallaxX - currentParallaxX) * 0.045;
      currentParallaxY += (mouseParallaxY - currentParallaxY) * 0.045;

      camera.position.x = currentParallaxX * 2.0;
      camera.position.y = 3.3 + currentParallaxY * 1.2;
      camera.lookAt(0, 0.5, 0);

      // Subtle breathing motion of the island
      islandGroup.position.y = Math.sin(elapsed * 0.7) * 0.03;
      houseGroup.position.y = islandGroup.position.y;
      treeGroup.position.y = islandGroup.position.y;

      // Floating Tools gentle harmonic motion
      tools.forEach(t => {
        t.group.position.y = t.baseY + Math.sin(elapsed * t.speed) * t.amp;
        t.group.rotation.y += t.rotSpeed;
      });

      renderer.render(scene, camera);
    }
    renderLoop();
  }

  /* ================= 4. AUDIO SIMULATOR (LIBRETA DE OBRA) ================= */
  function initAudioSimulator() {
    const audioBox = document.getElementById('audioSimulatorBox');
    if (!audioBox) return;

    let isPlaying = false;
    let interval = null;
    const playBtn = document.getElementById('audioPlayBtn');
    const label = document.getElementById('audioLabelText');
    const bars = audioBox.querySelectorAll('.audio-bar');

    audioBox.addEventListener('click', () => {
      if (!isPlaying) {
        isPlaying = true;
        if (playBtn) playBtn.textContent = '❚❚';
        if (label) label.textContent = 'Reproduciendo audio de Don Luis (0:14)...';

        interval = setInterval(() => {
          bars.forEach(bar => {
            const h = Math.floor(Math.random() * 18) + 6;
            bar.style.height = `${h}px`;
          });
        }, 120);

        showToast('🔊 "Doña Carmen, ya montamos el nuevo codo de cobre con teflón. 100% probado sin fugas."', 'normal');

        setTimeout(() => {
          isPlaying = false;
          if (playBtn) playBtn.textContent = '▶';
          if (label) label.textContent = 'Nota de voz Don Luis · Plomero (0:14)';
          clearInterval(interval);
          bars.forEach((bar, i) => {
            const defaults = [8, 16, 12, 22, 10, 18, 14, 20, 8];
            bar.style.height = `${defaults[i % defaults.length]}px`;
          });
        }, 4500);
      } else {
        isPlaying = false;
        if (playBtn) playBtn.textContent = '▶';
        if (label) label.textContent = 'Nota de voz Don Luis · Plomero (0:14)';
        clearInterval(interval);
      }
    });
  }

  /* ================= 5. EXAMEN TÉCNICO INTERACTIVO (SMITHS VALIDATION) ================= */
  // Banco exhaustivo de preguntas técnicas reales por oficio
  const EXAM_BANKS = {
    plomeria: {
      tradeName: 'Plomería & Redes Hidráulicas',
      questions: [
        {
          title: 'Diagnóstico de Golpe de Ariete',
          scenario: 'Un cliente reporta que cada vez que cierra la llave monomando de la cocina, las tuberías dentro de la pared emiten un golpe metálico seco muy fuerte y vibran.',
          options: [
            'Se debe aumentar la presión general abriendo más la llave de paso de la calle.',
            'Es un golpe de ariete por choque de presión hidráulica; la solución técnica es instalar una cámara de aire o amortiguador de golpe de ariete cerca a la grifería.',
            'El problema es que la grifería está mal enroscada; solo basta apretar la tuerca de la base con más fuerza.',
            'Se debe vaciar el tanque de reserva y cambiar la tubería a una de menor diámetro.'
          ],
          correct: 1,
          explanation: 'El golpe de ariete ocurre por la detención brusca del caudal de agua en válvulas de cierre rápido. Genera ondas de sobrepresión que fatigan las uniones; un amortiguador o tramo de aire disipa la energía cinética.'
        },
        {
          title: 'Pendiente Reglamentaria de Desagües Sanitarios',
          scenario: 'Al instalar un ramal horizontal de aguas servidas de 3" y 4" que conecta dos baños hacia la bajante principal:',
          options: [
            'Debe instalarse totalmente a nivel (0%) para evitar que el agua se mueva con turbulencia.',
            'Debe tener una pendiente mínima entre el 1.5% y el 2% para asegurar que los sólidos y líquidos se transporten a la velocidad adecuada sin sedimentar.',
            'Debe tener una pendiente vertical pronunciada superior al 10% para que caiga lo más rápido posible sin importar nada más.',
            'La pendiente depende únicamente del color del tubo PVC utilizado.'
          ],
          correct: 1,
          explanation: 'Una pendiente inferior al 1% causa sedimentación de sólidos y obstrucciones frecuentes; una pendiente superior al 3% provoca que el líquido fluya demasiado rápido dejando los sólidos varados.'
        },
        {
          title: 'Procedimiento de Unión por Termofusión (PPR)',
          scenario: 'Estás instalando una línea de agua caliente en polipropileno copolímero random (PPR). ¿Cuál es la regla fundamental durante la inserción de las piezas en el dado calefactor?',
          options: [
            'Girar las piezas 360 grados mientras se empujan para mezclar el plástico.',
            'Insertar de forma recta hasta el tope de profundidad sin girar las piezas, respetar el tiempo de calentamiento y unirlas inmediatamente de forma lineal.',
            'Enfriar la unión inmediatamente con agua helada o un trapo empapado para apurar el curado.',
            'Aplicar soldadura líquida de PVC antes de calentar para reforzar la unión.'
          ],
          correct: 1,
          explanation: 'En la termofusión está estrictamente prohibido rotar las piezas durante la inserción y el acople, ya que la torsión rompe las cadenas poliméricas debilitando la unión molecular.'
        },
        {
          title: 'Detección de Fugas Ocultas con Contador Parado',
          scenario: 'Una pared presenta manchas de humedad y salitre pero al cerrar todos los puntos de consumo el contador no marca movimiento perceptible.',
          options: [
            'Pintar encima inmediatamente con pintura impermeabilizante sin revisar.',
            'Aislar el tramo sospechoso y realizar una prueba hidrostática con bomba de presión y manómetro para medir pérdida de bares/PSI.',
            'Romper todo el piso del apartamento al azar hasta encontrar agua.',
            'Decirle al cliente que espere 6 meses a que se seque sola.'
          ],
          correct: 1,
          explanation: 'Fugas por microporos o goteos lentos en tramos empotrados requieren prueba de estanqueidad con manómetro calibrado para certificar si la línea retiene la presión de trabajo.'
        }
      ]
    },

    electricidad: {
      tradeName: 'Electricidad Residencial (Reglamento RETIE)',
      questions: [
        {
          title: 'Dimensionamiento de Breakers y Calibre AWG',
          scenario: 'Un circuito de tomacorrientes de cocina y electrodomésticos está protegido con un interruptor termomagnético de 20 Amperios. ¿Cuál es el calibre mínimo de conductor de cobre permitido por la norma RETIE / NTC 2050?',
          options: [
            'Conductor calibre 16 AWG.',
            'Conductor calibre 14 AWG.',
            'Conductor calibre 12 AWG.',
            'Conductor calibre 8 AWG únicamente.'
          ],
          correct: 2,
          explanation: 'Para breakers de 20A en circuitos ramales, la norma NTC 2050 y RETIE exigen conductor de cobre no menor a calibre 12 AWG para soportar la corriente nominal sin sobrecalentamiento del aislamiento.'
        },
        {
          title: 'Comportamiento ante Cortocircuito vs Sobrecarga',
          scenario: 'El cliente conecta un horno microondas y una cafetera; a los 8 minutos el breaker se dispara sin sonido. En cambio, en otra habitación, al conectar una lámpara el breaker salta instantáneamente con un chasquido fuerte.',
          options: [
            'El primer caso es un cortocircuito y el segundo es un fallo del polo a tierra.',
            'El primer caso es una sobrecarga térmica progresiva (bimetal calentado) y el segundo es un cortocircuito franco instantáneo (disparo magnético).',
            'Ambos casos son por culpa del medidor de energía defectuoso.',
            'El breaker está vencido y se debe cambiar por uno de 50 Amperios para que no moleste.'
          ],
          correct: 1,
          explanation: 'El interruptor termomagnético posee dos mecanismos: una lámina bimetálica para sobrecargas graduales y una bobina electromagnética para despeje instantáneo en cortocircuitos.'
        },
        {
          title: 'Puesta a Tierra y Seguridad de las Personas',
          scenario: 'En una vivienda recién remodelada, el cliente pregunta para qué sirve la tercera patita redonda en los tomacorrientes y el cable verde/desnudo.',
          options: [
            'Es un adorno estético obligatorio por ley.',
            'Sirve para que los aparatos gasten menos electricidad al mes.',
            'Es el conductor de protección a tierra; deriva corrientes de fuga accidentales hacia la varilla enterrada evitando electrocución a quien toque el chasis.',
            'Es una fase de reserva por si se corta la luz principal.'
          ],
          correct: 2,
          explanation: 'El sistema de puesta a tierra residencial canaliza corrientes de falla provocadas por defectos de aislamiento hacia el electrodo de tierra, protegiendo vidas humanas y activando las protecciones.'
        },
        {
          title: 'Equilibrio de Fases en Tablero Bifásico',
          scenario: 'Al revisar un tablero de distribución bifásico de 12 circuitos en un hogar con acometida de 120/240V:',
          options: [
            'Se deben conectar todos los circuitos en una sola barra de fase y dejar la otra vacía.',
            'Las cargas de iluminación y tomas deben repartirse equilibradamente entre las fases A y B para evitar caídas de tensión y recalentamiento del conductor neutro.',
            'El cable neutro debe conectarse a un breaker de 30A.',
            'No importa el balance, los electrones se reparten solos automáticamente.'
          ],
          correct: 1,
          explanation: 'Un desbalance excesivo de fases genera sobrecorrientes en el conductor neutro común, pérdidas por efecto Joule y caídas de tensión que deterioran electrodomésticos sensibles.'
        }
      ]
    },

    pintura: {
      tradeName: 'Pintura, Drywall & Acabados Arquitectónicos',
      questions: [
        {
          title: 'Tratamiento de Salitre y Humedad Freática',
          scenario: 'Una pared de primer piso tiene eflorescencias salinas blancas y desprendimiento de revoque en los 50 centímetros inferiores.',
          options: [
            'Lavar con abundante agua y pintar inmediatamente con óleo brillante.',
            'Picar y raspar el estuco dañado, neutralizar con solución ácida, sellar con hidrófugo/impermeabilizante de base solvente y repellar con estuco plástico resistente a la humedad.',
            'Colocar papel de colgadura adhesivo para tapar la mancha visualmente.',
            'Aplicar 4 manos de vinilo tipo 3 económico.'
          ],
          correct: 1,
          explanation: 'Pintar sobre eflorescencias sin barrera hidrófuga garantiza que la pintura se abombe en menos de un mes debido a la presión osmótica de los cristales de sal.'
        },
        {
          title: 'Selección de Pintura para Zonas de Humedad Continua',
          scenario: 'Un cliente desea pintar el cielo raso y las paredes superiores de un baño sin ventilación mecánica donde se acumula vapor a diario.',
          options: [
            'Vinilo tradicional Tipo 2 para interiores secos.',
            'Pintura acrílica de alta lavabilidad con componentes fungicidas/antihongos de poro abierto transpirable.',
            'Esmalte para metales con diluyente varsol.',
            'Cal pura mezclada con sal de cocina.'
          ],
          correct: 1,
          explanation: 'El vapor continuo coloniza micelios de hongos; se requiere recubrimiento acrílico elastomérico o vinilacrílico grado 1 con biocidas de amplio espectro.'
        }
      ]
    },

    carpinteria: {
      tradeName: 'Carpintería Fina & Mobiliario',
      questions: [
        {
          title: 'Holgura de Dilatación en Puertas de Madera Maciza',
          scenario: 'Instalas una puerta de madera maciza en un marco de madera en clima húmedo. ¿Cuál es la luz perimetral recomendada entre hoja y marco?',
          options: [
            'Cero milímetros; debe quedar rozando con fuerza para que no entre viento.',
            'Entre 3 mm y 4 mm uniformes en los cantos laterales y superior para permitir la expansión higroscópica natural de la madera.',
            'Al menos 3 centímetros de separación.',
            'La madera nunca cambia de tamaño con la humedad.'
          ],
          correct: 1,
          explanation: 'La madera es un material higroscópico anisotrópico. Con cambios estacionales de humedad se expande tangencialmente; sin luz de 3-4 mm la puerta se trabará al cerrar.'
        },
        {
          title: 'Corte Limpio en Aglomerados de Melamina (MDP/MDF)',
          scenario: 'Para cortar tableros de melamina de 15mm o 18mm sin que el recubrimiento se desportille o astille en la cara visible:',
          options: [
            'Usar un serrucho de poda manual.',
            'Usar disco de sierra con dientes trapezoidales/planos de alta densidad (mínimo 60-80 dientes) y precorte superficial o cinta de enmascarar sobre la línea de corte.',
            'Cortar a máxima velocidad golpeando la madera con un cincel.',
            'Lustrar con cera líquida antes de cortar.'
          ],
          correct: 1,
          explanation: 'El filo quebradizo de la melamina requiere discos de corte fino con ángulo de ataque negativo o neutro para evitar el astillamiento de los bordes vistos.'
        }
      ]
    }
  };

  function initExamModule() {
    const examContainer = document.getElementById('examInteractiveApp');
    if (!examContainer) return;

    let currentTrade = 'plomeria';
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];

    const tradeSelector = document.getElementById('examTradeSelector');
    if (tradeSelector) {
      tradeSelector.addEventListener('change', (e) => {
        currentTrade = e.target.value;
        startExam(currentTrade);
      });
    }

    startExam(currentTrade);

    function startExam(tradeKey) {
      currentTrade = tradeKey;
      currentQuestionIndex = 0;
      score = 0;
      userAnswers = [];
      renderQuestion();
    }

    function renderQuestion() {
      const bank = EXAM_BANKS[currentTrade];
      if (!bank) return;

      const totalQ = bank.questions.length;
      const q = bank.questions[currentQuestionIndex];

      const pct = Math.round((currentQuestionIndex / totalQ) * 100);
      const progressFill = document.getElementById('examProgressFill');
      const counterText = document.getElementById('examQuestionCounter');
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (counterText) counterText.textContent = `Caso ${currentQuestionIndex + 1} de ${totalQ}`;

      const titleEl = document.getElementById('examQuestionTitle');
      const scenarioEl = document.getElementById('examCaseScenario');
      const optionsBox = document.getElementById('examOptionsBox');
      const feedbackBox = document.getElementById('examFeedbackBox');

      if (titleEl) titleEl.textContent = q.title;
      if (scenarioEl) scenarioEl.textContent = q.scenario;
      if (feedbackBox) {
        feedbackBox.style.display = 'none';
        feedbackBox.innerHTML = '';
      }

      if (optionsBox) {
        optionsBox.innerHTML = '';
        q.options.forEach((optText, idx) => {
          const btn = document.createElement('div');
          btn.className = 'exam-option-item';
          btn.innerHTML = `
            <span style="font-weight: 700; color: var(--blue-primary); width: 22px;">${String.fromCharCode(65 + idx)}.</span>
            <span style="flex: 1;">${optText}</span>
          `;
          btn.addEventListener('click', () => selectOption(idx, q, btn));
          optionsBox.appendChild(btn);
        });
      }
    }

    function selectOption(chosenIdx, q, selectedBtn) {
      const optionsBox = document.getElementById('examOptionsBox');
      const feedbackBox = document.getElementById('examFeedbackBox');
      if (!optionsBox) return;

      // Disable further clicks on options
      const allOptions = optionsBox.querySelectorAll('.exam-option-item');
      allOptions.forEach(opt => opt.style.pointerEvents = 'none');

      const isCorrect = chosenIdx === q.correct;
      if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
      } else {
        selectedBtn.classList.add('incorrect');
        if (allOptions[q.correct]) allOptions[q.correct].classList.add('correct');
      }

      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.style.marginTop = '20px';
        feedbackBox.style.padding = '16px';
        feedbackBox.style.borderRadius = 'var(--radius-md)';
        feedbackBox.style.backgroundColor = isCorrect ? 'var(--green-soft)' : '#FFF0F0';
        feedbackBox.style.border = `1px solid ${isCorrect ? 'var(--green-border)' : '#FFCDD2'}`;
        feedbackBox.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 6px; color: ${isCorrect ? 'var(--green-verified)' : '#C62828'}">
            ${isCorrect ? '✓ ¡Respuesta Correcta y Fundamentada!' : '✗ Diagnóstico No Óptimo'}
          </div>
          <p style="font-size: 0.92rem; color: var(--ink-secondary); margin-bottom: 14px;">${q.explanation}</p>
          <button class="btn btn-primary btn-sm" id="btnNextQuestion">
            ${currentQuestionIndex + 1 < EXAM_BANKS[currentTrade].questions.length ? 'Siguiente Caso Clínico →' : 'Ver Resultado de Certificación →'}
          </button>
        `;

        document.getElementById('btnNextQuestion')?.addEventListener('click', () => {
          currentQuestionIndex++;
          if (currentQuestionIndex < EXAM_BANKS[currentTrade].questions.length) {
            renderQuestion();
          } else {
            showFinalResults();
          }
        });
      }
    }

    function showFinalResults() {
      const bank = EXAM_BANKS[currentTrade];
      const total = bank.questions.length;
      const pct = Math.round((score / total) * 100);
      const passed = pct >= 75;

      const container = document.getElementById('examQuestionCard');
      if (!container) return;

      if (currentUser && currentUser.role === 'smith' && passed) {
        currentUser.certified = true;
        currentUser.certifiedTrade = bank.tradeName;
        localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
        updateNavUserSlot();
      }

      container.innerHTML = `
        <div class="exam-badge-result">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">${passed ? '🏆' : '📖'}</div>
          <h3 style="font-size: 1.8rem; margin-bottom: 8px;">
            ${passed ? '¡Aprobado con Distinción Técnica!' : 'Examen Completado: Refuerzo Necesario'}
          </h3>
          <p style="font-size: 1.05rem; color: var(--ink-secondary); max-width: 500px; margin: 0 auto 16px;">
            Puntaje obtenido: <strong>${score} de ${total} casos resueltos (${pct}%)</strong> en la especialidad de <em>${bank.tradeName}</em>.
          </p>

          ${passed ? `
            <div class="certificate-stamp">
              ✓ SMITH VERIFICADO EN COMPETENCIAS TÉCNICAS
            </div>
            <p style="font-size: 0.9rem; color: var(--green-verified); font-weight: 600; margin-bottom: 24px;">
              Tu perfil ahora cuenta con el distintivo de aptitud para resolución de incidencias en obra.
            </p>
          ` : `
            <p style="font-size: 0.9rem; color: var(--wood-primary); margin-bottom: 24px;">
              El estándar de Tasksmith exige mínimo el 75% para asignación automática de clientes de alta prioridad. Te invitamos a repasar los conceptos y volver a intentarlo.
            </p>
          `}

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-ghost" id="btnRestartExam">Reiniciar Examen</button>
            <button class="btn btn-primary" onclick="openBookingModal('${currentTrade}')">Ver Trabajos Disponibles</button>
          </div>
        </div>
      `;

      document.getElementById('btnRestartExam')?.addEventListener('click', () => {
        // Restore DOM and restart
        window.location.reload();
      });
    }
  }

  /* ================= 5.1 PRUEBA DE VERIFICACIÓN PRÁCTICA (CÁMARA, FOTOS MÚLTIPLES Y AUDIOS GENERALES) ================= */
  // Estado de evidencias (soporte de pares de Foto + Audio dinámicos)
  let verificationEvidences = [
    {
      id: 1,
      photo: null,
      audioUrl: null,
      audioDuration: null,
      isRecording: false,
      recordSeconds: 0,
      recordTimerId: null,
      mediaRecorder: null,
      audioChunks: [],
      isPlaying: false,
      audioPlayerObj: null
    }
  ];
  let nextEvidenceId = 2;
  let activeCameraEvidenceId = 1;
  let cameraStream = null;

  // Gatekeeper: Bloqueo exclusivo para Smiths en portal-smiths.html
  window.updateSmithGatekeeperUI = function () {
    const gatekeeperBlock = document.getElementById('smithGatekeeperBlock');
    const examContentBlock = document.getElementById('smithExamContentBlock');
    if (!gatekeeperBlock && !examContentBlock) return;

    if (currentUser && currentUser.role === 'smith') {
      if (gatekeeperBlock) gatekeeperBlock.style.display = 'none';
      if (examContentBlock) examContentBlock.style.display = 'block';

      const nameEl = document.getElementById('examSmithName');
      const tradeEl = document.getElementById('examSmithTrade');
      if (nameEl) nameEl.textContent = currentUser.name || 'Maestro Smith';
      if (tradeEl) tradeEl.textContent = `Especialista en ${currentUser.trade || 'Oficio Técnico'}`;
    } else {
      if (gatekeeperBlock) gatekeeperBlock.style.display = 'block';
      if (examContentBlock) examContentBlock.style.display = 'none';
    }
  };

  window.loginAsDemoSmith = function () {
    currentUser = {
      name: 'Luis Rodríguez',
      email: 'luis@tasksmith.co',
      phone: '312 456 7890',
      role: 'smith',
      trade: 'Plomería',
      certified: true,
      rate: '70000',
      zone: 'Chapinero, Cedritos, Usaquén',
      portfolio: []
    };
    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
    updateNavUserSlot();
    updateSmithGatekeeperUI();
    showToast('🔨 Sesión iniciada como Don Luis (Maestro Smith). Prueba desbloqueada.', 'success');
  };

  function initPracticalVerificationModule() {
    updateSmithGatekeeperUI();
    initDropzoneForEvidence(1);
    updateEvidenceCountUI();
  }

  function initDropzoneForEvidence(id) {
    const dropzone = document.getElementById(`photoDropzone_${id}`);
    if (!dropzone) return;

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setEvidencePhoto(id, evt.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* --- CÁMARA EN VIVO / CAPTURA --- */
  window.openCameraModal = function (evidenceId = 1) {
    activeCameraEvidenceId = evidenceId;
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideoFeed');
    const fallback = document.getElementById('cameraStatusFallback');

    if (modal) modal.classList.add('open');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
      if (fallback) fallback.style.display = 'block';
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        if (fallback) fallback.style.display = 'none';
        video.play().catch(e => console.log('Camera video play issue:', e));
      })
      .catch(err => {
        console.log('No direct webcam stream available, using simulated shutter mode:', err);
        if (fallback) {
          fallback.textContent = '📸 Sensor de cámara listo (Modo captura fotográfica simulada)';
          fallback.style.display = 'block';
        }
        if (video) video.style.display = 'none';
      });
    } else {
      if (fallback) {
        fallback.textContent = '📸 Sensor de cámara listo (Modo captura fotográfica)';
        fallback.style.display = 'block';
      }
      if (video) video.style.display = 'none';
    }
  };

  window.capturePhotoFromCamera = function () {
    const video = document.getElementById('cameraVideoFeed');
    const canvas = document.getElementById('cameraCanvas');
    let photoDataUrl = null;

    if (video && cameraStream && video.videoWidth > 0 && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    } else {
      // Fallback realistic craft photo capture
      const sampleTradeImages = [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
      ];
      const imgIdx = (activeCameraEvidenceId - 1) % sampleTradeImages.length;
      photoDataUrl = sampleTradeImages[imgIdx];
    }

    setEvidencePhoto(activeCameraEvidenceId, photoDataUrl);
    closeCameraModal();
    showToast('📸 Foto capturada desde la cámara y adjuntada a la evidencia.', 'success');
  };

  window.closeCameraModal = function () {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    const modal = document.getElementById('cameraModal');
    if (modal) modal.classList.remove('open');
  };

  window.triggerFileInput = function (id) {
    const input = document.getElementById(`workPhotoInput_${id}`);
    if (input) input.click();
  };

  window.handlePhotoInputChange = function (id, input) {
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setEvidencePhoto(id, evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function setEvidencePhoto(id, src) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (ev) ev.photo = src;

    const dropzone = document.getElementById(`photoDropzone_${id}`);
    const container = document.getElementById(`photoPreviewContainer_${id}`);
    const img = document.getElementById(`photoPreviewImg_${id}`);
    const badgePhoto = document.getElementById(`badgePhotoStatus_${id}`);

    if (img) img.src = src;
    if (dropzone) dropzone.style.display = 'none';
    if (container) container.style.display = 'block';

    if (badgePhoto) {
      badgePhoto.textContent = '✓ Foto Cargada';
      badgePhoto.style.color = 'var(--green-verified)';
      badgePhoto.style.background = 'var(--green-soft)';
    }

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
    showToast(`✓ Foto del paso #${getEvidenceIndex(id)} adjuntada correctamente.`, 'success');
  }

  window.resetPhotoUpload = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (ev) ev.photo = null;

    const input = document.getElementById(`workPhotoInput_${id}`);
    if (input) input.value = '';

    const dropzone = document.getElementById(`photoDropzone_${id}`);
    const container = document.getElementById(`photoPreviewContainer_${id}`);
    const badgePhoto = document.getElementById(`badgePhotoStatus_${id}`);

    if (dropzone) dropzone.style.display = 'flex';
    if (container) container.style.display = 'none';

    if (badgePhoto) {
      badgePhoto.textContent = 'Pendiente';
      badgePhoto.style.color = 'var(--wood-primary)';
      badgePhoto.style.background = 'var(--bg-accent-soft)';
    }

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
  };

  window.loadSamplePhoto = function (id) {
    const samples = [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ];
    const pick = samples[(id - 1) % samples.length];
    setEvidencePhoto(id, pick);
  };

  /* --- AUDIO EXPLICATIVO (GENERAL PARA CUALQUIER OFICIO) --- */
  window.toggleAudioRecording = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    const btn = document.getElementById(`btnToggleRecord_${id}`);
    const timerEl = document.getElementById(`recordTimer_${id}`);
    const instrEl = document.getElementById(`recordInstructionText_${id}`);

    if (!ev.isRecording) {
      // Iniciar grabación
      ev.isRecording = true;
      ev.recordSeconds = 0;
      if (btn) btn.classList.add('recording');
      if (instrEl) instrEl.textContent = 'Grabando explicación general... Toca de nuevo para finalizar';
      if (timerEl) timerEl.textContent = '00:00';

      ev.recordTimerId = setInterval(() => {
        ev.recordSeconds++;
        const s = ev.recordSeconds;
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;

        if (s >= 90) {
          window.toggleAudioRecording(id);
        }
      }, 1000);

      ev.audioChunks = [];
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          try {
            ev.mediaRecorder = new MediaRecorder(stream);
            ev.mediaRecorder.ondataavailable = e => {
              if (e.data.size > 0) ev.audioChunks.push(e.data);
            };
            ev.mediaRecorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop());
              const blob = new Blob(ev.audioChunks, { type: 'audio/webm' });
              ev.audioUrl = URL.createObjectURL(blob);
            };
            ev.mediaRecorder.start();
          } catch (err) {
            console.log('MediaRecorder fallback:', err);
          }
        }).catch(err => {
          console.log('Mic fallback:', err);
        });
      }

      showToast(`🎙️ Grabando audio explicativo del paso #${getEvidenceIndex(id)}...`, 'normal');
    } else {
      // Detener grabación
      ev.isRecording = false;
      if (ev.recordTimerId) {
        clearInterval(ev.recordTimerId);
        ev.recordTimerId = null;
      }
      if (btn) btn.classList.remove('recording');

      if (ev.mediaRecorder && ev.mediaRecorder.state !== 'inactive') {
        try { ev.mediaRecorder.stop(); } catch (e) {}
      }

      const durSec = Math.max(ev.recordSeconds, 8);
      const durStr = `0:${durSec < 10 ? '0' : ''}${durSec}`;
      finishAudioRecording(id, durStr);
    }
  };

  function finishAudioRecording(id, durationStr) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    ev.audioDuration = durationStr;
    const recorderBox = document.getElementById(`audioRecorderBox_${id}`);
    const playbackBox = document.getElementById(`audioPlaybackContainer_${id}`);
    const badgeAudio = document.getElementById(`badgeAudioStatus_${id}`);
    const durText = document.getElementById(`audioDurationText_${id}`);

    if (recorderBox) recorderBox.style.display = 'none';
    if (playbackBox) playbackBox.style.display = 'block';

    if (badgeAudio) {
      badgeAudio.textContent = '✓ Audio Grabado';
      badgeAudio.style.color = 'var(--green-verified)';
      badgeAudio.style.background = 'var(--green-soft)';
    }

    if (durText) durText.textContent = durationStr;

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
    showToast(`✓ Explicación de audio guardada (${durationStr}) para el paso #${getEvidenceIndex(id)}.`, 'success');
  }

  window.loadSampleAudio = function (id) {
    finishAudioRecording(id, '0:22');
    showToast(`🎧 Audio general de muestra cargado para el paso #${getEvidenceIndex(id)}.`, 'success');
  };

  window.resetAudioRecording = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    if (ev.isPlaying) {
      stopPlayingEvidenceAudio(id);
    }
    ev.audioUrl = null;
    ev.audioDuration = null;
    ev.recordSeconds = 0;

    const recorderBox = document.getElementById(`audioRecorderBox_${id}`);
    const playbackBox = document.getElementById(`audioPlaybackContainer_${id}`);
    const badgeAudio = document.getElementById(`badgeAudioStatus_${id}`);
    const timerEl = document.getElementById(`recordTimer_${id}`);
    const instrEl = document.getElementById(`recordInstructionText_${id}`);

    if (recorderBox) recorderBox.style.display = 'flex';
    if (playbackBox) playbackBox.style.display = 'none';
    if (timerEl) timerEl.textContent = '00:00';
    if (instrEl) instrEl.textContent = 'Toca el micrófono para comenzar a hablar';

    if (badgeAudio) {
      badgeAudio.textContent = 'Pendiente';
      badgeAudio.style.color = 'var(--wood-primary)';
      badgeAudio.style.background = 'var(--bg-accent-soft)';
    }

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
  };

  window.togglePlayEvidenceAudio = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    if (!ev.isPlaying) {
      startPlayingEvidenceAudio(id);
    } else {
      stopPlayingEvidenceAudio(id);
    }
  };

  function startPlayingEvidenceAudio(id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    // Detener cualquier otro audio en reproducción
    verificationEvidences.forEach(other => {
      if (other.id !== id && other.isPlaying) {
        stopPlayingEvidenceAudio(other.id);
      }
    });

    ev.isPlaying = true;
    const playBtn = document.getElementById(`btnPlayEvidenceAudio_${id}`);
    const visualizer = document.getElementById(`playbackBarsVisualizer_${id}`);

    if (playBtn) playBtn.textContent = '⏸';
    if (visualizer) visualizer.classList.add('playing');

    if (ev.audioUrl) {
      ev.audioPlayerObj = new Audio(ev.audioUrl);
      ev.audioPlayerObj.play().catch(e => playFallbackUniversalVoice(id));
      ev.audioPlayerObj.onended = () => stopPlayingEvidenceAudio(id);
    } else {
      playFallbackUniversalVoice(id);
    }
  }

  function playFallbackUniversalVoice(id) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const trade = document.getElementById('verificationTradeSelect')?.value || 'el oficio técnico';
      const utterance = new SpeechSynthesisUtterance(
        `Para esta labor de ${trade}, primero diagnosticamos la causa raíz del problema del cliente. Procedimos a retirar los elementos afectados, utilizamos materiales de primera calidad con herramientas certificadas, y realizamos pruebas de funcionamiento y seguridad para entregar un trabajo 100% garantizado.`
      );
      utterance.lang = 'es-CO';
      utterance.rate = 1.05;
      utterance.onend = () => stopPlayingEvidenceAudio(id);
      utterance.onerror = () => {
        setTimeout(() => stopPlayingEvidenceAudio(id), 4000);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => stopPlayingEvidenceAudio(id), 4000);
    }
  }

  function stopPlayingEvidenceAudio(id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    ev.isPlaying = false;
    const playBtn = document.getElementById(`btnPlayEvidenceAudio_${id}`);
    const visualizer = document.getElementById(`playbackBarsVisualizer_${id}`);

    if (playBtn) playBtn.textContent = '▶';
    if (visualizer) visualizer.classList.remove('playing');

    if (ev.audioPlayerObj) {
      ev.audioPlayerObj.pause();
      ev.audioPlayerObj = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /* --- GESTIÓN DE PARES DINÁMICOS DE EVIDENCIA (FOTO + AUDIO) --- */
  window.addEvidencePair = function () {
    const newId = nextEvidenceId++;
    const stepNumber = verificationEvidences.length + 1;

    const newEvidence = {
      id: newId,
      photo: null,
      audioUrl: null,
      audioDuration: null,
      isRecording: false,
      recordSeconds: 0,
      recordTimerId: null,
      mediaRecorder: null,
      audioChunks: [],
      isPlaying: false,
      audioPlayerObj: null
    };
    verificationEvidences.push(newEvidence);

    const container = document.getElementById('evidenceListContainer');
    if (!container) return;

    const block = document.createElement('div');
    block.className = 'evidence-block-card';
    block.id = `evidenceBlock_${newId}`;
    block.setAttribute('data-evidence-id', newId);

    block.innerHTML = `
      <div class="evidence-block-header">
        <span class="evidence-step-badge">Paso o Evidencia #${stepNumber}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="live-badge" id="badgeStepStatus_${newId}">Pendiente</span>
          <button type="button" class="btn-remove-evidence" onclick="removeEvidencePair(${newId})" title="Eliminar este paso">
            ✕ Eliminar paso
          </button>
        </div>
      </div>

      <div class="work-evidence-grid">
        <!-- COLUMNA IZQUIERDA: CÁMARA Y FOTO -->
        <div class="evidence-panel">
          <div class="evidence-panel-header">
            <div class="evidence-panel-title">
              <span class="evidence-panel-icon">📷</span>
              <span>Foto del Trabajo</span>
            </div>
            <span class="live-badge" id="badgePhotoStatus_${newId}">Pendiente</span>
          </div>

          <input type="file" id="workPhotoInput_${newId}" accept="image/*" capture="environment" style="display: none;" onchange="handlePhotoInputChange(${newId}, this)">

          <div class="upload-dropzone" id="photoDropzone_${newId}">
            <div class="upload-dropzone-icon">📸</div>
            <button type="button" class="btn-open-camera" onclick="openCameraModal(${newId})">
              📸 Abrir Cámara
            </button>
            <span style="font-size: 0.82rem; color: var(--ink-muted); margin: 4px 0;">o selecciona una imagen</span>
            <button type="button" class="btn btn-outline btn-sm" onclick="triggerFileInput(${newId})">
              📁 Elegir Archivo
            </button>
          </div>

          <div class="photo-preview-container" id="photoPreviewContainer_${newId}">
            <img src="" alt="Evidencia capturada" id="photoPreviewImg_${newId}" class="photo-preview-img">
            <div class="photo-preview-actions">
              <span style="font-weight: 600;">✓ Foto de evidencia lista</span>
              <button type="button" class="btn btn-ghost btn-sm" style="color: #fff; padding: 2px 8px;" onclick="resetPhotoUpload(${newId})">Cambiar foto</button>
            </div>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; color: var(--ink-muted);">Para probar rápido:</span>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; padding: 4px 8px;" onclick="loadSamplePhoto(${newId})">
              ✨ Foto de ejemplo
            </button>
          </div>
        </div>

        <!-- COLUMNA DERECHA: AUDIO EXPLICATIVO GENERAL -->
        <div class="evidence-panel">
          <div class="evidence-panel-header">
            <div class="evidence-panel-title">
              <span class="evidence-panel-icon">🎙️</span>
              <span>Audio Explicativo</span>
            </div>
            <span class="live-badge" id="badgeAudioStatus_${newId}">Pendiente</span>
          </div>

          <div class="audio-recorder-box" id="audioRecorderBox_${newId}">
            <button type="button" class="btn-mic-record" id="btnToggleRecord_${newId}" onclick="toggleAudioRecording(${newId})" title="Toca para grabar audio">
              🎤
            </button>

            <div class="record-timer" id="recordTimer_${newId}">00:00</div>
            <p id="recordInstructionText_${newId}" style="font-size: 0.85rem; color: var(--ink-muted); margin: 6px 0 0;">
              Toca el micrófono para comenzar a hablar
            </p>

            <div class="audio-guide-list">
              <strong>Puntos clave a mencionar en tu audio:</strong>
              <ul style="padding-left: 18px; margin-top: 4px;">
                <li>1. ¿Cuál era el problema o necesidad inicial del cliente?</li>
                <li>2. ¿Qué materiales, herramientas y procedimiento aplicaste para solucionarlo?</li>
                <li>3. ¿Qué pruebas realizaste para garantizar que quedó seguro y con garantía?</li>
              </ul>
            </div>
          </div>

          <div class="audio-playback-container" id="audioPlaybackContainer_${newId}">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--ink-secondary); margin-bottom: 8px;">
              🎧 Tu explicación grabada:
            </div>
            <div class="audio-playback-row">
              <button type="button" class="audio-play-trigger" id="btnPlayEvidenceAudio_${newId}" onclick="togglePlayEvidenceAudio(${newId})">
                ▶
              </button>
              <div class="audio-bars-visualizer" id="playbackBarsVisualizer_${newId}">
                <span class="audio-bar-stick" style="height: 12px;"></span>
                <span class="audio-bar-stick" style="height: 22px;"></span>
                <span class="audio-bar-stick" style="height: 16px;"></span>
                <span class="audio-bar-stick" style="height: 28px;"></span>
                <span class="audio-bar-stick" style="height: 18px;"></span>
                <span class="audio-bar-stick" style="height: 24px;"></span>
                <span class="audio-bar-stick" style="height: 14px;"></span>
                <span class="audio-bar-stick" style="height: 20px;"></span>
                <span class="audio-bar-stick" style="height: 10px;"></span>
                <span class="audio-bar-stick" style="height: 26px;"></span>
                <span class="audio-bar-stick" style="height: 15px;"></span>
              </div>
              <span id="audioDurationText_${newId}" style="font-size: 0.82rem; font-weight: 700; color: var(--ink-muted);">0:22</span>
            </div>
            <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-ghost btn-sm" style="font-size: 0.8rem;" onclick="resetAudioRecording(${newId})">
                🔄 Grabar de nuevo
              </button>
            </div>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; color: var(--ink-muted);">¿Sin micrófono ahora?</span>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; padding: 4px 8px;" onclick="loadSampleAudio(${newId})">
              🎧 Audio de ejemplo
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(block);
    initDropzoneForEvidence(newId);
    updateEvidenceCountUI();
    showToast(`✓ Se agregó el Paso #${stepNumber}. Abre la cámara y graba el audio para este paso.`, 'success');

    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.removeEvidencePair = function (id) {
    if (verificationEvidences.length <= 1) {
      showToast('Debes mantener al menos un paso con foto y audio para validar el trabajo.', 'normal');
      return;
    }

    const ev = verificationEvidences.find(item => item.id === id);
    if (ev) {
      if (ev.recordTimerId) clearInterval(ev.recordTimerId);
      if (ev.isPlaying) stopPlayingEvidenceAudio(id);
    }

    verificationEvidences = verificationEvidences.filter(item => item.id !== id);
    const block = document.getElementById(`evidenceBlock_${id}`);
    if (block) block.remove();

    // Reindexar distintivos de los pasos restantes
    const blocks = document.querySelectorAll('#evidenceListContainer .evidence-block-card');
    blocks.forEach((el, index) => {
      const badge = el.querySelector('.evidence-step-badge');
      if (badge) badge.textContent = `Paso o Evidencia #${index + 1}`;
    });

    updateEvidenceCountUI();
    showToast('✓ Paso eliminado correctamente.', 'normal');
  };

  function getEvidenceIndex(id) {
    const idx = verificationEvidences.findIndex(item => item.id === id);
    return idx >= 0 ? idx + 1 : 1;
  }

  function updateEvidenceStepBadge(id) {
    const ev = verificationEvidences.find(item => item.id === id);
    const badgeStep = document.getElementById(`badgeStepStatus_${id}`);
    if (!badgeStep || !ev) return;

    if (ev.photo && ev.audioDuration) {
      badgeStep.textContent = '✓ Paso Completo';
      badgeStep.style.color = 'var(--green-verified)';
      badgeStep.style.background = 'var(--green-soft)';
    } else if (ev.photo || ev.audioDuration) {
      badgeStep.textContent = 'Parcial';
      badgeStep.style.color = 'var(--wood-primary)';
      badgeStep.style.background = 'var(--bg-accent-soft)';
    } else {
      badgeStep.textContent = 'Pendiente';
      badgeStep.style.color = 'var(--wood-primary)';
      badgeStep.style.background = 'var(--bg-accent-soft)';
    }
  }

  function updateEvidenceCountUI() {
    const readyPhotos = verificationEvidences.filter(e => !!e.photo).length;
    const readyAudios = verificationEvidences.filter(e => !!e.audioDuration).length;
    const total = verificationEvidences.length;

    const tagPhoto = document.getElementById('tagPhotoCheck');
    const tagAudio = document.getElementById('tagAudioCheck');

    if (tagPhoto) {
      tagPhoto.textContent = `📷 Fotos: ${readyPhotos} de ${total} listas`;
      if (readyPhotos > 0) tagPhoto.classList.add('ready');
      else tagPhoto.classList.remove('ready');
    }

    if (tagAudio) {
      tagAudio.textContent = `🎙️ Audios: ${readyAudios} de ${total} grabados`;
      if (readyAudios > 0) tagAudio.classList.add('ready');
      else tagAudio.classList.remove('ready');
    }
  }

  /* --- ENVÍO Y CERTIFICACIÓN --- */
  window.submitWorkVerification = function () {
    const jobTitleInput = document.getElementById('verificationJobTitle');
    const tradeSelect = document.getElementById('verificationTradeSelect');
    const jobTitle = jobTitleInput?.value.trim() || 'Trabajo técnico en obra';
    const trade = tradeSelect?.value || 'Plomería';

    // Auto-completar muestra en evidencias vacías si el maestro quiere probar rápido
    verificationEvidences.forEach((ev, idx) => {
      if (!ev.photo) {
        window.loadSamplePhoto(ev.id);
      }
      if (!ev.audioDuration) {
        finishAudioRecording(ev.id, '0:22');
      }
    });

    if (!currentUser) {
      currentUser = {
        name: 'Luis Rodríguez',
        email: 'luis@tasksmith.co',
        phone: '312 456 7890',
        role: 'smith',
        trade: trade,
        certified: true,
        rate: '70000',
        zone: 'Chapinero, Cedritos, Usaquén',
        portfolio: []
      };
    }

    currentUser.certified = true;
    currentUser.certifiedTrade = trade;
    if (!Array.isArray(currentUser.portfolio)) {
      currentUser.portfolio = [];
    }

    // Agregar todas las evidencias del trabajo al portafolio
    verificationEvidences.forEach((ev, idx) => {
      currentUser.portfolio.unshift({
        title: `${jobTitle} (Paso ${idx + 1}/${verificationEvidences.length})`,
        trade: trade,
        image: ev.photo,
        hasAudio: true,
        audioDuration: ev.audioDuration || '0:22',
        verified: true,
        date: 'Reciente'
      });
    });

    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
    updateNavUserSlot();

    const banner = document.getElementById('verificationSuccessBanner');
    if (banner) {
      banner.style.display = 'block';
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const submitBtn = document.getElementById('btnSubmitVerification');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = `✓ ${verificationEvidences.length} Pasos Evaluados y Certificados`;
      submitBtn.classList.remove('btn-primary');
      submitBtn.classList.add('btn-outline');
    }

    // Actualizar portafolio visual si está presente
    const grid = document.getElementById('smithPortfolioGrid');
    if (grid && verificationEvidences[0]?.photo) {
      const item = document.createElement('div');
      item.className = 'portfolio-item';
      item.innerHTML = `
        <img src="${verificationEvidences[0].photo}" alt="${jobTitle}">
        <span class="portfolio-item-label">⭐ ${jobTitle} (${verificationEvidences.length} fotos + audios)</span>
      `;
      grid.prepend(item);
    }

    showToast(`🏆 ¡Felicidades! Se certificaron ${verificationEvidences.length} evidencias de tu trabajo. Ahora portas el distintivo de Smith Verificado.`, 'success');
  };

  window.resetEntireVerification = function () {
    // Mantener sólo el primer bloque de evidencia y limpiarlo
    while (verificationEvidences.length > 1) {
      const last = verificationEvidences[verificationEvidences.length - 1];
      window.removeEvidencePair(last.id);
    }

    if (verificationEvidences.length === 1) {
      window.resetPhotoUpload(verificationEvidences[0].id);
      window.resetAudioRecording(verificationEvidences[0].id);
    }

    const banner = document.getElementById('verificationSuccessBanner');
    if (banner) banner.style.display = 'none';

    const submitBtn = document.getElementById('btnSubmitVerification');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Validar y Obtener Distintivo de Smith Verificado →';
      submitBtn.classList.remove('btn-outline');
      submitBtn.classList.add('btn-primary');
    }
    showToast('Formulario de verificación reiniciado.', 'normal');
  };

  /* ================= 6. MODAL & RESERVATION SYSTEM ================= */
  function setupModals() {
    // Backdrop click to close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAllModals();
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    // Booking modal openers
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tradePreset = btn.getAttribute('data-trade-preset');
        openBookingModal(tradePreset);
      });
    });

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleBookingSubmit);
    }
  }

  window.openBookingModal = function (tradePreset = '') {
    if (!currentUser) {
      showToast('Debes ingresar o registrarte para solicitar un especialista con garantía.', 'info');
      openLoginModal();
      return;
    }
    if (currentUser.role === 'smith') {
      showToast('Estás en modo Maestro (Smith). Abre tu perfil para ver tus solicitudes y portafolio.', 'info');
      openUserProfileModal();
      return;
    }

    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    const select = document.getElementById('bookingTradeSelect');
    if (select && tradePreset) {
      select.value = tradePreset;
    }
    modal.classList.add('open');
  };

  function handleBookingSubmit(e) {
    e.preventDefault();
    const trade = document.getElementById('bookingTradeSelect')?.value;
    const desc = document.getElementById('bookingDescInput')?.value;
    const loc = document.getElementById('bookingLocInput')?.value;

    closeAllModals();
    showToast(`✓ Solicitud de ${trade} publicada. 3 smiths verificados en ${loc} han sido notificados.`, 'success');
  }

  window.closeAllModals = function () {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  };

  /* ================= 7. TOAST MESSAGES ================= */
  window.showToast = function (message, type = 'normal') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  };

  /* ================= 8. MOTOR DE INTELIGENCIA ARTIFICIAL Y ASISTENTE DE CERTIFICACIÓN ================= */
  let currentCertStep = 1;
  let selectedCertTradeKey = 'plomeria';
  let certTheoreticalScore = 0;
  let certUserAnswers = {};

  const TRADE_EXPERT_KNOWLEDGE = {
    plomeria: {
      tradeName: 'Plomería & Redes Hidráulicas',
      icon: '🔧',
      norms: 'NTC 1500 (Código Colombiano de Fontanería)',
      sampleTranscript: 'Detecté fuga activa en el sifón y fisura en codo de PVC de pulgada y media bajo el lavaplatos. Desmonté el ensamble con llave para tubo, limpié impurezas y apliqué soldadura de PVC virgen. Instalé sifón rígido registrable sellando roscas con teflón de alta densidad. Realicé prueba hidrostática llenando a capacidad máxima y descargando a presión continua; verifiqué cero fugas y sellado hermético al 100%, dejando el trabajo garantizado.',
      expectedConcepts: [
        'Prueba hidrostática',
        'Sifón rígido registrable',
        'Teflón de alta densidad',
        'Soldadura líquida PVC',
        'Estanqueidad hermética',
        'Garantía técnica de 30 días'
      ],
      aiScores: { c1: 24, c2: 23, c3: 24, c4: 24, overall: 95 },
      verdictParagraph: 'La IA determinó que la explicación oral denota pericia avanzada conforme a la norma NTC 1500: diagnóstico preciso de la falla, selección de tubería rígida en lugar de flexible (antisedimento), aplicación correcta de cinta sellante y validación rigurosa mediante prueba de presión hidrostática.'
    },
    electricidad: {
      tradeName: 'Electricidad Residencial',
      icon: '⚡',
      norms: 'Reglamento Técnico RETIE y NTC 2050',
      sampleTranscript: 'El cliente presentaba disparo continuo del interruptor termomagnético en la cocina. Con pinza voltiamperimétrica medí consumo de 22 amperios en conductor calibre 14, violando la norma RETIE. Desenergicé y bloqueé el tablero, recableé el circuito con conductor de cobre calibre 12 AWG y sustituí la protección por un breaker de 20A curva C. Verifiqué continuidad en el polo a tierra al barraje equipotencial y comprobé 120 voltios estables bajo carga.',
      expectedConcepts: [
        'Código RETIE / NTC 2050',
        'Conductor calibre 12 AWG',
        'Interruptor termomagnético 20A',
        'Polo a tierra equipotencial',
        'Pinza voltiamperimétrica',
        'Medición de tensión (120V)'
      ],
      aiScores: { c1: 25, c2: 24, c3: 24, c4: 25, overall: 98 },
      verdictParagraph: 'La IA califica el procedimiento con nivel de Maestría Senior según RETIE: identificación de sobrecarga térmica por subdimensionamiento del conductor, sustitución normativa a calibre 12 AWG, conexión de seguridad a tierra y mediciones cuantitativas de amperaje y voltaje.'
    },
    carpinteria: {
      tradeName: 'Carpintería & Muebles',
      icon: '🪵',
      norms: 'Estándares de Ebanistería y Secado de Madera',
      sampleTranscript: 'La puerta principal rozaba contra el marco por dilatación estacional y el ensamble superior presentaba holgura. Desmonté la hoja, cepillé el canto respetando la luz de 3 milímetros perimetral, y reforcé el ensamble a inglete mediante espiga oculta encolada con adhesivo D3 y prensas de escuadra. Lijé en gradación 120 a 220 y apliqué sellador de poliuretano para proteger contra la humedad.',
      expectedConcepts: [
        'Ensamble a inglete con espiga',
        'Luz de dilatación perimetral (3mm)',
        'Adhesivo para madera D3',
        'Prensas de escuadra a 90°',
        'Lijado progresivo (grano 120-220)',
        'Sellador de poliuretano antihumedad'
      ],
      aiScores: { c1: 23, c2: 24, c3: 24, c4: 23, overall: 94 },
      verdictParagraph: 'La IA valida la pericia del maestro en carpintería fina: corrección de dilatación térmica sin desbalancear la escuadra, aplicación de adhesivo resistente y sellado químico para prevenir reincidencia por humedad ambiental.'
    },
    pintura: {
      tradeName: 'Pintura & Acabados',
      icon: '🎨',
      norms: 'NTC 5828 y Preparación de Superficies',
      sampleTranscript: 'El muro de la sala presentaba descascaramiento y microfisuras por humedad previa ya reparada. Rasqueteé la película suelta, apliqué fijador sellador impermeabilizante y nivelé las fisuras con masilla acrílica elástica. Tras curado de 4 horas, realicé lijado fino al ras y apliqué dos manos uniformes de vinilo tipo 1 lavable con rodillo de microfibra, protegiendo zócalos con cinta de enmascarar.',
      expectedConcepts: [
        'Fijador sellador impermeabilizante',
        'Masilla acrílica elástica',
        'Vinilo Tipo 1 lavable',
        'Curado de 4 horas entre capas',
        'Lijado fino al ras',
        'Acabado homogéneo sin traslape'
      ],
      aiScores: { c1: 24, c2: 23, c3: 24, c4: 23, overall: 94 },
      verdictParagraph: 'La IA comprueba excelente dominio técnico: preparación del sustrato previa a la pintura, uso de masilla elastomérica para impedir reaparición de fisuras y aplicación de pintura tipo 1 con tiempos de secado normativos.'
    },
    electrodomesticos: {
      tradeName: 'Electrodomésticos & Neveras',
      icon: '🧊',
      norms: 'Normas de Seguridad en Circuitos Frigoríficos',
      sampleTranscript: 'La nevera no enfriaba en el compartimento inferior y acumulaba escarcha en el evaporador. Con multímetro medí continuidad en la resistencia de deshielo, encontrándola abierta a circuito infinito. Reemplacé la resistencia bimetálica por repuesto original, verifiqué el fusible térmico y probé el flujo de aire del ventilador forzado. El ciclo de defrost automático operó correctamente y la temperatura estabilizó a 4 grados centígrados.',
      expectedConcepts: [
        'Diagnóstico de bimetálico y resistencia',
        'Medición de continuidad en ohmios',
        'Fusible térmico de protección',
        'Ventilador forzado de evaporador',
        'Ciclo de deshielo (defrost) automático',
        'Estabilización térmica (4°C)'
      ],
      aiScores: { c1: 25, c2: 24, c3: 24, c4: 24, overall: 97 },
      verdictParagraph: 'La IA evalúa con honores el diagnóstico frigorífico: medición instrumental de resistencia en lugar de suposiciones, reemplazo con repuestos originales y verificación de ciclo completo de temperatura controlada.'
    },
    cerrajeria: {
      tradeName: 'Cerrajería de Seguridad',
      icon: '🔑',
      norms: 'Estándares de Seguridad Física y Cilindros',
      sampleTranscript: 'La cerradura principal presentaba bloqueo intermitente y desalineación entre el pestillo y la cantonera del marco por asentamiento de la puerta. Desmonté el cilindro de seguridad, limpié las guardas internas aplicando grafito seco micronizado, rebajé y realineé el cerradero metálico en el marco con formón y lima, comprobando un giro suave y dos golpes de llave sin fricción.',
      expectedConcepts: [
        'Cilindro de seguridad europerfil',
        'Lubricación con grafito seco en polvo',
        'Alineación de cantonera en marco',
        'Ajuste de pestillo y resbalón',
        'Cero fricción en giros de llave',
        'Garantía de mecanismo antirobo'
      ],
      aiScores: { c1: 24, c2: 23, c3: 24, c4: 24, overall: 95 },
      verdictParagraph: 'La IA aprueba con distinción la pericia en cerrajería: aplicación de la regla de oro (usar grafito y jamás aceites viscosos que apelmazan las guardas) y ajuste milimétrico del recibidor en marco.'
    },
    albanileria: {
      tradeName: 'Albañilería & Enchapes',
      icon: '🧱',
      norms: 'NSR-10 y Normas de Acabados Cerámicos',
      sampleTranscript: 'Se requería enchapar piso y muro en baño con cerámica de gran formato. Nivelé la base con mortero 1 a 4 con aditivo impermeabilizante, verifiqué pendiente hacia el sifón del 1.5% y apliqué pega flexible con llana dentada de 10mm mediante técnica de doble encolado. Utilicé crucetas autonivelantes de 2mm, emboquillé con fragua antimicótica y comprobé planeidad absoluta con regla de aluminio.',
      expectedConcepts: [
        'Mortero nivelador impermeabilizado',
        'Pendiente hacia sifón del 1.5%',
        'Técnica de doble encolado con llana 10mm',
        'Crucetas autonivelantes',
        'Fragua epóxica / antimicótica',
        'Comprobación de planeidad con regla'
      ],
      aiScores: { c1: 24, c2: 24, c3: 25, c4: 24, overall: 97 },
      verdictParagraph: 'La IA certifica el conocimiento de albañilería moderna: doble encolado para evitar piezas huecas en gran formato, nivelación con pendiente correcta hacia el desagüe y uso de boquilla resistente a la humedad.'
    }
  };

  function initCertificationWizard() {
    const wizardEl = document.querySelector('.cert-wizard-wrapper');
    if (!wizardEl) return;

    window.selectCertificationTrade('plomeria');
  }

  window.selectCertificationTrade = function (tradeKey) {
    selectedCertTradeKey = tradeKey;
    document.querySelectorAll('.trade-picker-card').forEach(card => {
      if (card.getAttribute('data-trade-id') === tradeKey) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const info = TRADE_EXPERT_KNOWLEDGE[tradeKey];
    const lbl = document.getElementById('lblSelectedTrade');
    if (lbl && info) {
      lbl.textContent = info.tradeName;
    }
  };

  window.goToStep = function (stepNumber) {
    currentCertStep = stepNumber;
    
    // Actualizar progreso del stepper
    const progressTrack = document.getElementById('certProgressTrack');
    if (progressTrack) {
      const pct = ((stepNumber - 1) / 3) * 100;
      progressTrack.style.width = `${pct}%`;
    }

    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`stepNode_${i}`);
      const pane = document.getElementById(`certPane_${i}`);
      
      if (node) {
        if (i < stepNumber) {
          node.className = 'cert-step-node completed';
        } else if (i === stepNumber) {
          node.className = 'cert-step-node active';
        } else {
          node.className = 'cert-step-node';
        }
      }

      if (pane) {
        if (i === stepNumber) pane.classList.add('active');
        else pane.classList.remove('active');
      }
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  window.goToStep2_Examen = function () {
    const info = TRADE_EXPERT_KNOWLEDGE[selectedCertTradeKey];
    const bank = TECHNICAL_EXAM_BANK[selectedCertTradeKey] || TECHNICAL_EXAM_BANK['plomeria'];

    const titleEl = document.getElementById('examTradeTitle');
    if (titleEl && info) {
      titleEl.textContent = `Prueba de Diagnóstico: ${info.tradeName}`;
    }

    renderCertificationQuestions(bank.questions);
    goToStep(2);
  };

  function renderCertificationQuestions(questions) {
    const container = document.getElementById('certExamQuestionsContainer');
    if (!container) return;

    certUserAnswers = {};
    container.innerHTML = '';

    questions.forEach((q, qIndex) => {
      const card = document.createElement('div');
      card.className = 'exam-question-card';
      card.id = `certQuestionCard_${qIndex}`;

      let optionsHtml = '';
      q.options.forEach((optText, optIndex) => {
        optionsHtml += `
          <div class="exam-option-item" onclick="chooseCertExamOption(${qIndex}, ${optIndex})" id="certOpt_${qIndex}_${optIndex}">
            <input type="radio" name="cert_q_${qIndex}" class="exam-option-radio" value="${optIndex}">
            <div class="exam-option-text">${optText}</div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="exam-question-header">
          <span class="exam-q-num">Pregunta ${qIndex + 1} de ${questions.length}</span>
          <span class="exam-q-title">${q.title}</span>
        </div>
        <div class="exam-q-scenario">${q.scenario}</div>
        <div class="exam-options-list">
          ${optionsHtml}
        </div>
      `;
      container.appendChild(card);
    });

    const feedbackBlock = document.getElementById('certExamFeedbackBlock');
    if (feedbackBlock) feedbackBlock.style.display = 'none';

    const submitRow = document.getElementById('certExamSubmitRow');
    if (submitRow) submitRow.style.display = 'flex';
  }

  window.chooseCertExamOption = function (qIndex, optIndex) {
    certUserAnswers[qIndex] = optIndex;
    const items = document.querySelectorAll(`[id^="certOpt_${qIndex}_"]`);
    items.forEach((item, idx) => {
      const radio = item.querySelector('input[type="radio"]');
      if (idx === optIndex) {
        item.classList.add('selected');
        if (radio) radio.checked = true;
      } else {
        item.classList.remove('selected');
        if (radio) radio.checked = false;
      }
    });
  };

  window.evaluateTheoreticalExam = function () {
    const bank = TECHNICAL_EXAM_BANK[selectedCertTradeKey] || TECHNICAL_EXAM_BANK['plomeria'];
    const totalQ = bank.questions.length;

    let correctCount = 0;
    bank.questions.forEach((q, idx) => {
      const chosen = certUserAnswers[idx];
      if (chosen === q.correct) {
        correctCount++;
      }
    });

    // Score out of 100
    const calculatedScore = Math.round((correctCount / totalQ) * 100);
    // As per user specification: craftsman advances regardless of score
    certTheoreticalScore = calculatedScore > 0 ? calculatedScore : 75;

    const scoreNumEl = document.getElementById('examScoreNumber');
    if (scoreNumEl) scoreNumEl.textContent = `${certTheoreticalScore}/100`;

    const feedbackBadge = document.getElementById('examFeedbackBadge');
    if (feedbackBadge) {
      if (certTheoreticalScore >= 80) {
        feedbackBadge.textContent = '✓ Excelente Desempeño Teórico';
        feedbackBadge.style.color = 'var(--green-verified)';
        feedbackBadge.style.background = 'var(--green-soft)';
      } else {
        feedbackBadge.textContent = '✓ Evaluación Teórica Registrada';
        feedbackBadge.style.color = 'var(--blue-primary)';
        feedbackBadge.style.background = 'var(--bg-accent-soft)';
      }
    }

    const feedbackBlock = document.getElementById('certExamFeedbackBlock');
    if (feedbackBlock) {
      feedbackBlock.style.display = 'block';
      feedbackBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const submitRow = document.getElementById('certExamSubmitRow');
    if (submitRow) submitRow.style.display = 'none';

    showToast(`✓ Evaluación teórica registrada (${certTheoreticalScore}/100). Continúa con las evidencias prácticas.`, 'success');
  };

  window.goToStep3_Evidencias = function () {
    goToStep(3);
    initPracticalVerificationModule();
  };

  /* --- FLUJO DE EVALUACIÓN Y PERITAJE DE LA INTELIGENCIA ARTIFICIAL --- */
  window.startAiEvaluationFlow = function () {
    const info = TRADE_EXPERT_KNOWLEDGE[selectedCertTradeKey] || TRADE_EXPERT_KNOWLEDGE['plomeria'];

    // Asegurar que exista al menos una foto y audio para procesar
    if (!verificationEvidences[0]?.photo) {
      window.loadSamplePhoto(verificationEvidences[0].id);
    }
    if (!verificationEvidences[0]?.audioDuration) {
      window.loadSampleAudio(verificationEvidences[0].id);
    }

    goToStep(4);

    const scannerBox = document.getElementById('aiScannerBox');
    const verdictContainer = document.getElementById('aiVerdictContainer');
    const step2Label = document.getElementById('aiStep2Label');

    if (scannerBox) scannerBox.style.display = 'block';
    if (verdictContainer) verdictContainer.style.display = 'none';
    if (step2Label) step2Label.textContent = `Comparando con estándares y normas técnicas de ${info.tradeName}...`;

    const stepItems = [
      document.getElementById('aiStep_1'),
      document.getElementById('aiStep_2'),
      document.getElementById('aiStep_3'),
      document.getElementById('aiStep_4')
    ];

    stepItems.forEach(el => el && (el.className = 'ai-scan-step-item'));
    if (stepItems[0]) stepItems[0].className = 'ai-scan-step-item active';

    // Animación de los 4 pasos periciales en tiempo real
    setTimeout(() => {
      if (stepItems[0]) stepItems[0].className = 'ai-scan-step-item done';
      if (stepItems[1]) stepItems[1].className = 'ai-scan-step-item active';
    }, 900);

    setTimeout(() => {
      if (stepItems[1]) stepItems[1].className = 'ai-scan-step-item done';
      if (stepItems[2]) stepItems[2].className = 'ai-scan-step-item active';
    }, 1800);

    setTimeout(() => {
      if (stepItems[2]) stepItems[2].className = 'ai-scan-step-item done';
      if (stepItems[3]) stepItems[3].className = 'ai-scan-step-item active';
    }, 2700);

    setTimeout(() => {
      if (stepItems[3]) stepItems[3].className = 'ai-scan-step-item done';
      completeAiVerdictDisplay(info);
    }, 3500);
  };

  function completeAiVerdictDisplay(info) {
    const scannerBox = document.getElementById('aiScannerBox');
    const verdictContainer = document.getElementById('aiVerdictContainer');

    if (scannerBox) scannerBox.style.display = 'none';
    if (verdictContainer) {
      verdictContainer.style.display = 'block';
      verdictContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Renderizar datos del dictamen pericial
    const transcriptEl = document.getElementById('aiAudioTranscriptText');
    if (transcriptEl) transcriptEl.textContent = `"${info.sampleTranscript}"`;

    const conceptsCloud = document.getElementById('aiConceptsCloud');
    if (conceptsCloud) {
      conceptsCloud.innerHTML = info.expectedConcepts.map(c => `
        <span class="ai-concept-chip">✓ ${c}</span>
      `).join('');
    }

    const c1 = document.getElementById('aiScoreC1');
    const c2 = document.getElementById('aiScoreC2');
    const c3 = document.getElementById('aiScoreC3');
    const c4 = document.getElementById('aiScoreC4');
    const overall = document.getElementById('aiScoreOverallBadge');

    if (c1) c1.textContent = `${info.aiScores.c1}/25`;
    if (c2) c2.textContent = `${info.aiScores.c2}/25`;
    if (c3) c3.textContent = `${info.aiScores.c3}/25`;
    if (c4) c4.textContent = `${info.aiScores.c4}/25`;
    if (overall) overall.textContent = `${info.aiScores.overall} / 100`;

    const verdictP = document.getElementById('aiVerdictParagraph');
    if (verdictP) {
      verdictP.innerHTML = `<strong>Conclusión Pericial Tasksmith IA:</strong> ${info.verdictParagraph}`;
    }

    // Actualizar Certificado Oficial
    const certTradeDisplay = document.getElementById('certTradeNameDisplay');
    if (certTradeDisplay) {
      certTradeDisplay.textContent = `${info.icon} ${info.tradeName}`;
    }

    const certRecipientName = document.getElementById('certRecipientName');
    const craftsmanName = currentUser ? currentUser.name : 'Luis Rodríguez';
    if (certRecipientName) {
      certRecipientName.textContent = craftsmanName;
    }

    const certHash = document.getElementById('certHashId');
    if (certHash) {
      const rnd = Math.floor(1000 + Math.random() * 9000);
      certHash.textContent = `TS-CERT-2026-${info.tradeName.substring(0,2).toUpperCase()}${rnd}`;
    }

    // Actualizar estado del usuario en sesión
    if (!currentUser) {
      currentUser = {
        name: craftsmanName,
        email: 'luis@tasksmith.co',
        phone: '312 456 7890',
        role: 'smith',
        trade: info.tradeName,
        certified: true,
        certifiedTrade: info.tradeName,
        rate: '70000',
        zone: 'Bogotá (Cobertura Integral)',
        portfolio: []
      };
    } else {
      currentUser.certified = true;
      currentUser.certifiedTrade = info.tradeName;
    }

    localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
    updateNavUserSlot();

    showToast(`🏆 ¡Acreditación Aprobada! La IA ha emitido tu Certificado Oficial en ${info.tradeName}.`, 'success');
  }

  window.printCertificate = function () {
    window.print();
  };

  window.restartCertificationWizard = function () {
    window.resetEntireVerification();
    goToStep(1);
    showToast('Inicia una nueva certificación técnica.', 'normal');
  };

})();
