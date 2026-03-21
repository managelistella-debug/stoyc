/* ============================================
   LISTELLA — Homepage JavaScript
   ============================================ */

(function() {
  'use strict';

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const home = document.getElementById('ls-home');
    if (!home) return;

    introSequence();
    initTimeDisplay();
    initDraggableIcons();
    initScrollReveal();
    initSlider();
    initThemeToggle();
    initMobileMenu();
    initProjectCursor();
    initProjectFilters();
    initFAQ();
    initSmoothScroll();
    initScrollWhite();
    initHeroCursor();
  }

  /* === INTRO SEQUENCE === */
  function introSequence() {
    const overlay = document.getElementById('ls-intro-overlay');
    const counter = document.getElementById('ls-intro-counter');
    const nav = document.getElementById('ls-nav');
    const mobileNav = document.getElementById('ls-mobile-nav');
    const footer = document.getElementById('ls-footer');
    const mainContent = document.getElementById('ls-main-content');

    if (!overlay) return;

    // Lock scroll during intro
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100vw';

    function fadeOutIntro() {
      // Fade out counter
      if (counter) counter.style.opacity = '0';

      // Short delay then fade overlay into homepage
      setTimeout(function() {
        if (mainContent) mainContent.classList.add('ls-content-visible');
        overlay.classList.add('ls-intro-hidden');

        // Unlock scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';

        // Remove overlay from DOM after fade completes, then show nav
        setTimeout(function() {
          overlay.style.display = 'none';
          if (nav) nav.classList.add('ls-nav-visible');
          if (mobileNav) mobileNav.classList.add('ls-nav-visible');
          if (footer) footer.classList.add('ls-footer-visible');
        }, 1000);
      }, 300);
    }

    // Detect video type and trigger fade at end
    var introVideo = overlay.querySelector('video');
    var introImg = overlay.querySelector('img.ls-intro-video');
    var fadeTriggered = false;

    if (introVideo) {
      // Desktop: listen for video end
      introVideo.addEventListener('ended', function() {
        if (!fadeTriggered) { fadeTriggered = true; fadeOutIntro(); }
      });
      // Safety fallback
      setTimeout(function() {
        if (!fadeTriggered) { fadeTriggered = true; fadeOutIntro(); }
      }, 5000);
    } else if (introImg) {
      // Mobile <img>: hide the image after one play so it goes to black, then fade out
      setTimeout(function() {
        introImg.style.opacity = '0';
        introImg.style.transition = 'opacity 0.4s ease';
      }, 2800);
      // Fade overlay to homepage after going black
      setTimeout(function() {
        if (!fadeTriggered) { fadeTriggered = true; fadeOutIntro(); }
      }, 3400);
    } else {
      setTimeout(function() { fadeOutIntro(); }, 3000);
    }
  }

  /* === TIME DISPLAY === */
  function initTimeDisplay() {
    var timeEl = document.getElementById('ls-time-display');
    if (!timeEl) return;

    function updateTime() {
      var now = new Date();
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      var pad = function(n) { return n < 10 ? '0' + n : n; };
      timeEl.textContent = h + ':' + pad(m) + ':' + pad(s) + ' ' + ampm;
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* === DRAGGABLE ICONS === */
  function initDraggableIcons() {
    var icons = document.querySelectorAll('[data-ls-drag]');
    icons.forEach(function(icon) {
      var isDragging = false;
      var startX, startY, initialX, initialY;
      var currentX = 0, currentY = 0;

      var dragThreshold = 10;
      var dragConfirmed = false;

      icon.addEventListener('mousedown', dragStart);
      icon.addEventListener('touchstart', dragStart, { passive: true });

      function dragStart(e) {
        isDragging = true;
        dragConfirmed = false;
        if (e.type === 'touchstart') {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          startX = e.clientX;
          startY = e.clientY;
        }
        initialX = currentX;
        initialY = currentY;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
      }

      function drag(e) {
        if (!isDragging) return;

        var clientX, clientY;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        // Only start dragging after threshold — let normal scroll through
        if (!dragConfirmed) {
          var dx = Math.abs(clientX - startX);
          var dy = Math.abs(clientY - startY);
          // If moving more vertically, it's a scroll — let it through
          if (dy > dx && dy > dragThreshold) {
            isDragging = false;
            return;
          }
          if (dx > dragThreshold) {
            dragConfirmed = true;
            icon._lsDragged = true;
          } else {
            return;
          }
        }

        // Only preventDefault on touch to avoid blocking desktop scroll
        if (e.type === 'touchmove') e.preventDefault();
        currentX = initialX + (clientX - startX);
        currentY = initialY + (clientY - startY);

        icon.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
      }

      function dragEnd() {
        isDragging = false;
        dragConfirmed = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', dragEnd);
      }

      // Safety: end drag if mouse leaves the window
      document.addEventListener('mouseleave', function() {
        if (isDragging) dragEnd();
      });
    });

    // Floating animation for icons (only when not dragged)
    // Also: hover push-away with elastic spring-back
    icons.forEach(function(icon, i) {
      var speedY = 3 + Math.random() * 2;
      var speedX = 4 + Math.random() * 3;
      var speedRot = 5 + Math.random() * 4;
      var ampY = 20 + Math.random() * 15;
      var ampX = 12 + Math.random() * 10;
      var ampRot = 3 + Math.random() * 4;
      var offsetY = Math.random() * Math.PI * 2;
      var offsetX = Math.random() * Math.PI * 2;
      var offsetRot = Math.random() * Math.PI * 2;
      var startTime = performance.now();
      icon._lsDragged = false;

      // Spring push-away state — slow elastic rebound
      var pushX = 0, pushY = 0;
      var pushVelX = 0, pushVelY = 0;
      var springK = 0.03;    // gentle spring stiffness
      var damping = 0.94;    // slow damping — long settle
      var pushStrength = 40; // moderate push distance
      var lastPushTime = 0;  // cooldown to prevent spam

      icon.addEventListener('mouseenter', function(e) {
        if (icon._lsDragged) return;
        var now = performance.now();
        if (now - lastPushTime < 1200) return; // 1.2s cooldown between pushes
        lastPushTime = now;
        var rect = icon.getBoundingClientRect();
        var iconCX = rect.left + rect.width / 2;
        var iconCY = rect.top + rect.height / 2;
        var dx = iconCX - e.clientX;
        var dy = iconCY - e.clientY;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        pushVelX += (dx / dist) * pushStrength;
        pushVelY += (dy / dist) * pushStrength;
      });

      function float(time) {
        if (!icon._lsDragged) {
          var elapsed = (time - startTime) / 1000;
          var floatY = Math.sin(elapsed / speedY + offsetY) * ampY;
          var floatX = Math.cos(elapsed / speedX + offsetX) * ampX;
          var rot = Math.sin(elapsed / speedRot + offsetRot) * ampRot;

          // Spring physics for push-away
          pushVelX += -pushX * springK;
          pushVelY += -pushY * springK;
          pushVelX *= damping;
          pushVelY *= damping;
          pushX += pushVelX;
          pushY += pushVelY;

          // Snap to zero when close enough
          if (Math.abs(pushX) < 0.1 && Math.abs(pushVelX) < 0.1) { pushX = 0; pushVelX = 0; }
          if (Math.abs(pushY) < 0.1 && Math.abs(pushVelY) < 0.1) { pushY = 0; pushVelY = 0; }

          icon.style.transform = 'translate(' + (floatX + pushX) + 'px, ' + (floatY + pushY) + 'px) rotate(' + rot + 'deg)';
        }
        requestAnimationFrame(float);
      }
      requestAnimationFrame(float);
    });
  }

  /* === SCROLL REVEAL === */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('[data-ls-reveal]');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Check if this is a heading that should animate word by word
          var el = entry.target;
          if (el.classList.contains('ls-heading')) {
            animateWords(el);
          } else {
            el.classList.add('ls-revealed');
          }
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function(el) {
      observer.observe(el);
    });
  }

  function animateWords(heading) {
    var hasPenMarks = heading.classList.contains('ls-has-pen-marks');

    if (hasPenMarks) {
      // For pen-mark headings, preserve the inner HTML structure with SVGs
      // Wrap each text node's words in spans, but leave pen-word spans intact
      wrapWordsPreservingStructure(heading);
      heading.classList.add('ls-revealed');

      // Trigger word-by-word reveal
      requestAnimationFrame(function() {
        var wordSpans = heading.querySelectorAll('.ls-word');
        wordSpans.forEach(function(span) {
          span.classList.add('ls-word-visible');
        });

        // After words are revealed, trigger pen marks sequentially
        var totalWords = wordSpans.length;
        var wordRevealDuration = totalWords * 40 + 350; // total time for words to appear

        // Find pen marks and sort by order
        var penMarks = heading.querySelectorAll('.ls-pen-word');
        var sorted = Array.prototype.slice.call(penMarks).sort(function(a, b) {
          return (parseInt(a.getAttribute('data-pen-order')) || 0) - (parseInt(b.getAttribute('data-pen-order')) || 0);
        });

        sorted.forEach(function(mark, i) {
          setTimeout(function() {
            var paths = mark.querySelectorAll('.ls-pen-path');
            paths.forEach(function(path) {
              // Measure actual path length for accurate dash
              var len = path.getTotalLength ? path.getTotalLength() : 1000;
              path.style.strokeDasharray = len;
              path.style.strokeDashoffset = len;
              path.classList.add('ls-pen-animate');
            });
          }, wordRevealDuration + (i * 600));
        });
      });
    } else {
      // Original behavior for non-pen headings
      var text = heading.innerHTML.trim();
      var words = text.split(/\s+/).filter(function(w) { return w.length > 0; });
      heading.innerHTML = '';
      heading.classList.add('ls-revealed');

      words.forEach(function(word, i) {
        var span = document.createElement('span');
        span.className = 'ls-word';
        span.innerHTML = word;
        span.style.transitionDelay = (i * 0.04) + 's';
        heading.appendChild(span);
        heading.appendChild(document.createTextNode(' '));
      });

      requestAnimationFrame(function() {
        var wordSpans = heading.querySelectorAll('.ls-word');
        wordSpans.forEach(function(span) {
          span.classList.add('ls-word-visible');
        });
      });
    }
  }

  function wrapWordsPreservingStructure(heading) {
    // Walk through child nodes, wrap bare text words in .ls-word spans,
    // and wrap .ls-pen-word elements in .ls-word spans too
    var nodes = Array.prototype.slice.call(heading.childNodes);
    var wordIndex = 0;

    nodes.forEach(function(node) {
      if (node.nodeType === 3) {
        // Text node — split into words
        var text = node.textContent;
        var parts = text.split(/(\s+)/);
        var frag = document.createDocumentFragment();

        parts.forEach(function(part) {
          if (/^\s+$/.test(part) || part === '') {
            if (part) frag.appendChild(document.createTextNode(part));
          } else {
            var span = document.createElement('span');
            span.className = 'ls-word';
            span.textContent = part;
            span.style.transitionDelay = (wordIndex * 0.04) + 's';
            wordIndex++;
            frag.appendChild(span);
          }
        });

        heading.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.classList.contains('ls-pen-word')) {
        // Pen-word element — wrap in a .ls-word span
        var wrapper = document.createElement('span');
        wrapper.className = 'ls-word';
        wrapper.style.transitionDelay = (wordIndex * 0.04) + 's';
        wordIndex++;
        heading.insertBefore(wrapper, node);
        wrapper.appendChild(node);
      }
    });
  }

  /* === SLIDER === */
  function initSlider() {
    var viewport = document.getElementById('ls-slider-viewport');
    if (!viewport) return;

    var slides = viewport.querySelectorAll('.ls-slide');
    if (slides.length === 0) return;

    var currentIndex = 0;
    var totalSlides = slides.length;
    var currentEl = document.getElementById('ls-slide-current');
    var totalEl = document.getElementById('ls-slide-total');
    var prevBtn = document.getElementById('ls-prev-slide');
    var nextBtn = document.getElementById('ls-next-slide');

    // Set total count
    if (totalEl) totalEl.textContent = pad(totalSlides);

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function goToSlide(index) {
      slides.forEach(function(s) { s.classList.remove('ls-slide-active'); });
      currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      slides[currentIndex].classList.add('ls-slide-active');
      if (currentEl) currentEl.textContent = pad(currentIndex + 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { goToSlide(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goToSlide(currentIndex + 1); });

    // Auto-advance every 5s
    if (totalSlides > 1) {
      setInterval(function() { goToSlide(currentIndex + 1); }, 5000);
    }
  }

  /* === THEME TOGGLE (footer toggle switch) === */
  function initThemeToggle() {
    var toggle = document.getElementById('ls-theme-toggle');
    var home = document.getElementById('ls-home');

    if (!toggle || !home) return;

    var isLight = false;
    var lightsOnAudio = new Audio('assets/lights-on.mp3');
    var lightsOffAudio = new Audio('assets/lights-off.mp3');

    toggle.addEventListener('click', function() {
      isLight = !isLight;
      toggle.classList.toggle('active', isLight);
      home.classList.toggle('ls-light', isLight);
      if (isLight) {
        lightsOnAudio.currentTime = 0;
        lightsOnAudio.play().catch(function(){});
      } else {
        lightsOffAudio.currentTime = 0;
        lightsOffAudio.play().catch(function(){});
      }
    });
  }

  /* === MOBILE MENU === */
  function initMobileMenu() {
    var toggle = document.getElementById('ls-menu-toggle');
    var menu = document.getElementById('ls-mobile-menu-content');

    if (!toggle || !menu) return;

    var closeBtn = document.getElementById('ls-menu-close');

    var scrollY = 0;
    function openMenu() {
      scrollY = window.scrollY;
      toggle.classList.add('active');
      menu.classList.add('ls-menu-open');
      document.body.classList.add('ls-menu-locked');
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    function closeMenu() {
      toggle.classList.remove('active');
      menu.classList.remove('ls-menu-open');
      document.body.classList.remove('ls-menu-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }

    toggle.addEventListener('click', function() {
      if (menu.classList.contains('ls-menu-open')) { closeMenu(); } else { openMenu(); }
    });

    if (closeBtn) { closeBtn.addEventListener('click', closeMenu); }

    var links = menu.querySelectorAll('.ls-nav-link');
    links.forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* === CUSTOM PROJECT CURSOR === */
  function initProjectCursor() {
    var cursor = document.getElementById('ls-cursor');
    var cards = document.querySelectorAll('.ls-project-card');
    if (!cursor || !cards.length) return;

    var mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    var isOver = false;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        isOver = true;
        cursor.classList.add('ls-cursor-visible');
      });
      card.addEventListener('mouseleave', function() {
        isOver = false;
        cursor.classList.remove('ls-cursor-visible');
      });
    });

    function animateCursor() {
      // Smooth trailing
      curX += (mouseX - curX) * 0.15;
      curY += (mouseY - curY) * 0.15;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* === PROJECT FILTERS === */
  function initProjectFilters() {
    var filterBtns = document.querySelectorAll('.ls-filter-btn');
    var cards = document.querySelectorAll('.ls-project-card');
    if (!filterBtns.length || !cards.length) return;

    var filterOnAudio = new Audio('assets/lights-on.mp3');
    var filterOffAudio = new Audio('assets/lights-off.mp3');
    // all=on, real-estate=off, designers-pick=on, ecommerce=off, service-business=on, agency=off
    var filterSounds = {
      'all': filterOnAudio, 'real-estate': filterOffAudio,
      'designers-pick': filterOnAudio, 'ecommerce': filterOffAudio,
      'service-business': filterOnAudio, 'agency': filterOffAudio
    };

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filter = btn.getAttribute('data-filter');

        // Play click sound
        var snd = filterSounds[filter];
        if (snd) { snd.currentTime = 0; snd.play().catch(function(){}); }

        // Update active button
        filterBtns.forEach(function(b) { b.classList.remove('ls-filter-active'); });
        btn.classList.add('ls-filter-active');

        // Filter cards (supports space-separated multi-category)
        cards.forEach(function(card) {
          var categories = card.getAttribute('data-category').split(' ');
          if (filter === 'all' || categories.indexOf(filter) !== -1) {
            card.classList.remove('ls-filtered-out');
          } else {
            card.classList.add('ls-filtered-out');
          }
        });
      });
    });
  }

  /* === FAQ ACCORDION === */
  function initFAQ() {
    var items = document.querySelectorAll('.ls-faq-item');
    items.forEach(function(item) {
      var question = item.querySelector('.ls-faq-question');
      if (!question) return;

      question.addEventListener('click', function() {
        var wasOpen = item.classList.contains('ls-faq-open');

        // Close all
        items.forEach(function(i) { i.classList.remove('ls-faq-open'); });

        // Toggle current
        if (!wasOpen) {
          item.classList.add('ls-faq-open');
        }
      });
    });
  }

  /* === SMOOTH SCROLL === */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* === HERO GLASS DOT CURSOR === */
  function initHeroCursor() {
    var dot = document.getElementById('ls-hero-cursor');
    var hero = document.getElementById('ls-hero');
    if (!dot || !hero) return;

    hero.addEventListener('mousemove', function(e) {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      dot.classList.add('ls-hero-cursor-visible');
    });
    hero.addEventListener('mouseleave', function() {
      dot.classList.remove('ls-hero-cursor-visible');
    });
  }

  /* === SCROLL WHITE — Listella-style word-group grey→white on scroll === */
  function initScrollWhite() {
    var els = document.querySelectorAll('.ls-scroll-white');
    if (!els.length) return;

    // Wrap each word in a span
    els.forEach(function(el) {
      var text = el.textContent;
      var words = text.split(/\s+/);
      el.innerHTML = '';
      words.forEach(function(word, i) {
        var span = document.createElement('span');
        span.className = 'ls-scroll-word';
        span.textContent = word;
        el.appendChild(span);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
    });

    // On scroll, calculate which words to light up based on element's scroll progress
    function updateScrollWords() {
      var vh = window.innerHeight;
      els.forEach(function(el) {
        var rect = el.getBoundingClientRect();
        var words = el.querySelectorAll('.ls-scroll-word');
        if (!words.length) return;

        // Progress: 0 when element enters bottom of viewport, 1 when it reaches middle
        var progress = 1 - (rect.top - vh * 0.3) / (vh * 0.5);
        progress = Math.max(0, Math.min(1, progress));

        var litCount = Math.floor(progress * words.length);
        words.forEach(function(w, i) {
          if (i < litCount) {
            w.classList.add('ls-word-lit');
          } else {
            w.classList.remove('ls-word-lit');
          }
        });
      });
      requestAnimationFrame(updateScrollWords);
    }
    requestAnimationFrame(updateScrollWords);
  }

})();
