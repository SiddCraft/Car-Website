/**
 * NOCTIS — Scrollytelling Core Engine
 * Pure vanilla JavaScript with 60fps requestAnimationFrame pipeline.
 */

(function () {
  'use strict';

  // Feature detection
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // DOM Elements
  const body = document.body;
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCounter = document.getElementById('preloader-counter');
  const siteNav = document.getElementById('site-nav');
  const grainCanvas = document.getElementById('grain-canvas');
  const customCursor = document.getElementById('custom-cursor');
  const cursorLabel = customCursor ? customCursor.querySelector('.cursor-label') : null;

  // Hero Section Elements
  const heroWrapper = document.getElementById('hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroBlackOverlay = document.getElementById('hero-black-overlay');
  const heroProgressBar = document.getElementById('hero-progress-bar');
  const hudChapter = document.getElementById('hud-chapter-val');
  const hudSpeed = document.getElementById('hud-speed-val');
  const hudDist = document.getElementById('hud-dist-val');
  const heroChapters = [
    document.getElementById('hero-ch-1'),
    document.getElementById('hero-ch-2'),
    document.getElementById('hero-ch-3'),
    document.getElementById('hero-ch-4')
  ];

  // Statement Section Elements
  const statementSec = document.getElementById('statement');
  const statementWords = document.querySelectorAll('.statement-word');

  // Dismantle Section Elements
  const dismantleWrapper = document.getElementById('dismantle');
  const dismantleCanvas = document.getElementById('dismantle-canvas');
  const dismantleCalloutsLayer = document.getElementById('dismantle-callouts');
  const dismantleProgressBar = document.getElementById('dismantle-progress-bar');

  // Lineup Section Elements
  const lineupSection = document.getElementById('lineup');
  const lineupAccordion = document.getElementById('lineup-accordion');

  // State Management
  const state = {
    isMobile: window.innerWidth < 768,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    scrollY: window.scrollY,
    lastScrollY: window.scrollY,
    navHidden: false,
    loadedHeroFrames: 0,
    totalInitialPreload: CONFIG.sections.hero.initialPreloadCount || 40,
    siteReady: false,

    // Hero scrubber
    hero: {
      targetProgress: 0,
      currentProgress: 0,
      targetFrame: 0,
      currentFrame: 0,
      renderedFrame: -1,
      frames: [],
      frameCount: 0
    },

    // Dismantle scrubber
    dismantle: {
      targetProgress: 0,
      currentProgress: 0,
      targetFrame: 0,
      currentFrame: 0,
      renderedFrame: -1,
      frames: [],
      frameCount: 0
    },

    // Custom Cursor
    cursor: {
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
      label: '',
      isHovering: false,
      isDown: false
    },

    // Lineup
    lineup: {
      activeIndex: CONFIG.sections.lineup.defaultOpenIndex || 0,
      hoverTimeout: null
    }
  };

  /* ==========================================================================
     1. FILM GRAIN OVERLAY GENERATOR (Shifted ~8 times/sec, 3.5% opacity)
     ========================================================================== */
  function initFilmGrain() {
    if (!grainCanvas) return;
    const ctx = grainCanvas.getContext('2d');
    const grainSize = 160;

    // Offscreen noise canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = grainSize;
    offCanvas.height = grainSize;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(grainSize, grainSize);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    function resizeGrain() {
      grainCanvas.width = window.innerWidth;
      grainCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGrain);
    resizeGrain();

    let pattern;
    let lastShift = 0;
    const shiftInterval = 125; // ~8 times per second (1000 / 8 = 125ms)

    function renderGrain(now) {
      if (now - lastShift > shiftInterval) {
        lastShift = now;
        ctx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
        if (!pattern) {
          pattern = ctx.createPattern(offCanvas, 'repeat');
        }
        ctx.save();
        const offsetX = (Math.random() * grainSize) | 0;
        const offsetY = (Math.random() * grainSize) | 0;
        ctx.translate(offsetX, offsetY);
        ctx.fillStyle = pattern;
        ctx.fillRect(-offsetX, -offsetY, grainCanvas.width + grainSize, grainCanvas.height + grainSize);
        ctx.restore();
      }
      requestAnimationFrame(renderGrain);
    }
    requestAnimationFrame(renderGrain);
  }

  /* ==========================================================================
     2. CUSTOM CURSOR ("THE HEADLIGHT")
     ========================================================================== */
  function initCustomCursor() {
    if (!isFinePointer || prefersReducedMotion || !customCursor) return;

    window.addEventListener('mousemove', (e) => {
      state.cursor.targetX = e.clientX;
      state.cursor.targetY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      state.cursor.isDown = true;
      customCursor.classList.add('is-down');
      setTimeout(() => {
        state.cursor.isDown = false;
        customCursor.classList.remove('is-down');
      }, 120);
    });

    // Delegate hover states across interactive targets
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor-label], .lineup-slide');
      if (target) {
        state.cursor.isHovering = true;
        customCursor.classList.add('is-hovering');

        // Check if slide
        if (target.classList.contains('lineup-slide')) {
          const isOpen = target.classList.contains('active');
          state.cursor.label = isOpen ? 'CONFIGURE' : 'OPEN';
        } else {
          state.cursor.label = target.getAttribute('data-cursor-label') || 'VIEW';
        }

        if (cursorLabel) cursorLabel.textContent = state.cursor.label;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor-label], .lineup-slide');
      if (target && !e.relatedTarget?.closest('a, button, [data-cursor-label], .lineup-slide')) {
        state.cursor.isHovering = false;
        customCursor.classList.remove('is-hovering');
        state.cursor.label = '';
        if (cursorLabel) cursorLabel.textContent = '';
      }
    });

    // Smooth cursor follow RAF loop
    function updateCursor() {
      const lerp = CONFIG.motion.cursorLerp || 0.18;
      state.cursor.currentX += (state.cursor.targetX - state.cursor.currentX) * lerp;
      state.cursor.currentY += (state.cursor.targetY - state.cursor.currentY) * lerp;

      customCursor.style.transform = `translate3d(${state.cursor.currentX}px, ${state.cursor.currentY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  /* ==========================================================================
     3. FRAME LOADER PIPELINE (Preload 1-40, then stream rest in background)
     ========================================================================== */
  function getFrameUrl(type, index) {
    const isMob = state.isMobile;
    const configGroup = isMob ? CONFIG.frames[type].mobile : CONFIG.frames[type].desktop;
    const num = String(index + 1).padStart(configGroup.digits, '0');
    return `${configGroup.path}${num}${configGroup.ext}`;
  }

  function loadSingleFrame(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      if (img.decode) {
        img.decode()
          .then(() => resolve(img))
          .catch(() => {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          });
      } else {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
      }
    });
  }

  async function initPreloaderAndFrames() {
    const heroCfg = state.isMobile ? CONFIG.frames.hero.mobile : CONFIG.frames.hero.desktop;
    const disCfg = state.isMobile ? CONFIG.frames.dismantle.mobile : CONFIG.frames.dismantle.desktop;

    state.hero.frameCount = heroCfg.count;
    state.dismantle.frameCount = disCfg.count;

    state.hero.frames = new Array(heroCfg.count);
    state.dismantle.frames = new Array(disCfg.count);

    // Initial critical batch: Hero frames 0 to 39
    const initialCount = Math.min(state.totalInitialPreload, heroCfg.count);
    let loadedCount = 0;

    for (let i = 0; i < initialCount; i++) {
      const url = getFrameUrl('hero', i);
      loadSingleFrame(url).then((img) => {
        state.hero.frames[i] = img;
        loadedCount++;
        const pct = Math.round((loadedCount / initialCount) * 100);
        if (preloaderBar) preloaderBar.style.transform = `translateX(-50%) scaleX(${pct / 100})`;
        if (preloaderCounter) preloaderCounter.textContent = String(pct).padStart(3, '0');

        if (loadedCount === initialCount) {
          revealSite();
        }
      });
    }

    // Background streaming for remaining hero frames & dismantle frames
    function streamRest() {
      // 1. Remaining hero frames
      const remainingHero = [];
      for (let i = initialCount; i < heroCfg.count; i++) {
        remainingHero.push(i);
      }

      async function streamHeroQueue() {
        for (const idx of remainingHero) {
          const img = await loadSingleFrame(getFrameUrl('hero', idx));
          state.hero.frames[idx] = img;
        }
        // 2. Stream dismantle frames sequentially after hero
        for (let j = 0; j < disCfg.count; j++) {
          const img = await loadSingleFrame(getFrameUrl('dismantle', j));
          state.dismantle.frames[j] = img;
        }
      }
      setTimeout(streamHeroQueue, 200);
    }

    function revealSite() {
      if (state.siteReady) return;
      state.siteReady = true;

      // Initial canvas draws
      renderCanvasFrame(heroCanvas, state.hero.frames[0]);
      if (state.dismantle.frames[0]) {
        renderCanvasFrame(dismantleCanvas, state.dismantle.frames[0]);
      }

      // Preloader exit sequence
      if (preloaderBar) preloaderBar.classList.add('flash');
      setTimeout(() => {
        preloader.classList.add('preloader-hide');
        body.classList.remove('is-loading');
        // Trigger initial hero reveal
        triggerLineMasks(heroChapters[0]);
        streamRest();
      }, 350);
    }
  }

  /* ==========================================================================
     4. CANVAS RENDERING UTILITY (Cover on landscape, Contain on portrait)
     ========================================================================== */
  function renderCanvasFrame(canvas, img) {
    if (!canvas || !img || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = state.dpr;

    const w = rect.width * dpr;
    const h = rect.height * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const isPortrait = rect.width < rect.height;

    // Strict Rule: Cover-fit on landscape; on portrait contain-fit vertically centred
    let scale;
    if (isPortrait) {
      scale = Math.min(w / iw, h / ih);
    } else {
      scale = Math.max(w / iw, h / ih);
    }

    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    // Solid flat background
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function getNearestLoadedFrame(framesArray, targetIndex) {
    if (framesArray[targetIndex] && framesArray[targetIndex].complete && framesArray[targetIndex].naturalWidth > 0) {
      return framesArray[targetIndex];
    }
    let dist = 1;
    const maxDist = framesArray.length;
    while (dist < maxDist) {
      const down = targetIndex - dist;
      if (down >= 0 && framesArray[down] && framesArray[down].complete && framesArray[down].naturalWidth > 0) {
        return framesArray[down];
      }
      const up = targetIndex + dist;
      if (up < framesArray.length && framesArray[up] && framesArray[up].complete && framesArray[up].naturalWidth > 0) {
        return framesArray[up];
      }
      dist++;
    }
    return null;
  }

  /* ==========================================================================
     5. HERO & DISMANTLE SCROLL SCRUBBING RAF PIPELINE
     ========================================================================== */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function triggerLineMasks(container) {
    if (!container) return;
    const masks = container.querySelectorAll('.line-mask');
    masks.forEach((m, idx) => {
      setTimeout(() => {
        m.classList.add('revealed');
      }, idx * 80);
    });
  }

  function hideLineMasks(container) {
    if (!container) return;
    const masks = container.querySelectorAll('.line-mask');
    masks.forEach((m) => {
      m.classList.remove('revealed');
    });
  }

  function updateHeroScrolly(progress) {
    // 1. Bottom progress bar
    if (heroProgressBar) {
      heroProgressBar.style.transform = `scaleX(${progress})`;
    }

    // 2. Black fade overlay in last 5%
    if (heroBlackOverlay) {
      const fadeProgress = clamp((progress - 0.95) / 0.05, 0, 1);
      heroBlackOverlay.style.opacity = fadeProgress;
    }

    // 3. Left-edge HUD telemetry
    if (hudSpeed) {
      const speed = Math.round(progress * CONFIG.sections.hero.hud.speedMax);
      hudSpeed.textContent = `${String(speed).padStart(3, '0')} KM/H`;
    }
    if (hudDist) {
      const dist = (progress * CONFIG.sections.hero.hud.distanceMax).toFixed(1);
      hudDist.textContent = `${dist} KM`;
    }

    // Active chapter selection
    let activeChapIdx = 0;
    if (progress < 0.16) activeChapIdx = 0;
    else if (progress >= 0.20 && progress <= 0.44) activeChapIdx = 1;
    else if (progress >= 0.48 && progress <= 0.72) activeChapIdx = 2;
    else if (progress >= 0.78) activeChapIdx = 3;
    else activeChapIdx = -1; // In transition between chapters

    if (hudChapter && activeChapIdx >= 0) {
      hudChapter.textContent = `0${activeChapIdx + 1}/04`;
    }

    heroChapters.forEach((ch, idx) => {
      if (idx === activeChapIdx) {
        if (!ch.classList.contains('active')) {
          ch.classList.add('active');
          triggerLineMasks(ch);
        }
      } else {
        if (ch.classList.contains('active')) {
          ch.classList.remove('active');
          hideLineMasks(ch);
        }
      }
    });
  }

  function updateDismantleScrolly(progress) {
    // 1. Bottom progress bar
    if (dismantleProgressBar) {
      dismantleProgressBar.style.transform = `scaleX(${progress})`;
    }

    // 2. Callouts reveal after 70% progress
    const calloutEls = dismantleCalloutsLayer.querySelectorAll('.dismantle-callout');
    CONFIG.sections.dismantle.callouts.forEach((item, idx) => {
      const el = calloutEls[idx];
      if (el) {
        if (progress >= item.progressIn) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  function initDismantleCallouts() {
    if (!dismantleCalloutsLayer) return;
    dismantleCalloutsLayer.innerHTML = '';

    // Create SVG overlay for connecting lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'callout-svg-lines');
    dismantleCalloutsLayer.appendChild(svg);

    CONFIG.sections.dismantle.callouts.forEach((c) => {
      const wrap = document.createElement('div');
      wrap.className = 'dismantle-callout';

      const dot = document.createElement('div');
      dot.className = 'callout-dot';
      dot.style.left = `${c.dot.x}%`;
      dot.style.top = `${c.dot.y}%`;

      const card = document.createElement('div');
      card.className = 'callout-card';
      card.style.left = `${c.text.x}%`;
      card.style.top = `${c.text.y}%`;
      card.innerHTML = `
        <div class="dismantle-callout-tag">${c.label}</div>
        <div class="dismantle-callout-desc">${c.detail}</div>
      `;

      wrap.appendChild(dot);
      wrap.appendChild(card);
      dismantleCalloutsLayer.appendChild(wrap);

      // SVG connecting line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${c.dot.x}%`);
      line.setAttribute('y1', `${c.dot.y}%`);
      line.setAttribute('x2', `${c.text.x}%`);
      line.setAttribute('y2', `${c.text.y}%`);
      svg.appendChild(line);
    });
  }

  /* ==========================================================================
     6. MAIN ANIMATION & SCROLL LOOP (60fps)
     ========================================================================== */
  function onScrollOrResize() {
    state.scrollY = window.scrollY;

    // Navigation auto-hide on scroll down, show on scroll up
    if (siteNav) {
      const currentScroll = state.scrollY;
      if (currentScroll > 100 && currentScroll > state.lastScrollY && !state.navHidden) {
        state.navHidden = true;
        siteNav.classList.add('nav-hidden');
      } else if (currentScroll < state.lastScrollY && state.navHidden) {
        state.navHidden = false;
        siteNav.classList.remove('nav-hidden');
      }
      state.lastScrollY = currentScroll;
    }

    // Hero Progress
    if (heroWrapper) {
      const rect = heroWrapper.getBoundingClientRect();
      const scrollDist = heroWrapper.offsetHeight - window.innerHeight;
      state.hero.targetProgress = clamp(-rect.top / Math.max(scrollDist, 1), 0, 1);
    }

    // Dismantle Progress
    if (dismantleWrapper) {
      const rect = dismantleWrapper.getBoundingClientRect();
      const scrollDist = dismantleWrapper.offsetHeight - window.innerHeight;
      state.dismantle.targetProgress = clamp(-rect.top / Math.max(scrollDist, 1), 0, 1);
    }

    // Statement Section Word-by-word reveal
    if (statementSec && statementWords.length > 0) {
      const rect = statementSec.getBoundingClientRect();
      const totalH = window.innerHeight + rect.height;
      const progress = clamp((window.innerHeight - rect.top) / totalH, 0, 1);

      statementWords.forEach((word, idx) => {
        const wordStart = 0.15 + (idx / statementWords.length) * 0.55;
        const wordEnd = wordStart + 0.12;
        const p = clamp((progress - wordStart) / (wordEnd - wordStart), 0, 1);
        word.style.opacity = (0.15 + 0.85 * p).toFixed(3);
      });
    }
  }

  function animationLoop() {
    const lerp = CONFIG.motion.frameLerp || 0.15;

    // Smooth Hero Scroller
    state.hero.currentProgress += (state.hero.targetProgress - state.hero.currentProgress) * lerp;
    state.hero.targetFrame = Math.round(state.hero.currentProgress * (state.hero.frameCount - 1));

    if (state.hero.targetFrame !== state.hero.renderedFrame) {
      state.hero.renderedFrame = state.hero.targetFrame;
      const nearestImg = getNearestLoadedFrame(state.hero.frames, state.hero.renderedFrame);
      if (nearestImg) {
        renderCanvasFrame(heroCanvas, nearestImg);
      }
    }
    updateHeroScrolly(state.hero.currentProgress);

    // Smooth Dismantle Scroller
    state.dismantle.currentProgress += (state.dismantle.targetProgress - state.dismantle.currentProgress) * lerp;
    state.dismantle.targetFrame = Math.round(state.dismantle.currentProgress * (state.dismantle.frameCount - 1));

    if (state.dismantle.targetFrame !== state.dismantle.renderedFrame) {
      state.dismantle.renderedFrame = state.dismantle.targetFrame;
      const nearestImg = getNearestLoadedFrame(state.dismantle.frames, state.dismantle.renderedFrame);
      if (nearestImg) {
        renderCanvasFrame(dismantleCanvas, nearestImg);
      }
    }
    updateDismantleScrolly(state.dismantle.currentProgress);

    requestAnimationFrame(animationLoop);
  }

  /* ==========================================================================
     7. LINEUP ACCORDION (Interactive Slides, Debounced Hover, Keyboard Nav)
     ========================================================================== */
  function initLineupAccordion() {
    if (!lineupAccordion) return;
    lineupAccordion.innerHTML = '';

    const models = CONFIG.sections.lineup.models;

    models.forEach((m, idx) => {
      const slide = document.createElement('div');
      slide.className = `lineup-slide ${idx === state.lineup.activeIndex ? 'active' : ''}`;
      slide.setAttribute('role', 'tab');
      slide.setAttribute('aria-expanded', idx === state.lineup.activeIndex ? 'true' : 'false');
      slide.setAttribute('aria-label', `${m.num} ${m.name}`);
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('data-index', idx);

      // Build Closed View
      const closedView = document.createElement('div');
      closedView.className = 'slide-closed-view';
      closedView.innerHTML = `
        <span class="lineup-num">${m.num}</span>
        <span class="lineup-vertical-name">${m.verticalName}</span>
      `;

      // Closed tight cropped preview image
      const thumb = document.createElement('img');
      thumb.className = 'slide-thumb-img';
      thumb.src = m.image;
      thumb.alt = `${m.name} Front Light Signature`;
      thumb.loading = 'lazy';

      // Build Open View
      const openView = document.createElement('div');
      openView.className = 'slide-open-view';

      // Open Top
      const openTop = document.createElement('div');
      openTop.className = 'slide-open-top';
      openTop.innerHTML = `
        <div class="line-mask"><h3 class="slide-model-name">${m.name}</h3></div>
        <div class="line-mask"><p class="slide-subtitle">${m.subtitle}</p></div>
      `;

      // Shared Floor Hairline
      const floorLine = document.createElement('div');
      floorLine.className = 'slide-floor-line';

      // Full car image in open view
      const carContainer = document.createElement('div');
      carContainer.className = 'slide-car-container';
      const carImg = document.createElement('img');
      carImg.className = 'slide-car-img';
      carImg.src = m.image;
      carImg.alt = `${m.name} Side Profile Studio Shot`;
      carImg.loading = 'lazy';
      carContainer.appendChild(carImg);

      // Open Bottom (Specs, Swatches, Configure link)
      const openBottom = document.createElement('div');
      openBottom.className = 'slide-open-bottom';

      // Spec row
      const specRow = document.createElement('div');
      specRow.className = 'slide-specs-row';
      m.specs.forEach((s) => {
        specRow.innerHTML += `
          <div class="slide-spec-col">
            <span class="lineup-spec-label">${s.label}</span>
            <span class="lineup-spec-value">${s.value}</span>
          </div>
        `;
      });

      // Actions (Swatches + Link)
      const actions = document.createElement('div');
      actions.className = 'slide-actions';

      // Color swatches
      const swatchesWrap = document.createElement('div');
      swatchesWrap.className = 'slide-swatches';
      m.colors.forEach((c, cIdx) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = `color-swatch ${cIdx === 0 ? 'active' : ''}`;
        sw.style.backgroundColor = c.hex;
        sw.setAttribute('aria-label', c.name);
        sw.setAttribute('title', c.name);
        sw.addEventListener('click', (e) => {
          e.stopPropagation();
          swatchesWrap.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          sw.classList.add('active');
        });
        swatchesWrap.appendChild(sw);
      });

      const configLink = document.createElement('a');
      configLink.href = '#reserve';
      configLink.className = 'lineup-configure-link';
      configLink.textContent = 'Configure →';
      configLink.setAttribute('data-cursor-label', 'CONFIG');

      actions.appendChild(swatchesWrap);
      actions.appendChild(configLink);

      openBottom.appendChild(specRow);
      openBottom.appendChild(actions);

      openView.appendChild(openTop);
      openView.appendChild(floorLine);
      openView.appendChild(carContainer);
      openView.appendChild(openBottom);

      slide.appendChild(thumb);
      slide.appendChild(closedView);
      slide.appendChild(openView);

      // Event listeners
      function activate() {
        if (state.lineup.activeIndex === idx) return;
        state.lineup.activeIndex = idx;
        const allSlides = lineupAccordion.querySelectorAll('.lineup-slide');
        allSlides.forEach((s, sIdx) => {
          const isActive = sIdx === idx;
          s.classList.toggle('active', isActive);
          s.setAttribute('aria-expanded', isActive ? 'true' : 'false');
          if (isActive) {
            triggerLineMasks(s.querySelector('.slide-open-top'));
          }
        });
      }

      // Desktop: 80ms debounced hover
      slide.addEventListener('mouseenter', () => {
        clearTimeout(state.lineup.hoverTimeout);
        state.lineup.hoverTimeout = setTimeout(activate, CONFIG.sections.lineup.hoverDebounceMs || 80);
      });

      slide.addEventListener('mouseleave', () => {
        clearTimeout(state.lineup.hoverTimeout);
      });

      // Touch & Click
      slide.addEventListener('click', activate);

      // Keyboard navigation
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (idx + 1) % models.length;
          const nextSlide = lineupAccordion.querySelectorAll('.lineup-slide')[next];
          if (nextSlide) {
            nextSlide.focus();
            nextSlide.click();
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (idx - 1 + models.length) % models.length;
          const prevSlide = lineupAccordion.querySelectorAll('.lineup-slide')[prev];
          if (prevSlide) {
            prevSlide.focus();
            prevSlide.click();
          }
        }
      });

      lineupAccordion.appendChild(slide);
    });

    // Reveal slides staggered on scroll into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slides = lineupAccordion.querySelectorAll('.lineup-slide');
          slides.forEach((sl, idx) => {
            setTimeout(() => {
              sl.classList.add('visible');
            }, idx * 80);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(lineupSection);
  }

  /* ==========================================================================
     8. ACCESSIBILITY: REDUCED MOTION FALLBACK
     ========================================================================== */
  function applyReducedMotionMode() {
    body.classList.add('reduced-motion');
    // Preload hero static keyframe (first frame) and dismantle keyframe
    const heroCfg = state.isMobile ? CONFIG.frames.hero.mobile : CONFIG.frames.hero.desktop;
    const disCfg = state.isMobile ? CONFIG.frames.dismantle.mobile : CONFIG.frames.dismantle.desktop;

    loadSingleFrame(getFrameUrl('hero', 0)).then((img) => renderCanvasFrame(heroCanvas, img));
    loadSingleFrame(getFrameUrl('dismantle', 0)).then((img) => renderCanvasFrame(dismantleCanvas, img));

    if (preloader) {
      preloader.classList.add('preloader-hide');
      body.classList.remove('is-loading');
    }
  }

  /* ==========================================================================
     9. INITIALIZATION ENTRY POINT
     ========================================================================== */
  function init() {
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', () => {
      state.isMobile = window.innerWidth < 768;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      onScrollOrResize();
    });

    initFilmGrain();
    initCustomCursor();
    initDismantleCallouts();
    initLineupAccordion();

    if (prefersReducedMotion) {
      applyReducedMotionMode();
    } else {
      initPreloaderAndFrames();
      requestAnimationFrame(animationLoop);
    }

    onScrollOrResize();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
