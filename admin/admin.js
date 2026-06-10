/* ============================================================
   Hackability Admin — Main JavaScript
   ============================================================ */

// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "AIzaSyC4Yi7dHSOvmjb2victqbUI_H6Y86YMeIQ",
  authDomain: "hackability-a6980.firebaseapp.com",
  projectId: "hackability-a6980",
  storageBucket: "hackability-a6980.firebasestorage.app",
  messagingSenderId: "361281138633",
  appId: "1:361281138633:web:740138b0c8ef277a760218"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

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
      eyebrow: "",
      title: "",
      subtitle: "",
      primary_btn: "",
      secondary_btn: "",
      navBrand: ""
    },
    college: {
      eyebrow: "",
      title: "",
      subtitle: "",
      primary_btn: "",
      secondary_btn: "",
      navBrand: "",
      backLabel: ""
    },
    school: {
      eyebrow: "",
      title: "",
      subtitle: "",
      primary_btn: "",
      secondary_btn: "",
      navBrand: "",
      backLabel: ""
    }
  },
  about: {
    eyebrow: "",
    title: "",
    description: "",
    cta_text: ""
  },
  verticals: {
    eyebrow: "",
    title: "",
    cards: []
  },
  products: {
    eyebrow: "",
    title: "",
    badge: "",
    product_name: "",
    description: "",
    features: [],
    cta_text: ""
  },
  impact: {
    eyebrow: "",
    title: "",
    stats: []
  },
  cta: {
    title: "",
    subtitle: "",
    primary_btn: "",
    secondary_btn: ""
  },
  footer: {
    description: "",
    contact_email: "",
    copyright: ""
  }
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

// ---------- Auth ----------
function isLoginPage() {
  return window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/');
}

function handleAuthState() {
  auth.onAuthStateChanged(user => {
    if (isLoginPage()) {
      if (user) window.location.href = 'dashboard.html';
    } else {
      if (!user) window.location.href = 'index.html';
      else {
        populateUserInfo(user);
        if (typeof onAuthReady === 'function') onAuthReady(user);
      }
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
function loginUser() {
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

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(err => {
      btn.disabled = false;
      btn.textContent = 'Sign In';
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a moment.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      errorEl.textContent = msg;
      errorEl.classList.add('show');
    });
}

// Logout
function logoutUser() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}

// ---------- Firestore: Load Homepage ----------
let homepageData = null;

async function loadHomepageData() {
  try {
    const docRef = db.collection('site_content').doc('homepage');
    const doc = await docRef.get();
    if (doc.exists) {
      homepageData = doc.data();
    } else {
      // First run — create document with defaults
      homepageData = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE));
      await docRef.set(homepageData);
      showToast('Initialized homepage with default structure.', 'info');
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
  populateSimpleSection('hero_college', hero.college || {});
  populateSimpleSection('hero_school', hero.school || {});
  populateSimpleSection('about', homepageData.about || {});
  populateVerticals(homepageData.verticals || {});
  populateProducts(homepageData.products || {});
  populateImpact(homepageData.impact || {});
  populateSimpleSection('cta', homepageData.cta || {});
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

// ---------- Save Section ----------
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
        sectionData = collectSimpleSection('hero_parent', ['eyebrow','title','subtitle','primary_btn','secondary_btn','navBrand']);
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
      case 'footer':
        sectionData = collectSimpleSection('footer', ['description','contact_email','copyright']);
        break;
      default:
        throw new Error('Unknown section: ' + sectionKey);
    }

    let updatePayload = {};
    if (sectionKey.startsWith('hero_')) {
      const subKey = sectionKey.split('_')[1];
      updatePayload = { hero: { [subKey]: sectionData } };
    } else {
      updatePayload = { [sectionKey]: sectionData };
    }

    await db.collection('site_content').doc('homepage').set(
      updatePayload,
      { merge: true }
    );

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
  const storageRef = storage.ref(`admin/logos/${Date.now()}_${file.name}`);
  try {
    showToast('Uploading logo…', 'info');
    const snapshot = await storageRef.put(file);
    const url = await snapshot.ref.getDownloadURL();
    // Set the URL in the adjacent logo input
    const listItem = inputEl.closest('.list-item');
    if (listItem) {
      const logoInput = listItem.querySelector('.dd-logo');
      if (logoInput) logoInput.value = url;
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
    // Enter key support
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

// ---------- Analytics ----------
async function loadAnalytics() {
  const visitorsEl = document.getElementById('analytics-total-visitors');
  const pagesListEl = document.getElementById('analytics-top-pages');
  if (!visitorsEl || !pagesListEl) return;

  try {
    const snapshot = await db.collection('analytics').orderBy('views', 'desc').get();
    let totalViews = 0;
    const pages = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
      pages.push({ path: doc.id, views: data.views });
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
    visitorsEl.textContent = 'Error';
  }
}
