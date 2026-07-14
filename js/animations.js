/**
 * ============================================================
 *  Atelier Polytech — Animations JavaScript
 *  Scroll reveals, stagger groups, injection molding animation,
 *  and parallax layers.
 * ============================================================
 */

/* ---------------------------------------------------------- */
/*  1. SCROLL REVEAL (Intersection Observer)                  */
/* ---------------------------------------------------------- */

function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}


/* ---------------------------------------------------------- */
/*  2. STAGGER ANIMATION GROUPS                               */
/* ---------------------------------------------------------- */

function initStaggerGroups() {
  const groups = document.querySelectorAll('.stagger-group');
  if (!groups.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.1}s`;
            // Force the reveal if child has .reveal
            setTimeout(() => {
              child.classList.add('active');
            }, 50);
          });
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  groups.forEach((group) => observer.observe(group));
}


/* ---------------------------------------------------------- */
/*  3. INJECTION MOLDING ANIMATION CONTROLLER                 */
/* ---------------------------------------------------------- */

class MoldingAnimation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // SVG elements
    this.svg          = this.container.querySelector('svg');
    this.moldLeft     = this.container.querySelector('.mold-left');
    this.moldRight    = this.container.querySelector('.mold-right');
    this.plasticFlow  = this.container.querySelector('.plastic-flow');
    this.cavityFill   = this.container.querySelector('.cavity-fill');
    this.finishedPart = this.container.querySelector('.finished-part');
    this.ejectorPins  = this.container.querySelector('.ejector-pins');
    this.phaseLabel   = this.container.querySelector('.phase-label');

    // Step indicators
    this.stepDots     = this.container.querySelectorAll('.step-indicator__dot');
    this.stepLines    = this.container.querySelectorAll('.step-line-fill');

    // Process step cards
    this.stepCards    = document.querySelectorAll('.process-step[data-step]');

    // State
    this.isRunning    = false;
    this.isPaused     = false;
    this.currentPhase = 0;
    this.timer        = null;

    this._bindEvents();
  }

  _bindEvents() {
    if (!this.container) return;

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.pause());
    this.container.addEventListener('mouseleave', () => {
      if (this.isPaused) this.resume();
    });
  }

  start() {
    if (!this.container || this.isRunning) return;
    this.isRunning = true;
    this.isPaused  = false;
    this._reset();
    this._runCycle();
  }

  pause() {
    this.isPaused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this._continueFromPhase(this.currentPhase);
  }

  stop() {
    this.isRunning = false;
    this.isPaused  = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this._reset();
  }

  _reset() {
    if (!this.svg) return;

    // Reset mold positions
    if (this.moldRight) this.moldRight.style.transform = 'translateX(25px)';
    if (this.moldLeft)  this.moldLeft.style.transform  = '';

    // Reset plastic
    if (this.plasticFlow) {
      this.plasticFlow.setAttribute('width', '0');
      this.plasticFlow.style.opacity = '0';
      this.plasticFlow.style.fill = '#ff6b35';
    }

    // Reset cavity fill
    if (this.cavityFill) {
      this.cavityFill.style.opacity = '0';
      this.cavityFill.style.fill = '#ff6b35';
    }

    // Reset finished part
    if (this.finishedPart) {
      this.finishedPart.style.opacity = '0';
      this.finishedPart.style.transform = '';
    }

    // Reset ejector pins
    if (this.ejectorPins) {
      this.ejectorPins.style.opacity = '0';
      this.ejectorPins.style.transform = '';
    }

    // Reset phase label
    if (this.phaseLabel) {
      this.phaseLabel.style.opacity = '0';
    }

    this._setActiveStep(0);
  }

  _setActiveStep(step) {
    // Update step dots
    this.stepDots.forEach((dot, i) => {
      if (i < step) {
        dot.style.background = 'var(--accent)';
        dot.style.color = '#fff';
        dot.style.borderColor = 'var(--accent)';
        dot.style.transform = 'scale(1)';
      } else if (i === step) {
        dot.style.background = 'var(--accent)';
        dot.style.color = '#fff';
        dot.style.borderColor = 'var(--accent)';
        dot.style.transform = 'scale(1.15)';
        dot.style.boxShadow = '0 0 12px var(--accent-glow)';
      } else {
        dot.style.background = 'var(--bg-tertiary)';
        dot.style.color = 'var(--text-muted)';
        dot.style.borderColor = 'var(--border-color)';
        dot.style.transform = 'scale(1)';
        dot.style.boxShadow = 'none';
      }
    });

    // Update step lines
    this.stepLines.forEach((line, i) => {
      line.style.width = i < step ? '100%' : '0%';
    });

    // Update step cards
    this.stepCards.forEach((card) => {
      const cardStep = parseInt(card.dataset.step);
      card.classList.toggle('active', cardStep === step + 1);
    });
  }

  _setTransition(el, transition) {
    if (el) el.style.transition = transition;
  }

  _runCycle() {
    this.currentPhase = 0;
    this._phase1_clamp();
  }

    // Phase 1: CLAMPING
  _phase1_clamp() {
    if (!this.isRunning || this.isPaused) return;
    this.currentPhase = 1;
    this._setActiveStep(0);

    if (this.phaseLabel) {
      this.phaseLabel.textContent = 'CLAMPING';
      this.phaseLabel.style.opacity = '1';
      this.phaseLabel.style.transition = 'opacity 0.4s ease';
    }

    // Mold right slides in to close (smoother easing)
    if (this.moldRight) {
      this._setTransition(this.moldRight, 'transform 1.0s cubic-bezier(0.34, 1.56, 0.64, 1)');
      this.moldRight.style.transform = 'translateX(0)';
    }

    // Start injection right as the mold finishes closing
    this.timer = setTimeout(() => this._phase2_inject(), 1000);
  }

    // Phase 2: INJECTION
  _phase2_inject() {
    if (!this.isRunning || this.isPaused) return;
    this.currentPhase = 2;
    this._setActiveStep(1);

    if (this.phaseLabel) {
      this.phaseLabel.textContent = 'INJECTION';
    }

    if (this.plasticFlow) {
      this.plasticFlow.style.opacity = '1';
      this.plasticFlow.style.fill = '#ff6b35';
      this._setTransition(this.plasticFlow, 'none');
      this.plasticFlow.setAttribute('width', '0');

      let startTime = null;
      const duration = 800; // Faster injection
      const maxWidth = 80;

      const animateFlow = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const width = maxWidth * this._easeOutCubic(progress);
        this.plasticFlow.setAttribute('width', width.toString());
        if (progress < 1 && this.isRunning && !this.isPaused) {
          requestAnimationFrame(animateFlow);
        }
      };
      requestAnimationFrame(animateFlow);
    }

    // Overlap cavity fill slightly with the end of flow
    setTimeout(() => {
      if (this.cavityFill && this.isRunning) {
        this._setTransition(this.cavityFill, 'opacity 0.6s ease');
        this.cavityFill.style.opacity = '0.85';
        this.cavityFill.style.fill = '#ff6b35';
      }
    }, 700);

    this.timer = setTimeout(() => this._phase3_cool(), 1600);
  }

    // Phase 3: COOLING
  _phase3_cool() {
    if (!this.isRunning || this.isPaused) return;
    this.currentPhase = 3;
    this._setActiveStep(2);

    if (this.phaseLabel) {
      this.phaseLabel.textContent = 'COOLING';
    }

    // Smooth gradient color transition
    if (this.cavityFill) {
      this._setTransition(this.cavityFill, 'fill 1.0s ease');
      this.cavityFill.style.fill = '#06b6d4';

      setTimeout(() => {
        if (this.isRunning) {
          this._setTransition(this.cavityFill, 'fill 0.8s ease');
          this.cavityFill.style.fill = '#94a3b8';
        }
      }, 1000);
    }

    if (this.plasticFlow) {
      this._setTransition(this.plasticFlow, 'fill 1.8s ease');
      this.plasticFlow.style.fill = '#94a3b8';
    }

    this.timer = setTimeout(() => this._phase4_eject(), 2200);
  }

    // Phase 4: EJECTION
  _phase4_eject() {
    if (!this.isRunning || this.isPaused) return;
    this.currentPhase = 4;
    this._setActiveStep(3);

    if (this.phaseLabel) {
      this.phaseLabel.textContent = 'EJECTION';
    }

    if (this.plasticFlow) {
      this._setTransition(this.plasticFlow, 'opacity 0.3s ease');
      this.plasticFlow.style.opacity = '0';
    }
    if (this.cavityFill) {
      this._setTransition(this.cavityFill, 'opacity 0.3s ease');
      this.cavityFill.style.opacity = '0';
    }

    // Faster mold opening
    if (this.moldRight) {
      this._setTransition(this.moldRight, 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)');
      this.moldRight.style.transform = 'translateX(25px)';
    }

    setTimeout(() => {
      if (this.ejectorPins && this.isRunning) {
        this._setTransition(this.ejectorPins, 'opacity 0.2s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)');
        this.ejectorPins.style.opacity = '1';
        this.ejectorPins.style.transform = 'translateY(-15px)';
      }
    }, 400);

    setTimeout(() => {
      if (this.finishedPart && this.isRunning) {
        this.finishedPart.style.opacity = '1';
        this._setTransition(this.finishedPart, 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease');
        this.finishedPart.style.transform = 'translateY(-55px)';
      }
    }, 550);

    // Fast reset and loop
    this.timer = setTimeout(() => {
      if (this.isRunning) {
        if (this.finishedPart) {
          this._setTransition(this.finishedPart, 'opacity 0.4s ease');
          this.finishedPart.style.opacity = '0';
        }
        if (this.ejectorPins) {
          this._setTransition(this.ejectorPins, 'opacity 0.3s ease');
          this.ejectorPins.style.opacity = '0';
        }

        setTimeout(() => {
          if (this.isRunning) {
            this._reset();
            this._runCycle();
          }
        }, 500);
      }
    }, 1800);
  }

  _continueFromPhase(phase) {
    switch (phase) {
      case 1: this._phase1_clamp(); break;
      case 2: this._phase2_inject(); break;
      case 3: this._phase3_cool(); break;
      case 4: this._phase4_eject(); break;
      default: this._runCycle();
    }
  }

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}


/* ---------------------------------------------------------- */
/*  4. MOLDING ANIMATION VISIBILITY OBSERVER                  */
/* ---------------------------------------------------------- */

function initMoldingAnimation() {
  const container = document.getElementById('molding-process-animation');
  if (!container) return;

  const anim = new MoldingAnimation('molding-process-animation');
  window.atelierMoldingAnim = anim;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!anim.isRunning) anim.start();
          else if (anim.isPaused) anim.resume();
        } else {
          if (anim.isRunning && !anim.isPaused) anim.pause();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(container);
}


/* ---------------------------------------------------------- */
/*  5. GRADIENT TEXT ANIMATION                                */
/* ---------------------------------------------------------- */

function initGradientText() {
  const style = document.createElement('style');
  style.textContent = `
    .gradient-text {
      background: linear-gradient(135deg, var(--accent), var(--accent-hover), var(--accent-dark), var(--accent));
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease infinite;
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);
}


