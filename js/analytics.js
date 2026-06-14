// Hackability Custom Analytics Tracker (Supabase)
(async function() {
  // Ensure Supabase is loaded
  if (typeof sb === 'undefined') {
    console.warn('Analytics: Supabase client not loaded.');
    return;
  }

  try {
    // Determine the page path
    let path = window.location.pathname;
    if (path === '/' || path === '' || path === '/index.html') {
      path = 'homepage';
    } else {
      // Remove leading slash and .html extension
      path = path.replace(/^\//, '').replace(/\.html$/, '');
    }

    // Add query parameters if present (e.g., ?category=Colleges)
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      if (category) {
        path += `_category_${category}`;
      }
    }

    // Replace invalid characters for database keys
    path = path.replace(/[\/\.]/g, '_');

    // Increment the view count using Supabase RPC
    const { error } = await sb.rpc('increment_page_view', { page_path: path });
    if (error) {
      console.error('Analytics RPC error:', error);
    }

  } catch (err) {
    console.error('Analytics tracking failed:', err);
  }
})();
