/**
 * ============================================================
 *  Atelier Polytech — Main JavaScript
 *  Core website functionality: navigation, counters,
 *  contact form, product filters, parallax, and smooth scroll.
 *  Theme: Auto-detects system preference (dark/light mode)
 * ============================================================
 */

/* ---------------------------------------------------------- */
/*  0. HERO WORD CYCLING                                      */
/* ---------------------------------------------------------- */

function initHeroWordCycle() {
  const el = document.getElementById('hero-cycling-word');
  if (!el) return;

  const words = ['OEMs', 'Startups', 'Industrials', 'Manufacturers', 'Innovators'];
  let current = 0;

  function cycleWord() {
    // Fade out current word
    el.classList.remove('word-in');
    el.classList.add('word-out');

    setTimeout(() => {
      current = (current + 1) % words.length;
      el.textContent = words[current];
      el.classList.remove('word-out');
      el.classList.add('word-in');
    }, 370); // matches wordFadeOut duration
  }

  // Start cycling after initial entrance animation settles
  setTimeout(() => {
    el.classList.add('word-in');
    setInterval(cycleWord, 2800);
  }, 1400);
}

/* ---------------------------------------------------------- */
/*  0.5 HERO VIDEO SLIDESHOW PLAYLIST                         */
/* ---------------------------------------------------------- */
function initHeroVideoSlideshow() {
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');
  const dotsContainer = document.getElementById('heroSlideDots');
  const caption = document.getElementById('heroSlideCaption');
  const progressFill = document.getElementById('heroProgressFill');

  if (!videoA || !videoB) return;

  const HERO_VIDEOS = [
    {
      src: "assets/videos/1.mp4",
      caption: "High-Tonnage Injection Molding"
    },
    {
      src: "assets/videos/2.mp4",
      caption: "Bambu Lab H2S 3D Prototyping"
    },
    {
      src: "assets/videos/3.mp4",
      caption: "Precision Plastic Components"
    },
    {
      src: "assets/videos/4.mp4",
      caption: "Advanced Mold Design & Tooling"
    },
    {
      src: "assets/videos/5.mp4",
      caption: "Prototype Manufacturing"
    },
    {
      src: "assets/videos/6.mp4",
      caption: "CAD Engineering & Simulation"
    },
    {
      src: "assets/videos/7.mp4",
      caption: "Finished Production Quality"
    }
  ];

  let currentIndex = 0;
  let activePlayer = videoA;
  let idlePlayer = videoB;
  let isTransitioning = false;
  let progressAnimId = null;
  let transitionTimer = null;
  const VIDEO_DURATION_MS = 6500; // ~6.5s per video
  let clipStartTime = Date.now();

  function playSafely(v) {
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const unlock = () => {
          v.play();
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('scroll', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('scroll', unlock, { once: true });
      });
    }
  }

  function updateProgress() {
    const elapsed = Date.now() - clipStartTime;
    const pct = Math.min((elapsed / VIDEO_DURATION_MS) * 100, 100);
    if (progressFill) progressFill.style.width = pct + '%';

    if (pct < 100) {
      progressAnimId = requestAnimationFrame(updateProgress);
    }
  }

  function updateDots(index) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.hero__slide-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }

  function updateCaption(text) {
    if (!caption) return;
    caption.style.opacity = '0';
    setTimeout(() => {
      caption.textContent = text;
      caption.style.opacity = '1';
    }, 200);
  }

  function switchVideo(nextIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    clearTimeout(transitionTimer);
    if (progressAnimId) cancelAnimationFrame(progressAnimId);

    const nextItem = HERO_VIDEOS[nextIndex];
    currentIndex = nextIndex;

    updateDots(currentIndex);
    updateCaption(nextItem.caption);

    // Prepare idle player
    idlePlayer.src = nextItem.src;
    idlePlayer.currentTime = 0;
    idlePlayer.muted = true;
    idlePlayer.defaultMuted = true;

    const finalizeSwitch = () => {
      idlePlayer.classList.add('active');
      activePlayer.classList.remove('active');

      const previousPlayer = activePlayer;
      activePlayer = idlePlayer;
      idlePlayer = previousPlayer;

      clipStartTime = Date.now();
      updateProgress();

      setTimeout(() => {
        previousPlayer.pause();
        isTransitioning = false;
      }, 1000);

      transitionTimer = setTimeout(() => {
        switchVideo((currentIndex + 1) % HERO_VIDEOS.length);
      }, VIDEO_DURATION_MS);
    };

    idlePlayer.load();
    const p = idlePlayer.play();
    if (p !== undefined) {
      p.then(finalizeSwitch).catch(finalizeSwitch);
    } else {
      finalizeSwitch();
    }
  }

  // Setup dot navigation clicks
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.hero__slide-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(targetIdx) && targetIdx !== currentIndex) {
          switchVideo(targetIdx);
        }
      });
    });
  }

  // Initialize first video
  activePlayer.src = HERO_VIDEOS[0].src;
  activePlayer.muted = true;
  activePlayer.defaultMuted = true;
  activePlayer.classList.add('active');
  playSafely(activePlayer);

  updateDots(0);
  if (caption) caption.textContent = HERO_VIDEOS[0].caption;

  clipStartTime = Date.now();
  updateProgress();

  transitionTimer = setTimeout(() => {
    switchVideo(1);
  }, VIDEO_DURATION_MS);

  // Transition on video ended events
  videoA.addEventListener('ended', () => {
    if (activePlayer === videoA) switchVideo((currentIndex + 1) % HERO_VIDEOS.length);
  });
  videoB.addEventListener('ended', () => {
    if (activePlayer === videoB) switchVideo((currentIndex + 1) % HERO_VIDEOS.length);
  });
}

