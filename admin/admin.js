/* ============================================================
   Hackability Admin — Main JavaScript (Supabase)
   ============================================================ */

// ---------- Supabase Config ----------
const SUPABASE_URL = 'https://otzrqnmyrzegqqxgwdbd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_w-apjLisOCfwXc824ZZZEA_dDKWjQXh';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Default homepage structure ----------
const DEFAULT_HOMEPAGE = {
  navbar: {
    brand_name: "Hackability",
    cta_button: "Get Started",
    products_dropdown: [],
    partners_dropdown: []
  },
  hero: {
    parent: {
      eyebrow: "", title: "", subtitle: "",
      primary_btn: "", secondary_btn: "", navBrand: ""
    },
    college: {
      eyebrow: "", title: "", subtitle: "",
      primary_btn: "", secondary_btn: "", navBrand: "", backLabel: ""
    },
    school: {
      eyebrow: "", title: "", subtitle: "",
      primary_btn: "", secondary_btn: "", navBrand: "", backLabel: ""
    }
  },
  about: { eyebrow: "", title: "", description: "", cta_text: "" },
  verticals: { eyebrow: "", title: "", cards: [] },
  products: {
    eyebrow: "", title: "", badge: "", product_name: "",
    description: "", features: [], cta_text: ""
  },
  impact: { eyebrow: "", title: "", stats: [] },
  cta: { title: "", subtitle: "", primary_btn: "", secondary_btn: "" },
  footer: { description: "", contact_email: "", copyright: "" }
};

// ---------- Toast Notification System ----------
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------- Accordion Toggle ----------
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });
}

// ---------- Sidebar Toggle (mobile) ----------
function initSidebar() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }
}

// ---------- Auth (Supabase) ----------
function isLoginPage() {
  return window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/');
}

async function handleAuthState() {
  const { data: { session } } = await sb.auth.getSession();

  if (isLoginPage()) {
    if (session) window.location.href = 'dashboard.html';
  } else {
    if (!session) {
      window.location.href = 'index.html';
    } else {
      populateUserInfo(session.user);
      if (typeof onAuthReady === 'function') onAuthReady(session.user);
    }
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' && !isLoginPage()) {
      window.location.href = 'index.html';
    }
    if (event === 'SIGNED_IN' && isLoginPage()) {
      window.location.href = 'dashboard.html';
    }
  });
}

function populateUserInfo(user) {
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.email ? user.email.charAt(0).toUpperCase() : 'A';
}

// Login
async function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  if (!email || !password) {
    errorEl.textContent = 'Please enter both email and password.';
    errorEl.classList.add('show');
    return;
  }
  errorEl.classList.remove('show');
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in…';

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    btn.disabled = false;
    btn.textContent = 'Sign In';
    let msg = 'Login failed. Please try again.';
    if (error.message.includes('Invalid login')) {
      msg = 'Invalid email or password.';
    } else if (error.message.includes('Email not confirmed')) {
      msg = 'Please confirm your email first.';
    }
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  } else {
    window.location.href = 'dashboard.html';
  }
}

// Logout
async function logoutUser() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// ---------- Supabase: Load Homepage ----------
let homepageData = null;

async function loadHomepageData() {
  try {
    const { data, error } = await sb.from('site_content').select('*');
    if (error) throw error;

    if (!data || data.length === 0) {
      // First run — seed default data
      homepageData = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE));
      const sections = [
        { section_key: 'navbar', data: homepageData.navbar },
        { section_key: 'hero_parent', data: homepageData.hero.parent },
        { section_key: 'hero_college', data: homepageData.hero.college },
        { section_key: 'hero_school', data: homepageData.hero.school },
        { section_key: 'about', data: homepageData.about },
        { section_key: 'verticals', data: homepageData.verticals },
        { section_key: 'products', data: homepageData.products },
        { section_key: 'impact', data: homepageData.impact },
        { section_key: 'cta', data: homepageData.cta },
        { section_key: 'marquee', data: [] },
        { section_key: 'footer', data: homepageData.footer }
      ];
      await sb.from('site_content').upsert(sections);
      showToast('Initialized homepage with default structure.', 'info');
    } else {
      // Reconstruct the nested object from rows
      homepageData = {};
      data.forEach(row => {
        if (row.section_key.startsWith('hero_')) {
          if (!homepageData.hero) homepageData.hero = {};
          const subKey = row.section_key.replace('hero_', '');
          
          // Force correct title in the admin panel to update Supabase on save
          if (subKey === 'parent' && row.data && row.data.title) {
            row.data.title = 'Building innovation driven <br><span style="color:#F5C200;">talent ecosystems</span>';
          }
          
          homepageData.hero[subKey] = row.data;
        } else {
          homepageData[row.section_key] = row.data;
        }
      });
    }
    populateAllSections();
  } catch (err) {
    console.error('Error loading homepage:', err);
    showToast('Failed to load content: ' + err.message, 'error');
  }
}

