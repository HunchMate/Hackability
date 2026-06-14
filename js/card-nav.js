document.addEventListener('DOMContentLoaded', () => {
  // We apply this to all navbars on the page (usually just one)
  const navbars = document.querySelectorAll('#navbar');
  
  navbars.forEach(navbar => {
    const hamburger = navbar.querySelector('.hamburger-menu');
    const content = navbar.querySelector('.card-nav-content');
    if (!hamburger || !content) return;

    const cards = content.querySelectorAll('.nav-card');
    let isExpanded = false;
    let tl = null;

    function createTimeline() {
      // Set initial states for animation
      gsap.set(cards, { y: 50, opacity: 0 });
      
      const newTl = gsap.timeline({ paused: true });
      
      // Animate cards staggering in
      newTl.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.08
      });
      
      return newTl;
    }

    // Initialize GSAP timeline if gsap is loaded
    if (typeof gsap !== 'undefined') {
      tl = createTimeline();
    }

    hamburger.addEventListener('click', () => {
      isExpanded = !isExpanded;
      
      if (isExpanded) {
        // Open
        hamburger.classList.add('open');
        navbar.classList.add('nav-open');
        
        // Add mobile dark background to the nav wrapper when open
        navbar.classList.add('bg-black', 'bg-opacity-95', 'h-screen');
        
        if (tl) tl.play(0);
      } else {
        // Close
        hamburger.classList.remove('open');
        
        if (tl) {
          tl.reverse().then(() => {
            navbar.classList.remove('nav-open');
            navbar.classList.remove('bg-black', 'bg-opacity-95', 'h-screen');
          });
        } else {
          navbar.classList.remove('nav-open');
          navbar.classList.remove('bg-black', 'bg-opacity-95', 'h-screen');
        }
      }
    });
  });
});