/* ---------------------------------------------------------- */
/*  0.8 THEME DETECTION & DESKTOP TOGGLE                      */
/* ---------------------------------------------------------- */

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');

  // Auto-detect system preference
  const syncWithSystem = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    const isMobile = window.innerWidth <= 860;
    
    // On mobile, strictly follow phone settings
    if (isMobile || !saved) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', saved);
    }
  };

  // Run on initial load
  syncWithSystem();

  // Listen for real-time system theme change on phone/OS
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const isMobile = window.innerWidth <= 860;
      if (isMobile || !localStorage.getItem('theme-manual-override')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  // Desktop Toggle Button
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      localStorage.setItem('theme-manual-override', 'true');
    });
  }
}

/* ---------------------------------------------------------- */
/*  1. MOBILE NAVIGATION                                      */
/* ---------------------------------------------------------- */

function initMobileNav() {
  const hamburger  = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const backdrop   = document.getElementById('nav-backdrop');
  if (!hamburger || !mobileMenu) return;

  const open = () => {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('open');
    if (backdrop) backdrop.classList.add('visible');
    document.body.classList.add('no-scroll');
    document.body.classList.add('mobile-nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('open');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    document.body.classList.remove('mobile-nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.contains('open') ? close() : open();
  });

  // Close when a link is clicked
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  // Close on backdrop click
  if (backdrop) {
    backdrop.addEventListener('click', close);
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      close();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      close();
    }
  });
}


/* ---------------------------------------------------------- */
/*  3. SMOOTH SCROLL                                          */
/* ---------------------------------------------------------- */

const NAVBAR_OFFSET = 80;

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        NAVBAR_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ---------------------------------------------------------- */
/*  4. ACTIVE NAVIGATION LINK                                 */
/* ---------------------------------------------------------- */