/* ---------------------------------------------------------- */
/*  6. ANIMATION 1: Hero Injection Mold Fill                  */
/* ---------------------------------------------------------- */

function initHeroFill(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let startTime = null;

  // Timeline Adjustments (ms)
  const FILL_DURATION = 3000; 
  const COOL_DURATION = 2000; 
  const PAUSE_DURATION = 2000; 

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let isDarkMode = document.documentElement.classList.contains('dark');
  const observer = new MutationObserver(() => {
    isDarkMode = document.documentElement.classList.contains('dark');
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const moldLayout = {
    sprue: { x: 500, y: 300, r: 12 },
    runners: [
      { x1: 500, y1: 300, x2: 250, y2: 300 }, 
      { x1: 500, y1: 300, x2: 750, y2: 300 }, 
      { x1: 250, y1: 300, x2: 250, y2: 120 }, 
      { x1: 250, y1: 300, x2: 250, y2: 480 }, 
      { x1: 750, y1: 300, x2: 750, y2: 120 }, 
      { x1: 750, y1: 300, x2: 750, y2: 480 }  
    ],
    cavities: [
      { x: 150, y: 70, w: 200, h: 100, entryX: 250, entryY: 120, dirY: -1 },
      { x: 150, y: 430, w: 200, h: 100, entryX: 250, entryY: 480, dirY: 1 },
      { x: 650, y: 70, w: 200, h: 100, entryX: 750, entryY: 120, dirY: -1 },
      { x: 650, y: 430, w: 200, h: 100, entryX: 750, entryY: 480, dirY: 1 }
    ]
  };

  function drawMoldBase(w, h, scaleX, scaleY) {
    ctx.strokeStyle = isDarkMode ? 'rgba(90, 90, 90, 0.25)' : 'rgba(138, 138, 138, 0.15)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = 0; i < w; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
    for (let j = 0; j < h; j += 40) { ctx.moveTo(0, j); ctx.lineTo(w, j); }
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moldLayout.sprue.x * scaleX, moldLayout.sprue.y * scaleY, moldLayout.sprue.r * scaleX, 0, Math.PI * 2);
    moldLayout.runners.forEach(r => {
      ctx.moveTo(r.x1 * scaleX, r.y1 * scaleY);
      ctx.lineTo(r.x2 * scaleX, r.y2 * scaleY);
    });
    moldLayout.cavities.forEach(c => {
      ctx.rect(c.x * scaleX, c.y * scaleY, c.w * scaleX, c.h * scaleY);
    });
    ctx.stroke();
  }

  function getFluidGradient(x1, y1, x2, y2, phase, alpha = 1) {
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    if (phase === 'filling') {
      grad.addColorStop(0, `rgba(232, 93, 4, ${alpha})`);   
      grad.addColorStop(0.7, `rgba(255, 107, 26, ${alpha})`); 
      grad.addColorStop(1, `rgba(200, 230, 255, ${alpha})`); 
    } else if (phase === 'cooling') {
      grad.addColorStop(0, `rgba(65, 65, 65, ${0.4 * (1 - alpha)})`);
      grad.addColorStop(0.5, `rgba(255, 107, 26, ${0.25 * alpha})`);
      grad.addColorStop(1, `rgba(45, 45, 45, ${0.45 * (1 - alpha)})`);
    }
    return grad;
  }

  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const scaleX = w / 1000;
    const scaleY = h / 600;

    ctx.clearRect(0, 0, w, h);
    drawMoldBase(w, h, scaleX, scaleY);

    let phase = 'filling';
    let progress = 0;

    if (elapsed < FILL_DURATION) {
      phase = 'filling';
      progress = 1 - Math.pow(1 - (elapsed / FILL_DURATION), 2);
    } else if (elapsed < FILL_DURATION + COOL_DURATION) {
      phase = 'cooling';
      progress = (elapsed - FILL_DURATION) / COOL_DURATION;
    } else if (elapsed < FILL_DURATION + COOL_DURATION + PAUSE_DURATION) {
      phase = 'pause';
    } else {
      startTime = timestamp;
      animationId = requestAnimationFrame(render);
      return;
    }

    if (phase === 'filling' || phase === 'cooling') {
      ctx.lineWidth = 6 * scaleX;
      ctx.lineCap = 'round';
      const alpha = phase === 'filling' ? 1 : (1 - progress);

      ctx.beginPath();
      ctx.fillStyle = phase === 'filling' ? '#FF6B1A' : getFluidGradient(0, 0, w, h, 'cooling', 1 - progress);
      ctx.arc(moldLayout.sprue.x * scaleX, moldLayout.sprue.y * scaleY, moldLayout.sprue.r * scaleX, 0, Math.PI * 2);
      ctx.fill();

      const runnerProgress = Math.min(progress / 0.4, 1);
      if (runnerProgress > 0) {
        moldLayout.runners.forEach(r => {
          ctx.beginPath();
          const cx1 = r.x1 * scaleX;
          const cy1 = r.y1 * scaleY;
          const cx2 = (r.x1 + (r.x2 - r.x1) * runnerProgress) * scaleX;
          const cy2 = (r.y1 + (r.y2 - r.y1) * runnerProgress) * scaleY;
          ctx.strokeStyle = getFluidGradient(cx1, cy1, cx2, cy2, phase, phase === 'filling' ? 1 : 1 - progress);
          ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2);
          ctx.stroke();
        });
      }

      if (progress > 0.4) {
        const cavityProgress = Math.min((progress - 0.4) / 0.6, 1);
        moldLayout.cavities.forEach(c => {
          const cx = c.x * scaleX; const cy = c.y * scaleY;
          const cw = c.w * scaleX; const ch = c.h * scaleY;

          ctx.save();
          ctx.beginPath();
          ctx.rect(cx, cy, cw, ch);
          ctx.clip();

          ctx.fillStyle = getFluidGradient(c.entryX * scaleX, c.entryY * scaleY, cx + cw/2, cy + ch/2, phase, phase === 'filling' ? 1 : 1 - progress);
          if (c.dirY === -1) {
            const fillHeight = ch * cavityProgress;
            ctx.fillRect(cx, (cy + ch) - fillHeight, cw, fillHeight);
          } else if (c.dirY === 1) {
            const fillHeight = ch * cavityProgress;
            ctx.fillRect(cx, cy, cw, fillHeight);
          }
          ctx.restore();
        });
      }
    }

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);

  return function destroy() {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
    observer.disconnect();
  };
}


