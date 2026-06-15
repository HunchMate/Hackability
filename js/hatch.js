// hatch.js
document.addEventListener('DOMContentLoaded', () => {

  // ===========================
  // Tracks Tab Switching
  // ===========================
  const trackTabs = document.querySelectorAll('.track-tab');
  const trackContents = document.querySelectorAll('.track-content');

  trackTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      trackTabs.forEach(t => t.classList.remove('active'));
      // Remove active class from all contents
      trackContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Get target content ID and add active class to it
      const targetId = tab.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // ===========================
  // Mobile Menu Toggle
  // ===========================
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // ===========================
  // Sticky Nav Active State on Scroll
  // ===========================
  const stickyLinks = document.querySelectorAll('.sticky-nav-pill');
  const sections = [];
  
  // Extract sections from hrefs
  stickyLinks.forEach(link => {
    const targetId = link.getAttribute('href');
    if (targetId.startsWith('#')) {
      const section = document.querySelector(targetId);
      if (section) sections.push(section);
    }
  });

  function updateActiveStickyNav() {
    const scrollY = window.scrollY + 150; // offset for navbar + sticky nav height

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        stickyLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveStickyNav, { passive: true });
  updateActiveStickyNav();

  // ===========================
  // Smooth scroll for anchor links
  // ===========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      // If it's just a # or a link to another page with a hash, ignore
      if (targetId === '#' || targetId.includes('.html')) return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Calculate offset to account for fixed navbar + sticky subnav
        const offset = 140; 
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