function initActiveNav() {
  const navLinks = document.querySelectorAll('.navbar__links .navbar__link, .navbar__mobile-menu .navbar__link');
  if (!navLinks.length) return;

  let currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPath === '' || currentPath === '/') currentPath = 'index.html';
  const normCurrent = currentPath.replace(/\.html$/, '');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const rawTarget = href.split('#')[0];
    const linkPath = (rawTarget ? rawTarget.split('/').pop() : 'index.html') || 'index.html';
    const normLink = linkPath.replace(/\.html$/, '');

    if (normLink === normCurrent || (normCurrent === 'index' && (normLink === '' || normLink === 'index'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/* ---------------------------------------------------------- */
/*  5. NAVBAR SCROLL EFFECT                                   */
/* ---------------------------------------------------------- */

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ---------------------------------------------------------- */
/*  6. ANIMATED COUNTERS                                      */
/* ---------------------------------------------------------- */

function formatNumber(n) {
  return Math.floor(n).toLocaleString('en-US');
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  if (isNaN(target)) return;

  const duration = 2000;
  const start    = performance.now();

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = target * easeOutExpo(progress);

    el.textContent = formatNumber(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = formatNumber(target);
    }
  };

  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach((counter) => observer.observe(counter));
}


/* ---------------------------------------------------------- */
/*  7. CONTACT FORM                                           */
/* ---------------------------------------------------------- */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Handle URL query parameters for product prefill (/contact?subject=... or /contact?product=...)
  const urlParams = new URLSearchParams(window.location.search);
  const subjectParam = urlParams.get('subject') || urlParams.get('product');
  if (subjectParam) {
    const msgField = form.querySelector('[name="message"]');
    const serviceField = form.querySelector('[name="service"]') || form.querySelector('[name="interest"]');
    if (msgField && !msgField.value) {
      msgField.value = `Hi Atelier Polytech team,\n\nI am inquiring about "${subjectParam}". Please share details regarding material availability, pricing, tooling lead times, and MOQ.`;
    }
    if (serviceField) {
      const lower = subjectParam.toLowerCase();
      const matchedCatalogItem = (typeof PRODUCT_CATALOGUE !== 'undefined' && Array.isArray(PRODUCT_CATALOGUE))
        ? PRODUCT_CATALOGUE.find(p => p.title.toLowerCase() === lower)
        : null;

      if ((matchedCatalogItem && matchedCatalogItem.category === '3d-printed') || lower.includes('3d') || lower.includes('dragon') || lower.includes('lamp')) {
        serviceField.value = '3d-print-order';
      } else if (lower.includes('prototype') || lower.includes('laser')) {
        serviceField.value = 'prototyping';
      } else {
        serviceField.value = 'injection-molding';
      }
    }
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showError = (field, message) => {
    field.classList.add('error');
    let errorEl = field.parentElement.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:0.3rem;display:block;';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  };

  const clearErrors = () => {
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    // Check honeypot for spam bots
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== '') {
      // Silently discard spam submission
      return;
    }

    const name    = form.querySelector('[name="name"]');
    const email   = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');

    let valid = true;

    if (name && !name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    }

    if (email && !email.value.trim()) {
      showError(email, 'Please enter your email.');
      valid = false;
    } else if (email && !isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }

    if (message && !message.value.trim()) {
      showError(message, 'Please provide details on your requirements.');
      valid = false;
    }

    if (!valid) return;

    const statusEl = document.getElementById('contact-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    if (statusEl) {
      statusEl.textContent = 'Submitting your inquiry...';
      statusEl.style.color = 'var(--text-muted)';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;
    }

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Show success state
        const wrapper = form.parentElement;
        wrapper.innerHTML = `
          <div style="text-align:center;padding:3rem 1.5rem;">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--accent)"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1.5rem;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style="margin-bottom:0.75rem;font-size:1.6rem;color:var(--text-primary);">Inquiry Received!</h3>
            <p style="color:var(--text-secondary);max-width:480px;margin:0 auto 1.5rem;line-height:1.65;font-size:1rem;">
              Thank you for reaching out. Our engineering team will review your requirements and provide a comprehensive response within 24 business hours.
            </p>
            <div style="background:var(--bg-secondary);padding:1.5rem;border-radius:12px;border:1px solid var(--border-color);max-width:480px;margin:0 auto;text-align:left;">
              <p style="font-size:0.9rem;font-weight:600;margin-bottom:0.5rem;color:var(--text-primary);">Have 3D CAD files or technical drawings?</p>
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.5;">You can share them on WhatsApp or email <a href="mailto:sales@atelierpolytech.com" style="color:var(--accent);font-weight:600;">sales@atelierpolytech.com</a> for immediate DFM review.</p>
              <a href="https://wa.me/918970365175?text=Hi%20Atelier%20Polytech%2C%20I%20just%20submitted%20a%20project%20inquiry%20via%20your%20website." target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp" style="width:100%;">
                Share CAD files on WhatsApp
              </a>
            </div>
          </div>
        `;
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            statusEl.textContent = data["errors"].map(error => error["message"]).join(", ");
            statusEl.style.color = '#ef4444';
          } else {
            statusEl.textContent = 'Oops! There was a problem submitting your form. Please try again or WhatsApp us.';
            statusEl.style.color = '#ef4444';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
        });
      }
    })
    .catch(error => {
      statusEl.textContent = 'Network error. Please check your connection or contact us on WhatsApp directly.';
      statusEl.style.color = '#ef4444';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  });
}


/* ---------------------------------------------------------- */
/*  8. PRODUCTS FILTER                                        */
/* ---------------------------------------------------------- */

function initProductsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('[data-category]');
  if (!filterBtns.length || !cards.length) return;

  const filterCards = (category) => {
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;

      if (match) {
        card.style.display = '';
        void card.offsetHeight;
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (card.style.opacity === '0') {
            card.style.display = 'none';
          }
        }, 350);
      }
    });
  };

  // Add transition styles to cards
  cards.forEach((card) => {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards(btn.dataset.filter);
    });
  });
}


/* ---------------------------------------------------------- */
/*  9. PARALLAX EFFECT                                        */
/* ---------------------------------------------------------- */

function initParallax() {
  const heroBg = document.querySelector('.hero__bg img');
  if (!heroBg) return;

  let ticking = false;

  const update = () => {
    if (window.innerWidth <= 1024) {
      heroBg.style.transform = '';
      ticking = false;
      return;
    }
    const offset = window.scrollY * 0.4;
    heroBg.style.transform = `translateY(${offset}px) scale(1.1)`;
    ticking = false;
  };

  window.addEventListener('resize', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}


/* ---------------------------------------------------------- */
/*  10. SCROLL PROGRESS (Molten Runner)                       */
/* ---------------------------------------------------------- */

function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
    const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = `${(scrollPx / winHeightPx) * 100}%`;
    progressBar.style.width = scrolled;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}


/* ---------------------------------------------------------- */
/*  11. LOGO ANIMATION                                        */
/* ---------------------------------------------------------- */

function initLogoAnimation() {
  const logoImg = document.querySelector('.logo-animated-img');
  if (!logoImg) return;

  // Trigger the animation after a short delay
  setTimeout(() => {
    logoImg.classList.add('logo-animate');
  }, 300);
}


