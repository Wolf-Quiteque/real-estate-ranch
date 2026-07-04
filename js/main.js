// Real Estate Ranch — shared site behavior

initLoader();

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initReveal();
  initCounters();
  initLightbox();
  initTestimonialCarousel();
  initForms();
  initTabs();
});

/* Simple tab switcher: [data-tab-trigger="id"] shows [data-tab-panel="id"] */
function initTabs() {
  const triggers = document.querySelectorAll('[data-tab-trigger]');
  if (!triggers.length) return;
  const activate = (id) => {
    document.querySelectorAll('[data-tab-panel]').forEach(panel => {
      panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== id);
    });
    triggers.forEach(t => {
      const isActive = t.getAttribute('data-tab-trigger') === id;
      t.classList.toggle('bg-ranchblack', isActive);
      t.classList.toggle('text-white', isActive);
      t.classList.toggle('bg-transparent', !isActive);
    });
  };
  triggers.forEach(t => t.addEventListener('click', () => activate(t.getAttribute('data-tab-trigger'))));
  activate(triggers[0].getAttribute('data-tab-trigger'));
}

/* Branded page loader — hides once the page (and its images) are ready */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  document.body.classList.add('is-loading');

  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add('loader-hidden');
    document.body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 700);
  };

  const minDelay = new Promise(resolve => setTimeout(resolve, 500));
  const pageLoad = new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });
  Promise.all([minDelay, pageLoad]).then(hide);

  // Safety net: never let the loader block the site if something stalls.
  setTimeout(hide, 4000);
}

/* Sticky/transparent-to-solid nav */
function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const solidFrom = nav.hasAttribute('data-solid') ? 0 : 60;
  const onScroll = () => {
    if (window.scrollY > solidFrom) nav.classList.add('nav-solid');
    else nav.classList.remove('nav-solid');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
    btn.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
  }));
}

/* Scroll-triggered fade/slide reveal */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => io.observe(item));
}

/* Animated stat counters */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => io.observe(el));
}

/* Gallery lightbox */
function initLightbox() {
  const triggers = document.querySelectorAll('[data-lightbox]');
  if (!triggers.length) return;

  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = '<span class="lightbox-close" aria-label="Close">&times;</span><img src="" alt="">';
    document.body.appendChild(lightbox);
  }
  const img = lightbox.querySelector('img');
  const close = () => lightbox.classList.remove('open');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-lightbox');
      img.src = src;
      img.alt = trigger.querySelector('img')?.alt || '';
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* Testimonial carousel (auto-rotate + swipe/arrows) */
function initTestimonialCarousel() {
  const root = document.getElementById('testimonial-carousel');
  if (!root) return;
  const track = root.querySelector('.testi-track');
  const slides = root.querySelectorAll('.testi-slide');
  const dotsWrap = root.querySelector('.testi-dots');
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'w-2.5 h-2.5 rounded-full transition-all';
    dot.style.background = i === 0 ? 'var(--capital-bronze)' : 'var(--sandstone)';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll('button').forEach((d, i) => {
      d.style.background = i === index ? 'var(--capital-bronze)' : 'var(--sandstone)';
      d.style.width = i === index ? '22px' : '10px';
    });
  }
  function goTo(i) { index = (i + slides.length) % slides.length; update(); resetTimer(); }
  function next() { goTo(index + 1); }
  function resetTimer() { clearInterval(timer); timer = setInterval(next, 6000); }

  root.querySelector('.testi-next')?.addEventListener('click', next);
  root.querySelector('.testi-prev')?.addEventListener('click', () => goTo(index - 1));

  let startX = 0;
  track.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50) goTo(index - 1);
    if (diff < -50) goTo(index + 1);
  }, { passive: true });

  update();
  resetTimer();
}

/* Client-side form validation */
function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const errorEl = field.parentElement.querySelector('.field-error-msg');
        let fieldValid = field.value.trim() !== '';
        if (field.type === 'email' && fieldValid) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        if (field.type === 'tel' && fieldValid) {
          fieldValid = /^[0-9()+\-.\s]{7,}$/.test(field.value.trim());
        }
        if (!fieldValid) {
          valid = false;
          field.classList.add('field-error');
          if (errorEl) errorEl.classList.add('show');
        } else {
          field.classList.remove('field-error');
          if (errorEl) errorEl.classList.remove('show');
        }
      });

      const successEl = form.parentElement.querySelector('.form-success');
      if (valid) {
        form.reset();
        form.style.display = 'none';
        if (successEl) successEl.classList.remove('hidden');
      } else {
        const firstError = form.querySelector('.field-error');
        firstError?.focus();
      }
    });

    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim() !== '') {
          field.classList.remove('field-error');
          field.parentElement.querySelector('.field-error-msg')?.classList.remove('show');
        }
      });
    });
  });
}
