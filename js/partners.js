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
      if (category === 'Mentors') {
        // Mock data so the user can see the new mentor cards even if the database is empty
        filtered = [
          {
            title: "Dr. Sarah Chen",
            description: "AI Researcher & Tech Entrepreneur. Former Lead Scientist at DeepMind.",
            logo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
            url: "#",
            category: "Mentors"
          },
          {
            title: "James Miller",
            description: "Product Design Leader. 15+ years experience building consumer apps.",
            logo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Elena Rodriguez",
            description: "Startup Founder & Angel Investor. Featured in Forbes 30 Under 30.",
            logo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop",
            url: "#",
            category: "Mentors"
          }
        ];
      } else {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-grey-mid">No partners found in this category yet.</div>`;
        return;
      }
    }

    grid.innerHTML = filtered.map(partner => {
      if (partner.category === 'Mentors') {
        const bgImg = partner.logo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop';
        const colors = ["250 50% 30%", "150 50% 25%", "200 60% 30%", "330 60% 35%"];
        const themeColor = colors[partner.title.length % colors.length];

        return `
        <div class="group w-full h-[400px]" style="--theme-color: ${themeColor};">
          <a href="${partner.url || '#'}" target="_blank" rel="noopener noreferrer" 
             class="relative block w-full h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
             style="box-shadow: 0 0 40px -15px hsl(var(--theme-color) / 0.5)">
            
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110" 
                 style="background-image: url('${bgImg}')"></div>

            <div class="absolute inset-0" 
                 style="background: linear-gradient(to top, hsl(var(--theme-color) / 0.9), hsl(var(--theme-color) / 0.6) 30%, transparent 60%)"></div>
            
            <div class="relative flex flex-col justify-end h-full p-6 text-white text-left">
              <h3 class="text-3xl font-bold tracking-tight">${partner.title}</h3>
              <p class="text-sm text-white/80 mt-1 font-medium">${partner.description || 'Mentor'}</p>

              <div class="mt-8 flex items-center justify-end">
                <div class="bg-[hsl(var(--theme-color)/0.2)] backdrop-blur-md border border-[hsl(var(--theme-color)/0.3)] rounded-full p-3 transition-all duration-300 group-hover:bg-[hsl(var(--theme-color)/0.4)] group-hover:border-[hsl(var(--theme-color)/0.5)]">
                  <i class="ph-bold ph-arrow-up-right text-white"></i>
                </div>
              </div>
            </div>
          </a>
        </div>
        `;
      }

      return `
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
      `;
    }).join('');
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
