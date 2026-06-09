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
  // Navbar scroll shadow
  // ===========================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      } else {
        navbar.style.boxShadow = 'none';
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
  // CMS Content Hydration
  // ===========================
  fetch(`data/content.json?v=${new Date().getTime()}`)
    .then(response => response.json())
    .then(data => {
      hydrateCMSData(data);
      if (window.initPageSwitcher) {
        window.initPageSwitcher(data);
      }
    })
    .catch(error => console.error('Error loading CMS content:', error));

  // Listen for Live Preview updates from Decap CMS Iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'cms-preview-update') {
      const data = event.data.payload;
      hydrateCMSData(data);
      if (window.initPageSwitcher) {
        window.initPageSwitcher(data);
      }
    }
  });

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
  }
});
