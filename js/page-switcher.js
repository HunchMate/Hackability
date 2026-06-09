// Page state machine
// Manages which version of the homepage is visible: 'parent' | 'college' | 'school'

let PAGE_CONTENT = null;

// Allow main.js to inject CMS content into the page switcher
window.initPageSwitcher = function(cmsData) {
  // Transform the CMS JSON hero data into the format expected by the switcher
  PAGE_CONTENT = {
    parent: {
      heroTitle: cmsData.hero.parent.title,
      heroSub: cmsData.hero.parent.subtitle,
      eyebrow: cmsData.hero.parent.eyebrow,
      showVerticals: true,
      showBackBtn: false,
      showPortals: true,
      navBrand: cmsData.hero.parent.navBrand,
      primaryBtn: cmsData.hero.parent.primary_btn,
      secondaryBtn: cmsData.hero.parent.secondary_btn,
    },
    college: {
      heroTitle: cmsData.hero.college.title,
      heroSub: cmsData.hero.college.subtitle,
      eyebrow: cmsData.hero.college.eyebrow,
      showVerticals: false,
      showBackBtn: true,
      showPortals: false,
      backLabel: cmsData.hero.college.backLabel,
      navBrand: cmsData.hero.college.navBrand,
      primaryBtn: cmsData.hero.college.primary_btn,
      secondaryBtn: cmsData.hero.college.secondary_btn,
    },
    school: {
      heroTitle: cmsData.hero.school.title,
      heroSub: cmsData.hero.school.subtitle,
      eyebrow: cmsData.hero.school.eyebrow,
      showVerticals: false,
      showBackBtn: true,
      showPortals: false,
      backLabel: cmsData.hero.school.backLabel,
      navBrand: cmsData.hero.school.navBrand,
      primaryBtn: cmsData.hero.school.primary_btn,
      secondaryBtn: cmsData.hero.school.secondary_btn,
    }
  };
  
  // Set default state based on body attribute (or default to parent)
  const initialPage = document.body.dataset.page || 'parent';
  switchPage(initialPage);
};

window.switchPage = function(target) {
  if (!PAGE_CONTENT) return;
  const content = PAGE_CONTENT[target];
  if (!content) return;

  // Fade out hero content
  const heroText = document.getElementById('hero-text');
  if (heroText) {
    heroText.style.opacity = '0';
    heroText.style.transform = 'translateY(16px)';
  }

  setTimeout(() => {
    // Update hero headline
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.innerHTML = content.heroTitle;

    const heroSub = document.getElementById('hero-sub');
    if (heroSub) heroSub.textContent = content.heroSub;

    const heroEyebrow = document.getElementById('hero-eyebrow');
    if (heroEyebrow) heroEyebrow.textContent = content.eyebrow;

    // Show/hide verticals section
    const verticalsSection = document.getElementById('verticals');
    if (verticalsSection) {
      verticalsSection.style.display = content.showVerticals ? 'block' : 'none';
    }

    // Show/hide portal cards
    const portalCards = document.getElementById('portal-cards');
    if (portalCards) {
      portalCards.style.display = content.showPortals ? 'grid' : 'none';
    }

    // Show/hide back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.style.display = content.showBackBtn ? 'inline-flex' : 'none';
      if (content.showBackBtn) backBtn.textContent = content.backLabel;
    }

    // Update nav sub-label if exists
    const navBrand = document.getElementById('nav-brand-label');
    if (navBrand) navBrand.textContent = content.navBrand;
    
    // Update CTAs if present in the HTML (they aren't explicitly ID'd yet, but we will add them)
    const primaryBtn = document.getElementById('hero-primary-btn');
    if (primaryBtn && content.primaryBtn) {
      primaryBtn.innerHTML = `<i class="ph-bold ph-rocket-launch" style="font-size:18px;"></i> ${content.primaryBtn}`;
    }
    const secondaryBtn = document.getElementById('hero-secondary-btn');
    if (secondaryBtn && content.secondaryBtn) {
      secondaryBtn.innerHTML = `<i class="ph-bold ph-handshake" style="font-size:18px;"></i> ${content.secondaryBtn}`;
    }

    // Fade back in
    if (heroText) {
      heroText.style.opacity = '1';
      heroText.style.transform = 'translateY(0)';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update body data attr for CSS targeting
    document.body.dataset.page = target;
  }, 300);
}

// Back button wires up to parent
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', () => switchPage('parent'));
});
