document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('partners-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  let partners = [];

  // 1. Fetch data from Supabase
  try {
    const { data, error } = await sb.from('partners').select('*');
    if (error) throw error;
    partners = data || [];
  } catch (err) {
    console.error('Error fetching partners from Supabase:', err);
  }

  // Remove loading
  if (loadingIndicator) loadingIndicator.remove();

  // 2. Render function
  function renderPartners(category) {
    // Filter
    let filtered = partners;
    if (category !== 'All') {
      filtered = partners.filter(p => p.category === category);
    }

    // Render HTML
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12 text-grey-mid">No partners found in this category yet.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(partner => `
      <div class="bg-white rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-hk-border p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
        <div class="w-24 h-24 mb-4 flex items-center justify-center">
          ${partner.logo ? `
            <img src="${partner.logo}" alt="${partner.title}" class="max-w-full max-h-full object-contain" />
          ` : `
            <div class="w-full h-full rounded-full bg-navy-tint flex items-center justify-center text-navy font-bold text-2xl">
              ${partner.title.charAt(0)}
            </div>
          `}
        </div>
        <h3 class="font-bold text-navy text-lg mb-2">${partner.title}</h3>
        ${partner.description ? `<p class="text-grey-dark text-sm mb-4">${partner.description}</p>` : ''}
        ${partner.url ? `
          <a href="${partner.url}" target="_blank" rel="noopener noreferrer" class="mt-auto text-navy hover:text-yellow font-semibold text-sm flex items-center gap-1 transition-colors">
            Visit Website <i class="ph-bold ph-arrow-right"></i>
          </a>
        ` : ''}
      </div>
    `).join('');
  }

  // 3. Handle Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active', 'border-navy', 'text-white', 'bg-navy');
        b.classList.add('border-hk-border', 'text-grey-dark');
      });
      const targetBtn = e.target;
      targetBtn.classList.remove('border-hk-border', 'text-grey-dark');
      targetBtn.classList.add('active', 'border-navy', 'text-white', 'bg-navy');

      // Re-render
      const category = targetBtn.getAttribute('data-category');
      renderPartners(category);
    });
  });

  // 4. Initial Load (Check URL query params for initial category)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'All';
  
  // Click the corresponding button to set active state and trigger render
  const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-category') === initialCategory);
  if (targetBtn) {
    targetBtn.click();
  } else {
    renderPartners('All');
  }
});
