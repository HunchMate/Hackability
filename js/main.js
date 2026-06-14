// ===========================
// Main JS — Core nav, scroll, and utilities
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  // ===========================
  // Active nav link highlighting
  // ===========================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;

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

  // ===========================
  // Navbar scroll shadow & visibility
  // ===========================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      } else {
        navbar.style.boxShadow = 'none';
      }

      // Hide navbar when scrolled down, only show when at the top
      if (scrollTop > 80) {
        navbar.style.transform = 'translateY(-150%)'; // Ensure it's fully hidden including padding
      } else {
        navbar.style.transform = 'translateY(0)';
      }
    }, { passive: true });
  }

  // ===========================
  // Smooth scroll for anchor links
  // ===========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 72;
        const targetPosition = targetEl.offsetTop - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===========================
  // CMS Content Hydration (from Supabase)
  // ===========================
  if (typeof sb !== 'undefined') {
    sb.from('site_content').select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading content from Supabase:', error);
          return;
        }
        if (data && data.length > 0) {
          // Reconstruct the nested object from rows
          const homepageData = {};
          data.forEach(row => {
            if (row.section_key.startsWith('hero_')) {
              if (!homepageData.hero) homepageData.hero = {};
              const subKey = row.section_key.replace('hero_', '');
              homepageData.hero[subKey] = row.data;
            } else {
              homepageData[row.section_key] = row.data;
            }
          });
          hydrateCMSData(homepageData);
          if (window.initPageSwitcher) {
            window.initPageSwitcher(homepageData);
          }
        } else {
          console.warn('No homepage content found in Supabase. Using defaults from HTML.');
        }
      });
  }

  function hydrateCMSData(data) {
    // 1. Simple Text & Attribute Mapping
    document.querySelectorAll('[data-cms-id]').forEach(el => {
      const path = el.getAttribute('data-cms-id').split('.');
      let value = data;
      for (const key of path) {
        if (value && value[key] !== undefined) {
          value = value[key];
        } else {
          value = null;
          break;
        }
      }
      
      if (value !== null) {
        if (el.tagName === 'IMG') {
          el.src = value;
        } else {
          el.innerHTML = value;
        }
      }
    });

    // 2. Verticals Cards Generation
    const verticalsGrid = document.getElementById('verticals-grid');
    if (verticalsGrid && data.verticals && data.verticals.cards) {
      verticalsGrid.innerHTML = data.verticals.cards.map((card, index) => `
        <div class="bg-white rounded-2xl p-8 border border-hk-border hover:-translate-y-1 transition-transform duration-300 cursor-pointer group" style="animation-delay: ${index * 100}ms">
          <div class="w-14 h-14 rounded-xl mb-6 flex items-center justify-center transition-colors" style="background: ${index === 0 ? '#FFF8D6' : '#E8F0FF'};">
            <i class="ph-bold ${card.icon}" style="font-size:28px;color:${index === 0 ? '#D4A800' : '#0D1B8E'};"></i>
          </div>
          <h3 class="font-display font-bold text-navy text-2xl mb-3">${card.title}</h3>
          <p class="text-grey-dark mb-6" style="line-height:1.6;">${card.description}</p>
          <div class="flex items-center gap-2 flex-wrap">
            ${(card.tags || []).map(tag => `<span class="px-3 py-1 rounded-full bg-grey-light text-navy font-medium text-xs">${tag}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    // 3. Products Features List
    const featuresList = document.getElementById('products-features-list');
    if (featuresList && data.products && data.products.features) {
      featuresList.innerHTML = data.products.features.map(feature => `
        <li class="flex items-center gap-3" style="color:rgba(255,255,255,0.82);">
          <i class="ph-bold ${feature.icon}" style="font-size:20px;color:#F5C200;flex-shrink:0;"></i>
          <span>${feature.text}</span>
        </li>
      `).join('');
    }

    // 4. Impact Stats Generation
    const statsGrid = document.getElementById('impact-stats-grid');
    if (statsGrid && data.impact && data.impact.stats) {
      statsGrid.innerHTML = data.impact.stats.map((stat, index) => `
        <div class="stat-card rounded-2xl p-6 text-center bg-white" style="border:1px solid #E2E8F0; animation-delay: ${index * 100}ms">
          <i class="ph-bold ${stat.icon}" style="font-size:32px;color:#0D1B8E;margin-bottom:12px;display:block;"></i>
          <div class="stat-number font-data font-bold text-navy" style="font-size:42px;">${stat.number}${stat.suffix}</div>
          <div class="text-xs font-semibold text-grey-mid uppercase tracking-wider">${stat.label}</div>
        </div>
      `).join('');
    }

    // 5. Products Dropdown Generation
    const desktopDropdown = document.getElementById('products-dropdown-desktop');
    const mobileDropdown = document.getElementById('products-dropdown-mobile');
    
    if (data.navbar && data.navbar.products_dropdown) {
      const dropdownHtml = data.navbar.products_dropdown.map(product => `
        <a href="${product.url}" class="flex items-start gap-4 p-4 rounded-lg hover:bg-navy-tint transition-colors group/item no-underline">
          <!-- Optional Logo (fallback to text if empty) -->
          ${product.logo ? `
            <img src="${product.logo}" alt="${product.name}" class="w-10 h-10 object-contain flex-shrink-0" />
          ` : `
            <div class="w-10 h-10 rounded bg-white border border-hk-border flex items-center justify-center flex-shrink-0 text-navy font-bold shadow-sm text-sm">
              ${product.name.charAt(0)}
            </div>
          `}
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-navy font-bold text-[15px] block leading-none mb-1 group-hover/item:text-navy-mid">${product.name}</span>
              <i class="ph-bold ph-arrow-up-right text-grey-mid text-sm opacity-0 group-hover/item:opacity-100 transition-opacity"></i>
            </div>
            <span class="text-grey-dark text-[13px] leading-snug block">${product.description}</span>
          </div>
        </a>
      `).join('');
      
      if (desktopDropdown) desktopDropdown.innerHTML = dropdownHtml;
      
      // For mobile, slightly simpler styling
      if (mobileDropdown) {
        mobileDropdown.innerHTML = data.navbar.products_dropdown.map(product => `
          <a href="${product.url}" class="text-grey-dark text-sm hover:text-navy no-underline py-2 block">${product.name}</a>
        `).join('');
      }
    }

    // 6. Partners Dropdown Generation
    const desktopPartnersDropdown = document.getElementById('partners-dropdown-desktop');
    const mobilePartnersDropdown = document.getElementById('partners-dropdown-mobile');
    
    if (data.navbar && data.navbar.partners_dropdown) {
      const partnersHtml = data.navbar.partners_dropdown.map(partner => `
        <a href="${partner.url}" class="flex items-start gap-4 p-4 rounded-lg hover:bg-navy-tint transition-colors group/item no-underline">
          ${partner.logo ? `
            <img src="${partner.logo}" alt="${partner.name}" class="w-10 h-10 object-contain flex-shrink-0" />
          ` : `
            <div class="w-10 h-10 rounded bg-white border border-hk-border flex items-center justify-center flex-shrink-0 text-navy font-bold shadow-sm text-sm">
              ${partner.name.charAt(0)}
            </div>
          `}
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-navy font-bold text-[15px] block leading-none mb-1 group-hover/item:text-navy-mid">${partner.name}</span>
              <i class="ph-bold ph-arrow-up-right text-grey-mid text-sm opacity-0 group-hover/item:opacity-100 transition-opacity"></i>
            </div>
            ${partner.description ? `<span class="text-grey-dark text-[13px] leading-snug block">${partner.description}</span>` : ''}
          </div>
        </a>
      `).join('');
      
      if (desktopPartnersDropdown) desktopPartnersDropdown.innerHTML = partnersHtml;
      
      if (mobilePartnersDropdown) {
        mobilePartnersDropdown.innerHTML = data.navbar.partners_dropdown.map(partner => `
          <a href="${partner.url}" class="text-grey-dark text-sm hover:text-navy no-underline py-2 block">${partner.name}</a>
        `).join('');
      }
    }

    // 7. Hero Carousel Generation
    const carouselBg = document.getElementById('hero-carousel-bg');
    if (carouselBg && data.hero && data.hero.parent && data.hero.parent.carousel_slides && data.hero.parent.carousel_slides.length > 0) {
      const slides = data.hero.parent.carousel_slides;
      carouselBg.innerHTML = slides.map((slide, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${slide.image}')"></div>
      `).join('');

      if (slides.length > 1) {
        let currentSlide = 0;
        const slideEls = carouselBg.querySelectorAll('.hero-slide');
        setInterval(() => {
          slideEls[currentSlide].classList.remove('active');
          currentSlide = (currentSlide + 1) % slides.length;
          slideEls[currentSlide].classList.add('active');
        }, 5000);
      }
    }

    // 8. Marquee Partners Generation (Using LogoLoop)
    const marqueeContainer = document.querySelector('.marquee-container');
    if (marqueeContainer && data.marquee && data.marquee.length > 0) {
      const logos = data.marquee.map(p => {
        if (p.logo) {
          return { src: p.logo, alt: p.name, href: p.url || '#', title: p.name };
        } else {
          return { 
            node: `<div style="height: 100%; min-width: 150px; background: white; border-radius: 0.5rem; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; padding: 0 1.5rem; font-weight: bold; color: #0D1B8E;">${p.name}</div>`, 
            href: p.url || '#', 
            title: p.name 
          };
        }
      });
      
      if (window._marqueeLoop) window._marqueeLoop.destroy();

      window._marqueeLoop = new LogoLoop('.marquee-container', {
        logos: logos,
        speed: 120,
        direction: 'left',
        logoHeight: 64,
        gap: 32,
        hoverSpeed: 20,
        fadeOut: true,
        fadeOutColor: '#F2F5FF',
        scaleOnHover: true
      });
    }
  }

  // Initialize Animated Gradient Background for Impact Section
  initAnimatedGradient();
});

// ==========================================
// Vanilla JS Port of AnimatedGradientBackground
// ==========================================
function initAnimatedGradient() {
  const container = document.getElementById('impact-animated-bg');
  if (!container) return;

  // Configuration from original React component
  const startingGap = 125;
  const breathingRange = 5;
  const animationSpeed = 0.02;
  const topOffset = 0;
  const gradientColors = ["#0A0A0A", "#2979FF", "#FF80AB", "#FF6D00", "#FFD600", "#00E676", "#3D5AFE"];
  const gradientStops = [35, 50, 60, 70, 80, 90, 100];

  let width = startingGap;
  let directionWidth = 1;
  let animationFrame;

  // Trigger entrance animation (replacing Framer Motion)
  setTimeout(() => {
    container.style.opacity = '1';
    container.style.transform = 'scale(1)';
  }, 100);

  function animateGradient() {
    if (width >= startingGap + breathingRange) directionWidth = -1;
    if (width <= startingGap - breathingRange) directionWidth = 1;

    width += directionWidth * animationSpeed;

    const gradientStopsString = gradientStops
      .map((stop, index) => `${gradientColors[index]} ${stop}%`)
      .join(", ");

    const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;
    container.style.background = gradient;

    animationFrame = requestAnimationFrame(animateGradient);
  }

  animationFrame = requestAnimationFrame(animateGradient);
}