/* ---------------------------------------------------------- */
/*  7. ANIMATION 2: Process Steps Connecting Line             */
/* ---------------------------------------------------------- */

function initProcessLine(container) {
  if (!container) return () => {};

  container.innerHTML = `
    <svg width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="xMidYMid meet" style="overflow: visible;">
      <defs>
        <filter id="industrial-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path id="main-track" d="M 50 30 L 1150 30" fill="none" stroke="#FF6B1A" stroke-width="3" filter="url(#industrial-glow)" />
      <g id="node-group"></g>
    </svg>
  `;

  const path = container.querySelector('#main-track');
  const nodeGroup = container.querySelector('#node-group');
  const pathLength = path.getTotalLength();

  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;

  const nodeCount = 6;
  const startX = 50;
  const endX = 1150;
  const stepDist = (endX - startX) / (nodeCount - 1);
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    const cx = startX + (i * stepDist);
    const cy = 30;
    
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", cx); ring.setAttribute("cy", cy); ring.setAttribute("r", "8");
    ring.setAttribute("fill", "none"); ring.setAttribute("stroke", "#FF6B1A"); ring.setAttribute("stroke-width", "2");
    ring.style.transformOrigin = `${cx}px ${cy}px`;
    ring.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
    
    const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    core.setAttribute("cx", cx); core.setAttribute("cy", cy); core.setAttribute("r", "5");
    core.setAttribute("fill", "#FF6B1A");
    core.style.transformOrigin = `${cx}px ${cy}px`;
    core.style.transition = "transform 0.2s ease";
    
    g.appendChild(ring);
    g.appendChild(core);
    nodeGroup.appendChild(g);
    nodes.push({ cx, ring, core, triggered: false });
  }

  let animationStarted = false;
  let startTime = null;
  const duration = 2500; 
  let rafId = null;
  let pulseInterval = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    path.style.strokeDashoffset = pathLength * (1 - ease);
    const currentX = startX + (endX - startX) * ease;

    nodes.forEach((node) => {
      if (!node.triggered && currentX >= node.cx) {
        node.triggered = true;
        node.ring.style.transform = "scale(2.2)";
        node.ring.style.opacity = "0";
        node.core.style.transform = "scale(1.4)";
        setTimeout(() => { node.core.style.transform = "scale(1)"; }, 200);
      }
    });

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      path.style.transition = "opacity 2s ease-in-out";
      pulseInterval = setInterval(() => {
        path.style.opacity = path.style.opacity === "0.6" ? "1" : "0.6";
      }, 2000);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animationStarted) {
        animationStarted = true;
        rafId = requestAnimationFrame(animate);
        observer.unobserve(container);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(container);

  return function destroy() {
    cancelAnimationFrame(rafId);
    clearInterval(pulseInterval);
    observer.disconnect();
  };
}