// ---------- Populate Sections ----------
function populateAllSections() {
  if (!homepageData) return;
  populateNavbar(homepageData.navbar || {});
  const hero = homepageData.hero || {};
  populateSimpleSection('hero_parent', hero.parent || {});
  if(typeof renderCarouselSlides === 'function') renderCarouselSlides((hero.parent && hero.parent.carousel_slides) ? hero.parent.carousel_slides : []);
  populateSimpleSection('hero_college', hero.college || {});
  populateSimpleSection('hero_school', hero.school || {});
  populateSimpleSection('about', homepageData.about || {});
  populateVerticals(homepageData.verticals || {});
  populateProducts(homepageData.products || {});
  populateImpact(homepageData.impact || {});
  populateSimpleSection('cta', homepageData.cta || {});
  if(typeof renderMarqueePartners === 'function') renderMarqueePartners(homepageData.marquee || []);
  populateSimpleSection('footer', homepageData.footer || {});

  // Hide loader
  const loader = document.getElementById('page-loader');
  const mainContent = document.getElementById('main-content');
  if (loader) loader.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
}

function populateSimpleSection(sectionKey, data) {
  Object.keys(data).forEach(field => {
    const el = document.getElementById(`${sectionKey}-${field}`);
    if (el) el.value = data[field] || '';
  });
}

// ---------- Navbar ----------
function populateNavbar(data) {
  const brandEl = document.getElementById('navbar-brand_name');
  const ctaEl = document.getElementById('navbar-cta_button');
  if (brandEl) brandEl.value = data.brand_name || '';
  if (ctaEl) ctaEl.value = data.cta_button || '';
  renderDropdownList('products_dropdown', data.products_dropdown || []);
  renderDropdownList('partners_dropdown', data.partners_dropdown || []);
}

function renderDropdownList(key, items) {
  const container = document.getElementById(`${key}-list`);
  if (!container) return;
  container.innerHTML = '';
  items.forEach((item, idx) => {
    container.appendChild(createDropdownItem(key, idx, item));
  });
}

