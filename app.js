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
            <span>${currentUser.name.split(' ')[0]} (Maestro)</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="openUserProfileModal()">
            Mi Perfil
          </button>
          <button class="mobile-toggle" aria-label="Abrir menú"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        `;
        if (navActions) navActions.innerHTML = actionHtml;
        if (mobileAuthSlot) {
          mobileAuthSlot.innerHTML = `
            <button class="btn btn-primary full" onclick="openUserProfileModal()">Mi Perfil de Maestro</button>
          `;
        }
      } else {
        const actionHtml = `
          <button class="user-profile-badge" onclick="openUserProfileModal()">
            <span class="user-avatar-dot"></span>
            <span>${currentUser.name.split(' ')[0]}</span>
          </button>
          <button class="btn btn-primary btn-sm" data-open-booking>
            Pedir un Especialista
          </button>
          <button class="mobile-toggle" aria-label="Abrir menú"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        `;
        if (navActions) navActions.innerHTML = actionHtml;
        if (mobileAuthSlot) {
          mobileAuthSlot.innerHTML = `
            <button class="btn btn-ghost full" onclick="openUserProfileModal()" style="margin-bottom:8px;">Mi Perfil (${currentUser.name.split(' ')[0]})</button>
            <button class="btn btn-primary full" data-open-booking>Pedir un Especialista</button>
          `;
        }
      }
    } else {
      const actionHtml = `
        <button class="btn btn-ghost btn-sm" onclick="openLoginModal()" id="btnNavLogin">Ingresar</button>
        <button class="btn btn-primary btn-sm" onclick="openRegisterModal()" id="btnNavRegister">Registro</button>
        <button class="mobile-toggle" aria-label="Abrir menú"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
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
    showToast(' Configuración del perfil de maestro guardada.', 'success');
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
          badgeEl.textContent = ' Examen Técnico Aprobado';
          badgeEl.style.color = 'var(--green-verified)';
        } else {
          badgeEl.className = 'live-badge';
          badgeEl.textContent = 'Certificación Pendiente';
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
    showToast(' Nueva foto añadida a tu portafolio público.', 'success');
  };

  window.logoutUser = function () {
    currentUser = null;
    localStorage.removeItem(STATE_KEY_USER);
    updateNavUserSlot();
    closeAllModals();
    showToast('Has cerrado sesión correctamente.', 'normal');
  };

  /* ================= 3. MODELO 3D (DESACTIVADO TEMPORALMENTE) ================= */
  function initThreeScene() {
    // Desactivado temporalmente
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
        if (playBtn) playBtn.textContent = '';
        if (label) label.textContent = 'Reproduciendo audio de Don Luis (0:14)...';

        interval = setInterval(() => {
          bars.forEach(bar => {
            const h = Math.floor(Math.random() * 18) + 6;
            bar.style.height = `${h}px`;
          });
        }, 120);

        showToast('"Doña Carmen, ya montamos el nuevo codo de cobre con teflón. 100% probado sin fugas."', 'normal');

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
            ${isCorrect ? ' ¡Respuesta Correcta y Fundamentada!' : ' Diagnóstico No Óptimo'}
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
          <div style="font-size: 3.5rem; margin-bottom: 12px;">${passed ? 'Aprobado' : 'Pendiente'}</div>
          <h3 style="font-size: 1.8rem; margin-bottom: 8px;">
            ${passed ? '¡Aprobado con Distinción Técnica!' : 'Examen Completado: Refuerzo Necesario'}
          </h3>
          <p style="font-size: 1.05rem; color: var(--ink-secondary); max-width: 500px; margin: 0 auto 16px;">
            Puntaje obtenido: <strong>${score} de ${total} casos resueltos (${pct}%)</strong> en la especialidad de <em>${bank.tradeName}</em>.
          </p>

          ${passed ? `
            <div class="certificate-stamp">
               SMITH VERIFICADO EN COMPETENCIAS TÉCNICAS
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
    showToast('Sesión iniciada como Don Luis (Maestro Smith). Prueba desbloqueada.', 'success');
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
          fallback.textContent = 'Sensor de cámara listo (Modo captura fotográfica simulada)';
          fallback.style.display = 'block';
        }
        if (video) video.style.display = 'none';
      });
    } else {
      if (fallback) {
        fallback.textContent = 'Sensor de cámara listo (Modo captura fotográfica)';
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
    showToast('Foto capturada desde la cámara y adjuntada a la evidencia.', 'success');
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
      badgePhoto.textContent = ' Foto Cargada';
      badgePhoto.style.color = 'var(--green-verified)';
      badgePhoto.style.background = 'var(--green-soft)';
    }

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
    showToast(` Foto del paso #${getEvidenceIndex(id)} adjuntada correctamente.`, 'success');
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
    const liveTag = document.getElementById(`speechLiveTag_${id}`);
    const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);

    if (!ev.isRecording) {
      // Iniciar grabación
      ev.isRecording = true;
      ev.recordSeconds = 0;
      if (btn) btn.classList.add('recording');
      if (instrEl) instrEl.textContent = 'Grabando explicación... Habla sobre tu trabajo y toca de nuevo para finalizar.';
      if (timerEl) timerEl.textContent = '00:00';
      if (liveTag) {
        liveTag.textContent = 'Escuchando tu voz...';
        liveTag.style.color = 'var(--green-verified)';
      }

      // Reconocimiento de voz real con Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'es-CO';
          recognition.continuous = true;
          recognition.interimResults = true;
          ev.speechRecognition = recognition;

          let initialText = (transcriptInput && transcriptInput.value.trim()) ? transcriptInput.value.trim() + ' ' : '';

          recognition.onresult = (event) => {
            let sessionTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
              sessionTranscript += event.results[i][0].transcript;
            }
            const fullSpoken = (initialText + sessionTranscript).trim();
            ev.realTranscript = fullSpoken;
            if (transcriptInput) {
              transcriptInput.value = fullSpoken;
            }
            if (liveTag) {
              liveTag.textContent = 'Transcribiendo en tiempo real...';
            }
          };

          recognition.onerror = (e) => {
            console.log('Aviso de voz:', e.error);
            if (liveTag) {
              liveTag.textContent = 'Puedes escribir tu explicación técnica';
              liveTag.style.color = 'var(--ink-muted)';
            }
          };

          recognition.start();
        } catch (err) {
          console.log('SpeechRecognition fallback:', err);
        }
      }

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

      showToast(`Grabando audio explicativo del paso #${getEvidenceIndex(id)}...`, 'normal');
    } else {
      // Detener grabación
      ev.isRecording = false;
      if (ev.recordTimerId) {
        clearInterval(ev.recordTimerId);
        ev.recordTimerId = null;
      }
      if (btn) btn.classList.remove('recording');

      if (ev.speechRecognition) {
        try { ev.speechRecognition.stop(); } catch (e) {}
        ev.speechRecognition = null;
      }

      if (liveTag) {
        liveTag.textContent = 'Audio transcrito (editable)';
        liveTag.style.color = 'var(--green-verified)';
      }

      if (ev.mediaRecorder && ev.mediaRecorder.state !== 'inactive') {
        try { ev.mediaRecorder.stop(); } catch (e) {}
      }

      const durSec = Math.max(ev.recordSeconds, 6);
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
      badgeAudio.textContent = ' Audio Grabado';
      badgeAudio.style.color = 'var(--green-verified)';
      badgeAudio.style.background = 'var(--green-soft)';
    }

    if (durText) durText.textContent = durationStr;

    updateEvidenceStepBadge(id);
    updateEvidenceCountUI();
    showToast(` Explicación de audio guardada (${durationStr}) para el paso #${getEvidenceIndex(id)}.`, 'success');
  }

  window.loadSampleAudio = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (ev) {
      ev.usedSampleAudio = true;
      const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);
      if (transcriptInput && !transcriptInput.value.trim()) {
        transcriptInput.value = currentTradeExam ? currentTradeExam.sampleTranscript : 'Diagnóstico inicial de la falla, desmontaje con herramienta técnica, reemplazo de partes y prueba de estanqueidad garantizada.';
        ev.realTranscript = transcriptInput.value;
      }
    }
    finishAudioRecording(id, '0:22');
    showToast(`Audio de muestra cargado para el paso #${getEvidenceIndex(id)}.`, 'success');
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
    const newId = verificationEvidences.length > 0 
      ? Math.max(...verificationEvidences.map(e => e.id)) + 1 
      : 1;

    const newEvidenceObj = {
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
      audioElement: null,
      realTranscript: ''
    };

    verificationEvidences.push(newEvidenceObj);
    const stepNumber = verificationEvidences.length;

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
            &times; Eliminar paso
          </button>
        </div>
      </div>

      <div class="work-evidence-grid">
        <!-- COLUMNA IZQUIERDA: CÁMARA Y FOTO -->
        <div class="evidence-panel">
          <div class="evidence-panel-header">
            <div class="evidence-panel-title">
              <span>Foto del Trabajo</span>
            </div>
            <span class="live-badge" id="badgePhotoStatus_${newId}">Pendiente</span>
          </div>

          <input type="file" id="workPhotoInput_${newId}" accept="image/*" capture="environment" style="display: none;" onchange="handlePhotoInputChange(${newId}, this)">

          <div class="upload-dropzone" id="photoDropzone_${newId}">
            <button type="button" class="btn-open-camera" onclick="openCameraModal(${newId})">
              Abrir Cámara
            </button>
            <span style="font-size: 0.82rem; color: var(--ink-muted); margin: 4px 0;">o selecciona una imagen</span>
            <button type="button" class="btn btn-outline btn-sm" onclick="triggerFileInput(${newId})">
              Elegir Archivo
            </button>
          </div>

          <div class="photo-preview-container" id="photoPreviewContainer_${newId}">
            <img src="" alt="Evidencia capturada" id="photoPreviewImg_${newId}" class="photo-preview-img">
            <div class="photo-preview-actions">
              <span style="font-weight: 600;">Foto de evidencia lista</span>
              <button type="button" class="btn btn-ghost btn-sm" style="color: #fff; padding: 2px 8px;" onclick="resetPhotoUpload(${newId})">Cambiar foto</button>
            </div>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; color: var(--ink-muted);">Para probar rápido:</span>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; padding: 4px 8px;" onclick="loadSamplePhoto(${newId})">
              Foto de ejemplo
            </button>
          </div>
        </div>

        <!-- COLUMNA DERECHA: AUDIO EXPLICATIVO GENERAL -->
        <div class="evidence-panel">
          <div class="evidence-panel-header">
            <div class="evidence-panel-title">
              <span>Audio Explicativo</span>
            </div>
            <span class="live-badge" id="badgeAudioStatus_${newId}">Pendiente</span>
          </div>

          <div class="audio-recorder-box" id="audioRecorderBox_${newId}">
            <button type="button" class="btn-mic-record" id="btnToggleRecord_${newId}" onclick="toggleAudioRecording(${newId})" title="Toca para grabar audio">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
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
              Tu explicación grabada:
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
                Grabar de nuevo
              </button>
            </div>
          </div>

          <!-- Campo de Transcripción Real Editable por el Maestro -->
          <div class="audio-transcript-box-input" style="margin-top: 14px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label for="audioTranscriptInput_${newId}" style="font-size: 0.82rem; font-weight: 700; color: var(--ink-secondary); margin: 0;">
                Transcripción técnica de lo que dijiste:
              </label>
              <span id="speechLiveTag_${newId}" style="font-size: 0.75rem; color: var(--blue-primary); font-weight: 600;">Voz a texto activa</span>
            </div>
            <textarea id="audioTranscriptInput_${newId}" class="form-input" rows="3" placeholder="Al hablar por el micrófono, tus palabras se transcribirán aquí automáticamente. También puedes escribir o ajustar los detalles técnicos de tu labor si tu micrófono no está disponible..." style="font-size: 0.86rem; line-height: 1.45;"></textarea>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; color: var(--ink-muted);">¿Sin micrófono ahora?</span>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; padding: 4px 8px;" onclick="loadSampleAudio(${newId})">
              Audio de ejemplo
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(block);
    initDropzoneForEvidence(newId);
    updateEvidenceCountUI();
    showToast(`Se agregó el Paso #${stepNumber}. Abre la cámara y graba el audio para este paso.`, 'success');

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
    showToast(' Paso eliminado correctamente.', 'normal');
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
      badgeStep.textContent = ' Paso Completo';
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
      tagPhoto.textContent = `Fotos: ${readyPhotos} de ${total} listas`;
      if (readyPhotos > 0) tagPhoto.classList.add('ready');
      else tagPhoto.classList.remove('ready');
    }

    if (tagAudio) {
      tagAudio.textContent = `Audios: ${readyAudios} de ${total} grabados`;
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
      submitBtn.textContent = ` ${verificationEvidences.length} Pasos Evaluados y Certificados`;
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
        <span class="portfolio-item-label">${jobTitle} (${verificationEvidences.length} fotos + audios)</span>
      `;
      grid.prepend(item);
    }

    showToast(`¡Felicidades! Se certificaron ${verificationEvidences.length} evidencias de tu trabajo. Ahora portas el distintivo de Smith Verificado.`, 'success');
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
    showToast(` Solicitud de ${trade} publicada. 3 smiths verificados en ${loc} han sido notificados.`, 'success');
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
    toast.innerHTML = `<span>${type === 'success' ? '' : 'ℹ'}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  };

  /* ================= 8. MOTOR DE INTELIGENCIA ARTIFICIAL Y ASISTENTE DE CERTIFICACIÓN UNIVERSAL ================= */
  let currentCertStep = 1;
  let currentTradeExam = null;
  let certTheoreticalScore = 0;
  let certUserAnswers = {};

  // Perfiles de Conocimiento Experto Curados (Multi-Especialidad)
  const TRADE_EXPERT_PROFILES = {
    plomeria: {
      tradeName: 'Plomería & Redes Hidráulicas',
      icon: '',
      norms: 'NTC 1500 (Código Colombiano de Fontanería)',
      questions: [
        {
          title: 'Diagnóstico de Caída de Presión y Fuga Oculta',
          scenario: 'Un hogar presenta baja de presión repentina en griferías del segundo piso y el medidor registra consumo continuo con llaves cerradas. ¿Cuál es el procedimiento normativo para diagnosticar la falla?',
          options: [
            'Aislar por sectores las válvulas de paso y aplicar prueba de presión hidrostática con bomba de prueba manométrica para ubicar la línea averiada.',
            'Demoler de inmediato los muros del baño principal para buscar humedad a simple vista.',
            'Aumentar la presión de entrada conectando una bomba de sobrepresión directa a la red pública.',
            'Cerrar la llave de paso por las noches y sugerir al cliente convivir con la avería.'
          ],
          correct: 0,
          explanation: 'La NTC 1500 exige sectorización y prueba hidrostática con manómetro para localizar fugas sin generar daños destructivos innecesarios.'
        },
        {
          title: 'Materiales y Normas de Tuberías Hidráulicas',
          scenario: 'Al sustituir un tramo de tubería empotrada para agua caliente sanitaria a 65°C, ¿qué material y unión exige la norma técnica?',
          options: [
            'Tubería de PVC sanitario unido con pegamento tradicional para desagües.',
            'Tubería de Polipropileno Copolímero Random (PPR) unida mediante termofusión a 260°C o CPVC para agua caliente con soldadura química especial.',
            'Manguera flexible de polietileno negro ajustada con abrazaderas metálicas sinfín.',
            'Tubería de hierro galvanizado oxidado recuperada de otra demolición.'
          ],
          correct: 1,
          explanation: 'El agua caliente a 65°C deforma el PVC sanitario. Es obligatorio usar PPR termofusionado o CPVC apto para alta temperatura y presión continua.'
        },
        {
          title: 'Instalación Técnica de Sifones y Desagües',
          scenario: 'En la instalación de un lavaplatos nuevo, ¿cómo se garantiza que no ingresen malos olores ni gases de la red de alcantarillado?',
          options: [
            'Colocando tubo recto directo al bajante sin ningún tipo de curvatura.',
            'Instalando un sifón registrable rígido con sello hidráulico permanente (trampa de agua de mínimo 5 cm) y ventilación secundaria.',
            'Enrollando un tubo flexible en múltiples vueltas sin sello hidráulico fijo.',
            'Sellando la boca del desagüe con silicona sanitaria sin dejar sello de agua.'
          ],
          correct: 1,
          explanation: 'El sello de agua permanente en la trampa del sifón es la única barrera física que impide el retorno de gases mefíticos y vectores sanitarios.'
        },
        {
          title: 'Control de Calidad y Entrega Garantizada',
          scenario: 'Tras realizar una reparación de tubería de distribución principal, ¿qué prueba obligatoria debe superar antes de revocar el muro?',
          options: [
            'Prueba hidrostática a 1.5 veces la presión de trabajo normal durante al menos 15 minutos con cero caída de aguja en el manómetro.',
            'Abrir la llave solo dos segundos y tocar con el dedo si se siente húmedo.',
            'Tapar el hueco de inmediato con yeso rápido antes de abrir el paso general.',
            'Dejar la llave cerrada y cobrar el servicio sin comprobar el flujo.'
          ],
          correct: 0,
          explanation: 'La prueba hidrostática a 1.5x de presión de trabajo garantiza estanqueidad absoluta y previene daños catastróficos posteriores al cierre de obra.'
        }
      ],
      sampleTranscript: 'Detecté fuga activa en el sifón y fisura en codo de PVC de pulgada y media bajo el lavaplatos. Desmonté el ensamble con llave para tubo, limpié impurezas y apliqué soldadura de PVC virgen. Instalé sifón rígido registrable sellando roscas con teflón de alta densidad. Realicé prueba hidrostática llenando a capacidad máxima y descargando a presión continua; verifiqué cero fugas y sellado hermético al 100%, dejando el trabajo garantizado.',
      expectedConcepts: [
        'Prueba hidrostática manométrica',
        'Sifón rígido registrable con sello de agua',
        'Teflón de alta densidad',
        'Soldadura líquida de PVC virgen',
        'Estanqueidad hermética comprobada',
        'Garantía técnica por escrito'
      ],
      aiScores: { c1: 24, c2: 24, c3: 25, c4: 24, overall: 97 },
      verdictParagraph: 'La IA determinó que la explicación oral y las respuestas demuestran pericia avanzada conforme a la norma NTC 1500: diagnóstico preciso de la falla, selección de tubería rígida en lugar de flexible, aplicación correcta de cinta sellante y validación rigurosa mediante prueba de presión hidrostática.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'
    },
    electricidad: {
      tradeName: 'Electricidad Residencial & RETIE',
      icon: '',
      norms: 'Reglamento Técnico RETIE y Código NTC 2050',
      questions: [
        {
          title: 'Diagnóstico de Sobrecarga y Disparo de Protecciones',
          scenario: 'Un circuito de tomacorrientes en la cocina dispara el breaker termomagnético cada vez que se usa el microondas y la freidora de aire simultáneamente. ¿Cuál es el diagnóstico pericial?',
          options: [
            'El consumo combinado excede la capacidad nominal de conducción del cable y la protección actúa por sobrecarga térmica.',
            'El breaker está descompuesto y debe ser reemplazado por uno de 50 amperios sin cambiar el cable.',
            'Hay un cortocircuito a tierra permanente en el enchufe del electrodoméstico.',
            'La tensión de la red pública está invertida entre la fase y el neutro.'
          ],
          correct: 0,
          explanation: 'El disparo térmico protege el conductor contra sobrecalentamiento e incendio cuando la corriente de carga supera el calibre instalado.'
        },
        {
          title: 'Selección Normativa de Conductor y Protección (RETIE)',
          scenario: 'Para alimentar un circuito general de tomas de 20A en una vivienda bajo norma RETIE / NTC 2050, ¿qué especificación técnica debe cumplirse?',
          options: [
            'Conductor de cobre calibre 12 AWG con aislamiento termoplástico THHN/THWN y breaker de 20A curva C.',
            'Cable dúplex de audio calibre 18 amarrado con cinta aislante económica.',
            'Conductor de aluminio calibre 16 sin puesta a tierra.',
            'Alambre de timbre telefónico para ahorrar espacio en la tubería conduit.'
          ],
          correct: 0,
          explanation: 'El RETIE exige calibre mínimo 12 AWG en cobre para circuitos ramales de 20 amperios con aislamiento certificado anti-llama.'
        },
        {
          title: 'Sistema de Puesta a Tierra y Seguridad Humana',
          scenario: '¿Cuál es el rol primordial del electrodo y conductor de puesta a tierra (cable verde o desnudo) en una instalación residencial?',
          options: [
            'Derivar corrientes de falla por contacto indirecto hacia tierra para disparar la protección y evitar la electrocución de personas.',
            'Ahorrar consumo de energía reduciendo la factura mensual de electricidad.',
            'Servir como retorno de corriente en lugar del conductor neutro.',
            'Sostener físicamente las cajas de paso empotradas en los muros.'
          ],
          correct: 0,
          explanation: 'La puesta a tierra equipotencial canaliza corrientes parásitas y fallas de aislamiento hacia el suelo activando las protecciones en milisegundos.'
        },
        {
          title: 'Verificación Instrumental y Protocolo de Entrega',
          scenario: 'Antes de energizar y entregar un tablero de distribución renovado, ¿qué mediciones con multímetro o pinza deben registrarse?',
          options: [
            'Tensión fase-neutro (120V ±5%), tensión fase-tierra (120V), neutro-tierra (<2V) y ausencia de continuidad entre fase y tierra.',
            'Comprobar únicamente que al encender la bombilla haya luz.',
            'Tocar los cables con la mano para verificar si transmiten cosquilleo.',
            'Conectar directamente los cables sin verificar la polaridad.'
          ],
          correct: 0,
          explanation: 'Las mediciones cuantitativas de voltaje y resistencia de aislamiento son obligatorias por el RETIE para certificar la instalación.'
        }
      ],
      sampleTranscript: 'El cliente presentaba disparo continuo del interruptor termomagnético en la cocina. Con pinza voltiamperimétrica medí consumo de 22 amperios en conductor calibre 14, violando la norma RETIE. Desenergicé y bloqueé el tablero, recableé el circuito con conductor de cobre calibre 12 AWG y sustituí la protección por un breaker de 20A curva C. Verifiqué continuidad en el polo a tierra al barraje equipotencial y comprobé 120 voltios estables bajo carga.',
      expectedConcepts: [
        'Código RETIE / NTC 2050',
        'Conductor calibre 12 AWG de cobre',
        'Protección termomagnética calibrada (20A)',
        'Polo a tierra equipotencial verificado',
        'Medición instrumental con pinza y multímetro',
        'Tensión nominal estable (120V)'
      ],
      aiScores: { c1: 25, c2: 24, c3: 24, c4: 25, overall: 98 },
      verdictParagraph: 'La IA califica el procedimiento con nivel de Maestría Senior según RETIE: identificación certera de sobrecarga térmica, recableado normativo a calibre 12 AWG, conexión de seguridad a tierra y mediciones cuantitativas instrumentales bajo carga.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    },
    solar: {
      tradeName: 'Instalación de Energía Solar Fotovoltaica',
      icon: '',
      norms: 'RETIE Cap. 8, IEC 61215 y Código Eléctrico NTC 2050',
      questions: [
        {
          title: 'Diagnóstico de Sombras y Rendimiento en Strings Fotovoltaicos',
          scenario: 'Un arreglo fotovoltaico residencial en string presenta una caída del 40% en su generación en horas de la mañana. ¿Cuál es la causa técnica más probable?',
          options: [
            'Sombreado parcial sobre uno de los módulos que limita la corriente de todo el string conectado en serie debido a la curva I-V.',
            'Los módulos solares generan menos energía porque están sobrecalentados por la luz del amanecer.',
            'El inversor se apaga intencionalmente porque las baterías están en modo de ecualización diurna.',
            'La radiación solar viaja en polaridad invertida en las primeras horas del día.'
          ],
          correct: 0,
          explanation: 'En conexiones en serie (strings), la celda o módulo más ensombrecido actúa como cuello de botella para la corriente de todo el circuito.'
        },
        {
          title: 'Dimensionamiento de Protecciones DC y DPS',
          scenario: 'En el lado de corriente continua (DC) entre los paneles solares y el inversor híbrido, ¿qué elementos de protección son indispensables?',
          options: [
            'Seccionador bajo carga DC, fusibles fotovoltaicos tipo gPV para 1000V y descargador de sobretensiones (DPS) transitorias DC.',
            'Interruptores termomagnéticos convencionales de corriente alterna AC de ferretería común.',
            'Empalmes directos encintados sin fusible ni caja combinadora (combiner box).',
            'Un interruptor de luz simple de pared para cortar la corriente manualmente.'
          ],
          correct: 0,
          explanation: 'La corriente continua genera arcos eléctricos de difícil extinción; exige protecciones homologadas específicamente para DC (gPV) y DPS.'
        },
        {
          title: 'Estructura de Montaje y Sellado de Cubiertas',
          scenario: 'Al anclar la perfilería de aluminio anodizado en una cubierta de teja o losa de concreto, ¿cómo se previene la filtración de agua?',
          options: [
            'Utilizando pernos de acero inoxidable con arandela de caucho EPDM y sellador de poliuretano estructural de alta resistencia UV.',
            'Fijando las patas con clavos de acero común sin empaquetadura ni sellador.',
            'Apoyando los paneles sueltos sobre la cubierta sin atornillar para no perforar el tejado.',
            'Aplicando cemento de contacto escolar alrededor de la perforación.'
          ],
          correct: 0,
          explanation: 'El caucho vulcanizado EPDM y el sellador de poliuretano garantizan estanqueidad frente a lluvias torrenciales y soportan la radiación UV por décadas.'
        },
        {
          title: 'Puesta en Marcha y Verificación de Voc e Isc',
          scenario: 'Antes de conectar los strings a las entradas MPPT del inversor, ¿qué pruebas de control de calidad deben realizarse obligatoriamente?',
          options: [
            'Medir voltaje de circuito abierto (Voc) comprobando polaridad correcta y verificar corriente de cortocircuito (Isc) bajo irradiancia conocida.',
            'Conectar directamente los cables al inversor para ver si echa humo o enciende.',
            'Medir únicamente con la lengua para verificar si hay corriente en las terminales MC4.',
            'Omitir mediciones y encender el sistema sin comprobar aislamiento a tierra.'
          ],
          correct: 0,
          explanation: 'La comprobación previa de Voc y polaridad en conectores MC4 evita la destrucción catastrófica de las etapas MPPT del inversor por polaridad inversa.'
        }
      ],
      sampleTranscript: 'Realicé la instalación de un sistema fotovoltaico de 3.6 kWp con 8 módulos monocristalinos de 450W en cubierta metálica. Anclé la perfilería de aluminio con pernos sellados con arandelas EPDM y poliuretano. Conecté el string con cable solar fotovoltaico de 4mm² con doble aislamiento UV, instalando caja de protecciones DC con fusibles gPV de 15A y DPS tipo 2. Medí un Voc total de 396V en vacío y conecté al inversor híbrido, configurando la inyección cero y comprobando sincronismo estable con la red a 60 Hz.',
      expectedConcepts: [
        'Curva I-V y cálculo de Voc / Isc',
        'Fusibles fotovoltaicos gPV y DPS DC',
        'Cable solar resistente a radiación UV',
        'Anclajes estructurales con sellado EPDM',
        'Inversor MPPT y sincronismo de red',
        'Protocolo RETIE y pruebas de aislamiento'
      ],
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 24, overall: 98 },
      verdictParagraph: 'La IA certifica idoneidad con honores en energía solar: cálculo preciso de series de paneles, uso estricto de protecciones DC homologadas, anclaje estanco en cubierta y mediciones de seguridad antes de la interconexión con la red eléctrica.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
    },
    carpinteria: {
      tradeName: 'Carpintería Fina & Ebanistería',
      icon: '',
      norms: 'Estándares de Ebanistería y Secado de Madera',
      questions: [
        {
          title: 'Diagnóstico de Deformación por Contracción y Humedad',
          scenario: 'Un mueble de madera maciza presenta alabeo en la tapa superior y fisuras en las uniones tras un cambio de temporada. ¿Cuál es el diagnóstico pericial?',
          options: [
            'La madera fue trabajada con contenido de humedad desequilibrado (>14%) y se contrajo tangencialmente al secarse en ambiente interior.',
            'El mueble fue armado con tornillos demasiado cortos para el peso de la madera.',
            'La madera fue atacada de inmediato por polillas invisibles que doblan las fibras.',
            'El pegamento utilizado era demasiado flexible y desalineó las tablas por gravedad.'
          ],
          correct: 0,
          explanation: 'La madera es un material higroscópico. Si no se seca al 8-10% antes del ensamble, los cambios de humedad relativa generan alabeos y tensiones internas.'
        },
        {
          title: 'Técnica de Ensamble y Uniones Estructurales',
          scenario: 'Para ensamblar el marco de una puerta de madera maciza sometida a uso continuo, ¿qué unión garantiza mayor durabilidad mecánica?',
          options: [
            'Ensamble de caja y espiga pasante o espiga ciega encolada con adhesivo D3/D4 bajo prensa.',
            'Unión a tope fijada únicamente con clavos sin cabeza y silicona acrílica.',
            'Pegado simple de canto a canto sin ninguna espiga, tarugo o galleta de refuerzo.',
            'Grapas metálicas de tapicería en las esquinas exteriores.'
          ],
          correct: 0,
          explanation: 'La unión de caja y espiga proporciona gran área de contacto de fibra y resistencia mecánica al torque y a los ciclos de apertura.'
        },
        {
          title: 'Preparación de Superficie y Lijado Progresivo',
          scenario: 'Antes de aplicar acabado con poliuretano o barniz catalizado, ¿cuál es la secuencia correcta de lijado para no rayar la madera?',
          options: [
            'Lijado progresivo en el sentido de la veta con granos 100, 150, 180 y 240, limpiando el polvo residual entre granos.',
            'Lijado transversal en círculos con lija gruesa grano 60 únicamente.',
            'Aplicar el barniz directo sobre la madera en bruto sin lijar para que penetre más.',
            'Usar cepillo de alambre de acero para desgastar la veta rápidamente.'
          ],
          correct: 0,
          explanation: 'El lijado progresivo siguiendo la veta elimina los arañazos del grano anterior y abre el poro de manera uniforme sin dejar marcas visibles bajo la luz.'
        },
        {
          title: 'Protección y Sellado contra la Humedad',
          scenario: 'Al instalar muebles en zonas de baño o cocina, ¿cómo se protegen los cantos inferiores que tocan el suelo?',
          options: [
            'Sellando los cantos con parafina, fondo de poliuretano impermeable y colocando niveladores de nylon para elevar el mueble del piso.',
            'Dejando el aglomerado o madera al corte vivo directamente en contacto con el agua del trapero.',
            'Cubriendo la base con papel adhesivo decorativo sin sellado químico.',
            'Echando pintura de agua común en los cantos sin lijado previo.'
          ],
          correct: 0,
          explanation: 'Los cantos en corte absorben humedad por capilaridad; el sellado hidrófugo y el aislamiento con niveladores evita que el mueble se hinche y deteriore.'
        }
      ],
      sampleTranscript: 'La puerta principal rozaba contra el marco por dilatación estacional y el ensamble superior presentaba holgura. Desmonté la hoja, cepillé el canto respetando la luz de 3 milímetros perimetral, y reforcé el ensamble a inglete mediante espiga oculta encolada con adhesivo D3 y prensas de escuadra. Lijé en gradación 120 a 220 y apliqué sellador de poliuretano para proteger contra la humedad.',
      expectedConcepts: [
        'Ensamble de caja y espiga encolada',
        'Luz de dilatación perimetral (3mm)',
        'Adhesivo para madera D3 resistente a humedad',
        'Prensas de escuadra a 90°',
        'Lijado progresivo siguiendo la veta',
        'Sellador de poliuretano hidrófugo'
      ],
      aiScores: { c1: 24, c2: 24, c3: 25, c4: 24, overall: 97 },
      verdictParagraph: 'La IA valida la pericia del maestro en carpintería fina: corrección de dilatación térmica sin desbalancear la escuadra, aplicación de adhesivo resistente y sellado químico para prevenir reincidencia por humedad ambiental.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    },
    mecanica: {
      tradeName: 'Mecánica Automotriz & Diagnóstico OBD2',
      icon: '',
      norms: 'Estándares SAE, Normas OBD-II y Seguridad de Taller',
      questions: [
        {
          title: 'Diagnóstico Electrónico con Escáner OBD2',
          scenario: 'Un vehículo presenta testigo Check Engine encendido y código de falla P0301 (Fallo de combustión en cilindro 1). ¿Cuál es la ruta metódica de diagnóstico?',
          options: [
            'Intercambiar la bobina del cilindro 1 al 2 y verificar si la falla migra; si migra es la bobina, si no, revisar bujía, pulso de inyector y compresión mecánica.',
            'Desconectar la batería por 10 minutos para borrar la luz y entregar el vehículo al cliente sin revisar.',
            'Reemplazar de inmediato la computadora (ECU) del motor sin realizar ninguna medición previa.',
            'Vaciar el tanque de gasolina y echarle combustible premium sin diagnosticar los componentes.'
          ],
          correct: 0,
          explanation: 'La prueba cruzada de componentes y el análisis de causa raíz evitan gastos innecesarios al cliente y aíslan con certeza la avería eléctrica o mecánica.'
        },
        {
          title: 'Torque Normativo y Sustitución de Componentes Críticos',
          scenario: 'Al sustituir la culata o empaque de motor, ¿qué herramienta de precisión es obligatoria para ajustar los pernos según manual de taller?',
          options: [
            'Torquímetro de zafre calibrado y goniómetro angular respetando la secuencia en espiral y las etapas de apriete del fabricante.',
            'Llave neumática de impacto a máxima potencia hasta que el perno ya no gire.',
            'Alicate de presión con tubo de extensión para hacer palanca con el pie.',
            'Apretado a mano con llave fija hasta que se sienta apretado.'
          ],
          correct: 0,
          explanation: 'El apriete angular y por torque especificado en manual garantiza deformación elástica controlada del perno y asentamiento hermético del empaque sin quebrar el bloque.'
        },
        {
          title: 'Sistema de Frenos y Purga Hidráulica',
          scenario: 'Tras cambiar pastillas y mangueras de freno delanteras, el pedal se va al fondo con tacto esponjoso. ¿Cómo se soluciona técnicamente?',
          options: [
            'Realizar purga completa del líquido de frenos DOT 4 en las 4 ruedas en la secuencia recomendada para expulsar cualquier burbuja de aire.',
            'Ajustar más el freno de mano para compensar la falta de frenado hidráulico.',
            'Agregar aceite de motor en el depósito de frenos para espesar el fluido.',
            'Indicar al cliente que el freno se irá ajustando solo con los kilómetros.'
          ],
          correct: 0,
          explanation: 'El aire es compresible a diferencia del líquido de frenos; una sola microburbuja reduce drásticamente la fuerza de frenado poniendo en riesgo la vida.'
        },
        {
          title: 'Prueba Dinámica de Carretera y Validación Final',
          scenario: 'Finalizada una reparación del tren delantero y suspensión, ¿qué validación obligatoria se debe realizar antes de la entrega?',
          options: [
            'Alineación y balanceo computarizado de las ruedas y prueba de ruta comprobando estabilidad de volante, frenado recto y ausencia de ruidos parásitos.',
            'Lavar el vehículo y no probarlo en movimiento.',
            'Revisar únicamente la presión de aire en las llantas.',
            'Entregar el vehículo sin verificar los pernos de las rótulas ni terminales.'
          ],
          correct: 0,
          explanation: 'La alineación y la prueba dinámica en carretera garantizan que la geometría de la dirección esté dentro de especificación y no desgaste prematuramente los neumáticos.'
        }
      ],
      sampleTranscript: 'El vehículo ingresó con testigo Check Engine encendido y ralentí inestable. Conecté el escáner automotriz OBD2 detectando código P0301. Realicé prueba cruzada de bobinas confirmando que el fallo seguía en el cilindro 1, medí compresión registrando 160 PSI parejo, y al desmontar la bujía encontré electrodo desgastado con resistencia abierta. Cambié el juego de bujías de iridio calibradas a 0.040 pulgadas, limpié el cuerpo de aceleración y reajusté el ralentí, verificando ajuste de combustible en tiempo real a cero error.',
      expectedConcepts: [
        'Diagnóstico con escáner OBD2',
        'Prueba cruzada de componentes y pulso',
        'Medición de compresión en PSI',
        'Bujías calibradas a especificación',
        'Torquímetro para ajuste normativo',
        'Prueba de ruta y lectura de datos en vivo'
      ],
      aiScores: { c1: 25, c2: 25, c3: 24, c4: 25, overall: 99 },
      verdictParagraph: 'La IA evalúa con distinción la pericia en mecánica automotriz: secuencia diagnóstica deductiva impecable, medición instrumental de compresión y uso de parámetros en vivo para validar la reparación.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
    },
    refrigeracion: {
      tradeName: 'Refrigeración & Aires Acondicionados HVAC',
      icon: '',
      norms: 'Normas ASHRAE 15 y Manejo Seguro de Gases Refrigerantes',
      questions: [
        {
          title: 'Protocolo de Vacío y Deshidratación del Sistema',
          scenario: 'Al instalar una unidad minisplit de aire acondicionado con refrigerante ecológico R410A / R32, ¿cuál es el procedimiento normativo para el vacío?',
          options: [
            'Conectar bomba de vacío de dos etapas con vacuómetro digital y descender a menos de 500 micrones, comprobando estanqueidad durante 15 minutos.',
            'Hacer una purga rápida abriendo la válvula de gas para barrer el aire por la otra toma.',
            'Omitir la bomba de vacío y encender el equipo directamente con el aire atmosférico adentro.',
            'Conectar un compresor de aire común para empujar el aire atrapado.'
          ],
          correct: 0,
          explanation: 'La humedad atmosférica combinada con aceite POE forma ácidos que destruyen el bobinado del compresor; los 500 micrones garantizan evaporación total del agua.'
        },
        {
          title: 'Detección de Fugas y Presurización con Nitrógeno',
          scenario: 'Para ubicar una microfuga en un serpentín evaporador de climatización, ¿qué gas debe utilizarse para presurizar el circuito de forma segura?',
          options: [
            'Nitrógeno seco (OFN) regulado a presión de prueba (150 a 300 PSI según fabricante) y agua jabonosa o detector electrónico.',
            'Oxígeno puro a alta presión.',
            'Gas propano para detectar la fuga encendiendo fuego cerca.',
            'Aire comprimido húmedo de estación de gasolina.'
          ],
          correct: 0,
          explanation: 'El nitrógeno seco es un gas inerte, seco y seguro. El oxígeno puro reacciona explosivamente con el aceite de refrigeración y está terminantemente prohibido.'
        },
        {
          title: 'Carga de Refrigerante por Masa (Báscula Digital)',
          scenario: 'Al reponer la carga completa de gas refrigerante en un equipo que perdió todo el fluido, ¿cómo se dosifica la cantidad exacta?',
          options: [
            'Pesando el refrigerante en fase líquida con báscula digital de precisión conforme a los gramos indicados en la placa técnica del fabricante.',
            'Cargando a ojo hasta que el tubo grueso se sienta frío con la mano.',
            'Vaciando la botella completa sin importar el tamaño del equipo.',
            'Midiendo solo la presión manométrica sin considerar la temperatura ambiente ni el subenfriamiento.'
          ],
          correct: 0,
          explanation: 'Los refrigerantes modernos son mezclas que deben cargarse en fase líquida pesada exactamente en gramos para no desbalancear la capacidad ni quemar el compresor.'
        },
        {
          title: 'Control de Calidad: Salto Térmico y Sobrecalentamiento',
          scenario: 'Para certificar el correcto funcionamiento de un aire acondicionado en modo frío, ¿qué delta térmico (°ΔT) debe existir entre el retorno y la inyección?',
          options: [
            'Un salto térmico de entre 10°C y 14°C (18°F a 24°F) con sobrecalentamiento y subenfriamiento dentro de los rangos de la tabla del fabricante.',
            'Una diferencia menor a 2°C indicando que el aire casi no enfría.',
            'El aire debe salir caliente para indicar que el compresor está trabajando al máximo.',
            'No se mide ninguna temperatura, solo se verifica que sople viento.'
          ],
          correct: 0,
          explanation: 'Un delta térmico entre 10°C y 14°C en aire de retorno vs inyección valida la transferencia de calor óptima y la eficiencia energética del equipo.'
        }
      ],
      sampleTranscript: 'Atendí servicio de aire acondicionado minisplit que no enfriaba. Localicé fuga en la pestaña abocardada de la tubería de un cuarto de pulgada. Corté el tramo dañado, realicé nuevo abocardado a 45 grados y ajusté con torquímetro al par del fabricante. Presuricé con nitrógeno seco a 350 PSI confirmando estanqueidad. Bajé el vacío a 380 micrones manteniéndolo estable, y cargué 850 gramos exactos de R410A con báscula digital, verificando un salto térmico de 12 grados centígrados y drenaje fluido del condensado.',
      expectedConcepts: [
        'Vacío profundo con vacuómetro (<500 micrones)',
        'Presurización con nitrógeno seco (OFN)',
        'Carga en fase líquida con báscula digital',
        'Abocardado a 45° con torque calibrado',
        'Salto térmico verificado (12°C)',
        'Manejo seguro de gases refrigerantes'
      ],
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA evalúa con maestría pericial el diagnóstico frigorífico: respeto absoluto del vacío profundo para proteger el aceite POE, carga volumétrica pesada en báscula y medición rigurosa del salto térmico.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80'
    },
    soldadura: {
      tradeName: 'Soldadura TIG / MIG de Alta Precisión',
      icon: '',
      norms: 'Código AWS D1.1 (Structural Welding) y Normas ASME Sección IX',
      questions: [
        {
          title: 'Preparación de Bisel y Limpieza de Metal Base',
          scenario: 'Al preparar una junta a tope en placa de acero estructural de 10mm para soldadura con penetración completa, ¿cuál es el paso previo esencial?',
          options: [
            'Biselar a 60° con talón de 1.5mm y limpiar la zona con amoladora hasta metal blanco eliminando óxido, grasa y cascarilla.',
            'Soldar directamente sobre la chapa oxidada y pintada para ahorrar tiempo de preparación.',
            'Dejar una separación de 20 milímetros entre piezas sin bisel.',
            'Rellenar la unión con masilla antes de aplicar el arco.'
          ],
          correct: 0,
          explanation: 'La presencia de óxido, humedad o cascarilla genera porosidades internas, inclusiones de escoria y falta de fusión que debilitan la soldadura.'
        },
        {
          title: 'Protección Gaseosa y Selección de Parámetros TIG/MIG',
          scenario: 'Para soldar acero inoxidable austenítico con proceso GTAW (TIG), ¿qué gas de protección y tipo de corriente deben seleccionarse?',
          options: [
            'Gas Argón 100% de alta pureza con corriente continua y polaridad directa (DCEN) y electrodo de tungsteno al 2% cerio o torio afilado en punta.',
            'Gas acetileno inflamable con corriente alterna de alto voltaje.',
            'Dióxido de carbono (CO2) puro con polaridad inversa.',
            'Soldar sin gas protector al aire libre expuesto al viento.'
          ],
          correct: 0,
          explanation: 'El argón puro protege el baño fundido de la oxidación atmosférica y la polaridad DCEN concentra el 70% del calor en la pieza garantizando fusión limpia.'
        },
        {
          title: 'Control de Aporte Térmico y Secuencia de Pasadas',
          scenario: 'Para evitar la distorsión angular y la fragilización por sobrecalentamiento en estructuras soldadas, ¿qué técnica aplica un maestro soldador?',
          options: [
            'Controlar el aporte térmico mediante pasadas osciladas controladas, mantener la temperatura entre pasadas y soldar en secuencia de paso de peregrino.',
            'Quedarse inmóvil con el arco encendido en el mismo punto durante 5 minutos para calentar todo el metal.',
            'Enfriar el cordón inmediatamente echándole un balde de agua fría.',
            'Aplicar el máximo amperaje de la máquina en una sola pasada descontrolada.'
          ],
          correct: 0,
          explanation: 'El enfriamiento brusco con agua templa el acero volviéndolo quebradizo; la secuencia escalonada distribuye las tensiones residuales evitando deformaciones.'
        },
        {
          title: 'Inspección Visual y Ensayos No Destructivos (END)',
          scenario: '¿Qué criterios determinan que un cordón de soldadura cumple los estándares de calidad de la norma AWS D1.1?',
          options: [
            'Cordón homogéneo sin poros visibles, ausencia de socavaciones marginales, penetración completa en la raíz y sobreespesor conforme a tolerancia.',
            'Cordón lleno de poros negros y salpicaduras abundantes por toda la chapa.',
            'Presencia de fisuras longitudinales en el centro del cordón.',
            'Falta de fusión evidente donde el metal de aporte quedó pegado sin fundir la base.'
          ],
          correct: 0,
          explanation: 'La norma AWS D1.1 establece límites milimétricos estrictos para discontinuidades superficiales e internas garantizando la integridad estructural bajo cargas dinámicas.'
        }
      ],
      sampleTranscript: 'Realicé la unión estructural de tubería de acero al carbono cédula 40 mediante proceso combinado TIG en raíz y pase de presentación. Biselé a 60 grados con talón de un milímetro y separación uniforme. Purgué el interior de la tubería con gas argón para evitar la oxidación interna. Apliqué el pase de raíz con varilla ER70S-6 a 85 amperios asegurando penetración total con refuerzo interno positivo. Completé los pases de relleno y peinado con cordones uniformes y sin socavación, superando la inspección visual con galga y prueba de líquidos penetrantes.',
      expectedConcepts: [
        'Código AWS D1.1 / ASME IX',
        'Preparación de bisel a 60° y talón',
        'Gas argón de purga y protección',
        'Penetración de raíz completa',
        'Control de aporte térmico sin socavaciones',
        'Inspección con galga y líquidos penetrantes'
      ],
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA certifica maestría en soldadura de alta exigencia: purga interna con gas inerte para evitar la oxidación en la raíz, control de parámetros de amperaje y acabado visual homologado bajo normas AWS.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    },
    cerrajeria: {
      tradeName: 'Cerrajería Digital & Alta Seguridad',
      icon: '',
      norms: 'Normas de Seguridad Física UNE-EN 1303 y Cerraduras Electrónicas',
      questions: [
        {
          title: 'Diagnóstico de Ataques de Vulnerabilidad Física (Bumping y Ganzuado)',
          scenario: 'Un cliente solicita blindar la puerta principal de su vivienda frente a intrusiones silenciosas. ¿Qué tecnología de cilindro es la requerida?',
          options: [
            'Cilindro de seguridad de perfil europeo con certificación antibumping, antiganzúa, barra de acero antitaladro y pines telescópicos.',
            'Cerradura de pomo simple con llave de serreta tradicional fácil de forzar.',
            'Un candado de hierro colgado de un cáncamo de madera.',
            'Retirar la cerradura y colocar un pestillo de resorte sin llave.'
          ],
          correct: 0,
          explanation: 'Los cilindros certificados bajo norma europea cuentan con trampas internas, rotores acerados y pines de doble línea que impiden la apertura por bumping y taladrado.'
        },
        {
          title: 'Lubricación y Mantenimiento Técnico de Guardas',
          scenario: 'Al lubricar los componentes mecánicos de un cilindro de seguridad que gira con dureza, ¿qué producto debe utilizarse exclusivamente?',
          options: [
            'Polvo de grafito seco micronizado o lubricante sintético seco de teflón que no atraiga polvo.',
            'Aceite de motor usado o grasa espesa de automoción.',
            'Aceite comestible de cocina que se oxida y se vuelve pegajoso.',
            'Agua con detergente para enjuagar las guardas.'
          ],
          correct: 0,
          explanation: 'Los aceites viscosos apelmazan el polvo atmosférico dentro del cilindro bloqueando las guardas y resortes. La regla de oro es usar siempre grafito seco en polvo.'
        },
        {
          title: 'Alineación de Cerradero y Cantonera en Marco',
          scenario: 'Por asentamiento de la puerta, los cerrojos de una cerradura de seguridad frotan con fuerza contra el cerradero del marco impidiendo girar la llave suavemente. ¿Cómo se calibra?',
          options: [
            'Alinear y embutir la cantonera metálica en el marco respetando la holgura con formón y lima para que los pasadores entren holgados sin roce.',
            'Forzar la llave con un alicate hasta romperla dentro del cilindro.',
            'Limar los pernos de seguridad de la cerradura debilitando su grosor.',
            'Dejar la puerta sin cerrar con pasadores.'
          ],
          correct: 0,
          explanation: 'La cerradura debe cerrar suavemente con dos golpes de llave sin que el usuario deba empujar o levantar la hoja de la puerta.'
        },
        {
          title: 'Instalación de Cerraduras Electrónicas y Biométrica',
          scenario: 'Al instalar una cerradura digital inteligente con huella y teclado en puerta exterior, ¿qué factor crítico de seguridad no debe omitirse?',
          options: [
            'Verificar la resistencia a la intemperie (grado IP), la llave mecánica de emergencia de alta seguridad y el puerto de alimentación externa para batería agotada.',
            'Desechar la llave física de respaldo y dejar que el cliente dependa solo de las pilas.',
            'Conectar la cerradura directamente a la red de 110V sin transformador ni fusible.',
            'Dejar la contraseña de fábrica (1234) sin cambiar por el usuario.'
          ],
          correct: 0,
          explanation: 'Las cerraduras electrónicas deben contar obligatoriamente con redundancia mecánica de emergencia para garantizar acceso seguro en caso de fallo de batería.'
        }
      ],
      sampleTranscript: 'La cerradura principal presentaba bloqueo intermitente y desalineación entre el pestillo y la cantonera del marco por asentamiento de la puerta. Desmonté el cilindro de seguridad, limpié las guardas internas aplicando grafito seco micronizado, rebajé y realineé el cerradero metálico en el marco con formón y lima, comprobando un giro suave y dos golpes de llave sin fricción.',
      expectedConcepts: [
        'Cilindro de seguridad europerfil antibumping',
        'Lubricación con polvo de grafito micronizado',
        'Alineación milimétrica de cantonera en marco',
        'Ajuste de pestillo y resbalón sin fricción',
        'Redundancia de seguridad mecánica',
        'Garantía formal de seguridad antirrobo'
      ],
      aiScores: { c1: 24, c2: 25, c3: 24, c4: 25, overall: 98 },
      verdictParagraph: 'La IA aprueba con honores la pericia en cerrajería: aplicación de la regla de oro de la disciplina (grafito seco y jamás aceites apelmazantes) y alineación de precisión en marco para evitar torque excesivo.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    },
    barismo: {
      tradeName: 'Barismo Profesional & Café de Especialidad',
      icon: '',
      norms: 'Estándares SCA (Specialty Coffee Association)',
      questions: [
        {
          title: 'Calibración de Molienda y Ratio de Extracción Espresso',
          scenario: 'Un espresso preparado con 18g de café en el portafiltro extrae 60g de bebida en 14 segundos, resultando en una taza agria y con crema pálida. ¿Cuál es el diagnóstico pericial?',
          options: [
            'Subextracción severa por molienda demasiado gruesa o canalización del flujo; se debe ajustar el molino a una granulometría más fina para alcanzar ratio 1:2 en 25-30 segundos.',
            'Sobreextracción extrema por quemar el café con agua fría.',
            'El café es demasiado fino y tapó la ducha de la máquina.',
            'Se debe agregar azúcar antes de la extracción para espesar la crema.'
          ],
          correct: 0,
          explanation: 'El flujo rápido en 14 segundos arrastra solo los ácidos de alta solubilidad dejando atrás los azúcares y notas dulces que equilibran el espresso conforme al protocolo SCA.'
        },
        {
          title: 'Química del Agua y Temperatura de Extracción',
          scenario: 'Bajo los estándares de la SCA para café de especialidad, ¿qué parámetros de agua y temperatura garantizan la solubilidad ideal?',
          options: [
            'Agua filtrada con TDS de 75 a 150 ppm, dureza balanceada y temperatura de caldera controlada entre 90°C y 94°C.',
            'Agua destilada pura con 0 ppm de minerales a 70°C.',
            'Agua de mar salada sin filtrar para realzar el cuerpo del café.',
            'Agua hirviendo a 105°C para quemar los aceites del grano.'
          ],
          correct: 0,
          explanation: 'El agua necesita iones de calcio y magnesio para disolver los compuestos aromáticos del café; el agua destilada extrae una bebida plana y astringente.'
        },
        {
          title: 'Técnica de Emulsión y Texturizado de Leche (Microespuma)',
          scenario: 'Al vaporizar leche para un cappuccino o latte art, ¿cuál es la técnica para obtener microespuma sedosa sin burbujas visibles?',
          options: [
            'Posicionar la lanceta justo bajo la superficie para inyectar aire suave hasta 37°C y luego sumergirla generando un vórtice hasta alcanzar 60-65°C.',
            'Dejar la lanceta en el fondo de la jarra sin moverla hasta que hierva a 90°C.',
            'Batir la leche fría con una cuchara de plástico y verterla directamente.',
            'Inyectar vapor a máxima potencia en la superficie hasta formar grandes burbujas secas de jabón.'
          ],
          correct: 0,
          explanation: 'El vórtice rompe las burbujas integrándolas con las proteínas de la leche, logrando una textura elástica y dulce a 65°C antes de desnaturalizar la lactosa.'
        },
        {
          title: 'Limpieza y Desengrasado del Grupo Espresso',
          scenario: 'Al finalizar el turno en barra, ¿qué protocolo de mantenimiento previene la contaminación por sabores rancios en la taza?',
          options: [
            'Retrolavado (backflush) con filtro ciego y detergente especializado para remover aceites oxidados de la válvula de tres vías, ducha y dispersor.',
            'Enjuagar el portafiltro únicamente con agua de grifo sin limpiar las duchas internas.',
            'Dejar la borra de café dentro del grupo hasta el día siguiente.',
            'Aplicar cloro concentrado dentro del calderín de agua.'
          ],
          correct: 0,
          explanation: 'Los aceites del café se oxidan con el calor en horas adquiriendo sabor a quemado rancio; el retrolavado químico diario preserva la pureza sensorial del grano.'
        }
      ],
      sampleTranscript: 'Calibré la barra para un café colombiano de origen Nariño proceso lavado con tueste medio. Ajusté el molino micrométrico para una dosis de 18.5 gramos en canasta de precisión, nivelé con distribuidor y apliqué compactado uniforme a 15 kilos de presión. En la máquina a 93 grados y 9 bares de presión obtuve una extracción de 37 gramos en 27 segundos con crema avellanada elástica y notas cítricas balanceadas. Texturicé leche a 62 grados logrando microespuma sedosa y realicé retrolavado del grupo con filtro ciego al cierre.',
      expectedConcepts: [
        'Estándares SCA de extracción',
        'Dosis, rendimiento (ratio 1:2) y tiempo (27s)',
        'Calibración micrométrica de molienda',
        'Temperatura de agua controlada (93°C)',
        'Texturizado de leche con microespuma (62°C)',
        'Mantenimiento con retrolavado y filtro ciego'
      ],
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA certifica maestría en barismo profesional: control exhaustivo de variables de extracción según SCA, química del agua y emulsión de leche a temperatura de dulzor natural.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
    },
    drones: {
      tradeName: 'Mantenimiento y Calibración de Drones',
      icon: '',
      norms: 'Regulaciones Aeronáuticas RAC 100 y Estándares de Aviónica UAV',
      questions: [
        {
          title: 'Calibración de Sensores Inerciales (IMU y Brújula Magnetométrica)',
          scenario: 'Un dron multirotor presenta deriva lateral inesperada (drift) y comportamiento errático en modo GPS. ¿Cuál es el procedimiento técnico pericial?',
          options: [
            'Calibrar la IMU en una superficie perfectamente nivelada a temperatura ambiente y calibrar la brújula en campo abierto lejos de estructuras metálicas y hormigón armado.',
            'Acelerar a fondo los motores con las manos para forzar el enderezamiento.',
            'Ponerle una piedra de contrapeso en el brazo con deriva.',
            'Desactivar los satélites GPS y volar a ciegas cerca de cables de alta tensión.'
          ],
          correct: 0,
          explanation: 'El hormigón armado contiene varillas de acero que distorsionan el campo magnético local alterando la calibración de la brújula y provocando pérdida de control en vuelo.'
        },
        {
          title: 'Diagnóstico de Baterías LiPo y Seguridad de Carga',
          scenario: 'Al inspeccionar una batería LiPo 4S de 14.8V, una celda marca 3.1V mientras las otras tres marcan 4.15V y presenta leve hinchamiento. ¿Cuál es la acción técnica?',
          options: [
            'Dar de baja la batería de inmediato descargándola a 0V en salmuera para reciclaje seguro, ya que la celda desbalanceada presenta riesgo inminente de ignición térmica.',
            'Pinchar la celda hinchada con un alfiler para sacarle el gas y seguir volando.',
            'Cargarla a 5 veces su amperaje nominal para forzar la celda dañada.',
            'Envolverla en cinta aislante y usarla en vuelos de larga distancia.'
          ],
          correct: 0,
          explanation: 'Una celda LiPo con caída inferior a 3.2V y degradación química con hinchamiento sufre descomposición interna irreversible con alto riesgo de fuego espontáneo.'
        },
        {
          title: 'Balanceo de Hélices y Control de Vibraciones',
          scenario: '¿Por qué es indispensable balancear dinámicamente las palas de las hélices antes de instalar en motores brushless?',
          options: [
            'Para eliminar vibraciones de alta frecuencia que saturan los giroscopios de la controladora de vuelo y degradan la nitidez de la cámara del gimbal.',
            'Para que el dron haga más ruido durante el despegue.',
            'Para cambiar el color del plástico de las palas.',
            'No es necesario balancear las hélices porque los motores giran despacio.'
          ],
          correct: 0,
          explanation: 'Las vibraciones mecánicas son leídas como aceleraciones falsas por la controladora, provocando sobrecalentamiento de motores y pérdida de estabilidad.'
        },
        {
          title: 'Configuración de Fail-Safe y Pruebas Previas al Despegue',
          scenario: 'En la lista de chequeo (pre-flight checklist), ¿qué parámetro de seguridad fail-safe debe ser verificado antes de armar los motores?',
          options: [
            'Fijación del punto de retorno a casa (RTH / Home Point) con más de 12 satélites bloqueados y altitud de RTH configurada por encima de los obstáculos circundantes.',
            'Desconectar la antena del radiocontrol para ver si el dron se queda quieto.',
            'Volar sin verificar el estado de la memoria SD ni el enlace de telemetría.',
            'Armar los motores con personas a menos de un metro de las hélices.'
          ],
          correct: 0,
          explanation: 'Si el dron pierde el enlace de radio con el piloto, el sistema Fail-Safe RTH sube automáticamente a la altura segura programada y regresa autónomamente al despegue.'
        }
      ],
      sampleTranscript: 'Realicé el mantenimiento preventivo y calibración general de un dron cuadricóptero tras 100 horas de vuelo. Desmonté los 4 motores brushless limpiando rodamientos y verificando holgura milimétrica. Reemplacé las hélices desbalanceadas por repuestos originales de fibra de carbono. En banco de calibración ejecuté calibración de la IMU en 6 ejes a nivel cero absoluto y calibración de brújula en exterior. Configuré el Fail-Safe de regreso a casa a 45 metros sobre el terreno y verifiqué telemetría con 18 satélites y enlace de radio al 100%.',
      expectedConcepts: [
        'Regulaciones aeronáuticas UAV RAC 100',
        'Calibración de IMU en 6 ejes y brújula',
        'Gestión y seguridad de baterías LiPo',
        'Balanceo dinámico de hélices y motores brushless',
        'Configuración de Fail-Safe y Home Point RTH',
        'Checklist pre-vuelo y telemetría de enlace'
      ],
      aiScores: { c1: 25, c2: 25, c3: 24, c4: 25, overall: 99 },
      verdictParagraph: 'La IA dictamina competencia de élite en aviónica y mantenimiento de drones: riguroso protocolo de calibración inercial, gestión de baterías químicas y priorización de la seguridad operacional en vuelo.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
    },
    panaderia: {
      tradeName: 'Panadería Artesanal & Masas Madre',
      icon: '',
      norms: 'BPM (Buenas Prácticas de Manufactura) y Fermentación Biológica',
      questions: [
        {
          title: 'Control de Fermentación y Actividad de Masa Madre',
          scenario: 'Al elaborar pan con masa madre 100% natural, ¿cómo se determina que el fermento está en su punto óptimo para el amasado?',
          options: [
            'Ha triplicado su volumen tras el refresco, presenta estructura esponjosa de panal, aroma dulce-afrutado y supera la prueba de flotabilidad en agua.',
            'Huele a vinagre puro y se ha desinflado completamente en el fondo del frasco.',
            'Está congelada en bloque de hielo sin ninguna burbuja de gas carbónico.',
            'Se debe mezclar con levadura química en polvo antes de que fermente.'
          ],
          correct: 0,
          explanation: 'La masa madre en su punto pico de maduración concentra levaduras salvajes y bacterias ácido-lácticas en equilibrio para dar volumen y acidez controlada.'
        },
        {
          title: 'Desarrollo de Red de Gluten y Prueba de la Membrana',
          scenario: 'Durante el amasado de una masa con 75% de hidratación, ¿cómo se comprueba que el gluten ha alcanzado su elasticidad máxima?',
          options: [
            'Estirando una porción suavemente entre los dedos hasta formar una película traslúcida que no se rompe (prueba de la membrana o ventana de gluten).',
            'La masa se rompe en pedazos secos y agrietados al menor intento de estirado.',
            'Debe quedar líquida como sopa para que sea esponjosa.',
            'Amasando con batidora a máxima velocidad hasta quemar la masa por fricción térmica.'
          ],
          correct: 0,
          explanation: 'La red viscoelástica de gluten bien desarrollada retiene el dióxido de carbono producido en la fermentación generando alveolos abiertos y miga ligera.'
        },
        {
          title: 'Fermentación en Bloque y Retardo en Frío',
          scenario: '¿Por qué los maestros panaderos aplican una fermentación prolongada en frío a 4°C durante 16 a 24 horas?',
          options: [
            'Para ralentizar las levaduras y permitir que las bacterias lácticas degraden fitatos, faciliten la digestibilidad del trigo y desarrollen complejos perfiles de sabor y aroma.',
            'Para que la masa no fermente nunca y quede dura como una piedra.',
            'Porque el panadero se fue a dormir y olvidó el horno encendido.',
            'Para congelar la masa y evitar que tome volumen.'
          ],
          correct: 0,
          explanation: 'El retardo en frío frena la producción rápida de gas permitiendo la fermentación enzimática secundaria que otorga corteza caramelizada y alta digestibilidad.'
        },
        {
          title: 'Horneado con Inyección de Vapor y Formación de Greña',
          scenario: '¿Cuál es el rol del vapor de agua durante los primeros 10-15 minutos de horneado en un pan artesanal?',
          options: [
            'Mantener la corteza flexible permitiendo que el pan expanda al máximo (salto de horno) y gelatinizar los almidones para lograr una corteza crujiente y brillante.',
            'Enfriar el horno para que el pan tarde el doble de tiempo en cocinarse.',
            'Humedecer la miga para que quede cruda y pegajosa en el centro.',
            'Evitar que la cuchilla corte el pan antes de meterlo.'
          ],
          correct: 0,
          explanation: 'El vapor evita la formación prematura de una costra rígida, permitiendo que los gases se expandan abriendo la greña con volumen espectacular y brillo dorado.'
        }
      ],
      sampleTranscript: 'Elaboré hogazas de pan de campo con harina de trigo de alta fuerza al 75% de hidratación y 20% de masa madre activa al pico. Apliqué autólisis de 45 minutos para hidratar las proteínas, incorporé sal marina y desarrollé la malla de gluten con amasado francés y pliegues espaciados. Realicé fermentación en bloque de 3 horas y retardo en banetones a 4 grados durante 18 horas. Horneé a 240 grados con inyección de vapor inicial sobre piedra refractaria, logrando greña abierta y corteza crujiente con alveolo abierto.',
      expectedConcepts: [
        'Masa madre natural y prueba de flotabilidad',
        'Hidratación al 75% y autólisis',
        'Prueba de la ventana de gluten (membrana)',
        'Fermentación en frío prolongada a 4°C',
        'Corte de greña con cuchilla (lame)',
        'Horneado con vapor sobre piedra refractaria'
      ],
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA otorga calificación de Maestría Artesanal en panadería: dominio de la microbiología de la masa madre, desarrollo viscoelástico de la proteína y control del horno a vapor.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    }
  };

  // Motor Generador Universal de Pruebas Periciales con IA (Para CUALQUIER tema u oficio)
  function getOrGenerateAiTradeExam(tradeQuery) {
    const raw = (tradeQuery || '').trim();
    if (!raw) return TRADE_EXPERT_PROFILES['plomeria'];

    const norm = raw.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // 1. Coincidencias temáticas por palabras clave
    if (norm.includes('solar') || norm.includes('fotovolt') || norm.includes('panel')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.solar));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('plom') || norm.includes('agua') || norm.includes('fuga') || norm.includes('tub') || norm.includes('fontan')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.plomeria));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('electr') || norm.includes('retie') || norm.includes('luz') || norm.includes('cable') || norm.includes('breaker')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.electricidad));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('carpint') || norm.includes('mader') || norm.includes('muebl') || norm.includes('ebanist')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.carpinteria));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('mecanic') || norm.includes('auto') || norm.includes('carro') || norm.includes('motor') || norm.includes('vehic')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.mecanica));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('refrig') || norm.includes('aire') || norm.includes('clima') || norm.includes('hvac') || norm.includes('acondic')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.refrigeracion));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('soldad') || norm.includes('tig') || norm.includes('mig') || norm.includes('metalm')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.soldadura));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('cerraj') || norm.includes('chapa') || norm.includes('cerradur') || norm.includes('llav')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.cerrajeria));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('baris') || norm.includes('cafe') || norm.includes('espresso')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.barismo));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('dron') || norm.includes('uav') || norm.includes('vuelo') || norm.includes('robot')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.drones));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }
    if (norm.includes('panad') || norm.includes('masa') || norm.includes('pan') || norm.includes('repost') || norm.includes('pasteler')) {
      const p = JSON.parse(JSON.stringify(TRADE_EXPERT_PROFILES.panaderia));
      p.tradeName = formatTradeTitle(raw);
      return p;
    }

    // 2. GENERADOR UNIVERSAL SEMÁNTICO DE IA (Para cualquier otro oficio o tema libre)
    const cleanTitle = formatTradeTitle(raw);
    const inferredIcon = pickIconForTrade(cleanTitle);
    const inferredNorm = `Estándares Técnicos Internacionales y Protocolos de Seguridad en ${cleanTitle}`;

    return {
      tradeName: cleanTitle,
      icon: inferredIcon,
      norms: inferredNorm,
      questions: [
        {
          title: `Diagnóstico Inicial y Detección de Causa Raíz en ${cleanTitle}`,
          scenario: `Un cliente solicita una intervención técnica especializada en ${cleanTitle} por un fallo de funcionamiento o requerimiento crítico. ¿Cuál es el protocolo pericial que distingue a un profesional en ${cleanTitle}?`,
          options: [
            `Efectuar una inspección inicial exhaustiva con instrumental y mediciones técnicas, aislando la causa raíz del fallo antes de intervenir componentes.`,
            `Iniciar el desensamble o aplicación de inmediato sin registrar mediciones previas ni verificar el estado base.`,
            `Aplicar una solución temporal sin determinar el origen del problema esperando a ver si vuelve a fallar.`,
            `Delegar la evaluación en el cliente sin comprobar las especificaciones técnicas ni tolerancias del fabricante.`
          ],
          correct: 0,
          explanation: `En ${cleanTitle}, la norma exige diagnosticar la causa raíz de manera sistemática para evitar reparaciones fallidas y sobrecostos.`
        },
        {
          title: `Materiales Homologados, Herramientas de Precisión y Seguridad en ${cleanTitle}`,
          scenario: `Para ejecutar labores en ${cleanTitle} con garantía de durabilidad y resguardo de la salud ocupacional, ¿qué criterio debe regir la selección de herramientas y consumibles?`,
          options: [
            `Utilizar equipos de protección individual (EPI) normativos, herramientas calibradas para ${cleanTitle} y materiales con ficha técnica certificada.`,
            `Improvisar con herramientas genéricas desgastadas para abaratar el costo de la mano de obra.`,
            `Omitir los elementos de bioseguridad y protección si la labor aparenta ser rápida o de poca envergadura.`,
            `Utilizar insumos vencidos o de especificación inferior a la requerida por el manual técnico.`
          ],
          correct: 0,
          explanation: `El cumplimiento de los estándares de seguridad y el uso de herramientas calibradas son indispensables para garantizar idoneidad en ${cleanTitle}.`
        },
        {
          title: `Procedimiento Técnico Paso a Paso y Buenas Prácticas en ${cleanTitle}`,
          scenario: `Durante la fase de ejecución técnica en ${cleanTitle}, ¿cuál es la secuencia metodológica obligatoria que avala la pericia del especialista?`,
          options: [
            `Seguir una secuencia metódica: preparación adecuada de la base, ejecución con tolerancias exactas, ensamble limpio y control constante de calidad.`,
            `Acelerar el procedimiento forzando uniones o tolerancias mecánicas fuera del rango permitido.`,
            `Saltarse los pasos de preparación preliminar y limpieza para finalizar antes de tiempo.`,
            `Alterar el orden lógico del procedimiento e improvisar conexiones o mezclas sin sustento normativo.`
          ],
          correct: 0,
          explanation: `La destreza técnica en ${cleanTitle} se fundamenta en el respeto estricto de los pasos secuenciales y el cuidado de las tolerancias críticas.`
        },
        {
          title: `Control de Calidad, Pruebas Operativas y Política de Garantía en ${cleanTitle}`,
          scenario: `Al concluir la labor técnica en ${cleanTitle}, ¿cómo se certifica formalmente la calidad del servicio antes de entregar al cliente?`,
          options: [
            `Realizar pruebas de funcionamiento bajo condiciones reales de servicio, verificar cero desviaciones o anomalías y emitir constancia con garantía escrita.`,
            `Cobrar el servicio y retirarse del lugar sin encender ni probar la labor realizada.`,
            `Indicar al cliente que pruebe el trabajo por su cuenta en los próximos días sin dejar ningún respaldo.`,
            `Disimular posibles imperfecciones o ruidos anormales sin corregir el ajuste de precisión.`
          ],
          correct: 0,
          explanation: `La prueba de carga y la entrega de garantía escrita son el sello de calidad innegociable de la red oficial de especialistas Tasksmith.`
        }
      ],
      sampleTranscript: `Para esta labor especializada en ${cleanTitle}, inicié con una inspección técnica completa determinando con precisión la causa raíz del requerimiento. Utilicé herramientas especializadas y consumibles certificados según la norma aplicable. Ejecuté el procedimiento paso a paso cuidando las tolerancias y la seguridad, realicé pruebas de funcionamiento bajo condiciones reales de carga y entregué el trabajo con satisfacción total y garantía formal de 30 días.`,
      expectedConcepts: [
        'Diagnóstico de causa raíz metódico',
        `Herramientas especializadas para ${cleanTitle}`,
        `Normativa técnica y protocolos en ${cleanTitle}`,
        'Procedimiento secuencial de precisión',
        'Pruebas de funcionamiento y carga real',
        'Garantía formal de entrega de 30 días'
      ],
      aiScores: { c1: 24, c2: 24, c3: 25, c4: 24, overall: 97 },
      verdictParagraph: `La IA certifica idoneidad pericial en ${cleanTitle}: el especialista demostró solvencia técnica en diagnóstico, selección adecuada de herramientas y materiales, procedimiento de ejecución ordenado y validación de calidad antes de entrega.`,
      samplePhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    };
  }

  function formatTradeTitle(str) {
    if (!str) return 'Especialidad Técnica';
    return str.split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  function pickIconForTrade(title) { return ''; }

  /* --- INICIALIZADOR DEL ASISTENTE DE CERTIFICACIÓN --- */
  function initCertificationWizard() {
    const wizardEl = document.querySelector('.cert-wizard-wrapper');
    if (!wizardEl) return;

    // Foco en el campo de entrada abierta
    const input = document.getElementById('customTradeInput');
    if (input) {
      setTimeout(() => input.focus(), 300);
    }
  }

  window.applyQuickTradeSuggestion = function (tradeName) {
    const input = document.getElementById('customTradeInput');
    if (input) {
      input.value = tradeName;
    }
    window.startCustomTradeCertification();
  };

  window.startCustomTradeCertification = function () {
    const input = document.getElementById('customTradeInput');
    const tradeQuery = input ? input.value.trim() : '';

    if (!tradeQuery) {
      showToast('Por favor escribe en qué oficio o especialidad deseas certificarte.', 'normal');
      if (input) input.focus();
      return;
    }

    const loaderBox = document.getElementById('aiGeneratingExamState');
    const loaderTitle = document.getElementById('aiGeneratingTradeTitle');
    const submitBtn = document.getElementById('btnPrepareCustomExam');

    if (loaderTitle) {
      loaderTitle.textContent = `La IA está preparando el formulario técnico para: "${tradeQuery}"...`;
    }
    if (loaderBox) loaderBox.style.display = 'flex';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }

    // Simulación de formulación inteligente con IA
    setTimeout(() => {
      currentTradeExam = getOrGenerateAiTradeExam(tradeQuery);

      if (loaderBox) loaderBox.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }

      // Configurar y renderizar Paso 2 (Examen formulado)
      const titleEl = document.getElementById('examTradeTitle');
      const subtitleEl = document.getElementById('examTradeSubtitle');

      if (titleEl) {
        titleEl.textContent = `Prueba Pericial Formulada por IA: ${currentTradeExam.tradeName}`;
      }
      if (subtitleEl) {
        subtitleEl.textContent = `Responde los siguientes 4 casos reales calibrados bajo ${currentTradeExam.norms}.`;
      }

      renderCertificationQuestions(currentTradeExam.questions);
      goToStep(2);

      showToast(` La IA ha preparado tu examen diagnóstico en ${currentTradeExam.tradeName}.`, 'success');
    }, 650);
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
          <span class="exam-q-num">Caso #${qIndex + 1} de ${questions.length}</span>
          <span class="exam-q-title">${q.title}</span>
        </div>
        <div class="exam-q-scenario">${q.scenario}</div>
        <div class="exam-options-list">
          ${optionsHtml}
        </div>
        <div id="certExplanation_${qIndex}" style="display: none; margin-top: 14px; padding: 12px 16px; border-radius: var(--radius-md); background: var(--bg-card-subtle); border-left: 3px solid var(--green-verified); font-size: 0.86rem; color: var(--ink-secondary);">
          <strong>Criterio Técnico:</strong> ${q.explanation}
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
    if (!currentTradeExam) {
      currentTradeExam = getOrGenerateAiTradeExam('Plomería & Redes Hidráulicas');
    }
    const questions = currentTradeExam.questions;
    const totalQ = questions.length;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosen = certUserAnswers[idx];
      const explanationBlock = document.getElementById(`certExplanation_${idx}`);
      if (explanationBlock) explanationBlock.style.display = 'block';

      if (chosen === q.correct) {
        correctCount++;
        const chosenEl = document.getElementById(`certOpt_${idx}_${chosen}`);
        if (chosenEl) {
          chosenEl.style.borderColor = 'var(--green-verified)';
          chosenEl.style.background = 'var(--green-soft)';
        }
      } else {
        const correctEl = document.getElementById(`certOpt_${idx}_${q.correct}`);
        if (correctEl) {
          correctEl.style.borderColor = 'var(--green-verified)';
          correctEl.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3)';
        }
      }
    });

    // Calificación honesta y real (cada pregunta = 25%)
    certTheoreticalScore = Math.round((correctCount / totalQ) * 100);

    const scoreNumEl = document.getElementById('examScoreNumber');
    if (scoreNumEl) scoreNumEl.textContent = `${certTheoreticalScore}/100`;

    const feedbackBadge = document.getElementById('examFeedbackBadge');
    const verdictTitle = document.getElementById('examVerdictTitle');
    const verdictDesc = document.getElementById('examVerdictDescription');

    const passedTheoretical = (certTheoreticalScore >= 75);

    if (feedbackBadge) {
      if (passedTheoretical) {
        feedbackBadge.textContent = `Evaluación Teórica Aprobada (${certTheoreticalScore}/100)`;
        feedbackBadge.style.color = 'var(--green-verified)';
        feedbackBadge.style.background = 'var(--green-soft)';
      } else {
        feedbackBadge.textContent = `Evaluación Teórica Insuficiente (${certTheoreticalScore}/100)`;
        feedbackBadge.style.color = '#dc2626';
        feedbackBadge.style.background = '#fee2e2';
      }
    }

    if (verdictTitle) {
      verdictTitle.textContent = passedTheoretical
        ? '¡Conocimientos Teóricos Aprobados!'
        : 'Puntaje Teórico Insuficiente (Mínimo Requerido: 75/100)';
    }

    if (verdictDesc) {
      if (passedTheoretical) {
        verdictDesc.innerHTML = `Has respondido acertadamente <strong>${correctCount} de ${totalQ}</strong> casos de peritaje en <strong>${currentTradeExam.tradeName}</strong> (${certTheoreticalScore}/100). Recuerda que para emitir el certificado oficial es indispensable superar también la <strong>prueba práctica audiovisual</strong>. Ahora pasarás a capturar las fotos con tu cámara y grabar la explicación técnica con tu voz.`;
      } else {
        verdictDesc.innerHTML = `Has respondido correctamente <strong>${correctCount} de ${totalQ}</strong> casos (${certTheoreticalScore}/100). <strong>En Tasksmith el certificado sólo se otorga si se aprueba tanto la prueba de preguntas como la prueba práctica (mínimo 75/100 en cada una)</strong>. Puedes corregir tus respuestas ahora o avanzar a las evidencias prácticas si deseas completar el proceso antes de la evaluación final.`;
      }
    }

    const feedbackBlock = document.getElementById('certExamFeedbackBlock');
    if (feedbackBlock) {
      feedbackBlock.style.display = 'block';
      feedbackBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const submitRow = document.getElementById('certExamSubmitRow');
    if (submitRow) submitRow.style.display = 'none';

    if (passedTheoretical) {
      showToast(`Examen teórico aprobado (${certTheoreticalScore}/100). Continúa con las evidencias prácticas.`, 'success');
    } else {
      showToast(`Puntaje teórico insuficiente (${certTheoreticalScore}/100). Se requiere mínimo 75/100 para certificar.`, 'normal');
    }
  };

  window.goToStep3_Evidencias = function () {
    goToStep(3);
    initPracticalVerificationModule();

    // Adaptar títulos del paso 3 a la especialidad
    if (currentTradeExam) {
      const jobInput = document.getElementById('certJobTitle');
      if (jobInput) {
        jobInput.value = `Diagnóstico técnico, reparación y puesta a punto en ${currentTradeExam.tradeName}`;
      }
    }
  };

  /* --- FLUJO DE EVALUACIÓN Y PERITAJE DE LA INTELIGENCIA ARTIFICIAL --- */
  window.startAiEvaluationFlow = function () {
    if (!currentTradeExam) {
      currentTradeExam = getOrGenerateAiTradeExam('Plomería & Redes Hidráulicas');
    }
    const info = currentTradeExam;

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
    }, 850);

    setTimeout(() => {
      if (stepItems[1]) stepItems[1].className = 'ai-scan-step-item done';
      if (stepItems[2]) stepItems[2].className = 'ai-scan-step-item active';
    }, 1700);

    setTimeout(() => {
      if (stepItems[2]) stepItems[2].className = 'ai-scan-step-item done';
      if (stepItems[3]) stepItems[3].className = 'ai-scan-step-item active';
    }, 2550);

    setTimeout(() => {
      if (stepItems[3]) stepItems[3].className = 'ai-scan-step-item done';
      completeAiVerdictDisplay(info);
    }, 3400);
  };

  function completeAiVerdictDisplay(info) {
    const scannerBox = document.getElementById('aiScannerBox');
    const verdictContainer = document.getElementById('aiVerdictContainer');

    if (scannerBox) scannerBox.style.display = 'none';
    if (verdictContainer) {
      verdictContainer.style.display = 'block';
      verdictContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 1. Extraer transcripción técnica REAL provista o grabada por el maestro
    const collectedUserTranscripts = verificationEvidences.map(ev => {
      const inputEl = document.getElementById(`audioTranscriptInput_${ev.id}`);
      const userText = (inputEl ? inputEl.value.trim() : '') || (ev.realTranscript ? ev.realTranscript.trim() : '');
      return userText;
    }).filter(Boolean);

    let displayedTranscript = '';
    let hasSubstantiveExplanation = false;

    if (collectedUserTranscripts.length > 0) {
      displayedTranscript = collectedUserTranscripts.join(' // ');
      hasSubstantiveExplanation = displayedTranscript.length >= 25;
    } else if (verificationEvidences.some(ev => ev.usedSampleAudio)) {
      displayedTranscript = info.sampleTranscript;
      hasSubstantiveExplanation = true;
    } else {
      displayedTranscript = 'No se registró explicación técnica oral ni notas del procedimiento en el audio proporcionado.';
      hasSubstantiveExplanation = false;
    }

    const transcriptEl = document.getElementById('aiAudioTranscriptText');
    if (transcriptEl) {
      transcriptEl.textContent = `"${displayedTranscript}"`;
    }

    // 2. Evaluar Prueba Práctica (Fotos y Explicación Oral/Técnica)
    const readyPhotos = verificationEvidences.filter(e => !!e.photo).length;
    const readyAudios = verificationEvidences.filter(e => !!e.audioDuration).length;
    const totalEvidences = Math.max(verificationEvidences.length, 1);

    // Puntaje fotográfico: hasta 45 pts
    const photoRatio = readyPhotos / totalEvidences;
    const photoScore = Math.round(photoRatio * 45);

    // Puntaje de audio/explicación técnica: hasta 55 pts
    let audioScore = 0;
    if (hasSubstantiveExplanation) {
      const audioRatio = readyAudios / totalEvidences;
      audioScore += Math.round(audioRatio * 40);
      if (displayedTranscript.length > 60) audioScore += 10;
      else audioScore += 5;
    } else if (readyAudios > 0) {
      audioScore = 15; // grabó audio pero sin contenido técnico audible/transcrito
    }

    const practicalScore = Math.min(100, photoScore + audioScore);

    // Criterios desglosados para la matriz pericial
    const c1Score = Math.min(25, Math.round((practicalScore / 100) * 25));
    const c2Score = Math.min(25, Math.round((practicalScore / 100) * 24));
    const c3Score = Math.min(25, Math.round((practicalScore / 100) * 25));
    const c4Score = Math.max(0, practicalScore - (c1Score + c2Score + c3Score));

    const c1 = document.getElementById('aiScoreC1');
    const c2 = document.getElementById('aiScoreC2');
    const c3 = document.getElementById('aiScoreC3');
    const c4 = document.getElementById('aiScoreC4');
    const overall = document.getElementById('aiScoreOverallBadge');

    if (c1) c1.textContent = `${c1Score}/25`;
    if (c2) c2.textContent = `${c2Score}/25`;
    if (c3) c3.textContent = `${c3Score}/25`;
    if (c4) c4.textContent = `${c4Score}/25`;
    if (overall) {
      overall.textContent = `${practicalScore} / 100`;
      overall.style.color = practicalScore >= 75 ? 'var(--green-verified)' : '#dc2626';
    }

    // Conceptos identificados
    const conceptsCloud = document.getElementById('aiConceptsCloud');
    if (conceptsCloud) {
      let matchedConcepts = info.expectedConcepts.filter(c => {
        const words = c.toLowerCase().split(/\s+/);
        return words.some(w => w.length > 4 && displayedTranscript.toLowerCase().includes(w));
      });
      if (matchedConcepts.length === 0) {
        matchedConcepts = hasSubstantiveExplanation ? info.expectedConcepts.slice(0, 4) : ['Inspección pericial realizada'];
      }
      conceptsCloud.innerHTML = matchedConcepts.map(c => `
        <span class="ai-concept-chip">${c}</span>
      `).join('');
    }

    // 3. VALIDACIÓN ESTRICTA DE DOBLE CONDICIÓN
    // El certificado sólo se otorga si se logra un resultado bueno (>= 75) tanto en preguntas como en práctica
    const passedTheoretical = (certTheoreticalScore >= 75);
    const passedPractical = (practicalScore >= 75);
    const certApproved = passedTheoretical && passedPractical;

    const certWrapper = document.getElementById('printableCertificate');
    const failedCard = document.getElementById('aiEvaluationFailedCard');
    const postActions = document.getElementById('certPostActions');
    const statusBadge = document.getElementById('aiVerdictStatusBadge');
    const verdictP = document.getElementById('aiVerdictParagraph');

    if (certApproved) {
      // AMBAS PRUEBAS APROBADAS -> EMITIR CERTIFICADO
      if (statusBadge) {
        statusBadge.textContent = 'Evaluación Aprobada: Doble Idoneidad Demostrada (Teórica y Práctica)';
        statusBadge.style.color = 'var(--green-verified)';
        statusBadge.style.background = 'var(--green-soft)';
      }
      if (verdictP) {
        verdictP.innerHTML = `<strong>Conclusión del Peritaje IA:</strong> El especialista demostró competencia sobresaliente en la prueba teórica (${certTheoreticalScore}/100) y acreditó idoneidad práctica rigurosa en sus evidencias de obra (${practicalScore}/100). Cumple con la totalidad de los estándares exigidos para certificación oficial.`;
      }

      if (failedCard) failedCard.style.display = 'none';
      if (certWrapper) certWrapper.style.display = 'block';
      if (postActions) postActions.style.display = 'flex';

      // Actualizar datos del diploma
      const certTradeDisplay = document.getElementById('certTradeNameDisplay');
      if (certTradeDisplay) certTradeDisplay.textContent = info.tradeName;

      const certRecipientName = document.getElementById('certRecipientName');
      const craftsmanName = currentUser ? currentUser.name : 'Luis Rodríguez';
      if (certRecipientName) certRecipientName.textContent = craftsmanName;

      const certHash = document.getElementById('certHashId');
      if (certHash) {
        const codePrefix = info.tradeName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const rnd = Math.floor(1000 + Math.random() * 9000);
        certHash.textContent = `TS-CERT-2026-${codePrefix}${rnd}`;
      }

      // Otorgar credencial oficial en perfil
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
        currentUser.trade = info.tradeName;
      }

      localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
      updateNavUserSlot();
      showToast(`¡Acreditación Aprobada! Has superado la prueba teórica (${certTheoreticalScore}/100) y la práctica (${practicalScore}/100). Certificado emitido.`, 'success');

    } else {
      // AL MENOS UNA PRUEBA NO CUMPLE EL ESTÁNDAR -> NO EMITIR CERTIFICADO
      if (statusBadge) {
        statusBadge.textContent = 'Certificación No Otorgada: Criterios Insuficientes';
        statusBadge.style.color = '#dc2626';
        statusBadge.style.background = '#fee2e2';
      }

      let reasons = [];
      if (!passedTheoretical) reasons.push(`prueba teórica insuficiente (${certTheoreticalScore}/100, mínimo 75)`);
      if (!passedPractical) reasons.push(`evidencia práctica insuficiente (${practicalScore}/100, mínimo 75)`);

      if (verdictP) {
        verdictP.innerHTML = `<strong>Dictamen Pericial IA:</strong> No es posible otorgar la certificación oficial debido a: <strong>${reasons.join(' y ')}</strong>. En Tasksmith se exige demostrar idoneidad técnica plena en ambos campos para proteger a los hogares y respaldar la garantía oficial.`;
      }

      // Ocultar certificado y botones de emisión
      if (certWrapper) certWrapper.style.display = 'none';
      if (postActions) postActions.style.display = 'none';

      // Mostrar tarjeta explicativa de falla
      if (failedCard) {
        failedCard.style.display = 'block';

        const failedTheoScore = document.getElementById('failedTheoreticalScore');
        const failedTheoBadge = document.getElementById('failedTheoreticalBadge');
        const failedTheoMsg = document.getElementById('failedTheoreticalMsg');

        if (failedTheoScore) failedTheoScore.textContent = `${certTheoreticalScore}/100`;
        if (failedTheoBadge) {
          failedTheoBadge.textContent = passedTheoretical ? 'Aprobada (>= 75)' : 'Insuficiente (< 75)';
          failedTheoBadge.style.color = passedTheoretical ? 'var(--green-verified)' : '#dc2626';
          failedTheoBadge.style.background = passedTheoretical ? 'var(--green-soft)' : '#fee2e2';
        }
        if (failedTheoMsg) {
          failedTheoMsg.textContent = passedTheoretical
            ? 'Superaste satisfactoriamente este componente.'
            : `Puntaje obtenido: ${certTheoreticalScore}/100. Se requiere responder correctamente al menos 3 de los 4 casos técnicos.`;
        }

        const failedPractScore = document.getElementById('failedPracticalScore');
        const failedPractBadge = document.getElementById('failedPracticalBadge');
        const failedPractMsg = document.getElementById('failedPracticalMsg');

        if (failedPractScore) failedPractScore.textContent = `${practicalScore}/100`;
        if (failedPractBadge) {
          failedPractBadge.textContent = passedPractical ? 'Aprobada (>= 75)' : 'Insuficiente (< 75)';
          failedPractBadge.style.color = passedPractical ? 'var(--green-verified)' : '#dc2626';
          failedPractBadge.style.background = passedPractical ? 'var(--green-soft)' : '#fee2e2';
        }
        if (failedPractMsg) {
          failedPractMsg.textContent = passedPractical
            ? 'Superaste satisfactoriamente las evidencias prácticas.'
            : 'Faltan fotografías claras de obra o explicación de voz/transcripción con los materiales y pruebas ejecutadas.';
        }
      }

      // Asegurar que el usuario no quede certificado con esta evaluación fallida
      if (currentUser) {
        currentUser.certified = false;
        localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
        updateNavUserSlot();
      }

      showToast(`Evaluación completada: No se otorgó el certificado. Se requiere mínimo 75/100 en ambas pruebas.`, 'normal');
    }
  }

  window.printCertificate = function () {
    window.print();
  };

  window.restartCertificationWizard = function () {
    window.resetEntireVerification();
    goToStep(1);
    const input = document.getElementById('customTradeInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    showToast('Inicia una nueva certificación técnica con cualquier oficio.', 'normal');
  };

})();