/* ---------------------------------------------------------- */
/*  8. ANIMATION 3: Contact Section Ambient Glow              */
/* ---------------------------------------------------------- */

function initContactGlow(container) {
  if (!container) return () => {};

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    zIndex: '-1', pointerEvents: 'none'
  });
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let animationId = null;

  function resize() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  let isDarkMode = document.documentElement.classList.contains('dark');
  const observer = new MutationObserver(() => {
    isDarkMode = document.documentElement.classList.contains('dark');
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const orbs = [
    { x: 0.15, y: 0.25, r: 450, color: '255, 107, 26', baseOpacity: 0.15, seedX: 0.08, seedY: 0.12 },
    { x: 0.85, y: 0.75, r: 500, color: '26, 58, 255', baseOpacity: 0.08, seedX: 0.14, seedY: 0.06 }, 
    { x: 0.50, y: 0.50, r: 350, color: '240, 245, 255', baseOpacity: 0.06, seedX: 0.04, seedY: 0.18 } 
  ];

  function render(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';

    const multiplier = isDarkMode ? 1.5 : 1.0;

    orbs.forEach(orb => {
      const dX = Math.sin(time * 0.0004 * orb.seedX) * (canvas.width * 0.15);
      const dY = Math.cos(time * 0.0003 * orb.seedY) * (canvas.height * 0.15);
      const scale = 1 + Math.sin(time * 0.0005 * (orb.seedX + orb.seedY)) * 0.07;

      const cx = (orb.x * canvas.width) + dX;
      const cy = (orb.y * canvas.height) + dY;
      const radius = orb.r * scale;
      const alpha = Math.min(orb.baseOpacity * multiplier, 1.0);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, `rgba(${orb.color}, ${alpha})`);
      g.addColorStop(0.5, `rgba(${orb.color}, ${alpha * 0.3})`);
      g.addColorStop(1, `rgba(${orb.color}, 0)`);

      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    });

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);

  return function destroy() {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    observer.disconnect();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}


/* ---------------------------------------------------------- */
/*  9. ANIMATION 4: Cursor Molten Trail                       */
/* ---------------------------------------------------------- */

function initCursorTrail() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return () => {};

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '99999'
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const MAX_PARTICLES = 20;
  let rafId = null;

  function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Ember {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.0;
      this.vy = Math.random() * 1.5 + 2.0; 
      this.spawnTime = performance.now();
      this.lifespan = 500; 
      this.w = Math.random() * 1.5 + 2.5; 
      this.h = this.w * 1.4;
      this.color = Math.random() > 0.5 ? '#FF6B1A' : '#FFAA44';
    }

    update(now) {
      const age = now - this.spawnTime;
      const progress = age / this.lifespan;
      if (progress >= 1) return false;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle = this.color;
      
      ctx.beginPath();
      ctx.ellipse(0, 0, this.w * (1 - progress * 0.4), this.h * (1 - progress * 0.2), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.x += this.vx;
      this.y += this.vy;
      return true;
    }
  }

  function handleMove(e) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push(new Ember(e.clientX, e.clientY));
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.update(now));
    rafId = requestAnimationFrame(drawFrame);
  }

  window.addEventListener('mousemove', handleMove, { passive: true });
  rafId = requestAnimationFrame(drawFrame);

  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('resize', resize);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}


