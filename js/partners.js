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
    
    // TEMPORARY: Force empty array so the new mock data renders instead of Supabase test data
    partners = [];
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
      if (category === 'Colleges') {
        filtered = [
          {
            title: "Anurag University",
            description: "Anurag University is a Private University located in Venkatapur, Medchal-Malkajgiri district, Hyderabad, Telangana, India. Established in 2020, and is one of the First Private Universities in the State of Telangana.",
            logo: "assets/images/colleges/anurag.png",
            url: "https://www.anurag.edu.in/",
            category: "Colleges"
          },
          {
            title: "Geethanjali College of Engineering",
            description: "Geethanjali is equipped and geared up to take on the responsibility of providing exceptional quality technical education, assimilating the latest developments in an ambience committed to achieve academic excellence.",
            logo: "assets/images/colleges/gcet.png",
            url: "https://gcet.edu.in/",
            category: "Colleges"
          },
          {
            title: "Vaagdevi College of Engineering",
            description: "Vaagdevi College of Engineering, Warangal, is an AICTE-approved, JNTUH-affiliated autonomous institution committed to excellence in technical education, research, and holistic student development since its founding.",
            logo: "assets/images/colleges/vagdevi.png",
            url: "https://www.vaagdevi.edu.in/",
            category: "Colleges"
          },
          {
            title: "B.V. Raju Institute of Technology",
            description: "B.V. Raju Institute of Technology is an engineering college established in 1997 in Narsapur, Medak, Telangana State, India.",
            logo: "assets/images/colleges/bvrit.png",
            url: "https://bvrit.ac.in/",
            category: "Colleges"
          },
          {
            title: "TKR College of Engineering & Technology",
            description: "The Institution endeavours towards imparting quality education with ethical values and strives to make students technically competent to reach heights and make our nation self-reliant and globally recognized.",
            logo: "assets/images/colleges/tkr.png",
            url: "https://tkrcet.ac.in/",
            category: "Colleges"
          }
        ];
      } else if (category === 'Mentors') {
        // Mock data so the user can see the new mentor cards even if the database is empty
        filtered = [
          {
            title: "Mr. Madhu Vadlamani",
            description: "Enterprise Leader, Enterprise Minds, Inc. Ex-Practice Manager, Miracle Software Systems, Inc. Sr. Consultant Ex-Deloitte, Ex-Cognizant.",
            logo: "assets/images/mentors/madhu.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Baradwaj Arvapally",
            description: "Founder, ABTechVille. Serial Entrepreneur, Experienced in Mentoring 10,000+ Students on IoT & other Technologies.",
            logo: "assets/images/mentors/baradwaj.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Amarnath J.",
            description: "Founder & CEO, Buchuk Robo Chef. Prominent Mentor & TiE Hyderabad Speaker. 12+ yrs experience in Robotics & Manufacturing.",
            logo: "assets/images/mentors/amarnath.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Prithvi Raj",
            description: "Sr. Software Architect, Worthit Consultancy Services. Ex-Godrej, Ex-General Electric. 7+ Yrs Experience in Corporate Consulting, Alumni IIM-Trichy.",
            logo: "assets/images/mentors/prithvi.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Nikhil",
            description: "AI Strategy Architect, Techolution. Alumni IITM. 10x Hackathon Winner, Award-Winning Author.",
            logo: "assets/images/mentors/nikhil.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Swaminathan Jerra",
            description: "Founder & CEO, AquaHT Labs. Recognized by Prominent IITs, IIMs, STPI, T-Hub, Google and Microsoft for Startups. 2X Startup Founder.",
            logo: "assets/images/mentors/jeera.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. M. Sai Kiran",
            description: "Incubation Manager, VIBA. 5+ Years In Incubation & Innovation, Academic Mentor & Trainer.",
            logo: "assets/images/mentors/sai.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Mukesh Sankhla",
            description: "Founder, MakerBrains. Technical Mentor & Gen AI Trainer. 6+ yrs of Experience in STEM Technologies Training.",
            logo: "assets/images/mentors/mukesh.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Nalamilli Venkat Reddy",
            description: "Founder & CEO, Teckybot. 10+ yrs of experience in STEM Innovation Domain, Serial Entrepreneur, Hardware & MVP Expert.",
            logo: "assets/images/mentors/venkat.png",
            url: "#",
            category: "Mentors"
          },
          {
            title: "Mr. Prasad Anumula",
            description: "Founder & Director, Risk Guard Enterprise Solutions.",
            logo: "assets/images/mentors/prasad.png",
            url: "#",
            category: "Mentors"
          }
        ];
      } else if (category === 'Organizations') {
        filtered = [
          {
            title: "T-Hub",
            description: "T-Hub is the World's largest home for Startups, democratizing access for 10000+ startups. Join T-Hub. Come Build with Fellow Founders.",
            logo: "assets/images/organizations/thub.png",
            url: "https://www.t-hub.co/",
            category: "Organizations"
          },
          {
            title: "T-Works",
            description: "We are India's largest Prototyping Centre and Manufacturing Knowledge Partner, supported by the Government of Telangana.",
            logo: "assets/images/organizations/tworks.png",
            url: "https://tworks.telangana.gov.in/",
            category: "Organizations"
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
        <div class="group relative w-full h-[400px] rounded-[2rem] border border-white/10 overflow-hidden shadow-xl cursor-pointer bg-navy transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl">
          
          <!-- Full Cover Image (mix-blend-mode removed since images are now correctly cropped) -->
          <img src="${bgImg}" alt="${partner.title}" class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
          
          <!-- Smooth Dark Overlay - Restricted to bottom 60% so faces are clearly visible -->
          <div class="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#050b14] via-[#050b14]/80 to-transparent transition-opacity duration-500"></div>

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            
            <!-- Name and Verification -->
            <div class="flex items-center gap-2">
              <h2 class="text-2xl font-bold text-white tracking-tight leading-tight">${partner.title}</h2>
            </div>

            <!-- Description -->
            <p class="text-white/80 text-sm leading-relaxed line-clamp-3">
              ${partner.description}
            </p>
          </div>
        </div>
        `;
      }

      return `
      <div class="group relative bg-white rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(13,27,142,0.1)] border border-hk-border hover:border-navy/20 overflow-hidden h-full">
        <!-- Subtle background gradient on hover -->
        <div class="absolute inset-0 bg-gradient-to-b from-navy-tint/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <!-- Logo Container -->
        <div class="relative w-36 h-36 mb-4 flex items-center justify-center bg-white rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] border border-hk-border/50 p-2 transition-transform duration-500 group-hover:scale-105 z-10">
          ${partner.logo ? `
            <img src="${partner.logo}" alt="${partner.title}" class="max-w-full max-h-full object-contain drop-shadow-sm" />
          ` : `
            <div class="w-full h-full rounded-xl bg-gradient-to-br from-navy-tint to-white flex items-center justify-center text-navy font-display font-bold text-3xl">
              ${partner.title.charAt(0)}
            </div>
          `}
        </div>
        
        <!-- Text Content -->
        <div class="relative z-10 flex flex-col flex-grow items-center w-full">
          <h3 class="font-display font-bold text-navy text-xl mb-1.5 group-hover:text-blue-600 transition-colors">${partner.title}</h3>
          ${partner.description ? `<p class="text-grey-dark text-sm leading-relaxed mb-4 flex-grow">${partner.description}</p>` : '<div class="flex-grow"></div>'}
          
          ${partner.url ? `
            <a href="${partner.url}" target="_blank" rel="noopener noreferrer" class="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-grey-light text-navy font-semibold text-sm transition-all duration-300 hover:bg-navy hover:text-white group-hover:shadow-md">
              Visit Website <i class="ph-bold ph-arrow-up-right"></i>
            </a>
          ` : ''}
        </div>
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
  const initialCategory = urlParams.get('category') || 'Colleges';
  
  // Click the corresponding button to set active state and trigger render
  const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-category') === initialCategory);
  if (targetBtn) {
    targetBtn.click();
  } else {
    renderPartners('Colleges');
  }
});