/* ---------------------------------------------------------- */
/*  11. NEWSLETTER FORM                                       */
/* ---------------------------------------------------------- */

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value.trim()) {
      input.value = '';
      input.placeholder = 'Subscribed! ✓';
      setTimeout(() => {
        input.placeholder = 'Your email address';
      }, 3000);
    }
  });
}


/* ---------------------------------------------------------- */
/*  12. SELECT FLOATING LABEL FIX                             */
/* ---------------------------------------------------------- */

function initSelectLabels() {
  document.querySelectorAll('.form-group select').forEach((select) => {
    const updateLabel = () => {
      if (select.value) {
        select.classList.add('has-value');
      } else {
        select.classList.remove('has-value');
      }
    };
    select.addEventListener('change', updateLabel);
    updateLabel();
  });
}


/* ---------------------------------------------------------- */
/*  13. NO-SCROLL UTILITY                                     */
/* ---------------------------------------------------------- */

// Prevent body scroll (used by mobile nav)
// .no-scroll is toggled via mobile nav

const noScrollStyle = document.createElement('style');
noScrollStyle.textContent = `
  .no-scroll { overflow: hidden !important; }
  .navbar.scrolled {
    background: var(--nav-bg) !important;
    box-shadow: var(--shadow-sm);
    border-bottom-color: var(--border-color);
  }
  .field-error {
    color: #ef4444;
    font-size: 0.78rem;
    margin-top: 0.3rem;
    display: block;
  }
  input.error, textarea.error {
    border-bottom-color: #ef4444 !important;
  }
  .form-group select.has-value ~ label,
  .form-group select:focus ~ label {
    transform: translateY(-1.1rem);
    font-size: 0.75rem;
    color: var(--accent);
  }
`;
document.head.appendChild(noScrollStyle);


/* ---------------------------------------------------------- */
/*  14. THEME TOGGLE FUNCTIONALITY                            */
/* ---------------------------------------------------------- */

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (!themeToggleBtn) return;

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}


/* ---------------------------------------------------------- */
/*  15. CAREERS FORM SUBMISSION                               */
/* ---------------------------------------------------------- */

