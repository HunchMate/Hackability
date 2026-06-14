/* ============================================================
   Hackability Admin — Partners Management JavaScript (Supabase)
   ============================================================ */

// ---------- State ----------
let editingPartnerId = null;
let uploadedLogoURL = null;

// ---------- Toast ----------
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

// ---------- Sidebar ----------
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
function populateUserInfo(user) {
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.email ? user.email.charAt(0).toUpperCase() : 'A';
}

async function logoutUser() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// ---------- Load Partners ----------
async function loadPartners() {
  const grid = document.getElementById('partners-grid');
  const loader = document.getElementById('page-loader');
  const mainContent = document.getElementById('main-content');

  try {
    const { data, error } = await sb.from('partners').select('*').order('title');
    if (error) throw error;

    if (loader) loader.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    renderPartners(data || []);
    updateCount((data || []).length);
  } catch (err) {
    console.error('Error loading partners:', err);
    showToast('Failed to load partners: ' + err.message, 'error');
    if (loader) loader.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
  }
}

function renderPartners(partners) {
  const grid = document.getElementById('partners-grid');
  if (!grid) return;

  if (partners.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🤝</div>
        <h4>No partners yet</h4>
        <p>Click "Add Partner" to add your first partner.</p>
      </div>`;
    return;
  }

  grid.innerHTML = partners.map(p => `
    <div class="partner-card" data-id="${p.id}">
      <div class="partner-card-top">
        <div class="partner-card-logo">
          ${p.logo ? `<img src="${escapeAttr(p.logo)}" alt="${escapeAttr(p.title)}" />` : '<span style="font-size:1.4rem">🏢</span>'}
        </div>
        <div class="partner-card-info">
          <h4>${escapeHtml(p.title || 'Untitled')}</h4>
          <span class="category-badge ${(p.category || '').toLowerCase()}">${escapeHtml(p.category || 'General')}</span>
        </div>
      </div>
      <div class="partner-card-desc">${escapeHtml(p.description || 'No description')}</div>
      <div class="partner-card-actions">
        <button class="btn btn-sm btn-ghost" onclick="editPartner('${p.id}')">✎ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePartner('${p.id}', '${escapeAttr(p.title)}')">✕ Delete</button>
      </div>
    </div>
  `).join('');
}

function updateCount(count) {
  const el = document.getElementById('partners-count');
  if (el) el.textContent = `${count} partner${count !== 1 ? 's' : ''}`;
}

// ---------- Modal ----------
function openModal() {
  editingPartnerId = null;
  uploadedLogoURL = null;
  document.getElementById('modal-title').textContent = 'Add Partner';
  document.getElementById('partner-form').reset();
  clearPreview();
  document.getElementById('partner-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('partner-modal').classList.remove('active');
  editingPartnerId = null;
  uploadedLogoURL = null;
}

function clearPreview() {
  const preview = document.getElementById('logo-preview');
  if (preview) preview.innerHTML = '';
  const progress = document.getElementById('upload-progress');
  if (progress) progress.style.display = 'none';
}

// ---------- Edit Partner ----------
async function editPartner(id) {
  try {
    const { data, error } = await sb.from('partners').select('*').eq('id', id).single();
    if (error || !data) {
      showToast('Partner not found.', 'error');
      return;
    }
    
    editingPartnerId = id;
    uploadedLogoURL = data.logo || null;

    document.getElementById('modal-title').textContent = 'Edit Partner';
    document.getElementById('partner-name').value = data.title || '';
    document.getElementById('partner-category').value = data.category || 'Colleges';
    document.getElementById('partner-description').value = data.description || '';
    document.getElementById('partner-url').value = data.url || '';

    const preview = document.getElementById('logo-preview');
    if (data.logo) {
      preview.innerHTML = `<img src="${escapeAttr(data.logo)}" alt="Logo" />`;
    } else {
      preview.innerHTML = '';
    }

    document.getElementById('partner-modal').classList.add('active');
  } catch (err) {
    console.error('Error fetching partner:', err);
    showToast('Failed to load partner.', 'error');
  }
}

// ---------- Delete Partner ----------
async function deletePartner(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
  try {
    const { error } = await sb.from('partners').delete().eq('id', id);
    if (error) throw error;
    showToast(`"${name}" deleted successfully.`, 'success');
    loadPartners();
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ---------- Image Upload ----------
async function handleLogoUpload(inputEl) {
  let file = inputEl.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file.', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be smaller than 5MB.', 'error');
    return;
  }

  const preview = document.getElementById('logo-preview');
  const progress = document.getElementById('upload-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  progress.style.display = 'block';
  progressFill.style.width = '10%';
  progressText.textContent = 'Removing background AI...';

  // 1. Remove background using imgly
  if (typeof imglyRemoveBackground !== 'undefined') {
    try {
      const transparentBlob = await imglyRemoveBackground(file);
      file = new File([transparentBlob], `transparent_${file.name.split('.')[0]}.png`, { type: 'image/png' });
    } catch (bgErr) {
      console.warn("Background removal failed, proceeding with original.", bgErr);
    }
  }

  progressFill.style.width = '40%';
  progressText.textContent = 'Uploading to storage...';

  // Show preview of the transparent image
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="background:#f1f3fb;" />`;
  };
  reader.readAsDataURL(file);

  // 2. Upload to Supabase Storage
  try {
    const fileName = `partners/logos/${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage.from('uploads').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) throw error;

    const { data: urlData } = sb.storage.from('uploads').getPublicUrl(data.path);
    uploadedLogoURL = urlData.publicUrl;

    progressFill.style.width = '100%';
    progressText.textContent = 'Upload complete!';
    showToast('Logo uploaded with transparent background!', 'success');
    
    setTimeout(() => { progress.style.display = 'none'; }, 2000);
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Upload failed: ' + err.message, 'error');
    progress.style.display = 'none';
  }
}

// ---------- Save Partner ----------
async function savePartner() {
  const name = document.getElementById('partner-name').value.trim();
  const category = document.getElementById('partner-category').value;
  const description = document.getElementById('partner-description').value.trim();
  const url = document.getElementById('partner-url').value.trim();

  if (!name) {
    showToast('Partner name is required.', 'error');
    return;
  }

  const btn = document.getElementById('save-partner-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  const partnerData = {
    title: name,
    category: category,
    description: description,
    url: url,
    logo: uploadedLogoURL || ''
  };

  try {
    if (editingPartnerId) {
      const { error } = await sb.from('partners').update(partnerData).eq('id', editingPartnerId);
      if (error) throw error;
      showToast(`"${name}" updated successfully!`, 'success');
    } else {
      const { error } = await sb.from('partners').insert([partnerData]);
      if (error) throw error;
      showToast(`"${name}" added successfully!`, 'success');
    }
    closeModal();
    loadPartners();
  } catch (err) {
    console.error('Save error:', err);
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💾 Save Partner';
  }
}

// ---------- Helpers ----------
function escapeAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
  } else {
    populateUserInfo(session.user);
    loadPartners();
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      window.location.href = 'index.html';
    }
  });

  // Modal close on overlay click
  const modalOverlay = document.getElementById('partner-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
});
