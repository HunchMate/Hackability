// hackability.js
document.addEventListener('DOMContentLoaded', () => {

  // ===========================
  // Scroll Spy for Sticky Nav
  // ===========================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sticky-nav-link');

  function updateActiveNav() {
    // Add offset for fixed navbar + sticky nav height
    const scrollY = window.scrollY + 150; 

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Smooth scroll for sticky nav links
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Offset by 130px to account for both navbars
        const targetPosition = targetEl.offsetTop - 130;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===========================
  // Impact Slider Controls
  // ===========================
  const impactSlider = document.getElementById('impact-slider');
  const btnPrev = document.getElementById('impact-prev');
  const btnNext = document.getElementById('impact-next');

  if (impactSlider && btnPrev && btnNext) {
    const scrollAmount = 400; // Scroll distance

    let autoScrollTimer;

    const startAutoScroll = () => {
      autoScrollTimer = setInterval(() => {
        if (impactSlider.scrollLeft + impactSlider.clientWidth >= impactSlider.scrollWidth - 20) {
          // Reached the end, scroll back to start
          impactSlider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          impactSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }, 3500);
    };

    const resetAutoScroll = () => {
      clearInterval(autoScrollTimer);
      startAutoScroll();
    };

    btnPrev.addEventListener('click', () => {
      impactSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      resetAutoScroll();
    });

    btnNext.addEventListener('click', () => {
      impactSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      resetAutoScroll();
    });

    // Pause on hover or touch
    impactSlider.addEventListener('mouseenter', () => clearInterval(autoScrollTimer));
    impactSlider.addEventListener('mouseleave', startAutoScroll);
    impactSlider.addEventListener('touchstart', () => clearInterval(autoScrollTimer), { passive: true });
    impactSlider.addEventListener('touchend', startAutoScroll, { passive: true });

    // Start auto scroll initially
    startAutoScroll();
  }

  // ===========================
  // Number Counter Animation
  // ===========================
  const counters = document.querySelectorAll('.counter');
  const speed = 100; // The lower the slower

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      
      // Calculate increment
      const inc = target / speed;

      // If count is less than target, keep adding
      if (count < target) {
        counter.innerText = Math.ceil(count + inc);
        setTimeout(() => animateCounters(), 20); // Recursion
      } else {
        counter.innerText = target;
      }
    });
  };

  // Intersection Observer to trigger counter animation when in view
  const statsSection = document.querySelector('#our-journey');
  let animationTriggered = false;

  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animationTriggered) {
        animateCounters();
        animationTriggered = true;
      }
    }, { threshold: 0.3 }); // Trigger when 30% of the section is visible
    
    observer.observe(statsSection);
  }

  // ===========================
  // Mobile Menu Toggle (Drawer)
  // ===========================
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileOverlay.classList.remove('hidden');
    // slight delay to allow display:block to apply before animating opacity/transform
    setTimeout(() => {
      mobileMenu.classList.remove('translate-x-full');
      mobileOverlay.classList.remove('opacity-0');
    }, 10);
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('translate-x-full');
    mobileOverlay.classList.add('opacity-0');
    
    // wait for transition to finish before hiding
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      mobileOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', openMobileMenu);
  }
  if (menuClose) {
    menuClose.addEventListener('click', closeMobileMenu);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // ===========================
  // Navbar Hide on Scroll
  // ===========================
  const mainNav = document.querySelector('nav');
  if (mainNav) {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down and past 100px
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        mainNav.classList.add('-translate-y-full');
      } else {
        mainNav.classList.remove('-translate-y-full');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

});
