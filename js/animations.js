// ===========================
// Scroll Reveal
// ===========================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===========================
// Stat Counter Animation
// ===========================
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1200;
  const steps    = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(Math.round(increment * step), target);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (step >= steps) clearInterval(timer);
  }, duration / steps);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

// ===========================
// Mobile Menu Toggle
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    toggle.innerHTML = isOpen
      ? '<i class="ph-bold ph-list" style="font-size:24px;"></i>'
      : '<i class="ph-bold ph-x" style="font-size:24px;"></i>';
  });

  // Close mobile menu when clicking a nav link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      toggle.innerHTML = '<i class="ph-bold ph-list" style="font-size:24px;"></i>';
    });
  });
});
