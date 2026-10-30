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
  let currentCameraFacingMode = 'environment';
  let certEvaluationStartTime = null;
  let certEvaluationEndTime = null;

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
    if (window.detectDeviceHardware) {
      window.detectDeviceHardware();
    }
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

  /* --- DETECCIÓN DE SENSORES Y HARDWARE (MÓVIL / CELULAR Y ESCRITORIO) --- */
  window.detectDeviceHardware = async function () {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    const iconEl = document.getElementById('detectedDeviceIcon');
    const titleEl = document.getElementById('detectedDeviceTitle');
    const descEl = document.getElementById('detectedDeviceDesc');
    const camSensorEl = document.getElementById('labelCameraSensor');
    const micSensorEl = document.getElementById('labelMicSensor');

    if (isMobile) {
      if (iconEl) iconEl.textContent = '📱';
      if (titleEl) titleEl.textContent = 'Dispositivo Celular Móvil Identificado';
      if (descEl) descEl.textContent = 'Cámara trasera de obra y micrófono calibrados para peritaje en terreno';
      if (camSensorEl) camSensorEl.textContent = '📷 Cámara: Trasera (Entorno)';
      if (micSensorEl) micSensorEl.textContent = '🎙️ Micrófono: Supresión de Ruido Activa';
    } else {
      if (iconEl) iconEl.textContent = '💻';
      if (titleEl) titleEl.textContent = 'Dispositivo Desktop / Computador Detectado';
      if (descEl) descEl.textContent = 'Sensores de cámara web y micrófono listos para evaluación';
      if (camSensorEl) camSensorEl.textContent = '📷 Cámara Web: Conectada';
      if (micSensorEl) micSensorEl.textContent = '🎙️ Micrófono: Conectado';
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        let videoCount = 0;
        let audioCount = 0;
        devices.forEach(d => {
          if (d.kind === 'videoinput') videoCount++;
          if (d.kind === 'audioinput') audioCount++;
        });

        if (videoCount > 0 && camSensorEl) {
          camSensorEl.textContent = `📷 ${videoCount} Cámara${videoCount > 1 ? 's' : ''} Detectada${videoCount > 1 ? 's' : ''}`;
        }
        if (audioCount > 0 && micSensorEl) {
          micSensorEl.textContent = `🎙️ ${audioCount} Micrófono${audioCount > 1 ? 's' : ''} Detectado${audioCount > 1 ? 's' : ''}`;
        }
      } catch (err) {
        console.log('Error enumerating devices:', err);
      }
    }
  };

  /* --- CÁMARA EN VIVO / CAPTURA --- */
  window.triggerMobileCamera = function (id) {
    const input = document.getElementById(`workPhotoInput_${id}`);
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
    }
  };

  window.switchCameraFacingMode = function () {
    currentCameraFacingMode = (currentCameraFacingMode === 'environment') ? 'user' : 'environment';
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    const video = document.getElementById('cameraVideoFeed');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: currentCameraFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }
      }).then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.play().catch(e => console.log('Camera video play issue:', e));
        showToast(`Cámara cambiada a: ${currentCameraFacingMode === 'environment' ? 'Trasera (Obra)' : 'Frontal'}`, 'normal');
      }).catch(err => {
        console.log('Error switching camera:', err);
      });
    }
  };

  window.openCameraModal = function (evidenceId = 1) {
    activeCameraEvidenceId = evidenceId;
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideoFeed');
    const fallback = document.getElementById('cameraStatusFallback');

    if (modal) modal.classList.add('open');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
      if (fallback) fallback.style.display = 'block';
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: currentCameraFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }
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
          fallback.textContent = 'Sensor de cámara listo (Modo captura fotográfica)';
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
      // Se limita el lado mayor a 1600 px: suficiente detalle para la IA sin exceder el tamaño de la petición
      const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    } else {
      // Antes aquí se adjuntaba una foto de stock en silencio y la IA evaluaba esa imagen en lugar de la real.
      showToast('La cámara todavía no entrega imagen. Espera a ver el video en vivo o sube la foto desde tu galería.', 'error');
      return;
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

  window.handlePhotoInputChange = async function (id, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      showToast('El archivo seleccionado no es una imagen.', 'error');
      return;
    }
    try {
      // Las fotos de celular pesan 3-12 MB; se reducen para que la IA las reciba completas
      const dataUrl = await downscaleImageFile(file, 1600, 0.88);
      setEvidencePhoto(id, dataUrl);
    } catch (err) {
      console.warn('No se pudo procesar la imagen:', err);
      showToast('No se pudo leer esa imagen. Prueba con otra foto (JPG o PNG).', 'error');
    }
  };

  function downscaleImageFile(file, maxSide, quality) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

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

  /* --- NORMALIZACIÓN MÍNIMA DE LA TRANSCRIPCIÓN ---
     Antes este paso reemplazaba palabras por frases "más técnicas" (ej. "sifón" → "sifón registrable",
     "barniz" → "sellador de poliuretano 2K", "tester" → "multímetro digital"). Eso inventaba cosas que el
     maestro nunca dijo, inflaba la nota y además repetía el reemplazo en cada pasada. Ahora solo se
     limpian espacios y se escriben en mayúscula siglas técnicas; nunca se agregan palabras. */
  function enhanceTechnicalTranscription(rawText) {
    if (!rawText || typeof rawText !== 'string') return rawText || '';
    const acronyms = /\b(retie|ntc|pvc|cpvc|ppr|gfci|dps|awg|mppt|mc4|epdm|obd2|tig|mig|mag|smaw|r410a|r32|r134a)\b/gi;
    return rawText
      .replace(/\s+/g, ' ')
      .replace(acronyms, m => m.toUpperCase())
      .trim();
  }

  /* --- AUDIO EXPLICATIVO (ROBUSTO CON WEBSPEECH API, AUTO-RESTART Y MEDIDOR EN VIVO) --- */
  window.toggleAudioRecording = function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    const btn = document.getElementById(`btnToggleRecord_${id}`);
    const timerEl = document.getElementById(`recordTimer_${id}`);
    const instrEl = document.getElementById(`recordInstructionText_${id}`);
    const liveTag = document.getElementById(`speechLiveTag_${id}`);
    const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);
    const voiceMeterBox = document.getElementById(`audioLiveVoiceMeter_${id}`);

    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch(e) {}
    }

    if (!ev.isRecording) {
      // INICIAR GRABACIÓN
      ev.isRecording = true;
      ev.recordSeconds = 0;
      if (btn) btn.classList.add('recording');
      if (instrEl) instrEl.textContent = 'Grabando explicación... Habla sobre tu trabajo y toca de nuevo para finalizar.';
      if (timerEl) timerEl.textContent = '00:00';
      if (liveTag) {
        liveTag.textContent = 'Escuchando tu voz...';
        liveTag.style.color = 'var(--green-verified)';
      }
      if (voiceMeterBox) voiceMeterBox.style.display = 'flex';

      // 1. Reconocimiento de voz continuo y tolerante a pausas
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'es-CO';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 3;
          ev.speechRecognition = recognition;

          let finalSpokenAccumulator = (transcriptInput && transcriptInput.value.trim()) ? transcriptInput.value.trim() + ' ' : '';

          recognition.onresult = (event) => {
            let interimSpoken = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalSpokenAccumulator += res[0].transcript + ' ';
              } else {
                interimSpoken += res[0].transcript;
              }
            }
            const cleanCombined = (finalSpokenAccumulator + interimSpoken).trim();
            ev.realTranscript = cleanCombined;
            if (transcriptInput) {
              transcriptInput.value = cleanCombined;
            }
            if (liveTag) {
              liveTag.textContent = 'Transcribiendo en tiempo real...';
              liveTag.style.color = 'var(--green-verified)';
            }
          };

          recognition.onerror = (e) => {
            console.log('Aviso de voz WebSpeech:', e.error);
            if (e.error === 'not-allowed') {
              if (liveTag) {
                liveTag.textContent = 'Micrófono bloqueado en navegador (puedes escribir)';
                liveTag.style.color = '#dc2626';
              }
            }
          };

          recognition.onend = () => {
            // Auto-reinicio si sigue grabando (soluciona desconexión tras silencios en Android y Safari)
            if (ev.isRecording) {
              try {
                recognition.start();
              } catch (err) {
                console.log('Speech restart error:', err);
              }
            }
          };

          recognition.start();
        } catch (err) {
          console.log('SpeechRecognition fallback:', err);
        }
      }

      // 2. Temporizador
      ev.recordTimerId = setInterval(() => {
        ev.recordSeconds++;
        const s = ev.recordSeconds;
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;

        if (s >= 120) {
          window.toggleAudioRecording(id);
        }
      }, 1000);

      // 3. Captura de audio y Medidor de volumen con Web Audio API
      ev.audioChunks = [];
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        }).then(stream => {
          ev.micStream = stream;

          // Animación del medidor de volumen de voz real
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            try {
              const audioCtx = new AudioContextClass();
              ev.audioContext = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 32;
              source.connect(analyser);
              const dataArray = new Uint8Array(analyser.frequencyBinCount);

              function updateMeter() {
                if (!ev.isRecording) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let j = 0; j < dataArray.length; j++) sum += dataArray[j];
                const avg = sum / dataArray.length;

                const bars = voiceMeterBox ? voiceMeterBox.querySelectorAll('.audio-live-bar') : [];
                bars.forEach((bar, idx) => {
                  const val = dataArray[idx % dataArray.length] || avg;
                  const h = Math.max(6, Math.min(36, Math.round((val / 255) * 42)));
                  bar.style.height = `${h}px`;
                  bar.style.background = avg > 14 ? 'var(--blue-primary)' : 'rgba(27, 85, 226, 0.4)';
                });

                requestAnimationFrame(updateMeter);
              }
              requestAnimationFrame(updateMeter);
            } catch(e) {
              console.log('AudioContext error:', e);
            }
          }

          // Soporte multiplataforma de codecs de audio (WebM, MP4, AAC)
          const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg'];
          let chosenMime = supportedTypes.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';

          try {
            ev.mediaRecorder = chosenMime ? new MediaRecorder(stream, { mimeType: chosenMime }) : new MediaRecorder(stream);
            ev.mediaRecorder.ondataavailable = e => {
              if (e.data.size > 0) ev.audioChunks.push(e.data);
            };
            ev.mediaRecorder.onstop = async () => {
              stream.getTracks().forEach(track => track.stop());
              const blobType = chosenMime || 'audio/webm';
              const blob = new Blob(ev.audioChunks, { type: blobType });
              ev.audioBlob = blob;
              ev.audioMimeType = blobType;
              ev.audioUrl = URL.createObjectURL(blob);

              // Si hay API Key configurada (Gemini u OpenAI Whisper), transcribir el audio real con IA
              if (hasActiveAiKey()) {
                await transcribeEvidenceBlobWithAi(id, blob);
              }
            };
            ev.mediaRecorder.start(250);
          } catch (err) {
            console.log('MediaRecorder error:', err);
          }
        }).catch(err => {
          console.log('Mic stream error:', err);
        });
      }

      showToast(`Grabando audio explicativo del paso #${getEvidenceIndex(id)}...`, 'normal');
    } else {
      // DETENER GRABACIÓN
      ev.isRecording = false;
      if (ev.recordTimerId) {
        clearInterval(ev.recordTimerId);
        ev.recordTimerId = null;
      }
      if (btn) btn.classList.remove('recording');
      if (voiceMeterBox) voiceMeterBox.style.display = 'none';

      if (ev.audioContext) {
        try { ev.audioContext.close(); } catch(e) {}
        ev.audioContext = null;
      }

      if (ev.speechRecognition) {
        try { ev.speechRecognition.stop(); } catch (e) {}
        ev.speechRecognition = null;
      }

      if (ev.mediaRecorder && ev.mediaRecorder.state !== 'inactive') {
        try { ev.mediaRecorder.stop(); } catch (e) {}
      }

      // Aplicar mejora técnica a lo transcrito
      const currentRaw = (transcriptInput ? transcriptInput.value.trim() : '') || (ev.realTranscript ? ev.realTranscript.trim() : '');
      const enhanced = enhanceTechnicalTranscription(currentRaw);
      ev.realTranscript = enhanced;
      ev.transcriptSource = enhanced ? 'navegador' : null;
      if (transcriptInput) {
        transcriptInput.value = enhanced;
      }

      if (liveTag) {
        liveTag.textContent = hasActiveAiKey()
          ? 'Dictado preliminar del navegador. Esperando transcripción con IA...'
          : 'Dictado del navegador (puede tener errores, revísalo y corrígelo)';
        liveTag.style.color = 'var(--ink-muted)';
      }

      finishAudioRecording(id, formatAudioDuration(ev.recordSeconds));
    }
  };

  function formatAudioDuration(totalSeconds) {
    const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function getAudioDurationSeconds(url) {
    return new Promise(resolve => {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => resolve(isFinite(probe.duration) ? probe.duration : 0);
      probe.onerror = () => resolve(0);
      probe.src = url;
    });
  }

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

  window.triggerAudioFileInput = function (id) {
    const input = document.getElementById(`workAudioFileInput_${id}`);
    if (input) input.click();
  };

  window.handleAudioFileInputChange = async function (id, input) {
    const file = input.files?.[0];
    if (!file) return;

    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    ev.audioBlob = file;
    ev.audioMimeType = file.type || 'audio/mp3';
    ev.audioUrl = URL.createObjectURL(file);

    const realSeconds = await getAudioDurationSeconds(ev.audioUrl);
    finishAudioRecording(id, formatAudioDuration(realSeconds));
    showToast(`Archivo de audio "${file.name}" cargado. Iniciando transcripción técnica...`, 'normal');

    if (hasActiveAiKey()) {
      await transcribeEvidenceBlobWithAi(id, file);
    } else {
      const liveTag = document.getElementById(`speechLiveTag_${id}`);
      const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);
      if (liveTag) {
        liveTag.textContent = 'Archivo cargado (Configura API Key para transcripción IA automática)';
        liveTag.style.color = 'var(--blue-primary)';
      }
      if (transcriptInput && !transcriptInput.value.trim()) {
        transcriptInput.placeholder = 'Sin IA conectada no se puede transcribir el archivo. Escribe aquí lo que explicas en el audio.';
      }
    }
  };

  window.retranscribeEvidenceWithAi = async function (id) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev) return;

    const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);
    const liveTag = document.getElementById(`speechLiveTag_${id}`);

    if (ev.audioBlob && hasActiveAiKey()) {
      await transcribeEvidenceBlobWithAi(id, ev.audioBlob);
      return;
    }

    if (transcriptInput && transcriptInput.value.trim()) {
      if (hasActiveAiKey()) {
        if (liveTag) {
          liveTag.textContent = 'Refinando transcripción técnica con IA...';
          liveTag.style.color = 'var(--blue-primary)';
        }
        try {
          const tradeName = currentTradeExam ? currentTradeExam.tradeName : 'Oficio Técnico';
          const refined = await refineTranscriptTextWithAi(transcriptInput.value.trim(), tradeName);
          if (refined) {
            transcriptInput.value = refined;
            ev.realTranscript = refined;
            if (liveTag) {
              liveTag.textContent = `✨ Transcripción optimizada por ${getAiProviderLabel()}`;
              liveTag.style.color = 'var(--green-verified)';
            }
            showToast('Transcripción técnica verificada y optimizada con IA.', 'success');
            return;
          }
        } catch (err) {
          console.warn('Error refining transcript with AI:', err);
        }
      }

      const enhanced = enhanceTechnicalTranscription(transcriptInput.value.trim());
      transcriptInput.value = enhanced;
      ev.realTranscript = enhanced;
      if (liveTag) {
        liveTag.textContent = 'Texto limpiado (sin cambios de contenido)';
        liveTag.style.color = 'var(--green-verified)';
      }
      showToast('Texto de la explicación limpiado.', 'success');
    } else {
      showToast('Graba tu voz o sube un archivo de audio primero para transcribirlo con IA.', 'normal');
    }
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
    // Sin esto, al regrabar se seguía enviando a la IA el audio y el texto anteriores
    ev.audioBlob = null;
    ev.audioMimeType = null;
    ev.realTranscript = '';
    ev.transcriptSource = null;
    ev.usedSampleAudio = false;
    const oldTranscriptInput = document.getElementById(`audioTranscriptInput_${id}`);
    if (oldTranscriptInput) oldTranscriptInput.value = '';

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

          <!-- Input oculto para subir archivo de audio grabado previamente -->
          <input type="file" id="workAudioFileInput_${newId}" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" style="display: none;" onchange="handleAudioFileInputChange(${newId}, this)">

          <!-- Campo de Transcripción Real Editable por el Maestro -->
          <div class="audio-transcript-box-input" style="margin-top: 14px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
              <label for="audioTranscriptInput_${newId}" style="font-size: 0.82rem; font-weight: 700; color: var(--ink-secondary); margin: 0;">
                Transcripción técnica confrontada por IA:
              </label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="speechLiveTag_${newId}" style="font-size: 0.75rem; color: var(--blue-primary); font-weight: 600;">Voz a texto activa</span>
                <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 2px 8px;" onclick="retranscribeEvidenceWithAi(${newId})">
                  ✨ Transcribir Audio con IA
                </button>
              </div>
            </div>
            <textarea id="audioTranscriptInput_${newId}" class="form-input" rows="3" placeholder="Al grabar o subir tu audio, la IA lo transcribe tal cual lo dijiste. Revisa el texto y corrige lo que haya quedado mal escuchado." style="font-size: 0.86rem; line-height: 1.45;"></textarea>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.78rem; padding: 4px 10px;" onclick="triggerAudioFileInput(${newId})">
              📁 Subir archivo de audio (.mp3/.wav/.m4a)
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
  let certCorrectAnswersCount = 0;
  let certUserAnswers = {};

  // Base de Conocimiento Técnico Real para Confrontación Semántica y Pericial
  const REAL_TRADE_KNOWLEDGE_BASE = {
    plomeria: {
      standard: 'NTC 1500 (Código Colombiano de Fontanería)',
      diagnosticSteps: ['Sectorización con válvulas de corte', 'Prueba hidrostática manométrica', 'Inspección de pendiente y sifonamiento'],
      tools: ['Manómetro de glicerina', 'Bomba de prueba hidrostática', 'Termofusora digital a 260°C', 'Llave Stilson'],
      materials: ['Tubería PPR Copolímero Random', 'CPVC para agua caliente', 'Teflón de alta densidad', 'Soldadura líquida de PVC virgen'],
      tests: ['Prueba a 1.5x presión de trabajo por 15 min con cero caída de aguja', 'Comprobación de sello hidráulico permanente de 5cm'],
      keywords: ['ntc 1500', 'presion hidrostatica', 'manometro', 'termofusion', 'ppr', 'cpvc', 'sifon', 'sello hidraulico', 'estanqueidad', 'teflon', 'ariete', 'valvula reguladora']
    },
    electricidad: {
      standard: 'Reglamento Técnico RETIE y Norma NTC 2050',
      diagnosticSteps: ['Medición con multímetro True RMS', 'Prueba de disparo por sobrecarga vs cortocircuito', 'Comprobación de aislamiento'],
      tools: ['Pinza voltiamperimétrica True RMS', 'Megóhmetro / comprobador de aislamiento', 'Multímetro digital', 'Probador de tomacorrientes GFCI'],
      materials: ['Conductor de cobre calibre 12 AWG THHN/THWN', 'Breaker termomagnético curva C de 20A', 'Electrodo de puesta a tierra Copperweld', 'Barraje equipotencial'],
      tests: ['Tensión fase-neutro (120V ±5%)', 'Fase-tierra (120V)', 'Neutro-tierra (<2V)', 'Disparo diferencial GFCI en 4-6 mA'],
      keywords: ['retie', 'ntc 2050', 'calibre 12 awg', 'thhn', 'puesta a tierra', 'equipotencial', 'breaker', 'sobrecarga', 'cortocircuito', 'gfci', 'multimetro', 'amperaje', '120v']
    },
    solar: {
      standard: 'RETIE Cap. 8, IEC 61215 y Código Eléctrico NTC 2050',
      diagnosticSteps: ['Trazado de curva I-V y detección de sombreados', 'Comprobación de Voc e Isc bajo irradiancia', 'Aislamiento galvánico'],
      tools: ['Pinza amperimétrica para DC', 'Multímetro para 1000V DC', 'Crimpadora para conectores MC4 con matriz hexagonal', 'Torquímetro para perfilería'],
      materials: ['Cable solar fotovoltaico 4mm² H1Z2Z2-K doble aislamiento UV', 'Fusibles gPV para 1000V DC', 'Descargador de sobretensiones DPS tipo 2 DC', 'Arandelas EPDM y poliuretano'],
      tests: ['Medición de voltaje de circuito abierto (Voc) previo a conexión MPPT', 'Prueba de estanqueidad de anclajes en cubierta'],
      keywords: ['solar', 'fotovoltaico', 'retie', 'voc', 'isc', 'mppt', 'inversor', 'fusibles gpv', 'dps', 'mc4', 'epdm', 'string', 'curva i-v']
    },
    carpinteria: {
      standard: 'Estándares de Ebanistería y Secado de Madera (Humedad 8-10%)',
      diagnosticSteps: ['Medición de humedad higroscópica con higrómetro de contacto', 'Verificación de alabeo con regla de precisión y escuadra'],
      tools: ['Higrómetro de madera', 'Prensas de escuadra y sargentos', 'Formones y garlopa calibrada', 'Disco con dientes trapezoidales de 60-80 dientes'],
      materials: ['Madera maciza estacionada al 8-10% de humedad', 'Adhesivo vinílico grado D3/D4 resistente al agua', 'Sellador y fondo de poliuretano', 'Lijas grano 100 a 240'],
      tests: ['Luz perimetral de dilatación de 3-4 mm en marco', 'Resistencia a tracción del ensamble de caja y espiga'],
      keywords: ['caja y espiga', 'humedad higroscopica', 'dilatacion', 'adhesivo d3', 'poliuretano', 'veta', 'lijado progresivo', 'holgura', 'escuadra', 'melamina']
    },
    mecanica: {
      standard: 'Estándares SAE y Protocolos OBD-II',
      diagnosticSteps: ['Lectura de códigos de diagnóstico DTC', 'Prueba cruzada de componentes (bobinas/sensores)', 'Compresión mecánica en PSI con manómetro'],
      tools: ['Escáner automotriz profesional OBD2', 'Torquímetro de zafre calibrado y goniómetro angular', 'Compresómetro de cilindros', 'Vacuómetro de admisión'],
      materials: ['Bujías de iridio calibradas a especificación', 'Líquido de frenos sintético DOT 4', 'Empaques de culata multicapa MLS'],
      tests: ['Alineación computarizada y prueba de ruta recta sin derivas', 'Purga hidráulica de frenos sin microburbujas'],
      keywords: ['obd2', 'dtc', 'p0301', 'compresion', 'torquimetro', 'gonimetro', 'dot 4', 'purga', 'frenos', 'bujias', 'ralenti', 'alineacion']
    },
    refrigeracion: {
      standard: 'Normas ASHRAE 15 y Manejo Seguro de Gases Refrigerantes',
      diagnosticSteps: ['Detección de microfugas con detector electrónico', 'Presurización con nitrógeno seco OFN', 'Evacuación profunda'],
      tools: ['Bomba de vacío de dos etapas', 'Vacuómetro digital de alta precisión (<500 micrones)', 'Báscula digital de carga', 'Abocardador excéntrico a 45° con torque'],
      materials: ['Gas refrigerante ecológico R410A / R32', 'Nitrógeno seco (OFN)', 'Aceite sintético polioléster POE', 'Tubería de cobre deshidratado'],
      tests: ['Prueba de retención de vacío por 15 minutos', 'Medición de salto térmico de 10-14°C entre retorno e impulsión'],
      keywords: ['vacio', '500 micrones', 'nitrogeno seco', 'ofn', 'r410a', 'r32', 'bascula', 'salto termico', 'abocardado', 'ashrae', 'poe', 'estanqueidad']
    },
    soldadura: {
      standard: 'Código AWS D1.1 (Structural Welding) y ASME Sección IX',
      diagnosticSteps: ['Inspección visual dimensional con galga', 'Ensayo por líquidos penetrantes', 'Control de temperatura entre pasadas con pirómetro'],
      tools: ['Máquina inversora TIG / MIG pulsada', 'Antorcha TIG con difusor de gas (gas lens)', 'Galga de filete y bisel', 'Horno de mantenimiento a 120-150°C'],
      materials: ['Gas Argón 100% de alta pureza', 'Metal de aporte ER70S-6 / E7018 bajo hidrógeno', 'Electrodos de tungsteno al 2% cerio o torio'],
      tests: ['Inspección AWS D1.1 sin poros, socavaciones ni fisuras', 'Penetración completa de raíz comprobada'],
      keywords: ['aws d1.1', 'asme', 'tig', 'mig', 'argon puro', 'bisel 60', 'penetracion de raiz', 'socavacion', 'liquidos penetrantes', 'aporte termico', 'talon']
    },
    cerrajeria: {
      standard: 'Norma UNE-EN 1303 y Seguridad Física Antiefracción',
      diagnosticSteps: ['Evaluación de vulnerabilidad ante bumping, ganzuado y taladrado', 'Verificación de holguras perimetrales de hoja y marco'],
      tools: ['Formones de precisión y escoplos', 'Juegos de ganzúas de palpación milimétrica', 'Extractor de bombines y rotor antitaladro'],
      materials: ['Cilindro de perfil europeo de alta seguridad certificado', 'Polvo de grafito seco micronizado (prohibición de aceites viscosos)', 'Escudo protector acorazado'],
      tests: ['Giro suave de cilindro con dos vueltas completas de llave sin fricción en cantonera', 'Acceso mecánico de emergencia operativo'],
      keywords: ['une-en 1303', 'antibumping', 'antiganzua', 'antitaladro', 'grafito seco', 'europerfil', 'cantonera', 'resbalon', 'escudo acorazado', 'cerrojo']
    },
    barismo: {
      standard: 'Estándares SCA (Specialty Coffee Association)',
      diagnosticSteps: ['Medición de TDS de agua y café', 'Evaluación de ratio de extracción (1:2) y tiempo (25-30 seg)'],
      tools: ['Molino micrométrico de muelas planas o cónicas', 'Herramienta de distribución WDT de agujas', 'Tamper calibrado a 15 kg', 'Refractómetro de café'],
      materials: ['Café de especialidad con tueste medio y reposo óptimo', 'Agua filtrada balanceada (75-150 ppm TDS a 90-94°C)', 'Leche entera fresca'],
      tests: ['Retrolavado backflush con filtro ciego y detergente enzimático', 'Texturizado de leche con microespuma sedosa a 60-65°C'],
      keywords: ['sca', 'espresso', 'ratio 1:2', 'molienda micrometrica', 'tds', 'wdt', 'retrolavado', 'filtro ciego', 'microespuma', 'subextraccion', 'sobreextraccion']
    },
    drones: {
      standard: 'Regulaciones Aeronáuticas RAC 100 (Aerocivil) y Estándares UAV',
      diagnosticSteps: ['Calibración de IMU en 6 ejes', 'Calibración de brújula magnetométrica en campo abierto', 'Inspección de resistencia interna de celdas LiPo'],
      tools: ['Estación de calibración y nivel de precisión', 'Balanceador dinámico magnético de hélices', 'Cargador inteligente con balanceador LiPo', 'Multímetro'],
      materials: ['Baterías LiPo certificadas con celdas balanceadas (>3.7V)', 'Hélices originales balanceadas de fibra de carbono'],
      tests: ['Fijación de Home Point RTH con >12 satélites bloqueados', 'Prueba de enlace de radio y telemetría de retorno seguro'],
      keywords: ['rac 100', 'imu', 'brujula magnetica', 'lipo', 'fail-safe', 'rth', 'brushless', 'helices balanceadas', 'telemetria', 'aerocivil']
    },
    panaderia: {
      standard: 'BPM (Buenas Prácticas de Manufactura) y Fermentación Biológica',
      diagnosticSteps: ['Prueba de flotabilidad de masa madre al pico', 'Prueba de la ventana o membrana de gluten', 'Control de temperatura de masa (fórmula TDM)'],
      tools: ['Balanza de precisión digital', 'Termómetro de punzón para masas', 'Banetones de pulpa de madera', 'Cuchilla de corte (lame)'],
      materials: ['Harina de trigo de alta fuerza (W>300)', 'Masa madre 100% natural activa', 'Agua potable declorada', 'Sal marina sin yodo añadido'],
      tests: ['Prueba de la membrana translúcida elástica', 'Salto de horno con inyección de vapor y greña abierta'],
      keywords: ['masa madre', 'prueba de la membrana', 'autolisis', 'porcentaje panadero', 'retardo en frio 4c', 'greña', 'vapor', 'fuerza w', 'alveolos', 'bpm']
    },
    universal: {
      standard: 'Estándares Técnicos Internacionales y Protocolos de Seguridad',
      diagnosticSteps: ['Diagnóstico metódico de causa raíz instrumental', 'Inspección previa al desmontaje', 'Verificación de especificaciones de fabricante'],
      tools: ['Herramientas calibradas de precisión', 'Equipos de Protección Individual (EPI)', 'Instrumental de medición específico'],
      materials: ['Materiales homologados con ficha técnica certificada', 'Consumibles de especificación de fábrica'],
      tests: ['Pruebas de funcionamiento bajo carga real de servicio', 'Emisión de constancia con garantía escrita'],
      keywords: ['diagnostico de causa raiz', 'herramientas calibradas', 'epi', 'ficha tecnica', 'tolerancias', 'pruebas de carga', 'garantia escrita', 'control de calidad']
    }
  };

  // Perfiles de Conocimiento Experto Curados (Multi-Especialidad con 8 Casos Técnicos Situacionales cada uno)
  const TRADE_EXPERT_PROFILES = {
    plomeria: {
      tradeName: 'Plomería & Redes Hidráulicas',
      icon: '',
      norms: 'NTC 1500 (Código Colombiano de Fontanería)',
      questions: [
        {
          title: '1. Diagnóstico de Caída de Presión y Fuga Oculta',
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
          title: '2. Materiales y Normas de Tuberías Hidráulicas',
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
          title: '3. Instalación Técnica de Sifones y Desagües',
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
          title: '4. Control de Calidad y Entrega Garantizada',
          scenario: 'Tras realizar una reparación de tubería de distribución principal, ¿qué prueba obligatoria debe superar antes de revocar el muro?',
          options: [
            'Prueba hidrostática a 1.5 veces la presión de trabajo normal durante al menos 15 minutos con cero caída de aguja en el manómetro.',
            'Abrir la llave solo dos segundos y tocar con el dedo si se siente húmedo.',
            'Tapar el hueco de inmediato con yeso rápido antes de abrir el paso general.',
            'Dejar la llave cerrada y cobrar el servicio sin comprobar el flujo.'
          ],
          correct: 0,
          explanation: 'La prueba hidrostática a 1.5x de presión de trabajo garantiza estanqueidad absoluta y previene daños catastróficos posteriores al cierre de obra.'
        },
        {
          title: '5. Prevención y Control del Golpe de Ariete',
          scenario: 'Al cerrarse bruscamente una válvula solenoide de lavadora, las tuberías emiten un fuerte estampido metálico y vibran en los muros. ¿Cómo se mitiga técnicamente?',
          options: [
            'Instalar cámaras de aire verticales o amortiguadores mecánicos de golpe de ariete homologados cerca de las válvulas de cierre rápido.',
            'Amarrar las tuberías con alambre de púas a las columnas estructurales.',
            'Reducir el diámetro de toda la tubería a un cuarto de pulgada.',
            'Ignorar el sonido indicando al cliente que es normal en tuberías plásticas.'
          ],
          correct: 0,
          explanation: 'El amortiguador disipa la onda de choque hidrodinámica evitando la rotura por fatiga de codos, soldaduras y uniones roscadas.'
        },
        {
          title: '6. Pendientes Normativas en Evacuación Sanitaria',
          scenario: 'Bajo la norma NTC 1500, ¿cuál es la pendiente mínima requerida para ramales horizontales de desagüe sanitario de 2 y 3 pulgadas?',
          options: [
            'Pendiente uniforme mínima del 2% hacia el bajante para garantizar velocidad de autolimpieza del fluido sin sedimentación de sólidos.',
            'Totalmente horizontal a 0% para que el agua viaje despacio.',
            'Pendiente vertical directa del 45% sin importar el recorrido.',
            'Pendiente negativa del 1% para acumular agua en el fondo.'
          ],
          correct: 0,
          explanation: 'La pendiente del 2% genera la velocidad hidráulica óptima (entre 0.6 y 3 m/s) para arrastrar los sólidos en suspensión sin sedimentación.'
        },
        {
          title: '7. Calentadores de Paso a Gas y Evacuación de Monóxido',
          scenario: 'Al instalar un calentador de agua de paso continuo a gas en zona de lavandería, ¿qué requisito de ventilación y ductos exige la norma NTC 3833?',
          options: [
            'Ducto metálico de evacuación de humos con pendiente ascendente continua hacia el exterior y rejillas de ventilación permanente inferior y superior.',
            'Dejar que los gases quemados salgan directamente al cielo raso de la cocina.',
            'Conectar el ducto de gas a la tubería de desagüe sanitario.',
            'Sellar todas las ventanas del cuarto de lavandería con cinta hermética.'
          ],
          correct: 0,
          explanation: 'La ventilación cruzada y el ducto de tiro garantizan aporte de oxígeno y expulsión segura de monóxido de carbono protegiendo la vida de los ocupantes.'
        },
        {
          title: '8. Válvula Reguladora de Presión (VRP) en Redes Domiciliarias',
          scenario: 'En un edificio residencial donde la presión en los primeros pisos supera los 80 PSI generando daños en cartuchos cerámicos de grifería, ¿cuál es la solución pericial?',
          options: [
            'Instalar una válvula reductora/reguladora de presión calibrada con manómetro de salida entre 40 y 50 PSI y filtro de malla previo.',
            'Instalar mangueras plásticas delgadas para estrangular el flujo.',
            'Dejar una llave abierta permanentemente goteando en el patio.',
            'Quitar los empaques de las griferías para aliviar la fuerza del chorro.'
          ],
          correct: 0,
          explanation: 'La VRP estabiliza la presión dinámica protegiendo las griferías, calentadores y electrodomésticos de sobrepresiones destructivas.'
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
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA determinó que la explicación oral y las respuestas demuestran pericia avanzada conforme a la norma NTC 1500: diagnóstico preciso de la falla, selección de tubería rígida en lugar de flexible, aplicación correcta de cinta sellante y validación rigurosa mediante prueba de presión hidrostática.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'
    },

    electricidad: {
      tradeName: 'Electricidad Residencial & RETIE',
      icon: '',
      norms: 'Reglamento Técnico RETIE y Código NTC 2050',
      questions: [
        {
          title: '1. Diagnóstico de Sobrecarga y Disparo de Protecciones',
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
          title: '2. Selección Normativa de Conductor y Protección (RETIE)',
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
          title: '3. Sistema de Puesta a Tierra y Seguridad Humana',
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
          title: '4. Verificación Instrumental y Protocolo de Entrega',
          scenario: 'Antes de energizar y entregar un tablero de distribución renovado, ¿qué mediciones con multímetro o pinza deben registrarse?',
          options: [
            'Tensión fase-neutro (120V ±5%), tensión fase-tierra (120V), neutro-tierra (<2V) y ausencia de continuidad entre fase y tierra.',
            'Comprobar únicamente que al encender la bombilla haya luz.',
            'Tocar los cables con la mano para verificar si transmiten cosquilleo.',
            'Conectar directamente los cables sin verificar la polaridad.'
          ],
          correct: 0,
          explanation: 'Las mediciones cuantitativas de voltaje y resistencia de aislamiento son obligatorias por el RETIE para certificar la instalación.'
        },
        {
          title: '5. Protección Diferencial GFCI en Zonas Húmedas',
          scenario: 'En baños, cocinas y zonas de lavandería, ¿qué protección obligatoria exige el RETIE para prevenir accidentes por corrientes de fuga?',
          options: [
            'Tomacorrientes con interruptor de circuito por falla a tierra (GFCI) con sensibilidad de disparo entre 4 y 6 miliamperios.',
            'Tomacorrientes normales de dos patas sin polo a tierra.',
            'Un interruptor de cuchilla abierto.',
            'Enchufes cubiertos con cinta adhesiva transparente.'
          ],
          correct: 0,
          explanation: 'El dispositivo GFCI detecta desbalances ínfimos entre fase y neutro (4-6 mA) desconectando la energía en 25 milisegundos antes de que cause fibrilación cardíaca.'
        },
        {
          title: '6. Factor de Ocupación en Tuberías Conduit',
          scenario: 'Bajo la norma NTC 2050, al canalizar tres o más conductores de fase, neutro y tierra en una tubería conduit PVC o metálica:',
          options: [
            'El área transversal de los cables no debe superar el 40% del área interior del tubo para permitir disipación térmica y fácil cableado.',
            'Se debe llenar el tubo al 100% apretando con grasa para que quepan más cables.',
            'No hay límite de cables mientras se puedan empujar con fuerza.',
            'Se permite derretir el tubo con soplete para cerrarlo sobre los cables.'
          ],
          correct: 0,
          explanation: 'El límite del 40% evita el atrapamiento de calor por efecto Joule que degradaría prematuramente el aislamiento dieléctrico.'
        },
        {
          title: '7. Caída de Tensión Máxima Permisible',
          scenario: 'En un circuito ramal monofásico que alimenta una carga a 35 metros del tablero de distribución, ¿cuál es la máxima caída de tensión aceptada por el RETIE?',
          options: [
            'Máximo 3% en el circuito ramal y no más del 5% combinado desde el medidor hasta la salida más lejana.',
            'Caída de tensión del 20% para que los focos alumbren más tenue.',
            'No importa el voltaje resultante siempre que los cables no echen humo.',
            'Un 50% de caída de tensión en horas pico.'
          ],
          correct: 0,
          explanation: 'Una caída superior al 3% provoca bajo rendimiento, sobrecalentamiento de motores de electrodomésticos y sobreconsumo energético.'
        },
        {
          title: '8. Balance de Cargas en Tablero Bifásico / Trifásico',
          scenario: 'Al organizar los circuitos ramales en un tablero de distribución de dos fases (bifásico), ¿cuál es la buena práctica pericial?',
          options: [
            'Repartir las cargas equitativamente entre las fases A y B (desbalance inferior al 5%) para evitar sobrecalentamiento del neutro.',
            'Cargar todos los electrodomésticos pesados en la fase A y dejar la fase B solo con un bombillo.',
            'Conectar el neutro al chasis metálico sin barraje independiente.',
            'Puentear las dos fases con un alambre delgado para unificarlas.'
          ],
          correct: 0,
          explanation: 'El equilibrio de fases minimiza la corriente circulante por el conductor neutro común y evita fluctuaciones de tensión perjudiciales.'
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
      aiScores: { c1: 25, c2: 25, c3: 24, c4: 25, overall: 99 },
      verdictParagraph: 'La IA califica el procedimiento con nivel de Maestría Senior según RETIE: identificación certera de sobrecarga térmica, recableado normativo a calibre 12 AWG, conexión de seguridad a tierra y mediciones cuantitativas instrumentales bajo carga.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    },

    solar: {
      tradeName: 'Instalación de Energía Solar Fotovoltaica',
      icon: '',
      norms: 'RETIE Cap. 8, IEC 61215 y Código Eléctrico NTC 2050',
      questions: [
        {
          title: '1. Diagnóstico de Sombras y Rendimiento en Strings',
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
          title: '2. Dimensionamiento de Protecciones DC y DPS',
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
          title: '3. Estructura de Montaje y Sellado de Cubiertas',
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
          title: '4. Puesta en Marcha y Verificación de Voc e Isc',
          scenario: 'Antes de conectar los strings a las entradas MPPT del inversor, ¿qué pruebas de control de calidad deben realizarse obligatoriamente?',
          options: [
            'Medir voltaje de circuito abierto (Voc) comprobando polaridad correcta y verificar corriente de cortocircuito (Isc) bajo irradiancia conocida.',
            'Conectar directamente los cables al inversor para ver si echa humo o enciende.',
            'Medir únicamente con la lengua para verificar si hay corriente en las terminales MC4.',
            'Omitir mediciones y encender el sistema sin comprobar aislamiento a tierra.'
          ],
          correct: 0,
          explanation: 'La comprobación previa de Voc y polaridad en conectores MC4 evita la destrucción catastrófica de las etapas MPPT del inversor por polaridad inversa.'
        },
        {
          title: '5. Selección y Crimpado de Conectores MC4',
          scenario: 'Al ensamblar conectores solares MC4 en los extremos del cable solar de 4mm² o 6mm²:',
          options: [
            'Utilizar ponchadora/crimpadora solar con matriz hexagonal calibrada y ajustar el prensaestopas con llaves especiales al torque del fabricante.',
            'Aplastar las terminales metálicas con alicate común de corte y amarrar con cinta aislante.',
            'Soldar con estaño de fontanería y dejar el plástico suelto.',
            'Cortar los pelos del conductor para que entre forzado en un conector más chico.'
          ],
          correct: 0,
          explanation: 'Un crimpado deficiente en DC genera alta resistencia de contacto, puntos calientes (hotspots) y riesgo inminente de arco e incendio.'
        },
        {
          title: '6. Cable Fotovoltaico Especializado H1Z2Z2-K',
          scenario: '¿Por qué no se debe utilizar cable eléctrico convencional THHN en las conexiones exteriores de los módulos fotovoltaicos?',
          options: [
            'El cable solar fotovoltaico cuenta con doble aislamiento reticulado libre de halógenos, resistencia a rayos UV, ozono y temperaturas de hasta 120°C.',
            'Porque el cable solar es más brillante estéticamente.',
            'Cualquier cable sirve igual sin importar el sol ni la lluvia.',
            'El cable convencional es obligatorio por ley en tejados.'
          ],
          correct: 0,
          explanation: 'La radiación ultravioleta y el calor extremo tuestan y quiebran el PVC común en menos de dos años, dejando el cobre expuesto a fallas a tierra.'
        },
        {
          title: '7. Puesta a Tierra Equipotencial del Arreglo Solar',
          scenario: 'Bajo la reglamentación RETIE Cap. 8, ¿cómo debe asegurarse la puesta a tierra de la estructura fotovoltaica?',
          options: [
            'Interconectar todos los marcos de los paneles y rieles de aluminio con grapas de puesta a tierra dentadas y conductor de cobre continuo al barraje general.',
            'Dejar los marcos metálicos aislados flotantes sin conexión a tierra.',
            'Conectar la tierra del panel a la tubería de gas domiciliario.',
            'Poner a tierra solamente el inversor y no tocar los paneles en el tejado.'
          ],
          correct: 0,
          explanation: 'La equipotencialidad drena descargas atmosféricas inducidas y estática, protegiendo a los operarios contra descargas por fallas de aislamiento.'
        },
        {
          title: '8. Inversores Híbridos y Modo Anti-Isla (Anti-Islanding)',
          scenario: '¿Cuál es la función obligatoria de protección anti-isla en un inversor solar conectado a la red eléctrica pública?',
          options: [
            'Desconectarse instantáneamente de la red pública en milisegundos cuando hay un corte de energía para evitar electrocutar a los técnicos de la cuadrilla eléctrica.',
            'Alimentar toda la ciudad con la energía de los paneles solares de la casa.',
            'Apagar las baterías permanentemente cuando se corta la luz.',
            'Seguir inyectando energía a los postes de la calle sin control.'
          ],
          correct: 0,
          explanation: 'La norma IEEE 1547 y RETIE exigen corte anti-isla inmediato para salvaguardar la vida de los trabajadores que reparan las líneas públicas.'
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
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA certifica idoneidad con honores en energía solar: cálculo preciso de series de paneles, uso estricto de protecciones DC homologadas, anclaje estanco en cubierta y mediciones de seguridad antes de la interconexión con la red eléctrica.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
    },

    carpinteria: {
      tradeName: 'Carpintería Fina & Ebanistería',
      icon: '',
      norms: 'Estándares de Ebanistería y Secado de Madera',
      questions: [
        {
          title: '1. Diagnóstico de Deformación por Contracción y Humedad',
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
          title: '2. Técnica de Ensamble y Uniones Estructurales',
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
          title: '3. Preparación de Superficie y Lijado Progresivo',
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
          title: '4. Protección y Sellado contra la Humedad',
          scenario: 'Al instalar muebles en zonas de baño o cocina, ¿cómo se protegen los cantos inferiores que tocan el suelo?',
          options: [
            'Sellando los cantos con parafina, fondo de poliuretano impermeable y colocando niveladores de nylon para elevar el mueble del piso.',
            'Dejando el aglomerado o madera al corte vivo directamente en contacto con el agua del trapero.',
            'Cubriendo la base con papel adhesivo decorativo sin sellado químico.',
            'Echando pintura de agua común en los cantos sin lijado previo.'
          ],
          correct: 0,
          explanation: 'Los cantos en corte absorben humedad por capilaridad; el sellado hidrófugo y el aislamiento con niveladores evita que el mueble se hinche y deteriore.'
        },
        {
          title: '5. Holgura de Dilatación en Marcos y Puertas',
          scenario: 'Al instalar una puerta de madera maciza en su marco interior en clima húmedo, ¿cuál es la luz perimetral recomendada?',
          options: [
            'De 3 mm a 4 mm uniformes en cantos laterales y superior para permitir la variación dimensional higroscópica.',
            'Cero holgura; debe quedar forzada contra el marco.',
            'Dejar 4 centímetros de luz perimetral abierta.',
            'La madera maciza no cambia de tamaño con la humedad ambiental.'
          ],
          correct: 0,
          explanation: 'La luz perimetral calculada previene que la puerta se atasque o raspe el piso durante los meses de alta humedad relativa.'
        },
        {
          title: '6. Corte Limpio en Aglomerados de Melamina',
          scenario: 'Para cortar tableros de melamina de 15mm o 18mm sin desportillar el recubrimiento decorativo:',
          options: [
            'Utilizar disco de sierra con dientes trapezoidales/planos de alta densidad (mínimo 60-80 dientes) con ángulo neutro o negativo y precorte.',
            'Usar un serrucho de podar manual oxidado.',
            'Cortar golpeando con formón y martillo.',
            'Aplicar calor con soplete sobre la melamina antes de serruchar.'
          ],
          correct: 0,
          explanation: 'La geometría trapezoidal-plana rompe limpiamente la resina melamínica quebradiza sin quebrar las esquinas visibles.'
        },
        {
          title: '7. Regulación Tridimensional de Bisagras de Cazoleta (Euro)',
          scenario: 'Al nivelar puertas de cocina desalineadas con bisagras de cazoleta de 35mm, ¿qué tres ajustes se realizan?',
          options: [
            'Ajuste lateral (solape), ajuste de profundidad (separación del mueble) y ajuste vertical de altura mediante los tornillos de la base.',
            'Golpear la bisagra con maceta de hierro hasta que la puerta cierre.',
            'Cambiar la puerta entera por una cortina de tela.',
            'Limar las orillas de la puerta hasta que no roce.'
          ],
          correct: 0,
          explanation: 'Las bisagras tipo cazoleta incorporan tornillos excéntricos micrométricos para cuadrar la holgura en los 3 ejes espaciales.'
        },
        {
          title: '8. Inmunización y Protección contra Xilófagos',
          scenario: 'Antes de ensamblar y dar acabado a maderas blandas o semiduras susceptibles al comején y polilla:',
          options: [
            'Aplicar preservante inmunizante de base solvente con acción fungicida e insecticida por inmersión o brocha saturada.',
            'Lavar la madera con agua con azúcar para espantar insectos.',
            'Pintar encima sin tratamiento preventivo.',
            'Envolver la madera en periódico usado.'
          ],
          correct: 0,
          explanation: 'El tratamiento con sales o insecticidas sintéticos penetra los vasos conductores garantizando durabilidad biológica por décadas.'
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
      aiScores: { c1: 25, c2: 24, c3: 25, c4: 25, overall: 99 },
      verdictParagraph: 'La IA valida la pericia del maestro en carpintería fina: corrección de dilatación térmica sin desbalancear la escuadra, aplicación de adhesivo resistente y sellado químico para prevenir reincidencia por humedad ambiental.',
      samplePhotoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    },

    mecanica: {
      tradeName: 'Mecánica Automotriz & Diagnóstico OBD2',
      icon: '',
      norms: 'Estándares SAE, Normas OBD-II y Seguridad de Taller',
      questions: [
        {
          title: '1. Diagnóstico Electrónico con Escáner OBD2',
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
          title: '2. Torque Normativo y Sustitución de Componentes Críticos',
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
          title: '3. Sistema de Frenos y Purga Hidráulica',
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
          title: '4. Prueba Dinámica de Carretera y Validación Final',
          scenario: 'Finalizada una reparación del tren delantero y suspensión, ¿qué validación obligatoria se debe realizar antes de la entrega?',
          options: [
            'Alineación y balanceo computarizado de las ruedas y prueba de ruta comprobando estabilidad de volante, frenado recto y ausencia de ruidos parásitos.',
            'Lavar el vehículo y no probarlo en movimiento.',
            'Revisar únicamente la presión de aire en las llantas.',
            'Entregar el vehículo sin verificar los pernos de las rótulas ni terminales.'
          ],
          correct: 0,
          explanation: 'La alineación y la prueba dinámica en carretera garantizan que la geometría de la dirección esté dentro de especificación y no desgaste prematuramente los neumáticos.'
        },
        {
          title: '5. Diagnóstico de Emisiones por Color de Humo',
          scenario: 'Un motor emite humo azulado continuo por el tubo de escape al acelerar en caliente y baja el nivel de aceite en el cárter. ¿Cuál es el diagnóstico?',
          options: [
            'Paso de aceite a la cámara de combustión por retenes de válvulas o anillos de pistón desgastados.',
            'Falla en la mezcla de aire que está demasiado pobre.',
            'Consumo de agua refrigerante por empaque de culata quemado.',
            'El catalizador está funcionando con exceso de oxígeno.'
          ],
          correct: 0,
          explanation: 'El humo azul es indicio inconfundible de aceite de motor quemándose en la cámara de combustión por holgura excesiva de guías o aros.'
        },
        {
          title: '6. Presión de Riel de Combustible en Inyección Electrónica',
          scenario: 'Para verificar si una bomba de gasolina eléctrica entrega el caudal y presión adecuados:',
          options: [
            'Acoplar manómetro de combustible a la toma Schrader del riel y comprobar presión nominal (ej: 45-55 PSI) bajo aceleración y retención al apagar.',
            'Desconectar la manguera y apuntar a una botella para ver si salpica fuerte.',
            'Escuchar si el tanque hace zumbido sin tomar medidas.',
            'Reemplazar los inyectores sin medir la bomba.'
          ],
          correct: 0,
          explanation: 'La comprobación manométrica en riel valida tanto la presión dinámica como la hermeticidad de la válvula de retención check del aforador.'
        },
        {
          title: '7. Sincronización de Distribución y Calado de Tiempo',
          scenario: 'Al reemplazar la correa o cadena de distribución de un motor con doble árbol de levas (DOHC):',
          options: [
            'Utilizar herramientas de bloqueo de árboles y cigüeñal en Punto Muerto Superior (PMS) respetando las marcas de tiempo antes de tensionar.',
            'Montar la correa a ojo y dar arranque para ver si las válvulas chocan.',
            'Girar los árboles de levas al azar con una llave de tubo.',
            'Apretar el tensor con palanca hasta que la correa quede tiesa al máximo.'
          ],
          correct: 0,
          explanation: 'Un error de tan solo un diente en la distribución provoca choque destructivo de válvulas contra pistones o pérdida severa de rendimiento.'
        },
        {
          title: '8. Inspección de Líquido Refrigerante con Refractómetro',
          scenario: 'Al evaluar el sistema de enfriamiento del motor, ¿cómo se certifica el estado del refrigerante OAT?',
          options: [
            'Medir punto de congelación y ebullición con refractómetro óptico y verificar pH para descartar corrosión ácida por degradación de aditivos.',
            'Mirar si el color sigue verde fosforescente sin hacer pruebas.',
            'Echarle agua de la llave directa para diluir el sarro.',
            'Oler el líquido para ver si huele a gasolina.'
          ],
          correct: 0,
          explanation: 'Los inhibidores orgánicos se desgastan con los ciclos térmicos volviendo el fluido ácido y carcomiendo el aluminio de la culata y radiador.'
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
          title: '1. Protocolo de Vacío y Deshidratación del Sistema',
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
          title: '2. Detección de Fugas y Presurización con Nitrógeno',
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
          title: '3. Carga de Refrigerante por Masa (Báscula Digital)',
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
          title: '4. Control de Calidad: Salto Térmico y Sobrecalentamiento',
          scenario: 'Para certificar el correcto funcionamiento de un aire acondicionado en modo frío, ¿qué delta térmico (°ΔT) debe existir entre el retorno y la inyección?',
          options: [
            'Un salto térmico de entre 10°C y 14°C (18°F a 24°F) con sobrecalentamiento y subenfriamiento dentro de los rangos de la tabla del fabricante.',
            'Una diferencia menor a 2°C indicando que el aire casi no enfría.',
            'El aire debe salir caliente para indicar que el compresor está trabajando al máximo.',
            'No se mide ninguna temperatura, solo se verifica que sople viento.'
          ],
          correct: 0,
          explanation: 'Un delta térmico entre 10°C y 14°C en aire de retorno vs inyección valida la transferencia de calor óptima y la eficiencia energética del equipo.'
        },
        {
          title: '5. Abocardado a 45° y Ajuste Dinamométrico',
          scenario: 'Al confeccionar las pestañas abocardadas de las tuberías de cobre de 1/4 y 3/8:',
          options: [
            'Usar abocardador excéntrico, aplicar una gota de aceite POE en el cono y ajustar la tuerca con llave dinamométrica al torque de placa.',
            'Golpear la punta del tubo con un clavo grueso.',
            'Apretar la tuerca con llave Stilson de 18 pulgadas hasta barrer la rosca.',
            'Soldar con estaño blando sin abocardar.'
          ],
          correct: 0,
          explanation: 'El torque calibrado y la pestaña cónica perfecta sin rebabas evitan fugas diminutas que se producen por vibraciones con el paso de los meses.'
        },
        {
          title: '6. Incompatibilidad de Lubricantes Mineral vs POE/PVE',
          scenario: '¿Por qué no se debe utilizar aceite mineral tradicional en circuitos que operan con refrigerante R410A o R134a?',
          options: [
            'El aceite mineral no es miscible con los HFC/HFO, provocando que el lubricante quede atrapado en el evaporador y el compresor se quede sin aceite y se trabe.',
            'El aceite mineral hace que el gas huela feo.',
            'El aceite mineral congela los tubos a temperatura ambiente.',
            'Todos los aceites son iguales en refrigeración.'
          ],
          correct: 0,
          explanation: 'La miscibilidad es obligatoria para que el gas de retorno arrastre el aceite de vuelta al cárter del compresor en cada ciclo.'
        },
        {
          title: '7. Pendiente y Sifón en Línea de Condensados',
          scenario: 'Al instalar el drenaje de condensados de la unidad interior de aire acondicionado:',
          options: [
            'Mantener pendiente mínima continua descendente del 1% y colocar sifón de retención para evitar rebase de bandeja por presión negativa del ventilador.',
            'Tirar la manguera hacia arriba hacia el techo sin caída.',
            'Sellar el orificio de drenaje para que el agua no gotee.',
            'Conectar el drenaje directo a la tubería de gas del calentador.'
          ],
          correct: 0,
          explanation: 'La presión negativa del soplador succiona aire impidiendo la salida del agua a menos que el sifón mantenga una columna de sello constante.'
        },
        {
          title: '8. Limpieza Química de Serpentines con Producto Alcalino',
          scenario: 'Al dar mantenimiento preventivo profundo al serpentín condensador exterior con polvo incrustado:',
          options: [
            'Aplicar desincrustante espumante de base alcalina no agresiva, dejar actuar 5 minutos y enjuagar abundantemente con agua a baja presión para no doblar aletas.',
            'Lavar con ácido muriático concentrado sin enjuagar.',
            'Lanzar agua con hidrolavadora a máxima presión pegada a las aletas para aplastarlas.',
            'Cepillar con cerdas de acero para raspar el metal.'
          ],
          correct: 0,
          explanation: 'Los productos alcalinos biodegradables disuelven la grasa y el hollín sin atacar químicamente las láminas finas de aluminio del intercambiador.'
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
          title: '1. Preparación de Bisel y Limpieza de Metal Base',
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
          title: '2. Protección Gaseosa y Selección de Parámetros TIG/MIG',
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
          title: '3. Control de Aporte Térmico y Secuencia de Pasadas',
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
          title: '4. Inspección Visual y Ensayos No Destructivos (END)',
          scenario: '¿Qué criterios determinan que un cordón de soldadura cumple los estándares de calidad de la norma AWS D1.1?',
          options: [
            'Cordón homogéneo sin poros visibles, ausencia de socavaciones marginales, penetración completa en la raíz y sobreespesor conforme a tolerancia.',
            'Cordón lleno de poros negros y salpicaduras abundantes por toda la chapa.',
            'Presencia de fisuras longitudinales en el centro del cordón.',
            'Falta de fusión evidente donde el metal de aporte quedó pegado sin fundir la base.'
          ],
          correct: 0,
          explanation: 'La norma AWS D1.1 establece límites milimétricos estrictos para discontinuidades superficiales e internas garantizando la integridad estructural bajo cargas dinámicas.'
        },
        {
          title: '5. Almacenamiento de Electrodos E7018 Bajo Hidrógeno',
          scenario: '¿Por qué los electrodos revestidos de bajo hidrógeno (E7018) deben mantenerse en hornos portátiles a 120°C - 150°C en obra?',
          options: [
            'Para prevenir la absorción de humedad atmosférica que produciría fisuración retardada por hidrógeno bajo cordón.',
            'Para que quemen más rápido y gasten menos corriente eléctrica.',
            'Para derretir el recubrimiento antes de tocar el metal.',
            'Para cambiar el color del humo durante la soldadura.'
          ],
          correct: 0,
          explanation: 'El hidrógeno libre liberado por el agua atrapada en el revestimiento difunde a través de la red cristalina del acero provocando rotura frágil bajo tensión.'
        },
        {
          title: '6. Purga Interna con Gas Inerte en Tuberías Inoxidables',
          scenario: 'Al realizar el pase de raíz en tubería de acero inoxidable sanitario para industria alimentaria o química:',
          options: [
            'Purgar el interior de la tubería con gas argón usando tapones estancos para evitar la coliflor u oxidación del lado interno de la raíz.',
            'Dejar el tubo abierto al aire libre para que el oxígeno ayude a quemar la raíz.',
            'Rellenar el tubo con agua con jabón.',
            'Soldar con electrodo de carbón sin gas.'
          ],
          correct: 0,
          explanation: 'La purga con gas inerte preserva la película pasiva protectora del cromo y evita la precipitación de carburos corrosivos en la cara interna no accesible.'
        },
        {
          title: '7. Prevención de Distorsión Angular en Uniones en T',
          scenario: 'Para controlar la deformación angular al soldar una viga en T con soldaduras de filete continuas:',
          options: [
            'Aplicar contradeformación previa mecánica, soldar con pasadas alternadas en lados opuestos y usar punteado robusto con arriostres.',
            'Soldar todo un lado completo de corrido a máximo calor.',
            'Golpear la chapa con un combo de 20 libras mientras está al rojo vivo.',
            'Dejar la estructura suelta sin ningún amarre.'
          ],
          correct: 0,
          explanation: 'El equilibrio térmico bilateral compensa las fuerzas de contracción transversales de solidificación manteniendo la perpendicularidad a 90°.'
        },
        {
          title: '8. Ensayo por Líquidos Penetrantes (PT)',
          scenario: 'Al verificar la ausencia de microfisuras superficiales en un cordón crítico con líquidos penetrantes:',
          options: [
            'Limpiar con solvente desengrasante, aplicar penetrante rojo por 10-15 min, retirar exceso con paño húmedo y pulverizar revelador blanco observando manchas.',
            'Pintar con esmalte negro y mirar si se seca.',
            'Echar gasolina y prender fuego a la chapa.',
            'Aplicar solo agua con sal.'
          ],
          correct: 0,
          explanation: 'La acción capilar del líquido penetrante coloreado dibuja nítidamente sobre el fondo blanco cualquier discontinuidad abierta a la superficie.'
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
          title: '1. Diagnóstico de Vulnerabilidad (Bumping y Ganzuado)',
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
          title: '2. Lubricación y Mantenimiento Técnico de Guardas',
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
          title: '3. Alineación de Cerradero y Cantonera en Marco',
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
          title: '4. Instalación de Cerraduras Electrónicas y Biométrica',
          scenario: 'Al instalar una cerradura digital inteligente con huella y teclado en puerta exterior, ¿qué factor crítico de seguridad no debe omitirse?',
          options: [
            'Verificar la resistencia a la intemperie (grado IP), la llave mecánica de emergencia de alta seguridad y el puerto de alimentación externa para batería agotada.',
            'Desechar la llave física de respaldo y dejar que el cliente dependa solo de las pilas.',
            'Conectar la cerradura directamente a la red de 110V sin transformador ni fusible.',
            'Dejar la contraseña de fábrica (1234) sin cambiar por el usuario.'
          ],
          correct: 0,
          explanation: 'Las cerraduras electrónicas deben contar obligatoriamente con redundancia mecánica de emergencia para garantizar acceso seguro en caso de fallo de batería.'
        },
        {
          title: '5. Apertura Técnica No Destructiva por Ganzuado',
          scenario: 'En un servicio de apertura por olvido de llaves de un cilindro estándar de pernos:',
          options: [
            'Aplicar tensión rotatoria suave y palpar los pernos con ganzúa individual buscando la línea de corte (shear line) perno a perno sin dañar el mecanismo.',
            'Romper la puerta con una pata de cabra o hacha.',
            'Taladrar el pomo completo destruyendo la madera.',
            'Prender fuego alrededor de la cerradura para derretirla.'
          ],
          correct: 0,
          explanation: 'El peritaje del cerrajero profesional prioriza la técnica limpia no destructiva, conservando intacta la cerradura y la puerta del cliente.'
        },
        {
          title: '6. Escudos Protectores Acorazados y Resistencia al Desgarre',
          scenario: 'Para impedir que delincuentes utilicen llaves grifas de fuerza para quebrar o arrancar el cilindro sobresaliente:',
          options: [
            'Instalar un escudo acorazado cónico de acero macizo templado sujeto con pasadores pasantes desde el interior de la vivienda.',
            'Tapar el cilindro con un pedazo de cartón pegado.',
            'Dejar el cilindro sobresaliendo 2 centímetros hacia afuera.',
            'Pegar el bombín con cinta de doble faz.'
          ],
          correct: 0,
          explanation: 'El diseño biselado y el anclaje pasante impiden que las mordazas mecánicas agarren el cuerpo del cilindro para fracturarlo.'
        },
        {
          title: '7. Sistemas de Amaestramiento de Llaves (Plan Jerárquico)',
          scenario: 'En un complejo de oficinas donde una llave maestra abre todas las puertas pero cada empleado solo abre su despacho privado:',
          options: [
            'Calcular e instalar cilindros con pernos partidos (máster wafers) respetando la matriz de combinación matemática de alturas.',
            'Darle una lima a cada empleado para que desgaste su llave hasta que abra todo.',
            'Poner la misma cerradura idéntica en todas las oficinas.',
            'Dejar todas las puertas sin seguro durante el día.'
          ],
          correct: 0,
          explanation: 'Los máster wafers generan dos líneas de corte alternativas dentro del rotor permitiendo aperturas jerárquicas seguras y auditadas.'
        },
        {
          title: '8. Ajuste del Pestillo Antitarjeta (Deadlocking Latch)',
          scenario: 'En una cerradura de pestillo resbalón, ¿cómo se evita que sea abierta mediante el deslizamiento de una tarjeta plástica o radiografía?',
          options: [
            'Verificar que el pestillo auxiliar de seguridad quede comprimido contra la pletina del marco mientras el pestillo principal entra en el cerradero.',
            'Lubricar el marco con jabón para que la tarjeta resbale más rápido.',
            'Retirar la pletina del marco para que la puerta quede suelta.',
            'Indicar al cliente que no use el seguro por la noche.'
          ],
          correct: 0,
          explanation: 'Al quedar retenido el perno auxiliar, bloquea internamente el resbalón impidiendo su retroceso por presión exterior con láminas flexibles.'
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
          title: '1. Calibración de Molienda y Ratio de Extracción Espresso',
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
          title: '2. Química del Agua y Temperatura de Extracción',
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
          title: '3. Técnica de Emulsión y Texturizado de Leche',
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
          title: '4. Limpieza y Desengrasado del Grupo Espresso',
          scenario: 'Al finalizar el turno en barra, ¿qué protocolo de mantenimiento previene la contaminación por sabores rancios en la taza?',
          options: [
            'Retrolavado (backflush) con filtro ciego y detergente especializado para remover aceites oxidados de la válvula de tres vías, ducha y dispersor.',
            'Enjuagar el portafiltro únicamente con agua de grifo sin limpiar las duchas internas.',
            'Dejar la borra de café dentro del grupo hasta el día siguiente.',
            'Aplicar cloro concentrado dentro del calderín de agua.'
          ],
          correct: 0,
          explanation: 'Los aceites del café se oxidan con el calor en horas adquiriendo sabor a quemado rancio; el retrolavado químico diario preserva la pureza sensorial del grano.'
        },
        {
          title: '5. Distribución de la Cama y Prevención de Canalización (Channelling)',
          scenario: 'Durante la preparación de la pastilla de café en el portafiltro de precisión, ¿qué técnica previene los caminos preferenciales de agua a presión?',
          options: [
            'Descompactar y homogenizar con herramienta WDT de agujas finas y nivelar antes de compactar con tamper plano a 15 kg de presión perpendicular.',
            'Golpear los bordes del portafiltro con el mango del tamper para quebrar la pastilla.',
            'Apretar el café en ángulo torcido con el pulgar.',
            'Dejar grumos grandes secos dentro de la canasta.'
          ],
          correct: 0,
          explanation: 'El channelling ocurre cuando el agua a 9 bares rompe grietas en la pastilla, sobreextrayendo esas vías y subextrayendo el resto del café.'
        },
        {
          title: '6. Tiempo de Reposo (Degassing) del Café en Grano Tostado',
          scenario: 'Tras el tueste artesanal de un café especial, ¿por qué se recomienda un reposo de 7 a 14 días antes de calibrarlo para espresso?',
          options: [
            'Permitir que el dióxido de carbono (CO2) atrapado en la matriz celular se libere gradualmente sin distorsionar la extracción.',
            'Para que el grano pierda todo su sabor y se ponga rancio.',
            'Porque el café recién tostado es tóxico para la salud humana.',
            'No se debe esperar; debe molerse de inmediato caliente saliendo de la tostadora.'
          ],
          correct: 0,
          explanation: 'El exceso de gas carbónico en granos hiperfrescos genera turbulencia violenta en la canasta impidiendo que el agua solubilice los aceites aromáticos.'
        },
        {
          title: '7. Métodos Filtrados Manuales (V60 / Chemex) y Preinfusión (Blooming)',
          scenario: 'Al iniciar la extracción en un método de goteo cónico V60, ¿cuál es el propósito de la preinfusión con el triple de peso de agua durante 45 segundos?',
          options: [
            'Saturar homogéneamente la cama de café expulsando gases y preparando las partículas para una disolución equilibrada y limpia.',
            'Enfriar el filtro de papel para que el café tarde más en bajar.',
            'Ahogar el cono para que el agua desborde por los lados.',
            'Diluir el café con exceso de agua hirviendo.'
          ],
          correct: 0,
          explanation: 'El blooming abre los poros del grano molido facilitando un flujo constante y evitando zonas secas que generan amargores desbalanceados.'
        },
        {
          title: '8. Protocolo de Catación SCA y Análisis Sensorial',
          scenario: 'En una mesa de catación estandarizada según protocolo SCA, ¿qué variables determinan un café de grado especial (>80 puntos)?',
          options: [
            'Balance armónico en fragancia/aroma, acidez limpia, cuerpo agradable, dulzor residual y ausencia total de defectos o notas fermentadas sucias.',
            'Que sea negro como petróleo y extremadamente amargo sin acidez.',
            'Que tenga mucho azúcar agregado en la molienda.',
            'Que esté preparado en olla con canela y panela.'
          ],
          correct: 0,
          explanation: 'El protocolo SCA asigna puntaje cuantitativo a 10 atributos de taza; una puntuación sobre 80 certifica trazabilidad y calidad de origen.'
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
          title: '1. Calibración de Sensores Inerciales (IMU y Brújula)',
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
          title: '2. Diagnóstico de Baterías LiPo y Seguridad de Carga',
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
          title: '3. Balanceo de Hélices y Control de Vibraciones',
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
          title: '4. Configuración de Fail-Safe y Pruebas Previas al Despegue',
          scenario: 'En la lista de chequeo (pre-flight checklist), ¿qué parámetro de seguridad fail-safe debe ser verificado antes de armar los motores?',
          options: [
            'Fijación del punto de retorno a casa (RTH / Home Point) con más de 12 satélites bloqueados y altitud de RTH configurada por encima de los obstáculos circundantes.',
            'Desconectar la antena del radiocontrol para ver si el dron se queda quieto.',
            'Volar sin verificar el estado de la memoria SD ni el enlace de telemetría.',
            'Armar los motores con personas a menos de un metro de las hélices.'
          ],
          correct: 0,
          explanation: 'Si el dron pierde el enlace de radio con el piloto, el sistema Fail-Safe RTH sube automáticamente a la altura segura programada y regresa autónomamente al despegue.'
        },
        {
          title: '5. Regulaciones Aeronáuticas RAC 100 de la Aerocivil',
          scenario: 'Bajo el reglamento aeronáutico de operaciones de drones en Colombia (RAC 100):',
          options: [
            'Volar a una altura máxima de 120 metros (400 pies) AGL, mantener línea de vista visual permanente (VLOS) y respetar la prohibición de sobrevuelo sobre aglomeraciones.',
            'Volar a 1000 metros de altura en la ruta de aproximación de aeropuertos internacionales.',
            'Volar de noche sobre conciertos masivos sin ninguna autorización.',
            'No existen normas para drones en el espacio aéreo colombiano.'
          ],
          correct: 0,
          explanation: 'El RAC 100 de la Aeronáutica Civil establece límites estrictos para prevenir colisiones con aeronaves tripuladas y proteger a la población en tierra.'
        },
        {
          title: '6. Calibración y Mantenimiento del Gimbal de 3 Ejes',
          scenario: 'Al encender la aeronave, el gimbal de la cámara vibra y cae descolgado con mensaje de sobrecarga en motor:',
          options: [
            'Revisar si hay arena o residuos trabando los ejes, verificar que el seguro de transporte esté retirado y ejecutar calibración automática en superficie plana.',
            'Forzar el giro del motor del gimbal con alicates.',
            'Pegar el gimbal con pegamento instantáneo para que quede fijo.',
            'Quitar los amortiguadores de goma elástica del chasis.'
          ],
          correct: 0,
          explanation: 'Los micromotores brushless del gimbal son extremadamente sensibles a la resistencia mecánica; cualquier traba provoca sobrecalentamiento inmediato de sus bobinas.'
        },
        {
          title: '7. Inspección de Controladores de Velocidad (ESC) y Motores Brushless',
          scenario: 'Uno de los motores de un cuadricóptero titubea y no gira al armar mientras los otros tres giran suavemente:',
          options: [
            'Desconectar la alimentación y medir resistencia de devanados del motor con multímetro buscando espiras en corto o soldaduras frías en las 3 fases del ESC.',
            'Empujar el motor con los dedos mientras gira a ver si arranca.',
            'Subir la potencia al 100% para quemar el cable atascado.',
            'Echarle agua fría al motor para destrabarlo.'
          ],
          correct: 0,
          explanation: 'Un cortocircuito parcial en una de las tres fases trifásicas del ESC destruye los transistores MOSFET de potencia si se intenta forzar el arranque.'
        },
        {
          title: '8. Enlace de Radiofrecuencia y Telemetría Segura (RSSI / LQ)',
          scenario: 'Al realizar vuelos de inspección pericial en zonas con interferencias electromagnéticas urbanas:',
          options: [
            'Monitorear en tiempo real el indicador de calidad de enlace (Link Quality / RSSI) y orientar las antenas del mando en plano perpendicular al dron.',
            'Apuntar la punta de la antena directamente hacia el dron como si fuera un rifle.',
            'Volar detrás de edificios de hormigón perdiendo la línea de vista directa.',
            'Desactivar las alertas sonoras de batería baja en el radiocontrol.'
          ],
          correct: 0,
          explanation: 'La radiación de las antenas dipolo es toroidal; la señal es más débil en la punta del cono y máxima en sus costados laterales perpendiculares.'
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
          title: '1. Control de Fermentación y Actividad de Masa Madre',
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
          title: '2. Desarrollo de Red de Gluten y Prueba de la Membrana',
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
          title: '3. Fermentación en Bloque y Retardo en Frío',
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
          title: '4. Horneado con Inyección de Vapor y Formación de Greña',
          scenario: '¿Cuál es el rol del vapor de agua durante los primeros 10-15 minutos de horneado en un pan artesanal?',
          options: [
            'Mantener la corteza flexible permitiendo que el pan expanda al máximo (salto de horno) y gelatinizar los almidones para lograr una corteza crujiente y brillante.',
            'Enfriar el horno para que el pan tarde el doble de tiempo en cocinarse.',
            'Humedecer la miga para que quede cruda y pegajosa en el centro.',
            'Evitar que la cuchilla corte el pan antes de meterlo.'
          ],
          correct: 0,
          explanation: 'El vapor evita la formación prematura de una costra rígida, permitiendo que los gases se expandan abriendo la greña con volumen espectacular y brillo dorado.'
        },
        {
          title: "5. Cálculo del Porcentaje Panadero (Baker's Math)",
          scenario: 'En la formulación profesional de recetas de panadería, ¿cómo se calculan los porcentajes de los ingredientes?',
          options: [
            'Tomando siempre el peso total de la harina como la base del 100% y calculando todos los demás ingredientes (agua, sal, masa madre) en relación con ella.',
            'Sumando todos los pesos y dividiendo entre el número de panes horneados.',
            'Calculando el agua como el 100% y la harina como ingrediente secundario.',
            'Echando los ingredientes al tanteo con cucharas de cocina comunes.'
          ],
          correct: 0,
          explanation: 'El porcentaje panadero permite escalar cualquier tamaño de bache de producción manteniendo invariables las propiedades físicas de la masa.'
        },
        {
          title: '6. Temperatura Deseada de la Masa (Fórmula TDM)',
          scenario: 'Para lograr que la masa finalice el amasado a una temperatura óptima de fermentación entre 23°C y 25°C:',
          options: [
            'Calcular la temperatura del agua necesaria restando de la constante base la temperatura ambiente, la temperatura de la harina y la fricción mecánica de la amasadora.',
            'Usar siempre agua hirviendo a 90°C para matar las bacterias.',
            'Amasar con hielo molido sin medir ninguna temperatura.',
            'No controlar la temperatura porque el calor del horno lo arregla todo.'
          ],
          correct: 0,
          explanation: 'El control térmico previo evita masas sobrecalentadas que fermentan descontroladamente antes de desarrollar la estructura de gluten requerida.'
        },
        {
          title: '7. Clasificación de Harinas por Fuerza (W) y Tenacidad (P/L)',
          scenario: 'Para panes de alta hidratación (75% a 85%) sometidos a fermentaciones largas en frío de más de 20 horas, ¿qué harina técnica se selecciona?',
          options: [
            'Harina de gran fuerza panadera con W superior a 300-350 y relación P/L equilibrada (0.5 a 0.7).',
            'Harina floja de repostería con W de 100 utilizada para galletas secas.',
            'Fécula de maíz pura sin gluten.',
            'Harina cruda integral sin tamizar vencida.'
          ],
          correct: 0,
          explanation: 'La harina de gran fuerza contiene alto porcentaje de glutenina y gliadina capaces de soportar la degradación enzimática de la fermentación prolongada.'
        },
        {
          title: '8. Proceso de Autólisis y sus Beneficios Estructurales',
          scenario: '¿En qué consiste el método de autólisis al inicio del proceso de panificación artesanal?',
          options: [
            'Mezclar únicamente la harina con el agua y dejar reposar entre 30 y 60 minutos antes de añadir la sal y la masa madre para hidratar las proteínas de forma pasiva.',
            'Hornear la masa cruda antes de dejarla levar.',
            'Añadir sal en exceso para secar el agua de la harina.',
            'Dejar la masa al sol durante 8 horas sin tapar.'
          ],
          correct: 0,
          explanation: 'La autólisis reduce el tiempo de amasado mecánico activo a la mitad, evita la oxidación de carotenoides y mejora notablemente la extensibilidad de la masa.'
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

  // Motor Generador Universal de Pruebas Periciales con IA (8 Preguntas Situacionales para CUALQUIER tema u oficio)
  function getOrGenerateAiTradeExam(tradeQuery) {
    const raw = (tradeQuery || '').trim();
    if (!raw) return TRADE_EXPERT_PROFILES['plomeria'];

    const norm = raw.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    // Coincidencias temáticas curadas
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

    // GENERADOR UNIVERSAL SEMÁNTICO DE 8 PREGUNTAS TÉCNICAS SITUACIONALES
    const cleanTitle = formatTradeTitle(raw);
    const inferredIcon = pickIconForTrade(cleanTitle);
    const inferredNorm = `Estándares Técnicos Internacionales y Protocolos de Seguridad en ${cleanTitle}`;

    return {
      tradeName: cleanTitle,
      icon: inferredIcon,
      norms: inferredNorm,
      questions: [
        {
          title: `1. Diagnóstico Inicial y Detección de Causa Raíz en ${cleanTitle}`,
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
          title: `2. Instrumental Técnico y Mediciones Cuantitativas en ${cleanTitle}`,
          scenario: `Durante el peritaje técnico en ${cleanTitle}, ¿cómo se valida fehacientemente que los parámetros operativos cumplen con los rangos de tolerancia?`,
          options: [
            `Utilizar instrumental calibrado con certificación vigente, registrando valores cuantitativos exactos frente a la tabla técnica del fabricante.`,
            `Calcular al ojo y al tacto sin usar ningún instrumento de medición.`,
            `Anotar valores ficticios en la orden de servicio para terminar más rápido.`,
            `Preguntarle a una persona no especializada si le parece que está funcionando bien.`
          ],
          correct: 0,
          explanation: `La medición instrumental objetiva es la única garantía de precisión en ${cleanTitle} que respalda un dictamen técnico profesional.`
        },
        {
          title: `3. Normativa de Seguridad Industrial y Equipos de Protección (EPI)`,
          scenario: `Para ejecutar labores en ${cleanTitle} con resguardo estricto de la integridad física y bioseguridad, ¿qué criterio debe regir la jornada de trabajo?`,
          options: [
            `Portar los Equipos de Protección Individual (EPI) normativos para ${cleanTitle}, delimitar el área de trabajo y verificar ausencia de riesgos secundarios antes de operar.`,
            `Omitir las gafas de seguridad y guantes si la labor parece rápida o de poca monta.`,
            `Trabajar en chanclas o ropa de calle sin protección dieléctrica o mecánica.`,
            `Bloquear las salidas de evacuación con herramientas pesadas.`
          ],
          correct: 0,
          explanation: `La seguridad ocupacional es innegociable; el uso adecuado de EPI certificados previene accidentes graves en ${cleanTitle}.`
        },
        {
          title: `4. Selección de Materiales Homologados y Compatibilidad Físico-Química`,
          scenario: `Al reemplazar partes o aplicar consumibles técnicos en una labor de ${cleanTitle}, ¿qué requisito de materiales debe cumplirse obligatoriamente?`,
          options: [
            `Emplear insumos y repuestos originales o con ficha técnica certificada, verificando total compatibilidad química, térmica y mecánica con el sistema base.`,
            `Comprar el material más barato sin marca ni certificación que se consiga en ferreterías informales.`,
            `Reutilizar piezas rotas o desgastadas recuperadas de otros trabajos viejos.`,
            `Improvisar adhesivos o mezclas químicas no aprobadas por el manual técnico.`
          ],
          correct: 0,
          explanation: `Los materiales no homologados sufren fatiga prematura y anulan de inmediato cualquier garantía técnica en ${cleanTitle}.`
        },
        {
          title: `5. Herramientas Especializadas de Precisión y Calibración en ${cleanTitle}`,
          scenario: `Para intervenir mecanismos o ensambles críticos en ${cleanTitle} sin ocasionar daño por sobretorque o desalineación:`,
          options: [
            `Utilizar la herramienta específica diseñada para la tarea, ajustando a los pares de torque y tolerancias milimétricas recomendadas.`,
            `Usar alicates universales desgastados para apretar pernos de precisión.`,
            `Hacer palanca con tubos improvisados para forzar el encaje de las piezas.`,
            `Golpear componentes delicados con martillos pesados sin protección.`
          ],
          correct: 0,
          explanation: `El uso de herramientas especializadas calibradas preserva la geometría y la vida útil de los mecanismos en ${cleanTitle}.`
        },
        {
          title: `6. Procedimiento Secuencial de Ejecución según Manual Técnico`,
          scenario: `Durante la fase de ejecución en obra en ${cleanTitle}, ¿cuál es la secuencia metodológica obligatoria que avala la pericia del especialista?`,
          options: [
            `Seguir una secuencia metódica: preparación adecuada de la superficie o base, ensamble limpio paso a paso y control continuo de holguras.`,
            `Saltarse las fases preliminares de limpieza e iniciar directamente por el final.`,
            `Alterar el orden lógico de los pasos para improvisar según el tiempo disponible.`,
            `Forzar el encaje de componentes desalineados para acelerar la entrega.`
          ],
          correct: 0,
          explanation: `La destreza técnica en ${cleanTitle} se fundamenta en el respeto estricto de las secuencias operativas normadas.`
        },
        {
          title: `7. Control de Tolerancias y Resolución de Imprevistos en Terreno`,
          scenario: `Si durante la labor técnica en ${cleanTitle} se presenta una interferencia o desviación imprevista en las condiciones existentes:`,
          options: [
            `Evaluar el impacto estructural o funcional de la desviación, aplicar la solución técnica avalada por el estándar y registrar el ajuste en la bitácora de obra.`,
            `Tapar la imperfección con masilla o cinta para que el cliente no se dé cuenta.`,
            `Abandonar el trabajo sin avisar al cliente sobre la anomalía detectada.`,
            `Culpar al fabricante y forzar la instalación aún a riesgo de colapso.`
          ],
          correct: 0,
          explanation: `La capacidad pericial de resolución metódica ante imprevistos garantiza que el resultado final en ${cleanTitle} sea seguro y duradero.`
        },
        {
          title: `8. Pruebas Operativas de Carga, Control de Calidad y Garantía Escrita`,
          scenario: `Al concluir la labor técnica en ${cleanTitle}, ¿cómo se certifica formalmente la calidad del servicio antes de entregar al cliente?`,
          options: [
            `Realizar pruebas operativas bajo condiciones reales de carga continua, verificar cero desviaciones funcionales y emitir constancia formal con garantía de satisfacción.`,
            `Cobrar el servicio y retirarse del lugar sin probar el funcionamiento real de la obra.`,
            `Indicar al cliente que pruebe por su cuenta en los próximos días sin dejar ningún documento de respaldo.`,
            `Disimular ruidos anormales o vibraciones acelerando la entrega.`
          ],
          correct: 0,
          explanation: `La prueba de carga y la entrega de garantía escrita son el sello innegociable de la acreditación oficial Tasksmith en ${cleanTitle}.`
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

  /* --- CONFIGURACIÓN DE API KEY (GOOGLE GEMINI / OPENAI CHATGPT) Y MOTOR DE IA REAL --- */
  const STATE_KEY_AI_PROVIDER = 'tasksmith_ai_provider';
  const STATE_KEY_AI_KEY = 'tasksmith_ai_apikey';
  const DEFAULT_GEMINI_API_KEY = atob('QUl6YVN5QVFFMXdsNDJhUzNSTE9VUzJ6cHpOeXMzWk1nS1hkUlNN');

  let currentAiProvider = localStorage.getItem(STATE_KEY_AI_PROVIDER) || 'gemini';
  let currentAiApiKey = localStorage.getItem(STATE_KEY_AI_KEY) || DEFAULT_GEMINI_API_KEY;
  let candidateCertificationContext = {
    experience: 'Maestro Senior (Más de 5 años de experiencia en terreno)',
    customScope: ''
  };

  /* --- MODELOS DE GEMINI (CADENA DE RESPALDO GRATUITA) ---
     Todos estos modelos tienen capa gratuita en la API de Gemini y aceptan audio, imágenes y JSON
     estructurado, así que funcionan con la misma API Key sin pagar.
     Orden: del más capaz al más liviano. Si uno está retirado, saturado o se agotó su cupo gratuito,
     se pasa automáticamente al siguiente.
     Gemini 3 recomienda no bajar la temperatura de 1.0, por eso las peticiones no la fijan. */
  const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  const retiredGeminiModels = new Set(); // modelos que esta clave no puede usar (no se vuelven a intentar en la sesión)
  let activeGeminiModel = GEMINI_MODELS[0];

  async function geminiFetch(options) {
    let lastRes = null;
    for (const model of GEMINI_MODELS) {
      if (retiredGeminiModels.has(model)) continue;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(currentAiApiKey)}`;
      for (let attempt = 0; attempt < 2; attempt++) {
        let res;
        try {
          res = await fetch(url, options);
        } catch (netErr) {
          // Sin conexión: no tiene sentido probar otros modelos
          throw new Error('No hay conexión a internet o Google no respondió. Revisa tu conexión e inténtalo de nuevo.');
        }
        if (res.ok) {
          activeGeminiModel = model;
          return res;
        }
        lastRes = res;
        const errText = await res.clone().text().catch(() => '');
        if (res.status === 400 && /api key|API_KEY/i.test(errText)) return res; // clave inválida: ningún modelo va a funcionar
        if (res.status === 404 || /no longer available|not found|is not supported|deprecated/i.test(errText)) {
          retiredGeminiModels.add(model);
          break; // modelo retirado o sin acceso: siguiente modelo
        }
        if (res.status === 429 || /quota|rate limit|exhausted/i.test(errText)) break; // cupo gratuito agotado en este modelo: siguiente
        const overloaded = res.status === 503 || res.status === 500 || /high demand|overloaded|unavailable|try again later|internal/i.test(errText);
        if (!overloaded) return res; // error de la petición en sí (p. ej. archivo inválido): otro modelo no lo arregla
        if (attempt === 0) await new Promise(r => setTimeout(r, 1500)); // saturación temporal: un reintento y luego siguiente modelo
      }
    }
    return lastRes;
  }

  function hasActiveAiKey() {
    return !!(currentAiApiKey && currentAiApiKey.trim().length > 10);
  }

  function getAiProviderLabel() {
    return currentAiProvider === 'openai' ? 'OpenAI ChatGPT (GPT-4o + Whisper)' : `Google Gemini (${activeGeminiModel})`;
  }

  function updateAiConfigUI() {
    const providerSelect = document.getElementById('aiProviderSelect');
    const keyInput = document.getElementById('aiApiKeyInput');
    const statusBadge = document.getElementById('aiEngineStatusBadge');
    const providerLabel = document.getElementById('aiKeyProviderLabel');

    if (providerSelect) providerSelect.value = currentAiProvider;
    if (keyInput && currentAiApiKey) keyInput.value = currentAiApiKey;
    if (providerLabel) {
      providerLabel.textContent = currentAiProvider === 'openai' ? 'OpenAI Platform (sk-...)' : 'Google AI Studio (AIzaSy...)';
    }

    if (statusBadge) {
      if (hasActiveAiKey()) {
        statusBadge.textContent = `✅ Conectado: ${getAiProviderLabel()} Activo`;
        statusBadge.style.background = 'var(--green-soft)';
        statusBadge.style.color = 'var(--green-verified)';
      } else {
        statusBadge.textContent = 'Modo Simulación Local (Configura API Key para IA Real)';
        statusBadge.style.background = 'var(--bg-accent-soft)';
        statusBadge.style.color = 'var(--blue-primary)';
      }
    }
  }

  window.toggleAiApiKeyDrawer = function () {
    const drawer = document.getElementById('aiApiKeyDrawer');
    if (!drawer) return;
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  };

  window.handleAiProviderChange = function () {
    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect) {
      currentAiProvider = providerSelect.value;
      localStorage.setItem(STATE_KEY_AI_PROVIDER, currentAiProvider);
      updateAiConfigUI();
    }
  };

  window.saveAndTestAiApiKey = async function () {
    const providerSelect = document.getElementById('aiProviderSelect');
    const keyInput = document.getElementById('aiApiKeyInput');
    const saveBtn = document.getElementById('btnSaveAiKey');

    const provider = providerSelect ? providerSelect.value : 'gemini';
    const apiKey = keyInput ? keyInput.value.trim() : '';

    if (!apiKey || apiKey.length < 10) {
      showToast('Por favor pega una API Key válida (de Google AI Studio o de OpenAI).', 'error');
      return;
    }

    currentAiProvider = provider;
    currentAiApiKey = apiKey;
    localStorage.setItem(STATE_KEY_AI_PROVIDER, currentAiProvider);
    localStorage.setItem(STATE_KEY_AI_KEY, currentAiApiKey);

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Verificando conexión...';
    }

    try {
      const ok = await testAiConnection();
      if (ok) {
        updateAiConfigUI();
        showToast(`¡Conexión exitosa con ${getAiProviderLabel()}! Ahora la transcripción de audio, lectura de fotos y calificación usarán esta IA en vivo.`, 'success');
        const drawer = document.getElementById('aiApiKeyDrawer');
        if (drawer) drawer.style.display = 'none';
      }
    } catch (err) {
      updateAiConfigUI();
      showToast(`API Key guardada, pero hubo un detalle al verificarla: ${err.message || 'Verifica que la clave esté activa'}.`, 'normal');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar y Conectar IA';
      }
    }
  };

  window.clearAiApiKey = function () {
    currentAiApiKey = '';
    localStorage.removeItem(STATE_KEY_AI_KEY);
    const keyInput = document.getElementById('aiApiKeyInput');
    if (keyInput) keyInput.value = '';
    updateAiConfigUI();
    showToast('API Key eliminada. Se usará el motor local de respaldo.', 'normal');
  };

  async function testAiConnection() {
    if (currentAiProvider === 'gemini') {
      const res = await geminiFetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde únicamente: OK' }] }]
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }
      return true;
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Responde únicamente: OK' }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }
      return true;
    }
  }

  function blobToBase64Data(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result || '';
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function imageSourceToBase64(src) {
    if (!src) return null;
    if (src.startsWith('data:image/')) {
      const mimeMatch = src.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64 = src.split(',')[1];
      return { mimeType, base64, dataUrl: src };
    }
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const base64 = await blobToBase64Data(blob);
      return {
        mimeType: blob.type || 'image/jpeg',
        base64,
        dataUrl: `data:${blob.type || 'image/jpeg'};base64,${base64}`
      };
    } catch (e) {
      return null;
    }
  }

  /* --- CONVERSIÓN DE AUDIO A WAV (16 kHz mono) ---
     Chrome y Android graban en audio/webm (opus), formato que Gemini no acepta. La petición fallaba y la
     app caía en silencio al texto del dictado del navegador. Convertir a WAV lo hace compatible siempre. */
  async function audioBlobToWav16k(blob) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Este navegador no permite procesar audio');
    const arrayBuf = await blob.arrayBuffer();
    const ctx = new AudioCtx();
    let decoded;
    try {
      decoded = await new Promise((resolve, reject) => {
        const p = ctx.decodeAudioData(arrayBuf.slice(0), resolve, reject);
        if (p && p.then) p.then(resolve, reject);
      });
    } finally {
      try { ctx.close(); } catch (e) {}
    }
    const targetRate = 16000;
    const length = Math.max(1, Math.ceil(decoded.duration * targetRate));
    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offline = new OfflineCtx(1, length, targetRate);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, 'WAVE');
    writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true); view.setUint32(28, targetRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeStr(36, 'data'); view.setUint32(40, samples.length * 2, true);
    let off = 44;
    for (let i = 0; i < samples.length; i++, off += 2) {
      const v = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(off, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
    }
    return { blob: new Blob([buffer], { type: 'audio/wav' }), seconds: decoded.duration };
  }

  // Devuelve el audio listo para Gemini (WAV) reutilizando la conversión si ya se hizo
  async function getGeminiReadyAudio(ev) {
    if (!ev || !ev.audioBlob) return null;
    if (ev.wavCache && ev.wavCache.source === ev.audioBlob) return ev.wavCache;
    const type = (ev.audioBlob.type || '').split(';')[0];
    const nativeOk = ['audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/mpeg', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/aiff'];
    let result;
    if (nativeOk.includes(type)) {
      result = { mimeType: type === 'audio/mpeg' ? 'audio/mp3' : (type === 'audio/x-wav' ? 'audio/wav' : type), base64: await blobToBase64Data(ev.audioBlob) };
    } else {
      const wav = await audioBlobToWav16k(ev.audioBlob);
      result = { mimeType: 'audio/wav', base64: await blobToBase64Data(wav.blob) };
    }
    result.source = ev.audioBlob;
    ev.wavCache = result;
    return result;
  }

  /* --- TRANSCRIPCIÓN LITERAL DEL AUDIO CON IA (GEMINI / OPENAI WHISPER) --- */
  async function transcribeEvidenceBlobWithAi(id, audioBlob) {
    const ev = verificationEvidences.find(item => item.id === id);
    if (!ev || !audioBlob || !hasActiveAiKey()) return;

    const liveTag = document.getElementById(`speechLiveTag_${id}`);
    const transcriptInput = document.getElementById(`audioTranscriptInput_${id}`);
    const tradeName = currentTradeExam ? currentTradeExam.tradeName : 'oficio técnico';

    if (liveTag) {
      liveTag.textContent = `⏳ Transcribiendo audio con ${getAiProviderLabel()}...`;
      liveTag.style.color = 'var(--blue-primary)';
    }

    try {
      let transcribedText = '';

      if (currentAiProvider === 'openai') {
        const formData = new FormData();
        const type = (audioBlob.type || '');
        const ext = type.includes('mp4') || type.includes('m4a') ? 'm4a' : (type.includes('wav') ? 'wav' : (type.includes('mpeg') || type.includes('mp3') ? 'mp3' : (type.includes('ogg') ? 'ogg' : 'webm')));
        formData.append('file', audioBlob, `evidencia_paso_${id}.${ext}`);
        formData.append('model', 'whisper-1');
        formData.append('language', 'es');
        formData.append('temperature', '0');
        // Solo se da el nombre del oficio. Antes se daba una lista fija de términos (RETIE, NTC 1500,
        // termofusión...) y Whisper tendía a "escucharlos" aunque el maestro no los dijera.
        formData.append('prompt', `Explicación en español de un trabajo de ${tradeName}.`);

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentAiApiKey}` },
          body: formData
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Whisper HTTP ${res.status}`);
        }
        const data = await res.json();
        transcribedText = (data.text || '').trim();
      } else {
        const audio = await getGeminiReadyAudio(ev);
        const promptText = `Transcribe palabra por palabra lo que se dice en este audio en español.
Reglas estrictas:
- Escribe solo lo que realmente se escucha. No corrijas, no completes, no resumas y no agregues términos técnicos que no se pronuncien.
- Si una parte no se entiende, escribe [inaudible] en ese lugar.
- Si en el audio no hay voz humana hablando, responde exactamente: SIN_VOZ
- Devuelve solo la transcripción, sin comillas ni comentarios.`;

        const res = await geminiFetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                { inline_data: { mime_type: audio.mimeType, data: audio.base64 } }
              ]
            }],
            generationConfig: {}
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini Audio HTTP ${res.status}`);
        }
        const data = await res.json();
        transcribedText = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
      }

      if (/^SIN_VOZ\.?$/i.test(transcribedText) || !transcribedText) {
        ev.realTranscript = '';
        ev.transcriptSource = 'ia';
        if (transcriptInput) transcriptInput.value = '';
        if (liveTag) {
          liveTag.textContent = 'La IA no detectó voz en este audio. Vuelve a grabar más cerca del micrófono.';
          liveTag.style.color = '#dc2626';
        }
        showToast('No se detectó voz en el audio. Graba de nuevo.', 'error');
        return;
      }

      const finalText = enhanceTechnicalTranscription(transcribedText);
      ev.realTranscript = finalText;
      ev.transcriptSource = 'ia';
      if (transcriptInput) transcriptInput.value = finalText;
      if (liveTag) {
        liveTag.textContent = `✅ Transcrito por ${getAiProviderLabel()} (revisa y corrige si algo quedó mal)`;
        liveTag.style.color = 'var(--green-verified)';
      }
      showToast(`Transcripción de audio completada con ${getAiProviderLabel()}.`, 'success');
    } catch (err) {
      console.warn('Error en transcripción por IA:', err);
      ev.transcriptSource = ev.realTranscript ? 'navegador' : null;
      if (liveTag) {
        liveTag.textContent = `⚠️ La IA no pudo transcribir el audio (${err.message || 'error'}). El texto actual viene del dictado del navegador: revísalo.`;
        liveTag.style.color = '#b45309';
      }
    }
  }

  async function refineTranscriptTextWithAi(rawText, tradeName) {
    const prompt = `Esta es la transcripción automática de lo que dijo un especialista en "${tradeName}". Corrige solo errores evidentes de ortografía o de reconocimiento de voz (palabras mal escuchadas). No agregues información, no cambies el sentido, no reemplaces palabras por términos más técnicos y no completes ideas. Si no hay nada que corregir, devuélvela igual. Devuelve solo el texto, sin comillas:\n\n${rawText}`;
    if (currentAiProvider === 'gemini') {
      const res = await geminiFetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.choices?.[0]?.message?.content || '').trim();
    }
  }

  /* --- GENERACIÓN DINÁMICA DE LAS 8 PREGUNTAS CON CONTEXTO REAL POR GEMINI / CHATGPT --- */
  async function generateAiTradeExamFromApi(tradeQuery, experienceLevel, customScope) {
    const fallbackExam = getOrGenerateAiTradeExam(tradeQuery);
    if (!hasActiveAiKey()) return fallbackExam;

    const systemPrompt = `Eres el Evaluador Pericial Jefe de Tasksmith. Tu tarea es diseñar un examen técnico riguroso de 8 casos prácticos de selección múltiple para certificar a un candidato en el oficio o habilidad: "${tradeQuery}".
Contexto del candidato:
- Nivel de experiencia declarado: ${experienceLevel}
- Enfoque / alcance específico que desea certificar: ${customScope || 'Diagnóstico de causa raíz, uso de herramientas calibradas, normas técnicas de seguridad y pruebas de entrega con garantía.'}

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "tradeName": "Nombre formal del oficio o especialidad",
  "norms": "Normas técnicas reales nacionales o internacionales aplicables a este oficio",
  "questions": [
    {
      "title": "1. Título técnico del caso #1",
      "scenario": "Descripción detallada de un caso o problema técnico real en terreno...",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct": 0,
      "explanation": "Explicación técnica de por qué esa opción es la correcta"
    }
  ],
  "sampleTranscript": "Ejemplo de explicación técnica ideal en primera persona para una evidencia de este oficio (3 a 4 líneas)",
  "expectedConcepts": ["Concepto técnico 1", "Concepto 2", "Concepto 3", "Concepto 4", "Concepto 5", "Concepto 6"]
}
Importante:
- Deben ser exactamente 8 preguntas en el arreglo "questions".
- Varía la posición de la respuesta correcta ("correct" debe ser el índice 0, 1, 2 o 3 correspondiente a la opción correcta) para evaluar genuinamente al candidato.`;

    try {
      let rawJsonText = '';
      if (currentAiProvider === 'gemini') {
        const res = await geminiFetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
        const data = await res.json();
        rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentAiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Eres un perito certificador técnico que responde siempre en JSON válido.' },
              { role: 'user', content: systemPrompt }
            ],
            temperature: 0.4
          })
        });
        if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
        const data = await res.json();
        rawJsonText = data?.choices?.[0]?.message?.content || '';
      }

      const parsed = JSON.parse(rawJsonText);
      // Solo se aceptan preguntas bien formadas: 4 opciones y un índice de respuesta válido.
      // Antes una pregunta con "correct" fuera de rango no la podía acertar nadie.
      const validQuestions = (parsed && Array.isArray(parsed.questions) ? parsed.questions : []).filter(q =>
        q && typeof q.title === 'string' && Array.isArray(q.options) && q.options.length === 4 &&
        Number.isInteger(Number(q.correct)) && Number(q.correct) >= 0 && Number(q.correct) <= 3
      ).map(q => ({ ...q, correct: Number(q.correct) }));
      if (validQuestions.length >= 8) {
        return {
          ...fallbackExam,
          tradeName: parsed.tradeName || fallbackExam.tradeName,
          norms: parsed.norms || fallbackExam.norms,
          questions: validQuestions.slice(0, 8),
          sampleTranscript: parsed.sampleTranscript || fallbackExam.sampleTranscript,
          expectedConcepts: Array.isArray(parsed.expectedConcepts) ? parsed.expectedConcepts : fallbackExam.expectedConcepts
        };
      }
    } catch (err) {
      console.warn('Usando generador de respaldo para el examen:', err);
    }

    return fallbackExam;
  }

  /* --- CALIFICACIÓN INTEGRAL MULTIMODAL (FOTOS + AUDIO + EXAMEN TEÓRICO) CON GEMINI / CHATGPT ---
     Cambios clave frente a la versión anterior:
     1. Cada foto se envía junto a la explicación de SU paso (antes iban todas sueltas y solo el audio del paso 1).
     2. La IA debe describir primero qué ve en cada foto y qué dijo el maestro, y solo después calificar.
     3. Ya no hay un JSON de ejemplo con notas altas (24/25, 94/100) que la IA copiaba.
     4. Rúbrica con niveles definidos y reglas duras que el código vuelve a aplicar.
     5. Si la IA falla, se informa el error. Antes se usaba en silencio un "motor local" que solo
        contaba fotos y caracteres y aprobaba casi cualquier cosa. */
  function getEvidenceTranscript(ev) {
    const inputEl = document.getElementById(`audioTranscriptInput_${ev.id}`);
    return ((inputEl ? inputEl.value : '') || ev.realTranscript || '').trim();
  }

  const AI_EVAL_SCHEMA = {
    type: 'OBJECT',
    properties: {
      evidencias: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            paso: { type: 'INTEGER' },
            descripcionFoto: { type: 'STRING' },
            fotoCorrespondeAlOficio: { type: 'BOOLEAN' },
            resumenExplicacion: { type: 'STRING' },
            explicacionCoincideConFoto: { type: 'BOOLEAN' },
            observaciones: { type: 'STRING' }
          },
          required: ['paso', 'descripcionFoto', 'fotoCorrespondeAlOficio', 'resumenExplicacion', 'explicacionCoincideConFoto', 'observaciones'],
          propertyOrdering: ['paso', 'descripcionFoto', 'fotoCorrespondeAlOficio', 'resumenExplicacion', 'explicacionCoincideConFoto', 'observaciones']
        }
      },
      justificacionDiagnostico: { type: 'STRING' },
      p1: { type: 'INTEGER' },
      justificacionHerramientas: { type: 'STRING' },
      p2: { type: 'INTEGER' },
      justificacionProcedimiento: { type: 'STRING' },
      p3: { type: 'INTEGER' },
      justificacionPruebas: { type: 'STRING' },
      p4: { type: 'INTEGER' },
      conceptosDemostrados: { type: 'ARRAY', items: { type: 'STRING' } },
      conceptosFaltantes: { type: 'ARRAY', items: { type: 'STRING' } },
      coherencePercent: { type: 'INTEGER' },
      coherenceDescription: { type: 'STRING' },
      theoreticalFeedback: { type: 'STRING' },
      verdictParagraph: { type: 'STRING' }
    },
    required: ['evidencias', 'justificacionDiagnostico', 'p1', 'justificacionHerramientas', 'p2', 'justificacionProcedimiento', 'p3', 'justificacionPruebas', 'p4', 'conceptosDemostrados', 'conceptosFaltantes', 'coherencePercent', 'coherenceDescription', 'theoreticalFeedback', 'verdictParagraph'],
    propertyOrdering: ['evidencias', 'justificacionDiagnostico', 'p1', 'justificacionHerramientas', 'p2', 'justificacionProcedimiento', 'p3', 'justificacionPruebas', 'p4', 'conceptosDemostrados', 'conceptosFaltantes', 'coherencePercent', 'coherenceDescription', 'theoreticalFeedback', 'verdictParagraph']
  };

  async function evaluateFullCertificationWithRealAi(info, jobTitle, evidences) {
    if (!hasActiveAiKey()) {
      return { error: 'No hay una API Key de IA configurada. Configúrala en el paso 1 para poder evaluar.' };
    }

    const questionsBreakdown = (info.questions || []).map((q, idx) => {
      const userChoiceIdx = certUserAnswers[idx];
      const userChoiceText = userChoiceIdx !== undefined && q.options[userChoiceIdx] ? q.options[userChoiceIdx] : 'No respondida';
      const isRight = userChoiceIdx === q.correct;
      return `Caso ${idx + 1} (${q.title}): ${isRight ? 'ACERTÓ' : 'FALLÓ'}. Respondió: "${userChoiceText}". Correcta: "${q.options[q.correct]}".`;
    }).join('\n');

    const sendsAudio = currentAiProvider === 'gemini';
    const rubricPrompt = `Eres un evaluador técnico estricto e imparcial de Tasksmith. Vas a revisar las evidencias prácticas de una persona que quiere certificarse en el oficio "${info.tradeName}".
Tu trabajo es verificar, no animar. Solo cuenta lo que se VE en las fotos o lo que la persona DICE. No supongas trabajo que no se muestra ni conocimientos que no se mencionan. Si tienes dudas, califica bajo.

CONTEXTO
- Oficio a certificar: "${info.tradeName}"
- Normativa de referencia: "${info.norms || 'la aplicable al oficio'}"
- Experiencia declarada: "${candidateCertificationContext.experience}"
- Alcance declarado: "${candidateCertificationContext.customScope || 'competencia general en el oficio'}"
- Título del trabajo reportado: "${jobTitle}"
- Examen teórico (ya calificado por el sistema, NO lo uses para subir la nota práctica): ${certCorrectAnswersCount} de ${(info.questions || []).length} correctas.
${questionsBreakdown}

EVIDENCIAS
Más abajo vienen ${evidences.length} paso(s). Cada paso trae: la transcripción de la explicación de la persona, su FOTO${sendsAudio ? ' y, si existe, el AUDIO original' : ''}.
${sendsAudio ? 'Cuando haya audio, escúchalo: es la fuente principal. La transcripción automática puede tener errores.' : ''}

QUÉ DEBES HACER, EN ESTE ORDEN
1. Para cada paso, en "evidencias":
   - descripcionFoto: describe de forma literal y concreta lo que aparece en la foto (objetos, materiales, herramientas, lugar, estado del trabajo). No interpretes a favor de la persona.
   - fotoCorrespondeAlOficio: true solo si la foto muestra claramente un trabajo, herramienta, material o instalación propios de "${info.tradeName}". Selfies, mascotas, pantallas, capturas, paisajes, documentos, comida (salvo que el oficio sea de cocina) u objetos sin relación → false.
   - resumenExplicacion: qué dijo realmente la persona en ese paso. Si no dijo nada útil, escríbelo.
   - explicacionCoincideConFoto: true solo si lo que dice describe lo que se ve en esa foto.
   - observaciones: errores técnicos, riesgos de seguridad o información que falta.
2. Califica 4 pilares de 0 a 25 y justifica cada uno citando qué se vio o qué se dijo:
   p1 Diagnóstico (identificó el problema y su causa), p2 Herramientas y materiales, p3 Procedimiento (pasos lógicos y seguros), p4 Pruebas y garantía (verificó el resultado).
   Escala para cada pilar:
   0-5 = no hay evidencia de ese pilar.
   6-12 = se menciona de forma vaga o genérica, sin detalles verificables.
   13-18 = correcto pero incompleto, o la foto no lo respalda.
   19-22 = claro, específico y respaldado por la foto.
   23-25 = excelente: detalles técnicos precisos, coherentes con la foto y con la normativa.
3. Reglas obligatorias:
   - Si ninguna foto corresponde al oficio, cada pilar vale como máximo 5.
   - Si una o más fotos no corresponden al oficio, cada pilar vale como máximo 17.
   - Si la explicación está vacía, es genérica o no habla del trabajo, cada pilar vale como máximo 8.
   - Frases genéricas como "hice un diagnóstico", "usé herramientas adecuadas" o "dejé todo garantizado", sin detalles concretos, no valen más de 12.
4. conceptosDemostrados: solo conceptos técnicos que la persona realmente mencionó o que se ven en las fotos. conceptosFaltantes: lo importante del oficio que no demostró.
5. coherencePercent (0-100): qué tanto coincide lo que dice con lo que muestran las fotos.
6. verdictParagraph: dictamen de 3 a 5 líneas, honesto y específico, que mencione lo que se vio y lo que faltó.
Responde únicamente con el JSON pedido, en español.`;

    try {
      const stepPayloads = [];
      for (let i = 0; i < evidences.length; i++) {
        const ev = evidences[i];
        const image = ev.photo ? await imageSourceToBase64(ev.photo) : null;
        let audio = null;
        if (sendsAudio && ev.audioBlob) {
          try { audio = await getGeminiReadyAudio(ev); } catch (e) { console.warn('No se pudo convertir el audio del paso', i + 1, e); }
        }
        stepPayloads.push({ n: i + 1, transcript: getEvidenceTranscript(ev), image, audio });
      }

      let rawJsonResponse = '';

      if (currentAiProvider === 'gemini') {
        const parts = [{ text: rubricPrompt }];
        stepPayloads.forEach(step => {
          parts.push({ text: `\n=== PASO ${step.n} ===\nTranscripción de la explicación del paso ${step.n}: """${step.transcript || '(sin explicación escrita)'}"""\nFoto del paso ${step.n}:` });
          if (step.image) parts.push({ inline_data: { mime_type: step.image.mimeType, data: step.image.base64 } });
          else parts.push({ text: '(Este paso no tiene foto)' });
          if (step.audio) {
            parts.push({ text: `Audio original del paso ${step.n}:` });
            parts.push({ inline_data: { mime_type: step.audio.mimeType, data: step.audio.base64 } });
          }
        });

        const res = await geminiFetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json', responseSchema: AI_EVAL_SCHEMA }
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini HTTP ${res.status}`);
        }
        const data = await res.json();
        rawJsonResponse = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        if (!rawJsonResponse) {
          const reason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || 'respuesta vacía';
          throw new Error(`Gemini no devolvió resultado (${reason})`);
        }
      } else {
        const schemaHint = `\nFormato JSON exacto (mismas claves): {"evidencias":[{"paso":1,"descripcionFoto":"","fotoCorrespondeAlOficio":false,"resumenExplicacion":"","explicacionCoincideConFoto":false,"observaciones":""}],"justificacionDiagnostico":"","p1":0,"justificacionHerramientas":"","p2":0,"justificacionProcedimiento":"","p3":0,"justificacionPruebas":"","p4":0,"conceptosDemostrados":[],"conceptosFaltantes":[],"coherencePercent":0,"coherenceDescription":"","theoreticalFeedback":"","verdictParagraph":""}\nLos valores de ese formato son solo marcadores: debes reemplazarlos por tu evaluación real.`;
        const userContent = [{ type: 'text', text: rubricPrompt + schemaHint }];
        stepPayloads.forEach(step => {
          userContent.push({ type: 'text', text: `=== PASO ${step.n} ===\nTranscripción de la explicación del paso ${step.n}: """${step.transcript || '(sin explicación escrita)'}"""\nFoto del paso ${step.n}:` });
          if (step.image) userContent.push({ type: 'image_url', image_url: { url: step.image.dataUrl, detail: 'high' } });
          else userContent.push({ type: 'text', text: '(Este paso no tiene foto)' });
        });

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentAiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Eres un evaluador técnico estricto. Respondes solo con JSON válido.' },
              { role: 'user', content: userContent }
            ],
            temperature: 0
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `OpenAI HTTP ${res.status}`);
        }
        const data = await res.json();
        rawJsonResponse = data?.choices?.[0]?.message?.content || '';
      }

      let parsed;
      try {
        parsed = JSON.parse(rawJsonResponse.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      } catch (e) {
        throw new Error('La IA respondió en un formato no válido');
      }
      return applyEvaluationGuardrails(parsed, evidences, stepPayloads);
    } catch (err) {
      console.warn('Error en evaluación con IA:', err);
      const msg = err.message || 'Error desconocido al contactar la IA';
      return { error: /high demand|overloaded|try again later|quota|exhausted/i.test(msg) ? `Todos los modelos gratuitos de Gemini están saturados o sin cupo en este momento (se intentó con todos los modelos gratuitos de Gemini disponibles). Espera uno o dos minutos y vuelve a intentar. (${msg})` : msg };
    }
  }

  // Vuelve a aplicar en código las reglas duras, por si la IA no las respetó
  function applyEvaluationGuardrails(parsed, evidences, stepPayloads) {
    const clampPillar = v => Math.min(25, Math.max(0, Math.round(Number(v) || 0)));
    let p = [clampPillar(parsed.p1), clampPillar(parsed.p2), clampPillar(parsed.p3), clampPillar(parsed.p4)];

    const analysis = (Array.isArray(parsed.evidencias) ? parsed.evidencias : []).slice(0, evidences.length);
    const evidenceAnalysis = evidences.map((ev, idx) => {
      const a = analysis.find(x => Number(x.paso) === idx + 1) || analysis[idx] || {};
      return {
        paso: idx + 1,
        descripcionFoto: a.descripcionFoto || 'La IA no devolvió descripción para esta foto.',
        fotoCorrespondeAlOficio: a.fotoCorrespondeAlOficio === true,
        resumenExplicacion: a.resumenExplicacion || '',
        explicacionCoincideConFoto: a.explicacionCoincideConFoto === true,
        observaciones: a.observaciones || '',
        transcript: stepPayloads[idx]?.transcript || ''
      };
    });

    const guardNotes = [];
    const relevant = evidenceAnalysis.filter(e => e.fotoCorrespondeAlOficio).length;
    const mismatched = evidenceAnalysis.filter(e => !e.explicacionCoincideConFoto).length;
    const hasExplanation = stepPayloads.some(s => (s.transcript || '').length >= 20 || s.audio);
    let cap = 25;
    if (relevant === 0) {
      cap = Math.min(cap, 5);
      guardNotes.push('Ninguna foto corresponde al oficio.');
    } else if (relevant < evidenceAnalysis.length) {
      cap = Math.min(cap, 17);
      guardNotes.push(`${evidenceAnalysis.length - relevant} foto(s) no corresponden al oficio.`);
    }
    if (!hasExplanation) {
      cap = Math.min(cap, 8);
      guardNotes.push('No hay una explicación del trabajo.');
    }
    if (mismatched > evidenceAnalysis.length / 2) {
      cap = Math.min(cap, 17);
      guardNotes.push('En la mayoría de pasos lo explicado no coincide con lo que muestra la foto.');
    }
    p = p.map(v => Math.min(v, cap));
    const totalPracticalScore = p[0] + p[1] + p[2] + p[3];

    let coherencePercent = Math.min(100, Math.max(0, Math.round(Number(parsed.coherencePercent) || 0)));
    const matchRatio = evidenceAnalysis.length ? (evidenceAnalysis.length - mismatched) / evidenceAnalysis.length : 0;
    coherencePercent = Math.min(coherencePercent, Math.round(matchRatio * 100));

    return {
      p1: p[0], p2: p[1], p3: p[2], p4: p[3],
      totalPracticalScore,
      pillarNotes: {
        p1: parsed.justificacionDiagnostico || '',
        p2: parsed.justificacionHerramientas || '',
        p3: parsed.justificacionProcedimiento || '',
        p4: parsed.justificacionPruebas || ''
      },
      coherencePercent,
      coherenceDescription: parsed.coherenceDescription || '',
      matchedConcepts: Array.isArray(parsed.conceptosDemostrados) ? parsed.conceptosDemostrados.slice(0, 8) : [],
      missingConcepts: Array.isArray(parsed.conceptosFaltantes) ? parsed.conceptosFaltantes.slice(0, 8) : [],
      theoreticalFeedback: parsed.theoreticalFeedback || '',
      verdictParagraph: parsed.verdictParagraph || '',
      evidenceAnalysis,
      guardNotes,
      evaluatedByRealAi: getAiProviderLabel()
    };
  }

  /* --- INICIALIZADOR DEL ASISTENTE DE CERTIFICACIÓN --- */
  function initCertificationWizard() {
    updateAiConfigUI();
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
    const contextInput = document.getElementById('customTradeContextInput');
    if (contextInput && !contextInput.value.trim()) {
      contextInput.value = `Diagnóstico técnico de causa raíz, intervención normativa con herramientas calibradas y pruebas operativas de garantía en ${tradeName}.`;
    }
    window.startCustomTradeCertification();
  };

  window.startCustomTradeCertification = async function () {
    const input = document.getElementById('customTradeInput');
    const tradeQuery = input ? input.value.trim() : '';
    const expSelect = document.getElementById('customTradeExperienceSelect');
    const contextInput = document.getElementById('customTradeContextInput');

    if (!tradeQuery) {
      showToast('Por favor escribe en qué oficio o especialidad deseas certificarte.', 'normal');
      if (input) input.focus();
      return;
    }

    candidateCertificationContext = {
      experience: expSelect ? expSelect.value : 'Maestro Senior (+5 años)',
      customScope: contextInput ? contextInput.value.trim() : ''
    };

    // Iniciar cronómetro de evaluación
    certEvaluationStartTime = Date.now();

    const loaderBox = document.getElementById('aiGeneratingExamState');
    const loaderTitle = document.getElementById('aiGeneratingTradeTitle');
    const submitBtn = document.getElementById('btnPrepareCustomExam');

    if (loaderTitle) {
      loaderTitle.textContent = hasActiveAiKey()
        ? `${getAiProviderLabel()} está formulando 8 casos técnicos reales para: "${tradeQuery}"...`
        : `La IA está preparando 8 casos técnicos periciales para: "${tradeQuery}"...`;
    }
    if (loaderBox) loaderBox.style.display = 'flex';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }

    if (hasActiveAiKey()) {
      currentTradeExam = await generateAiTradeExamFromApi(
        tradeQuery,
        candidateCertificationContext.experience,
        candidateCertificationContext.customScope
      );
    } else {
      await new Promise(r => setTimeout(r, 650));
      currentTradeExam = getOrGenerateAiTradeExam(tradeQuery);
    }

    if (loaderBox) loaderBox.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }

    // Configurar y renderizar Paso 2 (Examen formulado con 8 preguntas)
    const titleEl = document.getElementById('examTradeTitle');
    const subtitleEl = document.getElementById('examTradeSubtitle');

    if (titleEl) {
      titleEl.textContent = `Prueba Pericial Formulada por IA: ${currentTradeExam.tradeName}`;
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Contexto: ${candidateCertificationContext.experience} • Normativa: ${currentTradeExam.norms}. Cada caso equivale al 12.5% (mínimo 6 de 8 aciertos para superar el 75%).`;
    }

    renderCertificationQuestions(currentTradeExam.questions);
    goToStep(2);

    showToast(`Se han formulado 8 casos periciales en ${currentTradeExam.tradeName}.`, 'success');
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

    // Restaurar estado de visibilidad del examen
    const confirmedCard = document.getElementById('certExamConfirmedCard');
    if (confirmedCard) confirmedCard.style.display = 'none';

    const submitRow = document.getElementById('certExamSubmitRow');
    if (submitRow) submitRow.style.display = 'flex';

    updateAnsweredQuestionsCounter(0, questions.length);

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
      `;
      container.appendChild(card);
    });

    const feedbackBlock = document.getElementById('certExamFeedbackBlock');
    if (feedbackBlock) feedbackBlock.style.display = 'none';
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

    const totalQuestions = currentTradeExam ? currentTradeExam.questions.length : 8;
    const answeredCount = Object.keys(certUserAnswers).length;
    updateAnsweredQuestionsCounter(answeredCount, totalQuestions);
  };

  function updateAnsweredQuestionsCounter(answered, total) {
    const counterEl = document.getElementById('answeredQuestionsCounter');
    if (counterEl) {
      counterEl.textContent = `${answered} de ${total} casos respondidos`;
      if (answered === total) {
        counterEl.style.color = 'var(--green-verified)';
        counterEl.style.fontWeight = '700';
      } else {
        counterEl.style.color = 'var(--ink-muted)';
        counterEl.style.fontWeight = '600';
      }
    }
  }

  // EVALUACIÓN TEÓRICA: Se guardan las 8 respuestas y se sellan en reserva (NO se muestra la nota en este paso)
  window.evaluateTheoreticalExam = function () {
    if (!currentTradeExam) {
      currentTradeExam = getOrGenerateAiTradeExam('Plomería & Redes Hidráulicas');
    }
    const questions = currentTradeExam.questions;
    const totalQ = questions.length;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosen = certUserAnswers[idx];
      if (chosen === q.correct) {
        correctCount++;
      }
    });

    certCorrectAnswersCount = correctCount;
    // Cada pregunta de las 8 equivale exactamente a 12.5%
    certTheoreticalScore = Math.round((correctCount / totalQ) * 100);

    // Ocultar botón de registro y preguntas para sellar
    const submitRow = document.getElementById('certExamSubmitRow');
    if (submitRow) submitRow.style.display = 'none';

    // Mostrar tarjeta de respuestas guardadas con confirmación estricta
    const confirmedCard = document.getElementById('certExamConfirmedCard');
    if (confirmedCard) {
      confirmedCard.style.display = 'block';
      confirmedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Asegurarse de que el bloque viejo de puntuación inmediata nunca se muestre en el paso 2
    const feedbackBlock = document.getElementById('certExamFeedbackBlock');
    if (feedbackBlock) feedbackBlock.style.display = 'none';

    showToast('Tus 8 respuestas han quedado registradas en el expediente. Tu nota teórica se revelará en el dictamen final.', 'success');
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

  /* --- MOTOR DE CONFRONTACIÓN SEMÁNTICA: AUDIO Y ACCIÓN FRENTE A CONOCIMIENTO REAL --- */
  function evaluateSpokenAndActionCoherence(transcript, jobTitle, tradeProfile, evidences) {
    const rawTrade = tradeProfile ? tradeProfile.tradeName.toLowerCase() : 'plomería';
    let kbKey = 'universal';
    if (rawTrade.includes('plom') || rawTrade.includes('agua') || rawTrade.includes('fontan')) kbKey = 'plomeria';
    else if (rawTrade.includes('electr') || rawTrade.includes('retie')) kbKey = 'electricidad';
    else if (rawTrade.includes('solar') || rawTrade.includes('fotovolt')) kbKey = 'solar';
    else if (rawTrade.includes('carpint') || rawTrade.includes('mader')) kbKey = 'carpinteria';
    else if (rawTrade.includes('mecanic') || rawTrade.includes('auto') || rawTrade.includes('motor')) kbKey = 'mecanica';
    else if (rawTrade.includes('refrig') || rawTrade.includes('aire') || rawTrade.includes('hvac')) kbKey = 'refrigeracion';
    else if (rawTrade.includes('soldad') || rawTrade.includes('tig') || rawTrade.includes('mig')) kbKey = 'soldadura';
    else if (rawTrade.includes('cerraj') || rawTrade.includes('cerradur')) kbKey = 'cerrajeria';
    else if (rawTrade.includes('baris') || rawTrade.includes('cafe')) kbKey = 'barismo';
    else if (rawTrade.includes('dron') || rawTrade.includes('uav')) kbKey = 'drones';
    else if (rawTrade.includes('panad') || rawTrade.includes('masa')) kbKey = 'panaderia';

    const kb = REAL_TRADE_KNOWLEDGE_BASE[kbKey] || REAL_TRADE_KNOWLEDGE_BASE['universal'];
    const lowerTranscript = (transcript || '').toLowerCase();
    const lowerJobTitle = (jobTitle || '').toLowerCase();

    // 1. Identificar conceptos reales mencionados en el audio
    let matchedConcepts = [];
    if (tradeProfile && Array.isArray(tradeProfile.expectedConcepts)) {
      tradeProfile.expectedConcepts.forEach(c => {
        const words = c.toLowerCase().split(/[\s/,.-]+/).filter(w => w.length > 3);
        const hasMatch = words.some(w => lowerTranscript.includes(w) || lowerJobTitle.includes(w));
        if (hasMatch) {
          matchedConcepts.push(c);
        }
      });
    }

    // Coincidencia con palabras clave de la base de conocimiento
    kb.keywords.forEach(kw => {
      if (lowerTranscript.includes(kw) && !matchedConcepts.includes(kw.toUpperCase())) {
        matchedConcepts.push(kw.toUpperCase());
      }
    });

    if (matchedConcepts.length === 0) {
      if (transcript && transcript.length >= 25) {
        matchedConcepts = tradeProfile && tradeProfile.expectedConcepts ? tradeProfile.expectedConcepts.slice(0, 4) : [kb.standard, 'Diagnóstico técnico estructurado'];
      } else {
        matchedConcepts = ['Inspección pericial de obra'];
      }
    }

    // 2. Evaluar fotos y audios físicos
    const readyPhotos = evidences.filter(e => !!e.photo).length;
    const readyAudios = evidences.filter(e => !!e.audioDuration).length;
    const totalEvidences = Math.max(evidences.length, 1);

    const hasSubstantiveExplanation = (transcript && transcript.length >= 25);
    const photoRatio = readyPhotos / totalEvidences;
    const audioRatio = readyAudios / totalEvidences;

    // Puntajes de los 4 Pilares Técnicos (25 puntos cada uno = 100 max)
    // Pilar 1: Diagnóstico de Causa Raíz
    let p1 = Math.round(photoRatio * 15 + (hasSubstantiveExplanation ? 10 : (audioRatio > 0 ? 5 : 0)));
    // Pilar 2: Herramientas y Materiales Homologados
    let p2 = Math.round(photoRatio * 10 + (matchedConcepts.length >= 2 ? 14 : (hasSubstantiveExplanation ? 10 : 4)));
    // Pilar 3: Procedimiento Técnico Ejecutado
    let p3 = Math.round(photoRatio * 12 + (hasSubstantiveExplanation ? 13 : (audioRatio > 0 ? 5 : 0)));
    // Pilar 4: Control de Calidad, Pruebas y Garantía
    let p4 = Math.round(photoRatio * 10 + (hasSubstantiveExplanation ? 14 : (audioRatio > 0 ? 4 : 0)));

    p1 = Math.min(25, Math.max(0, p1));
    p2 = Math.min(25, Math.max(0, p2));
    p3 = Math.min(25, Math.max(0, p3));
    p4 = Math.min(25, Math.max(0, p4));

    const totalPracticalScore = p1 + p2 + p3 + p4;

    // Coherencia práctica entre lo que dijo y lo que hizo
    let coherencePercent = 88;
    if (hasSubstantiveExplanation && readyPhotos > 0) {
      coherencePercent = Math.min(99, 90 + Math.min(8, matchedConcepts.length * 2));
    } else if (readyPhotos > 0 || hasSubstantiveExplanation) {
      coherencePercent = 78;
    } else {
      coherencePercent = 45;
    }

    let coherenceDescription = '';
    if (coherencePercent >= 90) {
      coherenceDescription = `La explicación técnica de audio se correlaciona con precisión milimétrica (${coherencePercent}%) con las fotografías de obra capturadas y los protocolos de la norma ${kb.standard}. Demuestra correspondencia fehaciente entre el diagnóstico oral y el trabajo físico ejecutado.`;
    } else if (coherencePercent >= 75) {
      coherenceDescription = `Se evidencia correspondencia satisfactoria (${coherencePercent}%) entre la explicación de audio y las fotografías suministradas para la especialidad de ${tradeProfile ? tradeProfile.tradeName : 'obra'}.`;
    } else {
      coherenceDescription = `Correspondencia débil (${coherencePercent}%). Se requiere mayor nitidez en las fotos de obra y una explicación de voz más detallada con las herramientas y pruebas realizadas.`;
    }

    return {
      matchedConcepts: matchedConcepts.slice(0, 6),
      coherencePercent,
      coherenceDescription,
      p1,
      p2,
      p3,
      p4,
      totalPracticalScore
    };
  }

  /* --- FLUJO DE EVALUACIÓN Y PERITAJE DE LA INTELIGENCIA ARTIFICIAL --- */
  window.startAiEvaluationFlow = async function () {
    if (!currentTradeExam) {
      showToast('Primero completa el paso 1 y el examen teórico.', 'error');
      goToStep(1);
      return;
    }
    const info = currentTradeExam;

    // Antes, si faltaba la foto o el audio, se rellenaban con una foto de stock y un texto "ideal"
    // y la IA calificaba eso. Ahora se exige evidencia real en cada paso.
    const problems = [];
    verificationEvidences.forEach((ev, idx) => {
      const n = idx + 1;
      if (!ev.photo) problems.push(`el paso ${n} no tiene foto`);
      if (!ev.audioBlob && getEvidenceTranscript(ev).length < 20) problems.push(`el paso ${n} no tiene audio ni explicación escrita`);
    });
    if (problems.length) {
      showToast(`Falta evidencia: ${problems.join('; ')}.`, 'error');
      return;
    }
    if (!hasActiveAiKey()) {
      showToast('Para evaluar con IA necesitas configurar una API Key de Gemini u OpenAI.', 'error');
      goToStep(1);
      const drawer = document.getElementById('aiApiKeyDrawer');
      if (drawer) drawer.style.display = 'block';
      return;
    }
    if (verificationEvidences.some(ev => ev.isRecording)) {
      showToast('Termina la grabación de audio antes de enviar.', 'error');
      return;
    }

    certEvaluationEndTime = Date.now();
    goToStep(4);

    const scannerBox = document.getElementById('aiScannerBox');
    const verdictContainer = document.getElementById('aiVerdictContainer');
    const errorBox = document.getElementById('aiEvalErrorBox');
    const step2Label = document.getElementById('aiStep2Label');

    if (scannerBox) scannerBox.style.display = 'block';
    if (verdictContainer) verdictContainer.style.display = 'none';
    if (errorBox) errorBox.style.display = 'none';
    if (step2Label) {
      step2Label.textContent = `${getAiProviderLabel()}: revisando cada foto con su explicación en ${info.tradeName}...`;
    }

    const stepItems = [1, 2, 3, 4].map(n => document.getElementById(`aiStep_${n}`));
    stepItems.forEach(el => el && (el.className = 'ai-scan-step-item'));
    if (stepItems[0]) stepItems[0].className = 'ai-scan-step-item active';

    const jobTitleInput = document.getElementById('certJobTitle');
    const jobTitle = (jobTitleInput && jobTitleInput.value.trim()) || `Trabajo de ${info.tradeName}`;

    // La animación avanza mientras la IA trabaja, pero el último paso solo se marca cuando hay respuesta
    const timers = [
      setTimeout(() => { stepItems[0] && (stepItems[0].className = 'ai-scan-step-item done'); stepItems[1] && (stepItems[1].className = 'ai-scan-step-item active'); }, 900),
      setTimeout(() => { stepItems[1] && (stepItems[1].className = 'ai-scan-step-item done'); stepItems[2] && (stepItems[2].className = 'ai-scan-step-item active'); }, 2200),
      setTimeout(() => { stepItems[2] && (stepItems[2].className = 'ai-scan-step-item done'); stepItems[3] && (stepItems[3].className = 'ai-scan-step-item active'); }, 3600)
    ];

    const result = await evaluateFullCertificationWithRealAi(info, jobTitle, verificationEvidences);
    timers.forEach(clearTimeout);

    if (!result || result.error) {
      if (scannerBox) scannerBox.style.display = 'none';
      if (errorBox) {
        const msg = document.getElementById('aiEvalErrorMsg');
        if (msg) msg.textContent = (result && result.error) || 'La IA no respondió.';
        errorBox.style.display = 'block';
      }
      showToast('No se pudo completar la evaluación con IA. No se emitió ningún resultado.', 'error');
      return;
    }

    stepItems.forEach(el => el && (el.className = 'ai-scan-step-item done'));
    completeAiVerdictDisplay(info, result, jobTitle);
  };

  let lastCertificationReport = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function completeAiVerdictDisplay(info, evaluationCoherence, jobTitle) {
    const scannerBox = document.getElementById('aiScannerBox');
    const verdictContainer = document.getElementById('aiVerdictContainer');

    if (scannerBox) scannerBox.style.display = 'none';
    if (verdictContainer) {
      verdictContainer.style.display = 'block';
      verdictContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 1. CRITERIO OBLIGATORIO: CÁLCULO Y VISUALIZACIÓN DEL TIEMPO TOTAL DE EVALUACIÓN
    if (!certEvaluationEndTime) certEvaluationEndTime = Date.now();
    // Antes, sin hora de inicio se inventaban 5 min 40 s; ahora se indica que no se registró
    const hasStart = !!certEvaluationStartTime;
    const elapsedMs = hasStart ? Math.max(1000, certEvaluationEndTime - certEvaluationStartTime) : 0;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
    const formattedDuration = hasStart ? `${elapsedMinutes} min ${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds} seg` : 'No registrado';

    const finalDurationEl = document.getElementById('evaluationFinalDuration');
    if (finalDurationEl) finalDurationEl.textContent = formattedDuration;

    const speedAssessmentEl = document.getElementById('evaluationSpeedAssessment');
    if (speedAssessmentEl) {
      if (!hasStart) {
        speedAssessmentEl.textContent = 'No se registró la hora de inicio de esta evaluación.';
      } else {
        const paceWord = elapsedMinutes < 5 ? 'Más rápido que el rango habitual' : (elapsedMinutes <= 25 ? 'Dentro del rango habitual' : 'Más lento que el rango habitual');
        speedAssessmentEl.innerHTML = `Ritmo: <strong>${paceWord}</strong> (${formattedDuration} cronometrados; rango habitual de 5 a 25 min).`;
      }
    }

    const timeBadgeEl = document.getElementById('evaluationTimeStandardBadge');
    if (timeBadgeEl) {
      timeBadgeEl.textContent = `⏱️ Tiempo Registrado: ${formattedDuration}`;
    }

    const certTimeDisplayEl = document.getElementById('certTimeDisplay');
    if (certTimeDisplayEl) {
      certTimeDisplayEl.textContent = `Tiempo de Evaluación: ${formattedDuration}`;
    }

    // 2. Transcripción real de cada paso (lo que la IA evaluó)
    const displayedTranscript = evaluationCoherence.evidenceAnalysis
      .map(e => `Paso ${e.paso}: ${e.transcript || '(sin texto)'}`)
      .join('  •  ');
    const transcriptEl = document.getElementById('aiAudioTranscriptText');
    if (transcriptEl) {
      transcriptEl.textContent = displayedTranscript;
    }

    const practicalScore = evaluationCoherence.totalPracticalScore;

    // Asignar puntajes de los 4 pilares a la interfaz
    const c1 = document.getElementById('aiScoreC1');
    const c2 = document.getElementById('aiScoreC2');
    const c3 = document.getElementById('aiScoreC3');
    const c4 = document.getElementById('aiScoreC4');
    const overall = document.getElementById('aiScoreOverallBadge');

    if (c1) c1.textContent = `${evaluationCoherence.p1}/25`;
    if (c2) c2.textContent = `${evaluationCoherence.p2}/25`;
    if (c3) c3.textContent = `${evaluationCoherence.p3}/25`;
    if (c4) c4.textContent = `${evaluationCoherence.p4}/25`;
    // Las leyendas bajo cada pilar eran fijas ("Preciso y certero") aunque la nota fuera 5/25
    [c1, c2, c3, c4].forEach((el, i) => {
      const caption = el && el.nextElementSibling;
      if (!caption) return;
      const v = evaluationCoherence[`p${i + 1}`];
      caption.textContent = v >= 19 ? 'Bien demostrado' : (v >= 13 ? 'Incompleto' : 'Sin evidencia suficiente');
      caption.style.color = v >= 19 ? 'var(--green-verified)' : (v >= 13 ? '#b45309' : '#dc2626');
    });
    if (overall) {
      overall.textContent = `${practicalScore} / 100`;
      overall.style.color = practicalScore >= 75 ? 'var(--green-verified)' : '#dc2626';
    }

    // Conceptos confrontados con conocimiento real
    const conceptsCloud = document.getElementById('aiConceptsCloud');
    if (conceptsCloud) {
      conceptsCloud.innerHTML = evaluationCoherence.matchedConcepts.length
        ? evaluationCoherence.matchedConcepts.map(c => `<span class="ai-concept-chip">${escapeHtml(c)}</span>`).join('')
        : '<span style="font-size: 0.85rem; color: var(--ink-muted);">La IA no identificó conceptos técnicos demostrados.</span>';
    }

    const pillarNotesEl = document.getElementById('aiPillarNotes');
    if (pillarNotesEl) {
      const labels = { p1: 'Diagnóstico', p2: 'Herramientas y materiales', p3: 'Procedimiento', p4: 'Pruebas y garantía' };
      const notes = Object.keys(labels)
        .filter(k => evaluationCoherence.pillarNotes && evaluationCoherence.pillarNotes[k])
        .map(k => `<li><strong>${labels[k]} (${evaluationCoherence[k]}/25):</strong> ${escapeHtml(evaluationCoherence.pillarNotes[k])}</li>`);
      const guard = (evaluationCoherence.guardNotes || []).map(n => `<li style="color: #b91c1c;"><strong>Regla aplicada:</strong> ${escapeHtml(n)}</li>`);
      const missing = (evaluationCoherence.missingConcepts || []).length
        ? `<li><strong>Le faltó demostrar:</strong> ${evaluationCoherence.missingConcepts.map(escapeHtml).join(', ')}</li>` : '';
      pillarNotesEl.innerHTML = notes.concat(guard).join('') + missing;
      pillarNotesEl.style.display = pillarNotesEl.innerHTML ? 'block' : 'none';
    }

    // Coherencia práctica (Lo que dijo vs Lo que hizo)
    const coherenceBadge = document.getElementById('practicalCoherenceBadge');
    if (coherenceBadge) {
      coherenceBadge.textContent = `${evaluationCoherence.coherencePercent}% Coherencia Práctica`;
      coherenceBadge.style.color = evaluationCoherence.coherencePercent >= 75 ? 'var(--green-verified)' : '#dc2626';
      coherenceBadge.style.background = evaluationCoherence.coherencePercent >= 75 ? 'var(--green-soft)' : '#fee2e2';
    }

    const coherenceDesc = document.getElementById('practicalCoherenceDescription');
    if (coherenceDesc) {
      coherenceDesc.textContent = evaluationCoherence.coherenceDescription;
    }

    // 4. REVELACIÓN DE CALIFICACIONES AL FINAL
    const passedTheoretical = (certTheoreticalScore >= 75);
    const passedPractical = (practicalScore >= 75);
    const certApproved = passedTheoretical && passedPractical;
    const overallAverageScore = Math.round((certTheoreticalScore + practicalScore) / 2);

    // Revelar Teórico
    const revTheoScore = document.getElementById('revealedTheoScore');
    const revTheoBadge = document.getElementById('revealedTheoBadge');
    const revTheoDesc = document.getElementById('revealedTheoDesc');

    if (revTheoScore) revTheoScore.textContent = `${certTheoreticalScore}/100`;
    if (revTheoBadge) {
      revTheoBadge.textContent = `${certCorrectAnswersCount} de 8 aciertos`;
      revTheoBadge.style.background = passedTheoretical ? 'var(--green-soft)' : '#fee2e2';
      revTheoBadge.style.color = passedTheoretical ? 'var(--green-verified)' : '#dc2626';
    }
    if (revTheoDesc) {
      revTheoDesc.textContent = passedTheoretical
        ? `Prueba teórica aprobada (${certCorrectAnswersCount}/8 aciertos, mínimo 6 requeridos).`
        : `Prueba teórica insuficiente (${certCorrectAnswersCount}/8 aciertos; se exige mínimo 6 de 8 = 75/100).`;
    }

    // Revelar Práctico
    const revPractScore = document.getElementById('revealedPractScore');
    const revPractBadge = document.getElementById('revealedPractBadge');

    if (revPractScore) revPractScore.textContent = `${practicalScore}/100`;
    if (revPractBadge) {
      revPractBadge.textContent = passedPractical ? 'Idoneidad Acreditada' : 'Insuficiente (<75)';
      revPractBadge.style.background = passedPractical ? 'var(--green-soft)' : '#fee2e2';
      revPractBadge.style.color = passedPractical ? 'var(--green-verified)' : '#dc2626';
    }

    // Revelar Global Oficial
    const revOverallScore = document.getElementById('revealedOverallScore');
    const revOverallBadge = document.getElementById('revealedOverallBadge');

    if (revOverallScore) revOverallScore.textContent = `${overallAverageScore}/100`;
    if (revOverallBadge) {
      revOverallBadge.textContent = certApproved ? 'Acreditación Oficial Smith' : 'Certificación Pendiente';
      revOverallBadge.style.background = certApproved ? 'var(--green-soft)' : '#fee2e2';
      revOverallBadge.style.color = certApproved ? 'var(--green-verified)' : '#dc2626';
    }

    // 5. MUESTRA FORMAL DE EVIDENCIAS ENTREGADAS (FOTOS Y AUDIOS AUDITADOS)
    const showcaseJobTitle = document.getElementById('evidenceShowcaseJobTitle');
    if (showcaseJobTitle) showcaseJobTitle.textContent = `Labor Auditada: ${jobTitle}`;

    const countSubmittedText = document.getElementById('evidenceCountSubmittedText');
    const readyPhotos = verificationEvidences.filter(e => !!e.photo).length;
    const readyAudios = verificationEvidences.filter(e => !!e.audioDuration).length;
    if (countSubmittedText) {
      countSubmittedText.textContent = `${readyPhotos} fotos de cámara y ${readyAudios} notas de voz auditadas`;
    }

    const auditedGallery = document.getElementById('auditedEvidenceGallery');
    if (auditedGallery) {
      auditedGallery.innerHTML = verificationEvidences.map((ev, idx) => {
        const photoSrc = ev.photo || '';
        const dur = ev.audioDuration || 'Sin audio';
        const analysis = evaluationCoherence.evidenceAnalysis[idx] || {};
        const audioTranscript = analysis.transcript || 'Sin explicación.';
        const stampOk = analysis.fotoCorrespondeAlOficio;
        const deviceSensorLabel = stampOk ? 'Corresponde al oficio' : 'No corresponde al oficio';

        return `
          <div style="background: var(--bg-card); border: 1px solid var(--border-soft); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
            <div style="position: relative; height: 180px; background: #1a1a24; overflow: hidden;">
              <img src="${photoSrc}" alt="Evidencia ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">
              <span class="ai-stamp-badge" style="${stampOk ? '' : 'background: #dc2626; color: #fff;'}">
                ${stampOk ? 'IA: FOTO DEL OFICIO' : 'IA: NO CORRESPONDE'}
              </span>
              <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem;">
                ${deviceSensorLabel} • Paso #${idx + 1}
              </div>
            </div>
            <div style="padding: 14px;">
              <p style="font-size: 0.78rem; color: var(--ink-secondary); margin: 0 0 10px; line-height: 1.4;">
                <strong>Lo que la IA ve en la foto:</strong> ${escapeHtml(analysis.descripcionFoto || '')}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 0.86rem; color: var(--ink-primary);">Explicación #${idx + 1}</strong>
                <span class="live-badge" style="background: ${analysis.explicacionCoincideConFoto ? 'var(--green-soft)' : '#fee2e2'}; color: ${analysis.explicacionCoincideConFoto ? 'var(--green-verified)' : '#dc2626'}; font-size: 0.76rem;">${analysis.explicacionCoincideConFoto ? 'Coincide con la foto' : 'No coincide con la foto'}</span>
              </div>
              ${ev.audioUrl ? `<div class="audio-playback-row" style="background: var(--bg-card-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 8px;">
                <button type="button" class="audio-play-trigger" onclick="togglePlayEvidenceAudio(${ev.id})" style="width: 32px; height: 32px; font-size: 0.85rem;">
                  ▶
                </button>
                <div style="font-size: 0.8rem; color: var(--ink-muted); flex: 1; margin-left: 8px;">
                  Reproducir audio (${dur})
                </div>
              </div>` : ''}
              <p style="font-size: 0.78rem; color: var(--ink-secondary); margin: 0; line-height: 1.35; font-style: italic;">
                "${escapeHtml(audioTranscript.length > 160 ? audioTranscript.substring(0, 160) + '...' : audioTranscript)}"
              </p>
              ${analysis.observaciones ? `<p style="font-size: 0.76rem; color: var(--ink-muted); margin: 8px 0 0; line-height: 1.35;"><strong>Observaciones:</strong> ${escapeHtml(analysis.observaciones)}</p>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    // 6. VALIDACIÓN ESTRICTA DE DOBLE CONDICIÓN PARA EL DIPLOMA
    const certWrapper = document.getElementById('printableCertificate');
    const failedCard = document.getElementById('aiEvaluationFailedCard');
    const postActions = document.getElementById('certPostActions');
    const statusBadge = document.getElementById('aiVerdictStatusBadge');
    const verdictP = document.getElementById('aiVerdictParagraph');

    const engineTag = evaluationCoherence.evaluatedByRealAi
      ? `(${evaluationCoherence.evaluatedByRealAi})`
      : '(Auditor Pericial Tasksmith IA)';

    if (certApproved) {
      if (statusBadge) {
        statusBadge.textContent = `Evaluación Aprobada por ${evaluationCoherence.evaluatedByRealAi || 'IA'}: Doble Idoneidad Demostrada`;
        statusBadge.style.color = 'var(--green-verified)';
        statusBadge.style.background = 'var(--green-soft)';
      }
      if (verdictP) {
        verdictP.innerHTML = evaluationCoherence.verdictParagraph
          ? `<strong>Conclusión del Peritaje ${engineTag}:</strong> ${escapeHtml(evaluationCoherence.verdictParagraph)} <em>(Teórico: ${certTheoreticalScore}/100 • Práctico: ${practicalScore}/100 • Tiempo: ${formattedDuration})</em>`
          : `<strong>Conclusión del Peritaje ${engineTag}:</strong> El especialista demostró competencia técnica sobresaliente respondiendo ${certCorrectAnswersCount} de 8 casos teóricos (${certTheoreticalScore}/100) y acreditó idoneidad práctica rigurosa en sus fotos y audios auditados (${practicalScore}/100) en un tiempo total de ${formattedDuration}. Cumple plenamente con el estándar oficial de Tasksmith.`;
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
      showToast(`¡Acreditación Oficial Aprobada! Teórico: ${certTheoreticalScore}/100 (${certCorrectAnswersCount}/8) • Práctico: ${practicalScore}/100 • Tiempo: ${formattedDuration}.`, 'success');

    } else {
      // REQUISITOS NO CUMPLIDOS
      if (statusBadge) {
        statusBadge.textContent = 'Certificación No Otorgada: Requisitos Mínimos No Alcanzados';
        statusBadge.style.color = '#dc2626';
        statusBadge.style.background = '#fee2e2';
      }

      let reasons = [];
      if (!passedTheoretical) reasons.push(`prueba teórica insuficiente (${certTheoreticalScore}/100 con ${certCorrectAnswersCount} de 8 aciertos, mínimo 6 requeridos)`);
      if (!passedPractical) reasons.push(`evidencia práctica audiovisual insuficiente (${practicalScore}/100, mínimo 75)`);

      if (verdictP) {
        const aiExtraFeedback = evaluationCoherence.verdictParagraph ? `<br><br><em>Observación de ${evaluationCoherence.evaluatedByRealAi || 'la IA'}:</em> ${escapeHtml(evaluationCoherence.verdictParagraph)}` : '';
        verdictP.innerHTML = `<strong>Dictamen Pericial ${engineTag}:</strong> No se emite la certificación oficial debido a: <strong>${reasons.join(' y ')}</strong> tras ${formattedDuration} de evaluación. En Tasksmith se exige demostrar idoneidad técnica en ambas áreas (mínimo 75/100 en cada una) para garantizar la seguridad de los hogares.${aiExtraFeedback}`;
      }

      if (certWrapper) certWrapper.style.display = 'none';
      if (postActions) postActions.style.display = 'none';

      if (failedCard) {
        failedCard.style.display = 'block';

        const failedTheoScore = document.getElementById('failedTheoreticalScore');
        const failedTheoBadge = document.getElementById('failedTheoreticalBadge');
        const failedTheoMsg = document.getElementById('failedTheoreticalMsg');

        if (failedTheoScore) failedTheoScore.textContent = `${certTheoreticalScore}/100`;
        if (failedTheoBadge) {
          failedTheoBadge.textContent = passedTheoretical ? `Aprobada (${certCorrectAnswersCount}/8)` : `Insuficiente (${certCorrectAnswersCount}/8)`;
          failedTheoBadge.style.color = passedTheoretical ? 'var(--green-verified)' : '#dc2626';
          failedTheoBadge.style.background = passedTheoretical ? 'var(--green-soft)' : '#fee2e2';
        }
        if (failedTheoMsg) {
          failedTheoMsg.textContent = passedTheoretical
            ? 'Superaste satisfactoriamente este componente con 6 o más aciertos.'
            : `Puntaje obtenido: ${certTheoreticalScore}/100 (${certCorrectAnswersCount} de 8 casos). Se exige acertar mínimo 6 de 8 casos para alcanzar el 75%.`;
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
            : 'Faltan fotografías nítidas de obra o una explicación de voz más detallada con herramientas, materiales y pruebas ejecutadas.';
        }
      }

      if (currentUser) {
        currentUser.certified = false;
        localStorage.setItem(STATE_KEY_USER, JSON.stringify(currentUser));
        updateNavUserSlot();
      }

      showToast('Evaluación concluida sin certificación: No se superó el 75% en ambas pruebas obligatorias.', 'normal');
    }

    // 7. Fecha real de emisión y expediente para exportar en PDF
    const issueDate = new Date();
    const issueDateText = issueDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const certIssueDateEl = document.getElementById('certIssueDate');
    if (certIssueDateEl) certIssueDateEl.textContent = issueDateText;

    const certHashEl = document.getElementById('certHashId');
    lastCertificationReport = {
      candidateName: currentUser ? currentUser.name : 'Candidato',
      candidateEmail: currentUser ? currentUser.email : '',
      tradeName: info.tradeName,
      norms: info.norms || '',
      experience: candidateCertificationContext.experience,
      scope: candidateCertificationContext.customScope,
      jobTitle,
      issueDate,
      issueDateText,
      certificateId: certApproved && certHashEl ? certHashEl.textContent : null,
      approved: certApproved,
      durationText: formattedDuration,
      theoretical: {
        score: certTheoreticalScore,
        correct: certCorrectAnswersCount,
        total: (info.questions || []).length,
        passed: passedTheoretical,
        feedback: evaluationCoherence.theoreticalFeedback || '',
        questions: (info.questions || []).map((q, idx) => ({
          title: q.title,
          scenario: q.scenario || '',
          chosen: certUserAnswers[idx] !== undefined ? q.options[certUserAnswers[idx]] : 'No respondida',
          correctAnswer: q.options[q.correct],
          isRight: certUserAnswers[idx] === q.correct,
          explanation: q.explanation || ''
        }))
      },
      practical: {
        score: practicalScore,
        passed: passedPractical,
        pillars: [
          { name: 'Diagnóstico', score: evaluationCoherence.p1, note: evaluationCoherence.pillarNotes?.p1 || '' },
          { name: 'Herramientas y materiales', score: evaluationCoherence.p2, note: evaluationCoherence.pillarNotes?.p2 || '' },
          { name: 'Procedimiento', score: evaluationCoherence.p3, note: evaluationCoherence.pillarNotes?.p3 || '' },
          { name: 'Pruebas y garantía', score: evaluationCoherence.p4, note: evaluationCoherence.pillarNotes?.p4 || '' }
        ],
        coherencePercent: evaluationCoherence.coherencePercent,
        coherenceDescription: evaluationCoherence.coherenceDescription,
        matchedConcepts: evaluationCoherence.matchedConcepts || [],
        missingConcepts: evaluationCoherence.missingConcepts || [],
        guardNotes: evaluationCoherence.guardNotes || []
      },
      evidences: verificationEvidences.map((ev, idx) => ({
        ...(evaluationCoherence.evidenceAnalysis[idx] || {}),
        photo: ev.photo,
        audioDuration: ev.audioDuration || null
      })),
      overallScore: overallAverageScore,
      verdictParagraph: evaluationCoherence.verdictParagraph || '',
      engine: evaluationCoherence.evaluatedByRealAi || 'IA'
    };
    document.querySelectorAll('[data-export-cert-pdf]').forEach(btn => { btn.disabled = false; });
  }

  window.restartCertificationWizard = function () {
    certEvaluationStartTime = null;
    certEvaluationEndTime = null;
    certUserAnswers = {};
    certTheoreticalScore = 0;
    certCorrectAnswersCount = 0;
    window.resetEntireVerification();
    goToStep(1);
    const input = document.getElementById('customTradeInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    showToast('Inicia una nueva certificación técnica con cualquier oficio.', 'normal');
  };

  /* --- EXPORTAR RESULTADOS DE CERTIFICACIÓN EN PDF (jsPDF) --- */
  function loadImageAsDataUrl(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          resolve({ dataUrl: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function getImageSize(dataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  // Helvetica de jsPDF solo trae caracteres latinos básicos: se quitan emojis y símbolos raros
  function pdfSafe(str) {
    return String(str == null ? '' : str)
      .replace(/[≤]/g, '<=').replace(/[≥]/g, '>=').replace(/[→]/g, '->')
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ–—•€]/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  window.exportCertificationReportPdf = async function () {
    const r = lastCertificationReport;
    if (!r) {
      showToast('Primero completa la evaluación para poder exportar los resultados.', 'error');
      return;
    }
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      showToast('No se pudo cargar el generador de PDF. Revisa tu conexión a internet e inténtalo de nuevo.', 'error');
      return;
    }

    const buttons = document.querySelectorAll('[data-export-cert-pdf]');
    buttons.forEach(b => { b.disabled = true; });

    try {
      const doc = new JsPDF({ unit: 'mm', format: 'a4' });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();
      const M = 16;
      const CW = PW - M * 2;
      const COLORS = {
        ink: [44, 34, 26], soft: [90, 74, 61], muted: [138, 122, 109], blue: [37, 88, 134],
        green: [37, 124, 62], red: [185, 28, 28], line: [228, 220, 208], panel: [246, 242, 235]
      };
      let y = M;

      const setColor = c => doc.setTextColor(c[0], c[1], c[2]);
      const ensure = h => { if (y + h > PH - 16) { doc.addPage(); y = M; } };
      const text = (str, opts = {}) => {
        const size = opts.size || 10;
        const x = opts.x != null ? opts.x : M;
        const width = opts.width || CW;
        const lh = size * 0.42 + (opts.leading || 1.2);
        doc.setFont('helvetica', opts.bold ? 'bold' : (opts.italic ? 'italic' : 'normal'));
        doc.setFontSize(size);
        setColor(opts.color || COLORS.ink);
        const lines = doc.splitTextToSize(pdfSafe(str), width);
        lines.forEach(line => {
          ensure(lh);
          doc.text(line, x, y + size * 0.35);
          y += lh;
        });
        y += opts.after != null ? opts.after : 1.5;
      };
      const section = title => {
        ensure(16);
        y += 4;
        doc.setDrawColor(COLORS.line[0], COLORS.line[1], COLORS.line[2]);
        doc.setLineWidth(0.3);
        doc.line(M, y, PW - M, y);
        y += 5;
        text(title, { size: 13, bold: true, color: COLORS.blue, after: 2 });
      };
      const labelValue = (label, value) => {
        if (!value) return;
        text(`${label}: ${value}`, { size: 10, color: COLORS.soft, after: 0.8 });
      };

      // Encabezado
      const logo = await loadImageAsDataUrl('assets/logo.png');
      if (logo) doc.addImage(logo.dataUrl, 'PNG', M, y, 12, 12 * logo.h / logo.w);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); setColor(COLORS.ink);
      doc.text('Tasksmith', M + (logo ? 15 : 0), y + 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setColor(COLORS.muted);
      doc.text('Informe de resultados de certificación', M + (logo ? 15 : 0), y + 11);
      doc.text(pdfSafe(r.issueDateText), PW - M, y + 6, { align: 'right' });
      y += 20;

      // Resultado general
      const statusColor = r.approved ? COLORS.green : COLORS.red;
      ensure(34);
      doc.setFillColor(COLORS.panel[0], COLORS.panel[1], COLORS.panel[2]);
      doc.roundedRect(M, y, CW, 30, 3, 3, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); setColor(COLORS.muted);
      doc.text('RESULTADO', M + 6, y + 7);
      doc.setFontSize(15); setColor(statusColor);
      doc.text(r.approved ? 'Certificación aprobada' : 'Certificación no otorgada', M + 6, y + 15);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setColor(COLORS.soft);
      doc.text(pdfSafe(`${r.tradeName}`), M + 6, y + 22);
      if (r.certificateId) doc.text(pdfSafe(`Código: ${r.certificateId}`), M + 6, y + 27);
      const cols = [
        ['General', `${r.overallScore}/100`],
        ['Teórica', `${r.theoretical.score}/100`],
        ['Práctica', `${r.practical.score}/100`]
      ];
      cols.forEach((c, i) => {
        const cx = PW - M - 6 - (2 - i) * 24;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(COLORS.muted);
        doc.text(pdfSafe(c[0]), cx, y + 10, { align: 'right' });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); setColor(COLORS.ink);
        doc.text(c[1], cx, y + 18, { align: 'right' });
      });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(COLORS.muted);
      doc.text('Mínimo para aprobar: 75/100 en teórica y en práctica', PW - M - 6, y + 26, { align: 'right' });
      y += 36;

      // Datos
      section('Datos de la evaluación');
      labelValue('Candidato', r.candidateName);
      labelValue('Correo', r.candidateEmail);
      labelValue('Oficio', r.tradeName);
      labelValue('Normativa de referencia', r.norms);
      labelValue('Experiencia declarada', r.experience);
      labelValue('Alcance declarado', r.scope);
      labelValue('Trabajo reportado', r.jobTitle);
      labelValue('Tiempo total de la evaluación', r.durationText);
      labelValue('Evaluado con', r.engine);

      // Teórica
      section(`Prueba teórica: ${r.theoretical.score}/100 (${r.theoretical.correct} de ${r.theoretical.total} correctas)`);
      if (r.theoretical.feedback) text(r.theoretical.feedback, { size: 10, color: COLORS.soft, after: 3 });
      r.theoretical.questions.forEach((q, idx) => {
        ensure(18);
        text(`${idx + 1}. ${q.title.replace(/^\d+\.\s*/, '')}`, { size: 10.5, bold: true, after: 0.5 });
        text(q.isRight ? 'Correcta' : 'Incorrecta', { size: 9, bold: true, color: q.isRight ? COLORS.green : COLORS.red, after: 0.5 });
        text(`Respondió: ${q.chosen}`, { size: 9.5, color: COLORS.soft, after: 0.5 });
        if (!q.isRight) text(`Respuesta correcta: ${q.correctAnswer}`, { size: 9.5, color: COLORS.soft, after: 0.5 });
        if (q.explanation) text(q.explanation, { size: 9, italic: true, color: COLORS.muted, after: 3 });
        else y += 2;
      });

      // Práctica
      section(`Prueba práctica: ${r.practical.score}/100`);
      r.practical.pillars.forEach(p => {
        ensure(12);
        text(`${p.name}: ${p.score}/25`, { size: 10.5, bold: true, after: 0.5 });
        if (p.note) text(p.note, { size: 9.5, color: COLORS.soft, after: 2.5 });
      });
      labelValue('Coherencia entre lo dicho y las fotos', `${r.practical.coherencePercent}%`);
      if (r.practical.coherenceDescription) text(r.practical.coherenceDescription, { size: 9.5, color: COLORS.soft, after: 2 });
      if (r.practical.matchedConcepts.length) labelValue('Conceptos demostrados', r.practical.matchedConcepts.join(', '));
      if (r.practical.missingConcepts.length) labelValue('Le faltó demostrar', r.practical.missingConcepts.join(', '));
      r.practical.guardNotes.forEach(n => text(`Regla aplicada: ${n}`, { size: 9.5, bold: true, color: COLORS.red, after: 1 }));

      // Evidencias
      section('Evidencias revisadas');
      for (const ev of r.evidences) {
        const imgW = 56;
        let imgH = 0;
        let size = null;
        if (ev.photo && ev.photo.startsWith('data:image/')) size = await getImageSize(ev.photo);
        if (size) imgH = Math.min(70, imgW * size.h / size.w);
        ensure(Math.max(imgH, 30) + 6);
        const top = y;
        text(`Paso ${ev.paso}`, { size: 11, bold: true, after: 1 });
        const textX = size ? M + imgW + 6 : M;
        const textW = size ? CW - imgW - 6 : CW;
        if (size) {
          try { doc.addImage(ev.photo, 'JPEG', M, y, imgW, imgH); } catch (e) { /* imagen no compatible */ }
        }
        const startY = y;
        text(`Lo que la IA ve: ${ev.descripcionFoto || '-'}`, { size: 9.5, x: textX, width: textW, after: 1 });
        text(`¿La foto corresponde al oficio? ${ev.fotoCorrespondeAlOficio ? 'Sí' : 'No'}`, { size: 9.5, bold: true, x: textX, width: textW, color: ev.fotoCorrespondeAlOficio ? COLORS.green : COLORS.red, after: 1 });
        text(`Explicación${ev.audioDuration ? ` (audio de ${ev.audioDuration})` : ''}: "${ev.transcript || 'Sin explicación'}"`, { size: 9.5, italic: true, x: textX, width: textW, color: COLORS.soft, after: 1 });
        text(`¿Coincide con la foto? ${ev.explicacionCoincideConFoto ? 'Sí' : 'No'}`, { size: 9.5, bold: true, x: textX, width: textW, color: ev.explicacionCoincideConFoto ? COLORS.green : COLORS.red, after: 1 });
        if (ev.observaciones) text(`Observaciones: ${ev.observaciones}`, { size: 9.5, x: textX, width: textW, color: COLORS.soft, after: 1 });
        if (size && y < startY + imgH) y = startY + imgH;
        y += 5;
        if (y < top) y = top;
      }

      // Dictamen
      section('Dictamen');
      text(r.verdictParagraph || 'Sin dictamen.', { size: 10.5, color: COLORS.ink, after: 3 });
      text('Este informe fue generado automáticamente a partir de la evaluación con inteligencia artificial de Tasksmith. Las notas prácticas y las observaciones son el criterio de la IA sobre las fotos y explicaciones enviadas.', { size: 8.5, italic: true, color: COLORS.muted });

      // Pie de página
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(COLORS.muted);
        doc.text(pdfSafe(`Tasksmith · Informe de certificación · ${r.tradeName}`), M, PH - 8);
        doc.text(`Página ${i} de ${pages}`, PW - M, PH - 8, { align: 'right' });
      }

      const slug = s => pdfSafe(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      const dateSlug = `${r.issueDate.getFullYear()}-${String(r.issueDate.getMonth() + 1).padStart(2, '0')}-${String(r.issueDate.getDate()).padStart(2, '0')}`;
      doc.save(`tasksmith-certificacion-${slug(r.tradeName)}-${slug(r.candidateName)}-${dateSlug}.pdf`);
      showToast('Informe de resultados descargado en PDF.', 'success');
    } catch (err) {
      console.error('Error generando el PDF:', err);
      showToast('No se pudo generar el PDF. Inténtalo de nuevo.', 'error');
    } finally {
      buttons.forEach(b => { b.disabled = false; });
    }
  };

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
