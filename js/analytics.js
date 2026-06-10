// Hackability Custom Analytics Tracker
(async function() {
  // Ensure Firebase is loaded
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    console.warn('Analytics: Firebase SDK not loaded.');
    return;
  }

  try {
    const db = firebase.firestore();
    
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

    // Replace invalid characters for Firestore document IDs
    path = path.replace(/[\/\.]/g, '_');

    // Increment the view count for this page
    const docRef = db.collection('analytics').doc(path);
    await docRef.set({
      views: firebase.firestore.FieldValue.increment(1),
      lastVisit: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (err) {
    console.error('Analytics tracking failed:', err);
  }
})();
