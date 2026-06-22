/**
 * Hackability Blog Logic
 * Fetches blog posts from Supabase (if available) or uses fallback mock data.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const blogGrid = document.getElementById('blog-grid');
  const categoryFilters = document.querySelectorAll('.blog-filter-btn');
  let allPosts = [];

  // Mock Fallback Data (Professional & Hackability Branded)
  const fallbackPosts = [
    {
      id: 1,
      title: 'Building the Future: Inside Hackability',
      excerpt: 'How we are bridging the gap between student talent and global ecosystem needs through intensive training.',
      category: 'Program Updates',
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop',
      author: 'Vishva',
      date: 'June 22, 2026',
      read_time: '5 min read'
    },
    {
      id: 2,
      title: 'Hatch: Empowering School Students',
      excerpt: 'A deep dive into our new entrepreneurship program designed to inspire the next generation of founders before they even reach college.',
      category: 'Education',
      image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop',
      author: 'Sarah Chen',
      date: 'June 18, 2026',
      read_time: '4 min read'
    },
    {
      id: 3,
      title: 'Top 5 Tech Stacks for 2026 Startups',
      excerpt: 'From Supabase to Next.js, here are the tools our top teams are using to ship products in record time.',
      category: 'Tech & Development',
      image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
      author: 'James Miller',
      date: 'June 10, 2026',
      read_time: '7 min read'
    },
    {
      id: 4,
      title: 'Meet Our Mentor: Elena Rodriguez',
      excerpt: 'Elena shares her journey from a bootstrapped startup founder to a Forbes 30 Under 30 angel investor.',
      category: 'Interviews',
      image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop',
      author: 'Hackability Team',
      date: 'June 05, 2026',
      read_time: '6 min read'
    },
    {
      id: 5,
      title: 'The Art of the Pitch Deck',
      excerpt: 'Learn the exact structure and narrative flow that helped our alumni raise over $5M in seed funding last year.',
      category: 'Startups',
      image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop',
      author: 'David Wright',
      date: 'May 28, 2026',
      read_time: '8 min read'
    },
    {
      id: 6,
      title: 'Why Soft Skills Matter More Than Ever',
      excerpt: 'In an age of AI coding assistants, human communication, empathy, and leadership are your biggest competitive advantages.',
      category: 'Career Advice',
      image_url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&auto=format&fit=crop',
      author: 'Vishva',
      date: 'May 15, 2026',
      read_time: '4 min read'
    }
  ];

  // Try to fetch from Supabase
  try {
    if (typeof supabase !== 'undefined') {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        allPosts = data;
      } else {
        console.log('No posts found in Supabase, using mock data.');
        allPosts = fallbackPosts;
      }
    } else {
      console.log('Supabase client not found, using mock data.');
      allPosts = fallbackPosts;
    }
  } catch (err) {
    console.warn('Error fetching blogs from Supabase, using mock data:', err);
    allPosts = fallbackPosts;
  }

  // Render Function
  function renderPosts(posts) {
    blogGrid.innerHTML = '';
    
    if (posts.length === 0) {
      blogGrid.innerHTML = `<div class="col-span-full text-center py-12 text-grey-mid">No articles found in this category.</div>`;
      return;
    }

    posts.forEach(post => {
      // Handle Supabase fields vs Mock fields
      const title = post.title;
      const excerpt = post.excerpt || post.description || '';
      const imageUrl = post.image_url || post.cover_image || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&auto=format&fit=crop';
      const category = post.category || 'Uncategorized';
      const author = post.author || 'Hackability Team';
      const date = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
      const readTime = post.read_time || '5 min read';
      
      // Determine link (for real posts, it would route to a dynamic page, for now just #)
      const postUrl = post.slug ? `/blog/${post.slug}` : '#';

      const cardHTML = `
        <article class="bg-white rounded-2xl border border-hk-border overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
          <!-- Image -->
          <a href="${postUrl}" class="block overflow-hidden relative h-56">
            <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-navy shadow-sm">
              ${category}
            </div>
          </a>
          
          <!-- Content -->
          <div class="p-6 flex flex-col flex-grow">
            <div class="flex items-center text-xs text-grey-mid font-medium mb-3 gap-2">
              <span class="flex items-center gap-1"><i class="ph-bold ph-calendar-blank"></i> ${date}</span>
              <span>•</span>
              <span class="flex items-center gap-1"><i class="ph-bold ph-clock"></i> ${readTime}</span>
            </div>
            
            <a href="${postUrl}" class="block group-hover:text-navy transition-colors">
              <h3 class="font-display font-bold text-xl text-grey-dark mb-3 line-clamp-2">${title}</h3>
            </a>
            
            <p class="text-grey-dark/80 text-sm mb-6 line-clamp-3 font-body flex-grow">
              ${excerpt}
            </p>
            
            <!-- Author / Footer -->
            <div class="mt-auto pt-4 border-t border-hk-border/50 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-navy-tint text-navy flex items-center justify-center font-bold text-xs uppercase">
                  ${author.charAt(0)}
                </div>
                <span class="text-sm font-semibold text-navy">${author}</span>
              </div>
              <a href="${postUrl}" class="text-navy hover:text-navy-mid transition-colors text-sm font-semibold flex items-center gap-1">
                Read <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </article>
      `;
      
      blogGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
  }

  // Initial Render
  if (blogGrid) {
    renderPosts(allPosts);
  }

  // Filtering Logic
  if (categoryFilters) {
    categoryFilters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active from all
        categoryFilters.forEach(b => {
          b.classList.remove('bg-navy', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'text-grey-dark', 'hover:bg-grey-light');
        });
        
        // Add active to clicked
        const target = e.currentTarget;
        target.classList.remove('bg-white', 'text-grey-dark', 'hover:bg-grey-light');
        target.classList.add('bg-navy', 'text-white', 'shadow-md');
        
        const selectedCategory = target.dataset.category;
        
        if (selectedCategory === 'All') {
          renderPosts(allPosts);
        } else {
          const filtered = allPosts.filter(p => p.category === selectedCategory);
          renderPosts(filtered);
        }
      });
    });
  }
});