/* ---------------------------------------------------------- */
/*  10. ANIMATION 5: Product Card 3D Tilt Enhancement         */
/* ---------------------------------------------------------- */

function initTiltEffect(cardElement) {
  if (!cardElement) return () => {};

  cardElement.style.willChange = "transform";
  cardElement.style.transition = "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)";

  let sheen = cardElement.querySelector('.industrial-sheen-layer');
  if (!sheen) {
    sheen = document.createElement('div');
    sheen.className = 'industrial-sheen-layer';
    Object.assign(sheen.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      pointerEvents: 'none', borderRadius: window.getComputedStyle(cardElement).borderRadius,
      mixBlendMode: 'screen', transition: 'opacity 400ms ease', opacity: '0',
      background: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 26, 0.15) 0%, rgba(255, 107, 26, 0) 70%)'
    });
    if (window.getComputedStyle(cardElement).position === 'static') {
      cardElement.style.position = 'relative';
    }
    cardElement.appendChild(sheen);
  }

  function onMouseMove(e) {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    const MAX_ROTATION = 12;
    const rotX = (-normY * MAX_ROTATION).toFixed(2);
    const rotY = (normX * MAX_ROTATION).toFixed(2);

    cardElement.style.transition = "none";
    cardElement.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    sheen.style.transition = "none";
    sheen.style.opacity = '1';
    sheen.style.background = `radial-gradient(circle at ${((x / rect.width) * 100).toFixed(1)}% ${((y / rect.height) * 100).toFixed(1)}%, rgba(255, 107, 26, 0.16) 0%, rgba(255, 107, 26, 0) 65%)`;
  }

  function onMouseLeave() {
    cardElement.style.transition = "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)";
    cardElement.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    sheen.style.transition = "opacity 400ms ease";
    sheen.style.opacity = '0';
  }

  cardElement.addEventListener('mousemove', onMouseMove, { passive: true });
  cardElement.addEventListener('mouseleave', onMouseLeave);

  return function destroy() {
    cardElement.removeEventListener('mousemove', onMouseMove);
    cardElement.removeEventListener('mouseleave', onMouseLeave);
    cardElement.style.transform = "";
    if (sheen && sheen.parentNode) sheen.parentNode.removeChild(sheen);
  };
}


/* ---------------------------------------------------------- */
/*  INITIALIZATION                                            */
/* ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initStaggerGroups();
  initMoldingAnimation();
  initGradientText();
  
  // Custom newly requested animations
  initHeroFill(document.getElementById('hero-canvas'));
  initProcessLine(document.getElementById('process-line'));
  initContactGlow(document.getElementById('contact-glow'));
  
  // Apply Tilt Effect to all product cards
  document.querySelectorAll('.product-card').forEach(card => {
    initTiltEffect(card);
  });
});
