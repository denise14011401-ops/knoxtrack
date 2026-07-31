// KnoxTrack — shared site behavior

// Dark/light theme toggle — circular reveal via the View Transitions API,
// with a graceful instant fallback for browsers that don't support it.
function initThemeToggle(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  btn.addEventListener('click', (e) => {
    const goingLight = root.getAttribute('data-theme') !== 'light';

    const applyTheme = () => {
      if (goingLight) {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      try { localStorage.setItem('kt-theme', goingLight ? 'light' : 'dark'); } catch (err) {}
    };

    if (!document.startViewTransition || reduceMotion) {
      applyTheme();
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => applyTheme());
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.16,.84,.44,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });
}

// Smart FAQ chat widget — content (homepage assistant)
const CHAT_TOPICS = [
  {
    id: 'plataforma',
    q: '¿Qué incluye la plataforma KnoxTrack?',
    a: 'KnoxTrack incluye rastreo GPS en tiempo real, geocercas, alertas instantáneas y reportes de conducción, más Knox Master (panel de administración web) y Knox System (facturación integrada) — todo en un mismo sistema.',
    ctaLabel: 'Ver el producto completo',
    ctaHref: 'producto.html'
  },
  {
    id: 'precios',
    q: '¿Cuánto cuesta un plan?',
    a: 'Tenemos planes empresariales (para empresas de GPS y revendedores) y planes personales (para flotas y particulares), con precios según la cantidad de vehículos o dispositivos.',
    ctaLabel: 'Ver precios y planes',
    ctaHref: 'precios.html'
  },
  {
    id: 'prueba',
    q: '¿Puedo probarlo gratis antes de pagar?',
    a: 'Sí — ofrecemos una prueba gratuita para que veas la plataforma funcionando con tu propia flota antes de decidir.',
    ctaLabel: 'Solicitar prueba gratis',
    ctaHref: 'contacto.html'
  },
  {
    id: 'compatibilidad',
    q: '¿Con qué marcas de GPS es compatible?',
    a: 'Es compatible con más de 1,500 marcas de dispositivos GPS, incluyendo Concox, Queclink, Sinotrack, Coban, Teltonika, Suntech, Ruptela, Benway, TKSTAR y ATrack.'
  },
  {
    id: 'marca-blanca',
    q: '¿Ofrecen software de marca blanca?',
    a: 'Sí — puedes ofrecer KnoxTrack bajo tu propia marca a tus clientes, con tu logo y dominio propio. Ideal para empresas de GPS y revendedores.',
    ctaLabel: 'Ver marca blanca',
    ctaHref: 'marcablanca.html'
  },
  {
    id: 'integraciones',
    q: '¿Se integra con WhatsApp, Telegram u otras apps?',
    a: 'Sí — KnoxTrack se conecta con WhatsApp Business, Telegram Bot, Gmail, Google Maps, SMS Gateway, un BOT con inteligencia artificial y una API abierta para terceros.'
  },
  {
    id: 'contacto',
    q: '¿Dónde están ubicados y cómo los contacto?',
    a: 'Tenemos oficinas en Santiago, República Dominicana y en Philadelphia, PA, EE. UU. Puedes escribirnos por teléfono, correo o WhatsApp.',
    ctaLabel: 'Ir a contacto',
    ctaHref: 'contacto.html'
  }
];

function initAudioFab(){
  const btn = document.getElementById('audioToggle');
  const audio = document.getElementById('siteAudio');
  if (!btn || !audio) return;

  function setPlayingUI(isPlaying){
    btn.classList.toggle('is-paused', !isPlaying);
    btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    btn.setAttribute('aria-label', isPlaying ? 'Pausar audio' : 'Reproducir audio');
  }

  // No autoplay: the audio starts paused and only plays when the
  // user explicitly presses the button.
  setPlayingUI(false);

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlayingUI(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
}

function initChatWidget(){
  const widget = document.getElementById('chatWidget');
  if (!widget) return;

  const toggleBtn = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const panel = document.getElementById('chatPanel');
  const messagesEl = document.getElementById('chatMessages');
  const dot = document.getElementById('chatDot');
  const notify = document.getElementById('chatNotify');
  const notifyClose = document.getElementById('chatNotifyClose');

  let answeredTopics = [];

  function scrollToBottom(){ messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(text, sender){
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg--${sender}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addBotMessageWithTyping(text, callback){
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollToBottom();
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      typing.remove();
      addMessage(text, 'bot');
      if (callback) callback();
    }, delay);
  }

  function addWhatsAppCTA(){
    const el = document.createElement('a');
    el.className = 'chat-cta-whatsapp';
    el.target = '_blank';
    el.rel = 'noopener';
    el.href = 'https://api.whatsapp.com/send/?phone=18494996329&text=Saludos';
    el.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.7.8-.9 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5.3-.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.5-.9-2s-.5-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1c.6.3 1.1.4 1.5.6a3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>Hablar por WhatsApp';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function disableAllOptions(){
    messagesEl.querySelectorAll('.chat-option-btn').forEach(b => { b.disabled = true; });
  }

  function showMenu(){
    const remaining = CHAT_TOPICS.filter(t => answeredTopics.indexOf(t.id) === -1);
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    remaining.forEach(topic => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-option-btn';
      btn.textContent = topic.q;
      btn.addEventListener('click', () => selectTopic(topic));
      wrap.appendChild(btn);
    });
    messagesEl.appendChild(wrap);
    if (answeredTopics.length > 0) addWhatsAppCTA();
    scrollToBottom();
  }

  function selectTopic(topic){
    disableAllOptions();
    addMessage(topic.q, 'user');
    answeredTopics.push(topic.id);
    addBotMessageWithTyping(topic.a, () => {
      if (topic.ctaLabel && topic.ctaHref) {
        const link = document.createElement('a');
        link.className = 'chat-option-btn';
        link.href = topic.ctaHref;
        link.textContent = topic.ctaLabel + ' →';
        const wrap = document.createElement('div');
        wrap.className = 'chat-options';
        wrap.appendChild(link);
        messagesEl.appendChild(wrap);
        scrollToBottom();
      }
      setTimeout(showMenu, 350);
    });
  }

  function startConversation(){
    if (messagesEl.dataset.started) return;
    messagesEl.dataset.started = '1';
    addBotMessageWithTyping('¡Hola! 👋 Soy el asistente de KnoxTrack. ¿En qué puedo ayudarte hoy?', showMenu);
  }

  function openChat(){
    widget.classList.add('is-open');
    panel.hidden = false;
    if (dot) dot.hidden = true;
    if (notify) notify.hidden = true;
    startConversation();
  }
  function closeChat(){
    widget.classList.remove('is-open');
    panel.hidden = true;
  }

  toggleBtn.addEventListener('click', () => {
    if (panel.hidden) openChat(); else closeChat();
  });
  closeBtn.addEventListener('click', closeChat);

  if (notify) {
    setTimeout(() => {
      if (panel.hidden) {
        notify.hidden = false;
        if (dot) dot.hidden = false;
      }
    }, 1800);
    notify.addEventListener('click', (e) => {
      if (e.target === notifyClose) return;
      openChat();
    });
    if (notifyClose) {
      notifyClose.addEventListener('click', (e) => {
        e.stopPropagation();
        notify.hidden = true;
      });
    }
    setTimeout(() => { if (notify && !notify.hidden) notify.hidden = true; }, 14000);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navClose = document.getElementById('navClose');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-open', isOpen);
    });
    if (navClose) {
      navClose.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    }
    // Mobile dropdown toggle (tap to expand submenu on small screens)
    document.querySelectorAll('.nav-drop > a').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          trigger.parentElement.classList.toggle('open');
        }
      });
    });
    // Close the drawer when tapping outside it (backdrop)
    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  }

  // Close mobile nav when an actual navigation link is clicked
  // (skips .nav-drop > a triggers — those only toggle their submenu, handled above)
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.parentElement && a.parentElement.classList.contains('nav-drop')) return;
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768 && navLinks) {
        navLinks.classList.remove('open');
        document.body.classList.remove('nav-open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Video modal (opens an embedded YouTube player instead of leaving the site)
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoModalFrame');
  if (videoModal && videoFrame) {
    const closeVideoModal = () => {
      videoModal.classList.remove('open');
      videoModal.setAttribute('aria-hidden', 'true');
      videoFrame.innerHTML = ''; // stop playback
      document.body.classList.remove('video-open');
    };
    document.querySelectorAll('.video-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const id = trigger.getAttribute('data-video');
        if (!id) return;
        videoFrame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('video-open');
      });
    });
    document.getElementById('videoModalBackdrop')?.addEventListener('click', closeVideoModal);
    document.getElementById('videoModalClose')?.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideoModal();
    });
  }

  // Login — abre KnoxGPS en una ventana emergente (popup) en vez de un iframe.
  // Un iframe embebido pierde la cookie de sesión (los navegadores bloquean
  // cookies de terceros en iframes cross-domain), lo que hacía que el login
  // mostrara "la página ha caducado por inactividad". Un popup es una
  // navegación de nivel superior, así que la cookie de sesión de knoxgps.com
  // funciona con normalidad.
  const LOGIN_URL = 'https://knoxgps.com/authentication/create';
  document.querySelectorAll('.login-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const w = 480, h = 680;
      const left = (window.screen.width - w) / 2;
      const top = (window.screen.height - h) / 2;
      const popup = window.open(
        LOGIN_URL,
        'knoxLogin',
        `width=${w},height=${h},left=${left},top=${top},noopener=no,resizable=yes,scrollbars=yes`
      );
      if (!popup) {
        // Bloqueado por el navegador (popup blocker) → fallback a pestaña nueva
        window.open(LOGIN_URL, '_blank', 'noopener');
      } else {
        popup.focus();
      }
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const raw = el.getAttribute('data-count');
      const target = parseFloat(raw);
      const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1300;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString('es-DO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { animate(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(el => cio.observe(el));
    } else {
      counters.forEach(animate);
    }
  }

  // Pricing plan toggle (empresarial / personal)
  const toggleBtns = document.querySelectorAll('[data-plan-toggle]');
  if (toggleBtns.length) {
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-plan-toggle');
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.plan-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // Forms send their content straight to the company's WhatsApp (no backend needed)
  const WHATSAPP_NUMBER = '18494996329'; // Rep. Dom. — +1 (849) 499-6329

  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;

      const lines = [];
      form.querySelectorAll('.field').forEach(field => {
        const labelEl = field.querySelector('label');
        const control = field.querySelector('input, select, textarea');
        if (!control) return;
        const val = (control.value || '').trim();
        if (!val) return;
        const label = labelEl ? labelEl.textContent.trim() : '';
        lines.push(label ? `${label}: ${val}` : val);
      });
      const radioGroups = {};
      form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        const labelText = radio.closest('label')?.textContent.trim() || radio.value;
        radioGroups[radio.name] = labelText;
      });
      Object.values(radioGroups).forEach(val => lines.push(val));

      const message = 'Hola KnoxTrack, quiero más información:\n\n' + lines.join('\n');
      const waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

      btn.disabled = true;
      btn.textContent = 'Abriendo WhatsApp...';
      setTimeout(() => {
        window.open(waUrl, '_blank');
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 500);
    });
  });

  // SIM card 3D tilt widget (homepage "SIM IoT Emnify" section)
  const simScene = document.getElementById('simHero');
  const simTilt = document.getElementById('simTilt');
  const simSheen = document.getElementById('simSheen');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (simScene && simTilt && simSheen && !reduceMotion) {
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0, idleT = 0, hovering = false;

    simScene.addEventListener('mousemove', (e) => {
      hovering = true;
      const rect = simScene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * 22;
      targetRX = -(py - 0.5) * 16;
    });
    simScene.addEventListener('mouseleave', () => { hovering = false; });
    simScene.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      hovering = true;
      const rect = simScene.getBoundingClientRect();
      const px = (e.touches[0].clientX - rect.left) / rect.width;
      const py = (e.touches[0].clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * 22;
      targetRX = -(py - 0.5) * 16;
    }, { passive: true });
    simScene.addEventListener('touchend', () => { hovering = false; });

    (function simLoop(){
      idleT += 0.012;
      const idleRX = Math.sin(idleT) * 3;
      const idleRY = Math.cos(idleT * 0.8) * 5;
      const tx = hovering ? targetRX : idleRX;
      const ty = hovering ? targetRY : idleRY;
      curRX += (tx - curRX) * 0.08;
      curRY += (ty - curRY) * 0.08;
      simTilt.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      simSheen.style.transform = `translateX(${curRY * 1.8}%) translateY(${curRX * 1.2}%)`;
      requestAnimationFrame(simLoop);
    })();
  }

  // Funciones avanzadas: acordeón (solo una abierta a la vez)
  document.querySelectorAll('.feat-acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.feat-acc-item');
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.feat-acc-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // App icons stage: play cursor-click reveal animation once in view
  const appIconsStage = document.getElementById('appIconsStage');
  if (appIconsStage) {
    if ('IntersectionObserver' in window) {
      const aio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) appIconsStage.classList.add('play');
        });
      }, { threshold: 0.1 });
      aio.observe(appIconsStage);
    } else {
      appIconsStage.classList.add('play');
    }
  }

  // Marca Blanca: Knox Track Pro hero click + burst de apps, una vez en vista
  const wlShowcase = document.getElementById('wlShowcase');
  if (wlShowcase) {
    if ('IntersectionObserver' in window) {
      const wlo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) wlShowcase.classList.add('play');
        });
      }, { threshold: 0.1 });
      wlo.observe(wlShowcase);
    } else {
      wlShowcase.classList.add('play');
    }
  }

  // Smart FAQ chat widget (homepage)
  initChatWidget();
  initAudioFab();

  // Dark/light theme toggle
  initThemeToggle();

  // Active nav link highlight
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current) a.classList.add('active');
  });
});