function initCareersForm() {
  const form = document.getElementById('careers-form');
  if (!form) return;

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showError = (field, message) => {
    field.classList.add('error');
    let errorEl = field.parentElement.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:0.3rem;display:block;';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  };

  const clearErrors = () => {
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name       = form.querySelector('[name="name"]');
    const email      = form.querySelector('[name="email"]');
    const phone      = form.querySelector('[name="phone"]');
    const position   = form.querySelector('[name="position"]');
    const experience = form.querySelector('[name="experience"]');
    const cover      = form.querySelector('[name="cover-letter"]');

    let valid = true;

    if (name && !name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    }

    if (email && !email.value.trim()) {
      showError(email, 'Please enter your email.');
      valid = false;
    } else if (email && !isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }

    if (phone && !phone.value.trim()) {
      showError(phone, 'Please enter your phone number.');
      valid = false;
    }

    if (position && !position.value) {
      showError(position, 'Please select a position.');
      valid = false;
    }

    if (experience && !experience.value.trim()) {
      showError(experience, 'Please mention your experience.');
      valid = false;
    }

    if (cover && !cover.value.trim()) {
      showError(cover, 'Please write a brief cover letter.');
      valid = false;
    }

    if (!valid) return;

    const statusEl = document.getElementById('careers-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (statusEl) {
      statusEl.textContent = 'Submitting application...';
      statusEl.style.color = 'var(--text-muted)';
    }
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Show custom inline thank you card
        const wrapper = form.parentElement;
        wrapper.innerHTML = `
          <div style="text-align:center;padding:3rem 1rem;">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--accent)"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1.5rem;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style="margin-bottom:0.5rem;font-family:'Outfit',sans-serif;font-size:1.8rem;">Application Received!</h3>
            <p style="color:var(--text-secondary);max-width:400px;margin:0 auto 1.5rem;">Thank you for applying to join our team. Our HR department will review your details and resume, and get back to you shortly.</p>
            <a href="index.html" class="btn btn--secondary" style="display:inline-flex;">Back to Home</a>
          </div>
        `;
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            statusEl.textContent = data["errors"].map(error => error["message"]).join(", ");
            statusEl.style.color = '#ef4444';
          } else {
            statusEl.textContent = 'Oops! There was a problem submitting your application';
            statusEl.style.color = '#ef4444';
          }
          if (submitBtn) submitBtn.disabled = false;
        });
      }
    })
    .catch(error => {
      statusEl.textContent = 'Oops! There was a problem submitting your application';
      statusEl.style.color = '#ef4444';
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}


/* ---------------------------------------------------------- */
/*  15.5 DYNAMIC PRODUCTS RENDERER                            */
/* ---------------------------------------------------------- */

function renderDynamicProducts() {
  const featuredContainer = document.getElementById('featured-products-container');
  const allContainer = document.getElementById('all-products-container');

  if (typeof PRODUCT_CATALOGUE === 'undefined' || !Array.isArray(PRODUCT_CATALOGUE) || PRODUCT_CATALOGUE.length === 0) {
    const fallbackHTML = `
      <div class="products-fallback" style="text-align:center;padding:3rem 1.5rem;grid-column:1/-1;">
        <p style="color:var(--text-secondary);font-size:1.05rem;margin-bottom:1.5rem;">Products are loading, or contact us for our complete manufacturing catalog.</p>
        <a href="/contact" class="btn btn--primary">Contact Us for Catalog &rarr;</a>
      </div>
    `;
    if (featuredContainer && !featuredContainer.children.length) featuredContainer.innerHTML = fallbackHTML;
    if (allContainer && !allContainer.children.length) allContainer.innerHTML = fallbackHTML;
    return;
  }

  const generateCardHTML = (product) => {
    const is3D = product.category === '3d-printed';
    const catLabel = is3D ? '3D Printed' : 'Injection Molded';
    const contactUrl = `/contact?subject=${encodeURIComponent(product.title)}`;
    const waUrl = `https://wa.me/918970365175?text=${encodeURIComponent('Hi Atelier Polytech, I want to order the ' + product.title + '.')}`;

    const actionButton = is3D
      ? `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--sm" style="flex:1;width:100%;text-align:center;font-size:0.82rem;padding:0.55rem 0.75rem;display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/></svg>
          Order on WhatsApp
        </a>`
      : `<a href="${contactUrl}" class="btn btn--primary btn--sm product-card__inquire-btn" style="flex:1;width:100%;text-align:center;font-size:0.82rem;padding:0.55rem 0.75rem;">Inquire Now</a>`;

    return `
      <div class="product-card" data-category="${product.category}" data-title="${product.title}" data-images='${JSON.stringify(product.images)}' data-desc="${product.desc}">
        <div class="product-card__image">
          <img src="${product.images[0]}" alt="${product.title} - Atelier Polytech" loading="lazy" width="400" height="300">
        </div>
        <div class="product-card__content">
          <span style="display:inline-block; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent); margin-bottom:0.35rem;">${catLabel}</span>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem; color: var(--text-primary);">${product.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${product.desc}</p>
          <div style="display:flex;gap:0.5rem;margin-top:auto;width:100%;">
            ${actionButton}
          </div>
        </div>
      </div>
    `;
  };

  if (featuredContainer) {
    // Show balanced showcase of 3D printed & injection molded products (4 total)
    const printed = PRODUCT_CATALOGUE.filter(p => p.category === '3d-printed').slice(0, 2);
    const molded = PRODUCT_CATALOGUE.filter(p => p.category === 'injection-molded').slice(0, Math.max(2, 4 - printed.length));
    const selected = [...printed, ...molded];
    featuredContainer.innerHTML = selected.map(generateCardHTML).join('');
  }

  if (allContainer) {
    allContainer.innerHTML = PRODUCT_CATALOGUE.map(generateCardHTML).join('');
  }
}

/* ---------------------------------------------------------- */
/*  16. PRODUCT CARD AUTO-CAROUSEL & ENLARGED VIEW LIGHTBOX   */
/* ---------------------------------------------------------- */
function initProductGalleries(openEnlargedModal) {
  const cards = document.querySelectorAll('.product-card, .showcase-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeIntervals = [];

  cards.forEach((card, cardIdx) => {
    if (card.dataset.galleryInitialized) return;

    const rawImages = card.getAttribute('data-images');
    const container = card.querySelector('.product-card__image, .showcase-card__gallery');
    if (!rawImages || !container) return;

    let images = [];
    try {
      images = JSON.parse(rawImages);
    } catch (e) {
      console.error('Error parsing product images JSON', e);
      return;
    }
    if (!Array.isArray(images) || images.length === 0) return;

    card.dataset.galleryInitialized = 'true';
    const cardTitle = card.getAttribute('data-title') || 'Product';
    const hasMultiple = images.length > 1;
    let currentIndex = 0;
    let isHoveredOrFocused = false;
    let autoTimer = null;

    container.classList.add('has-carousel');
    container.innerHTML = `
      <div class="card-carousel${hasMultiple ? '' : ' card-carousel--single'}">
        <div class="card-carousel__track">
          ${images.map((src, idx) => `
            <div class="card-carousel__slide" data-slide-idx="${idx}">
              <img src="${src}" alt="${cardTitle}${hasMultiple ? ` view ${idx + 1}` : ''} - Atelier Polytech" width="400" height="300" loading="${idx === 0 ? 'eager' : 'lazy'}">
            </div>
          `).join('')}
        </div>
        <button type="button" class="card-carousel__enlarge" aria-label="Enlarge images for ${cardTitle}" title="Open enlarged view">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        ${hasMultiple ? `
          <button type="button" class="card-carousel__btn card-carousel__btn--prev" aria-label="Previous image for ${cardTitle}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button type="button" class="card-carousel__btn card-carousel__btn--next" aria-label="Next image for ${cardTitle}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div class="card-carousel__dots" role="tablist" aria-label="${cardTitle} gallery navigation">
            ${images.map((_, idx) => `
              <button type="button" class="card-carousel__dot${idx === 0 ? ' active' : ''}" data-dot-idx="${idx}" aria-label="Show image ${idx + 1} of ${images.length}" aria-selected="${idx === 0 ? 'true' : 'false'}"></button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const track = container.querySelector('.card-carousel__track');
    const dots = Array.from(container.querySelectorAll('.card-carousel__dot'));
    const prevBtn = container.querySelector('.card-carousel__btn--prev');
    const nextBtn = container.querySelector('.card-carousel__btn--next');
    const enlargeBtn = container.querySelector('.card-carousel__enlarge');
    const slides = container.querySelectorAll('.card-carousel__slide');

    const goTo = (nextIdx) => {
      if (!track || images.length === 0) return;
      currentIndex = (nextIdx + images.length) % images.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      card.dataset.activeIndex = String(currentIndex);
      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const startAutoPlay = () => {
      if (!hasMultiple || prefersReducedMotion || autoTimer) return;
      const delay = 3200 + (cardIdx % 4) * 400;
      autoTimer = setInterval(() => {
        if (isHoveredOrFocused || document.hidden || document.body.classList.contains('no-scroll')) return;
        goTo(currentIndex + 1);
      }, delay);
      activeIntervals.push(autoTimer);
    };

    const resetAutoPlay = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      startAutoPlay();
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(currentIndex - 1);
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(currentIndex + 1);
        resetAutoPlay();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetIdx = parseInt(dot.getAttribute('data-dot-idx'), 10);
        if (!isNaN(targetIdx)) {
          goTo(targetIdx);
          resetAutoPlay();
        }
      });
    });

    if (enlargeBtn) {
      enlargeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openEnlargedModal === 'function') openEnlargedModal(card, currentIndex);
      });
    }

    let touchStartX = 0;
    let touchEndX = 0;
    container.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].clientX;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!hasMultiple || !e.changedTouches || !e.changedTouches[0]) return;
      touchEndX = e.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > 36) {
        if (delta < 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
        resetAutoPlay();
      }
    }, { passive: true });

    slides.forEach((slide) => {
      slide.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openEnlargedModal === 'function') openEnlargedModal(card, currentIndex);
      });
    });

    card.addEventListener('mouseenter', () => { isHoveredOrFocused = true; });
    card.addEventListener('mouseleave', () => { isHoveredOrFocused = false; });
    card.addEventListener('focusin', () => { isHoveredOrFocused = true; });
    card.addEventListener('focusout', () => {
      if (!card.contains(document.activeElement)) {
        isHoveredOrFocused = false;
      }
    });

    startAutoPlay();
  });
}

function initQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) {
    initProductGalleries(null);
    return;
  }

  const closeBtn = document.getElementById('quick-view-close');
  const stage = document.getElementById('quick-view-main-image-container');
  const mainImg = document.getElementById('quick-view-main-image');
  const prevBtn = document.getElementById('quick-view-prev');
  const nextBtn = document.getElementById('quick-view-next');
  const dotsContainer = document.getElementById('quick-view-dots');
  const counterEl = document.getElementById('quick-view-counter');
  const title = document.getElementById('quick-view-title');
  const desc = document.getElementById('quick-view-desc');
  const thumbContainer = document.getElementById('quick-view-thumbnails');
  const inqBtn = document.getElementById('quick-view-inquire-btn');
  const waBtn = document.getElementById('quick-view-wa-btn');

  let currentImages = [];
  let currentCardTitle = 'Product';
  let activeModalIdx = 0;

  const setModalSlide = (idx) => {
    if (!currentImages.length) return;
    activeModalIdx = (idx + currentImages.length) % currentImages.length;
    const src = currentImages[activeModalIdx];

    if (mainImg) {
      mainImg.src = src;
      mainImg.alt = `${currentCardTitle} - Enlarged view ${activeModalIdx + 1}`;
    }
    if (counterEl) {
      counterEl.textContent = `${activeModalIdx + 1} / ${currentImages.length}`;
    }
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, i) => {
        const isActive = i === activeModalIdx;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
    if (thumbContainer) {
      Array.from(thumbContainer.children).forEach((thumb, i) => {
        thumb.style.border = i === activeModalIdx ? '2px solid var(--accent)' : '1px solid var(--border-color)';
      });
    }
  };

  const openModal = (card, startIndex = 0) => {
    const rawImages = card.getAttribute('data-images');
    if (!rawImages) return;

    let images = [];
    try {
      images = JSON.parse(rawImages);
    } catch (e) {
      console.error('Error parsing images JSON', e);
      return;
    }
    if (!Array.isArray(images) || images.length === 0) return;

    currentImages = images;
    currentCardTitle = card.getAttribute('data-title') || 'Product';
    const cardDesc = card.getAttribute('data-desc') || '';
    const cardCat = card.getAttribute('data-category') || '';
    const is3D = cardCat === '3d-printed' || (typeof PRODUCT_CATALOGUE !== 'undefined' && Array.isArray(PRODUCT_CATALOGUE) && PRODUCT_CATALOGUE.some(p => p.title === currentCardTitle && p.category === '3d-printed'));
    const hasMultiple = images.length > 1;

    if (title) title.textContent = currentCardTitle;
    if (desc) desc.textContent = cardDesc;
    if (inqBtn) {
      inqBtn.href = `/contact?subject=${encodeURIComponent(currentCardTitle)}`;
      inqBtn.textContent = is3D ? 'Request Custom Quote' : 'Request Quote / Email';
    }

    if (waBtn) {
      const waMsg = is3D
        ? `Hi Atelier Polytech, I want to order the "${currentCardTitle}". Please let me know pricing, available colors, and dispatch time.`
        : `Hi Atelier Polytech, I'd like a quote for "${currentCardTitle}".`;
      waBtn.href = `https://wa.me/918970365175?text=${encodeURIComponent(waMsg)}`;
      waBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/></svg>
        ${is3D ? 'Order on WhatsApp' : 'Chat on WhatsApp'}
      `;
    }

    if (prevBtn) prevBtn.hidden = !hasMultiple;
    if (nextBtn) nextBtn.hidden = !hasMultiple;
    if (counterEl) counterEl.hidden = !hasMultiple;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      dotsContainer.hidden = !hasMultiple;
      if (hasMultiple) {
        images.forEach((_, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'card-carousel__dot';
          dot.setAttribute('aria-label', `View enlarged image ${idx + 1} of ${images.length}`);
          dot.addEventListener('click', () => setModalSlide(idx));
          dotsContainer.appendChild(dot);
        });
      }
    }

    if (thumbContainer) {
      thumbContainer.innerHTML = '';
      thumbContainer.style.display = hasMultiple ? 'flex' : 'none';
      if (hasMultiple) {
        images.forEach((src, idx) => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = `${currentCardTitle} thumbnail ${idx + 1}`;
          img.style.width = '54px';
          img.style.height = '54px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '6px';
          img.style.cursor = 'pointer';
          img.style.background = 'var(--gradient-card)';
          img.addEventListener('click', () => setModalSlide(idx));
          thumbContainer.appendChild(img);
        });
      }
    }

    setModalSlide(startIndex);

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  if (prevBtn) prevBtn.addEventListener('click', () => setModalSlide(activeModalIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setModalSlide(activeModalIdx + 1));

  if (stage) {
    let modalTouchStartX = 0;
    stage.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) modalTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (currentImages.length <= 1 || !e.changedTouches || !e.changedTouches[0]) return;
      const delta = e.changedTouches[0].clientX - modalTouchStartX;
      if (Math.abs(delta) > 36) {
        if (delta < 0) setModalSlide(activeModalIdx + 1);
        else setModalSlide(activeModalIdx - 1);
      }
    }, { passive: true });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft' && currentImages.length > 1) setModalSlide(activeModalIdx - 1);
    else if (e.key === 'ArrowRight' && currentImages.length > 1) setModalSlide(activeModalIdx + 1);
  });

  initProductGalleries(openModal);
}

/* ---------------------------------------------------------- */
/*  17. FLOATING WHATSAPP WIDGET (ALL PAGES)                  */
/* ---------------------------------------------------------- */
const WHATSAPP_PHONE = '918970365175';

function initFloatingWhatsApp() {
  if (document.getElementById('floating-whatsapp-widget')) return;

  const path = window.location.pathname.toLowerCase();
  let defaultMessage = "Hi Atelier Polytech, I have an enquiry about plastic injection molding / prototyping.";
  if (path.includes('prototyping')) {
    defaultMessage = "Hi Atelier Polytech, I have an enquiry about prototyping and 3D printing.";
  } else if (path.includes('products')) {
    defaultMessage = "Hi Atelier Polytech, I have an enquiry about your plastic products.";
  } else if (path.includes('services')) {
    defaultMessage = "Hi Atelier Polytech, I have an enquiry about plastic injection molding services.";
  }

  const encodedMsg = encodeURIComponent(defaultMessage);
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;

  const container = document.createElement('div');
  container.className = 'floating-whatsapp';
  container.id = 'floating-whatsapp-widget';
  container.innerHTML = `
    <div class="floating-whatsapp__tooltip" id="wa-tooltip" role="tooltip">
      <span>Chat with us on WhatsApp</span>
      <button class="floating-whatsapp__tooltip-close" id="wa-tooltip-close" aria-label="Dismiss WhatsApp tooltip">&times;</button>
    </div>
    <a href="${waUrl}" class="floating-whatsapp__btn" id="wa-floating-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat with Atelier Polytech on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM17.39 16.5C17.17 17.13 16.3 17.67 15.62 17.75C15.15 17.81 14.54 17.84 12.49 16.99C9.87 15.9 8.18 13.23 8.05 13.06C7.92 12.89 7 11.67 7 10.41C7 9.15 7.65 8.53 7.89 8.27C8.13 8.01 8.52 7.89 8.87 7.89C8.99 7.89 9.1 7.9 9.2 7.9C9.48 7.91 9.62 7.93 9.8 8.38C10.03 8.94 10.59 10.31 10.66 10.45C10.73 10.59 10.79 10.78 10.7 10.96C10.61 11.14 10.53 11.23 10.39 11.39C10.25 11.55 10.12 11.66 9.98 11.83C9.83 11.99 9.68 12.16 9.84 12.44C10 12.72 10.56 13.63 11.38 14.36C12.44 15.3 13.31 15.6 13.62 15.73C13.93 15.86 14.11 15.83 14.29 15.62C14.47 15.41 15.07 14.71 15.28 14.41C15.49 14.11 15.7 14.16 15.99 14.27C16.28 14.38 17.83 15.14 18.15 15.3C18.47 15.46 18.68 15.54 18.76 15.67C18.84 15.8 18.84 16.43 18.62 17.06L17.39 16.5Z"/>
      </svg>
    </a>
  `;
  document.body.appendChild(container);

  const tooltip = document.getElementById('wa-tooltip');
  const tooltipClose = document.getElementById('wa-tooltip-close');
  const btn = document.getElementById('wa-floating-btn');

  // Show tooltip after ~3 seconds if not previously dismissed
  if (!sessionStorage.getItem('wa_tooltip_dismissed')) {
    setTimeout(() => {
      if (tooltip) tooltip.classList.add('is-visible');
    }, 3200);
  }

  if (tooltipClose) {
    tooltipClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (tooltip) tooltip.classList.remove('is-visible');
      sessionStorage.setItem('wa_tooltip_dismissed', 'true');
    });
  }

  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', {
          event_category: 'engagement',
          event_label: window.location.pathname
        });
      }
    });
  }
}

/* ---------------------------------------------------------- */
/*  18. SMOOTH FADING VIDEO LOOP FOR SUBPAGE HEROES           */
/* ---------------------------------------------------------- */
function initPageHeroVideos() {
  const videos = document.querySelectorAll('.page-hero__video, .products-hero__video');
  if (!videos.length) return;

  videos.forEach((video) => {
    if (video.dataset.loopInitialized) return;
    video.dataset.loopInitialized = 'true';

    video.removeAttribute('loop');
    video.muted = true;
    video.defaultMuted = true;

    let isFadingOut = false;
    const FADE_LEAD_TIME = 1.2; // starts fading out 1.2s before the end

    const fadeIn = () => {
      requestAnimationFrame(() => {
        video.classList.add('is-visible');
      });
    };

    const playSafely = () => {
      const p = video.play();
      if (p !== undefined) {
        p.then(fadeIn).catch(() => {
          const unlock = () => {
            video.play().then(fadeIn).catch(() => {});
            window.removeEventListener('click', unlock);
            window.removeEventListener('scroll', unlock);
            window.removeEventListener('touchstart', unlock);
          };
          window.addEventListener('click', unlock, { once: true });
          window.addEventListener('scroll', unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
        });
      } else {
        fadeIn();
      }
    };

    const loopSmoothly = () => {
      if (isFadingOut) return;
      isFadingOut = true;
      // Smoothly fade out to deep black
      video.classList.remove('is-visible');

      // After fade completes, reset and fade back in seamlessly
      setTimeout(() => {
        video.currentTime = 0;
        isFadingOut = false;
        playSafely();
      }, 1200);
    };

    video.addEventListener('timeupdate', () => {
      if (!video.duration || isFadingOut) return;
      const timeLeft = video.duration - video.currentTime;
      if (timeLeft <= FADE_LEAD_TIME) {
        loopSmoothly();
      }
    });

    video.addEventListener('ended', () => {
      loopSmoothly();
    });

    if (video.readyState >= 2) {
      playSafely();
    } else {
      video.addEventListener('loadeddata', playSafely, { once: true });
    }
  });
}

/* ---------------------------------------------------------- */
/*  INITIALIZATION                                            */
/* ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initSmoothScroll();
  initActiveNav();
  initNavbarScroll();
  initCounters();
  initContactForm();
  initCareersForm();
  initProductsFilter();
  initParallax();
  initScrollProgress();
  initLogoAnimation();
  initNewsletter();
  initSelectLabels();
  initHeroWordCycle();
  initHeroVideoSlideshow();
  initPageHeroVideos();
  renderDynamicProducts();
  initQuickView();
  initFloatingWhatsApp();
});

