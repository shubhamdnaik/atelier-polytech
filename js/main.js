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
/*  0.5 HERO SLIDESHOW                                        */
/* ---------------------------------------------------------- */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__slide-dot');
  const caption = document.getElementById('heroSlideCaption');
  const progressFill = document.getElementById('heroProgressFill');
  if (!slides.length) return;

  let currentSlide = 0;
  const slideDuration = 6000;
  let slideInterval;
  let progressInterval;
  let startTime;

  function updateProgress() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / slideDuration) * 100, 100);
    if (progressFill) progressFill.style.width = `${progress}%`;
    
    if (progress < 100) {
      progressInterval = requestAnimationFrame(updateProgress);
    }
  }

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');

    if (caption) {
      // Re-trigger animation
      caption.style.animation = 'none';
      caption.offsetHeight; // trigger reflow
      caption.style.animation = null;
      caption.textContent = slides[currentSlide].dataset.caption || '';
    }

    // Reset progress
    cancelAnimationFrame(progressInterval);
    startTime = Date.now();
    updateProgress();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
    startTime = Date.now();
    updateProgress();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      startAutoPlay();
    });
  });

  // Init first progress bar run
  startAutoPlay();
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
    hamburger.classList.add('open');
    if (backdrop) backdrop.classList.add('visible');
    document.body.classList.add('no-scroll');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.classList.remove('no-scroll');
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
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__links .navbar__link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${id}`
      );
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: `-${NAVBAR_OFFSET}px 0px -40% 0px`,
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));
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

    const name  = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');

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

    if (!valid) return;

    const statusEl = document.getElementById('contact-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (statusEl) {
      statusEl.textContent = 'Sending...';
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
        // Show success state
        const wrapper = form.parentElement;
        wrapper.innerHTML = `
          <div style="text-align:center;padding:3rem 1rem;">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--accent)"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1.5rem;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style="margin-bottom:0.5rem;">Message Sent!</h3>
            <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
          </div>
        `;
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            statusEl.textContent = data["errors"].map(error => error["message"]).join(", ");
            statusEl.style.color = '#ef4444';
          } else {
            statusEl.textContent = 'Oops! There was a problem submitting your form';
            statusEl.style.color = '#ef4444';
          }
          if (submitBtn) submitBtn.disabled = false;
        });
      }
    })
    .catch(error => {
      statusEl.textContent = 'Oops! There was a problem submitting your form';
      statusEl.style.color = '#ef4444';
      if (submitBtn) submitBtn.disabled = false;
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
  initHeroSlideshow();
});