function createDropdownItem(key, idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <span>${key.replace('_', ' ')} Item #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="dd-name" value="${escapeAttr(data.name || '')}" />
      </div>
      <div class="form-group">
        <label>URL</label>
        <input type="text" class="dd-url" value="${escapeAttr(data.url || '')}" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" class="dd-description" value="${escapeAttr(data.description || '')}" />
    </div>
    <div class="form-group">
      <label>Logo URL</label>
      <input type="text" class="dd-logo" value="${escapeAttr(data.logo || '')}" />
    </div>
  `;
  return div;
}

function addDropdownItem(key) {
  const container = document.getElementById(`${key}-list`);
  const idx = container.children.length;
  container.appendChild(createDropdownItem(key, idx));
}

// ---------- Verticals ----------
function populateVerticals(data) {
  const eyebrowEl = document.getElementById('verticals-eyebrow');
  const titleEl = document.getElementById('verticals-title');
  if (eyebrowEl) eyebrowEl.value = data.eyebrow || '';
  if (titleEl) titleEl.value = data.title || '';
  renderVerticalCards(data.cards || []);
}

function renderVerticalCards(cards) {
  const container = document.getElementById('verticals-cards-list');
  if (!container) return;
  container.innerHTML = '';
  cards.forEach((card, idx) => {
    container.appendChild(createVerticalCard(idx, card));
  });
}

function createVerticalCard(idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  const tags = (data.tags || []).join(', ');
  div.innerHTML = `
    <div class="list-item-header">
      <span>Card #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Icon (emoji/class)</label>
        <input type="text" class="card-icon" value="${escapeAttr(data.icon || '')}" />
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="card-title" value="${escapeAttr(data.title || '')}" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="card-description">${escapeHtml(data.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" class="card-tags" value="${escapeAttr(tags)}" />
    </div>
  `;
  return div;
}

function addVerticalCard() {
  const container = document.getElementById('verticals-cards-list');
  const idx = container.children.length;
  container.appendChild(createVerticalCard(idx));
}

// ---------- Products ----------
function populateProducts(data) {
  const fields = ['eyebrow', 'title', 'badge', 'product_name', 'description', 'cta_text'];
  fields.forEach(f => {
    const el = document.getElementById(`products-${f}`);
    if (el) el.value = data[f] || '';
  });
  renderFeaturesList(data.features || []);
}

function renderFeaturesList(features) {
  const container = document.getElementById('products-features-list');
  if (!container) return;
  container.innerHTML = '';
  features.forEach((feat, idx) => {
    container.appendChild(createFeatureItem(idx, feat));
  });
}

function createFeatureItem(idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <span>Feature #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Icon</label>
        <input type="text" class="feat-icon" value="${escapeAttr(data.icon || '')}" />
      </div>
      <div class="form-group">
        <label>Text</label>
        <input type="text" class="feat-text" value="${escapeAttr(data.text || '')}" />
      </div>
    </div>
  `;
  return div;
}

function addFeatureItem() {
  const container = document.getElementById('products-features-list');
  const idx = container.children.length;
  container.appendChild(createFeatureItem(idx));
}

// ---------- Impact ----------
function populateImpact(data) {
  const eyebrowEl = document.getElementById('impact-eyebrow');
  const titleEl = document.getElementById('impact-title');
  if (eyebrowEl) eyebrowEl.value = data.eyebrow || '';
  if (titleEl) titleEl.value = data.title || '';
  renderStatsList(data.stats || []);
}

function renderStatsList(stats) {
  const container = document.getElementById('impact-stats-list');
  if (!container) return;
  container.innerHTML = '';
  stats.forEach((stat, idx) => {
    container.appendChild(createStatItem(idx, stat));
  });
}

function createStatItem(idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <span>Stat #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Icon</label>
        <input type="text" class="stat-icon" value="${escapeAttr(data.icon || '')}" />
      </div>
      <div class="form-group">
        <label>Number</label>
        <input type="text" class="stat-number" value="${escapeAttr(data.number || '')}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Suffix</label>
        <input type="text" class="stat-suffix" value="${escapeAttr(data.suffix || '')}" />
      </div>
      <div class="form-group">
        <label>Label</label>
        <input type="text" class="stat-label" value="${escapeAttr(data.label || '')}" />
      </div>
    </div>
  `;
  return div;
}

function addStatItem() {
  const container = document.getElementById('impact-stats-list');
  const idx = container.children.length;
  container.appendChild(createStatItem(idx));
}

// ---------- Remove any list item ----------
function removeListItem(btn) {
  const item = btn.closest('.list-item');
  if (item) {
    item.style.opacity = '0';
    item.style.transform = 'scale(.95)';
    setTimeout(() => item.remove(), 200);
  }
}

// ---------- Collect Section Data ----------
function collectNavbarData() {
  return {
    brand_name: getVal('navbar-brand_name'),
    cta_button: getVal('navbar-cta_button'),
    products_dropdown: collectDropdownList('products_dropdown'),
    partners_dropdown: collectDropdownList('partners_dropdown')
  };
}

function collectDropdownList(key) {
  const container = document.getElementById(`${key}-list`);
  if (!container) return [];
  return Array.from(container.querySelectorAll('.list-item')).map(item => ({
    name: item.querySelector('.dd-name').value,
    description: item.querySelector('.dd-description').value,
    url: item.querySelector('.dd-url').value,
    logo: item.querySelector('.dd-logo').value
  }));
}

function collectSimpleSection(sectionKey, fields) {
  const data = {};
  fields.forEach(f => {
    data[f] = getVal(`${sectionKey}-${f}`);
  });
  return data;
}

// ---------- Carousel Images ----------
function renderCarouselSlides(slides) {
  const container = document.getElementById('carousel_slides-list');
  if (!container) return;
  container.innerHTML = '';
  slides.forEach((slide, idx) => {
    container.appendChild(createCarouselSlide(idx, slide));
  });
}

function addCarouselSlide() {
  const container = document.getElementById('carousel_slides-list');
  const idx = container.children.length;
  container.appendChild(createCarouselSlide(idx, {}));
}

function createCarouselSlide(idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <span>Slide #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row" style="align-items:flex-end;">
      <div class="form-group" style="flex:2;">
        <label>Image URL</label>
        <input type="text" class="slide-url" value="${escapeAttr(data.image || '')}" placeholder="https://..." />
        <div class="upload-progress-container" style="display:none; height: 4px; background: #e0e0e0; border-radius: 2px; margin-top: 4px; overflow: hidden; width: 100%;">
          <div class="upload-progress-fill" style="width: 0%; height: 100%; background: #0D1B8E; transition: width 0.3s ease;"></div>
        </div>
      </div>
      <div class="form-group" style="flex:1;">
        <label>Upload Image</label>
        <input type="file" accept="image/*" onchange="uploadImage(this, 'carousel')" />
      </div>
    </div>
  `;
  return div;
}

// ---------- Supabase Storage Upload (shared) ----------
async function uploadImage(input, folder) {
  let file = input.files[0];
  if (!file) return;
  const parentRow = input.closest('.form-row');
  const urlInput = parentRow.querySelector('input[type="text"]');
  const progressContainer = parentRow.querySelector('.upload-progress-container');
  const progressFill = parentRow.querySelector('.upload-progress-fill');

  urlInput.value = 'Uploading...';
  if (progressContainer) {
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    requestAnimationFrame(() => { progressFill.style.width = '30%'; });
  }

  const saveBtns = document.querySelectorAll('.btn-primary');
  saveBtns.forEach(btn => btn.disabled = true);

  try {
    // Background Removal Interception
    if ((folder === 'marquee' || folder === 'partners') && typeof imglyRemoveBackground !== 'undefined') {
      urlInput.value = '🤖 Removing background AI...';
      try {
        const transparentBlob = await imglyRemoveBackground(file);
        file = new File([transparentBlob], `transparent_${file.name.split('.')[0]}.png`, { type: 'image/png' });
        if (progressFill) progressFill.style.width = '60%';
      } catch (bgErr) {
        console.warn("Background removal failed, proceeding with original.", bgErr);
      }
      urlInput.value = 'Uploading to storage...';
    }

    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage.from('uploads').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) throw error;

    const { data: urlData } = sb.storage.from('uploads').getPublicUrl(data.path);
    urlInput.value = urlData.publicUrl;

    if (progressFill) progressFill.style.width = '100%';
    showToast('Image uploaded successfully!', 'success');
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    urlInput.value = '';
    showToast('Upload failed: ' + (err.message || err.error || 'Unknown error'), 'error');
    alert('Upload Error:\n\n' + (err.message || JSON.stringify(err)) + '\n\nMake sure:\n1. Storage bucket "uploads" exists (public)\n2. Storage policies allow authenticated uploads\n3. You ran the SQL setup script');
  } finally {
    if (progressContainer) setTimeout(() => { progressContainer.style.display = 'none'; }, 500);
    saveBtns.forEach(btn => btn.disabled = false);
  }
}

function collectHeroParentData() {
  const simple = collectSimpleSection('hero_parent', ['eyebrow','title','subtitle','primary_btn','secondary_btn','navBrand']);
  const container = document.getElementById('carousel_slides-list');
  const carousel_slides = Array.from(container.querySelectorAll('.list-item')).map(item => ({
    image: item.querySelector('.slide-url').value
  }));
  return { ...simple, carousel_slides };
}

// ---------- Marquee Partners ----------
function renderMarqueePartners(partners) {
  const container = document.getElementById('marquee_partners-list');
  if (!container) return;
  container.innerHTML = '';
  (Array.isArray(partners) ? partners : []).forEach((partner, idx) => {
    container.appendChild(createMarqueePartner(idx, partner));
  });
}

function addMarqueePartner() {
  const container = document.getElementById('marquee_partners-list');
  const idx = container.children.length;
  container.appendChild(createMarqueePartner(idx, {}));
}

function createMarqueePartner(idx, data = {}) {
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <div class="list-item-header">
      <span>Partner #${idx + 1}</span>
      <button class="btn-remove-item" onclick="removeListItem(this)">✕ Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Company Name</label>
        <input type="text" class="partner-name" value="${escapeAttr(data.name || '')}" placeholder="e.g. Google" />
      </div>
      <div class="form-group">
        <label>Website URL</label>
        <input type="text" class="partner-link" value="${escapeAttr(data.url || '')}" placeholder="https://" />
      </div>
    </div>
    <div class="form-row" style="align-items:flex-end;">
      <div class="form-group" style="flex:2;">
        <label>Logo Image URL</label>
        <input type="text" class="partner-logo" value="${escapeAttr(data.logo || '')}" placeholder="https://" />
        <div class="upload-progress-container" style="display:none; height: 4px; background: #e0e0e0; border-radius: 2px; margin-top: 4px; overflow: hidden; width: 100%;">
           <div class="upload-progress-fill" style="width: 0%; height: 100%; background: #0D1B8E; transition: width 0.3s ease;"></div>
        </div>
      </div>
      <div class="form-group" style="flex:1;">
        <label>Upload Logo</label>
        <input type="file" accept="image/*" onchange="uploadImage(this, 'marquee')" />
      </div>
    </div>
  `;
  return div;
}

function collectMarqueeData() {
  const container = document.getElementById('marquee_partners-list');
  return Array.from(container.querySelectorAll('.list-item')).map(item => {
    let logoUrl = item.querySelector('.partner-logo').value.trim();
    if (logoUrl === 'Uploading...') logoUrl = '';
    return {
      name: item.querySelector('.partner-name').value.trim(),
      url: item.querySelector('.partner-link').value.trim(),
      logo: logoUrl
    };
  });
}

function collectVerticalsData() {
  const container = document.getElementById('verticals-cards-list');
  const cards = Array.from(container.querySelectorAll('.list-item')).map(item => ({
    icon: item.querySelector('.card-icon').value,
    title: item.querySelector('.card-title').value,
    description: item.querySelector('.card-description').value,
    tags: item.querySelector('.card-tags').value.split(',').map(t => t.trim()).filter(Boolean)
  }));
  return {
    eyebrow: getVal('verticals-eyebrow'),
    title: getVal('verticals-title'),
    cards
  };
}

function collectProductsData() {
  const container = document.getElementById('products-features-list');
  const features = Array.from(container.querySelectorAll('.list-item')).map(item => ({
    icon: item.querySelector('.feat-icon').value,
    text: item.querySelector('.feat-text').value
  }));
  return {
    eyebrow: getVal('products-eyebrow'),
    title: getVal('products-title'),
    badge: getVal('products-badge'),
    product_name: getVal('products-product_name'),
    description: getVal('products-description'),
    features,
    cta_text: getVal('products-cta_text')
  };
}

function collectImpactData() {
  const container = document.getElementById('impact-stats-list');
  const stats = Array.from(container.querySelectorAll('.list-item')).map(item => ({
    icon: item.querySelector('.stat-icon').value,
    number: item.querySelector('.stat-number').value,
    suffix: item.querySelector('.stat-suffix').value,
    label: item.querySelector('.stat-label').value
  }));
  return {
    eyebrow: getVal('impact-eyebrow'),
    title: getVal('impact-title'),
    stats
  };
}

// ---------- Save Section (Supabase) ----------
async function saveSection(sectionKey) {
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  let sectionData;
  try {
    switch (sectionKey) {
      case 'navbar':
        sectionData = collectNavbarData();
        break;
      case 'hero_parent':
        sectionData = collectHeroParentData();
        break;
      case 'hero_college':
        sectionData = collectSimpleSection('hero_college', ['eyebrow','title','subtitle','primary_btn','secondary_btn','navBrand','backLabel']);
        break;
      case 'hero_school':
        sectionData = collectSimpleSection('hero_school', ['eyebrow','title','subtitle','primary_btn','secondary_btn','navBrand','backLabel']);
        break;
      case 'about':
        sectionData = collectSimpleSection('about', ['eyebrow','title','description','cta_text']);
        break;
      case 'verticals':
        sectionData = collectVerticalsData();
        break;
      case 'products':
        sectionData = collectProductsData();
        break;
      case 'impact':
        sectionData = collectImpactData();
        break;
      case 'cta':
        sectionData = collectSimpleSection('cta', ['title','subtitle','primary_btn','secondary_btn']);
        break;
      case 'marquee':
        sectionData = collectMarqueeData();
        break;
      case 'footer':
        sectionData = collectSimpleSection('footer', ['description','contact_email','copyright']);
        break;
      default:
        throw new Error('Unknown section: ' + sectionKey);
    }

    const { error } = await sb.from('site_content').upsert({
      section_key: sectionKey,
      data: sectionData,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    showToast(`${formatSectionName(sectionKey)} saved successfully!`, 'success');
  } catch (err) {
    console.error('Save error:', err);
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ---------- Helpers ----------
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escapeAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatSectionName(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------- Image upload for dropdown logos ----------
async function uploadDropdownLogo(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  try {
    showToast('Uploading logo…', 'info');
    const fileName = `logos/${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage.from('uploads').upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = sb.storage.from('uploads').getPublicUrl(data.path);
    const listItem = inputEl.closest('.list-item');
    if (listItem) {
      const logoInput = listItem.querySelector('.dd-logo');
      if (logoInput) logoInput.value = urlData.publicUrl;
    }
    showToast('Logo uploaded successfully!', 'success');
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Upload failed: ' + err.message, 'error');
  }
}

// ---------- Init on DOM ready ----------
document.addEventListener('DOMContentLoaded', () => {
  handleAuthState();
  initSidebar();
  initAccordions();

  // Login page form
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', loginUser);
    document.getElementById('login-password')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginUser();
    });
    document.getElementById('login-email')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('login-password')?.focus();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
});

