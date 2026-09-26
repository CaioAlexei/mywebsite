/* =========================================================
   Portfólio TI — interações do site
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Tema (claro/escuro) com persistência ---------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', stored || (prefersLight ? 'light' : 'dark'));

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Menu mobile ---------- */
  var nav = document.getElementById('primaryNav');
  var menuToggle = document.getElementById('menuToggle');
  var navClose = document.getElementById('navClose');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    }
  }
  function openNav() {
    if (!nav) return;
    nav.classList.add('open');
    document.body.classList.add('nav-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fechar menu');
    }
    if (navClose) navClose.focus({ preventScroll: true });
  }
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      if (nav.classList.contains('open')) { closeNav(); } else { openNav(); }
    });
    if (navClose) navClose.addEventListener('click', closeNav);
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    // Tocar fora do painel (no scrim) fecha o menu.
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || (menuToggle && menuToggle.contains(e.target))) return;
      closeNav();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) closeNav(); });
  }

  /* ---------- Header ao rolar + botão "voltar ao topo" ---------- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Link ativo na navegação ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal ao entrar na tela ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Barras de habilidade ---------- */
  var bars = Array.prototype.slice.call(document.querySelectorAll('.bar-track i'));
  function fillBars() { bars.forEach(function (b) { b.style.width = (b.getAttribute('data-width') || 0) + '%'; }); }
  if (bars.length) {
    if ('IntersectionObserver' in window) {
      var barObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          fillBars();
          obs.disconnect();
        });
      }, { threshold: 0.3 });
      barObserver.observe(bars[0].closest('.bars'));
    } else { fillBars(); }
  }

  /* ---------- Contadores ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1200, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          runCounter(e.target);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cObserver.observe(c); });
    } else {
      counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
    }
  }

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Validação do formulário de contato ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      var valid = true;
      ['nome', 'email', 'mensagem'].forEach(function (id) {
        var input = form.querySelector('#' + id);
        if (!input) return;
        var field = input.closest('.field');
        var ok = input.value.trim().length > 0;
        if (id === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        if (status) { status.textContent = 'Preencha nome, e-mail válido e mensagem.'; status.className = 'form-status err'; }
        return;
      }
      // Se o endpoint do Formspree ainda não foi configurado, abre o cliente de e-mail.
      if (form.getAttribute('action').indexOf('SEU-ID') !== -1) {
        e.preventDefault();
        var to = 'caioalexeilimaazevedo@hotmail.com';
        var subject = encodeURIComponent('[Site] ' + (form.assunto ? form.assunto.value : 'Contato'));
        var body = encodeURIComponent(
          'Nome: ' + form.nome.value + '\nE-mail: ' + form.email.value + '\n\n' + form.mensagem.value
        );
        window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
        if (status) { status.textContent = 'Abrindo seu aplicativo de e-mail...'; status.className = 'form-status ok'; }
        return;
      }
      if (status) { status.textContent = 'Enviando...'; status.className = 'form-status'; }
    });
  }
})();
