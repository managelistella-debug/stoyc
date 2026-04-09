/* ============================================
   STOYC — AI Services Page JavaScript
   ============================================ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var home = document.getElementById('ls-home');
    if (!home) return;

    initScrollReveal();
    initThemeToggle();
    initMobileMenu();
    initFAQ();
    initSmoothScroll();
    initScrollWhite();
    showUI();
  }

  function showUI() {
    var nav = document.getElementById('ls-nav');
    var mobileNav = document.getElementById('ls-mobile-nav');
    var footer = document.getElementById('ls-footer');
    var mainContent = document.getElementById('ls-main-content');

    if (mainContent) mainContent.classList.add('ls-content-visible');
    if (nav) nav.classList.add('ls-nav-visible');
    if (mobileNav) mobileNav.classList.add('ls-nav-visible');
    if (footer) footer.classList.add('ls-footer-visible');
  }

  /* === SCROLL REVEAL === */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('[data-ls-reveal]');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ls-revealed');
          observer.unobserve(entry.target);
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

  /* === THEME TOGGLE === */
  function initThemeToggle() {
    var toggle = document.getElementById('ls-theme-toggle');
    var home = document.getElementById('ls-home');
    if (!toggle || !home) return;

    var isLight = false;
    var lightsOnAudio = new Audio('/assets/lights-on.mp3');
    var lightsOffAudio = new Audio('/assets/lights-off.mp3');

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

  /* === FAQ ACCORDION === */
  function initFAQ() {
    var items = document.querySelectorAll('.ls-faq-item');
    items.forEach(function(item) {
      var question = item.querySelector('.ls-faq-question');
      if (!question) return;

      question.addEventListener('click', function() {
        var wasOpen = item.classList.contains('ls-faq-open');
        items.forEach(function(i) { i.classList.remove('ls-faq-open'); });
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

  /* === SCROLL WHITE — word-group grey to white on scroll === */
  function initScrollWhite() {
    var els = document.querySelectorAll('.ls-scroll-white');
    if (!els.length) return;

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

    function updateScrollWords() {
      var vh = window.innerHeight;
      els.forEach(function(el) {
        var rect = el.getBoundingClientRect();
        var words = el.querySelectorAll('.ls-scroll-word');
        if (!words.length) return;

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