// Called after auth check confirms user is logged in (on dashboard page)
function onAuthReady(user) {
  if (document.getElementById('main-content')) {
    loadHomepageData();
    loadAnalytics();
  }
}

// ---------- Analytics (Supabase) ----------
async function loadAnalytics() {
  const visitorsEl = document.getElementById('analytics-total-visitors');
  const pagesListEl = document.getElementById('analytics-top-pages');
  if (!visitorsEl || !pagesListEl) return;

  try {
    const { data, error } = await sb.from('analytics').select('*').order('views', { ascending: false });
    if (error) throw error;

    let totalViews = 0;
    const pages = [];

    (data || []).forEach(row => {
      totalViews += row.views || 0;
      pages.push({ path: row.path, views: row.views });
    });

    visitorsEl.textContent = totalViews.toLocaleString();

    if (pages.length === 0) {
      pagesListEl.innerHTML = '<div class="text-grey-mid">No analytics data yet. Visit the site to log views!</div>';
      return;
    }

    pagesListEl.innerHTML = pages.slice(0, 5).map(p => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333;">
        <span style="color: #e0e0e0; font-family: monospace;">${p.path.replace(/_/g, '/')}</span>
        <span style="color: #F5C200; font-weight: bold;">${p.views.toLocaleString()} views</span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading analytics:', err);
    if (visitorsEl) visitorsEl.textContent = 'Error';
  }
}
