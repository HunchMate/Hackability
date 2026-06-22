/* ============================================================
   Hackability Admin - Blog Manager (Firebase)
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ---------- Global State ----------
let quill;
let currentBlogs = [];

// ---------- UI Utilities ----------
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = isError ? '#e74c3c' : '#2ecc71';
  toast.className = 'toast show';
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

// Toggle Views
function showList() {
  document.getElementById('view-form').classList.add('hidden');
  document.getElementById('view-list').classList.remove('hidden');
  loadBlogs();
}

function showForm() {
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-form').classList.remove('hidden');
  resetForm();
  document.getElementById('form-title').innerText = "Create Blog";
}

// Generate Slug automatically from title
function generateSlug() {
  const title = document.getElementById('blog-title').value;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  document.getElementById('blog-slug').value = slug;
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---------- Init Quill Editor ----------
document.addEventListener("DOMContentLoaded", () => {
  quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write your amazing blog post here...',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    }
  });

  // Mobile sidebar toggle
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if(toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Handle Image Upload automatically
  document.getElementById('blog-image').addEventListener('change', handleImageUpload);
});

// ---------- Auth Listener ----------
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html"; // Redirect to login
  } else {
    document.getElementById("user-email").innerText = user.email;
    loadBlogs();
  }
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});

// ---------- Fetch & Render Blogs ----------
async function loadBlogs() {
  const listContainer = document.getElementById('blog-list');
  listContainer.innerHTML = "<p>Loading blogs...</p>";

  try {
    const snapshot = await db.collection("blogs").orderBy("date", "desc").get();
    currentBlogs = [];
    snapshot.forEach(doc => {
      currentBlogs.push({ id: doc.id, ...doc.data() });
    });

    if (currentBlogs.length === 0) {
      listContainer.innerHTML = "<p>No blogs found. Create one!</p>";
      return;
    }

    listContainer.innerHTML = "";
    currentBlogs.forEach(blog => {
      const item = document.createElement('div');
      item.className = 'blog-item';
      
      const info = document.createElement('div');
      info.className = 'blog-info';
      info.innerHTML = `
        <h4>${blog.title || 'Untitled'}</h4>
        <p>${blog.author || 'Unknown'} • ${formatDate(blog.date)} • /blog/${blog.slug || ''}</p>
      `;

      const actions = document.createElement('div');
      actions.className = 'blog-actions';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.innerText = 'Edit';
      editBtn.onclick = () => editBlog(blog.id);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.innerText = 'Delete';
      delBtn.onclick = () => deleteBlog(blog.id);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(actions);
      listContainer.appendChild(item);
    });

  } catch (error) {
    console.error("Error loading blogs:", error);
    showToast("Failed to load blogs", true);
  }
}

// ---------- Image Upload ----------
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const storageRef = storage.ref(`blog_images/${Date.now()}_${file.name}`);
  
  showToast("Uploading image...");
  
  try {
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    document.getElementById('blog-image-url').value = downloadURL;
    
    const previewWrapper = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    previewImg.src = downloadURL;
    previewWrapper.style.display = 'block';
    
    showToast("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
    showToast("Failed to upload image", true);
  }
}

// ---------- Save Blog ----------
async function saveBlog() {
  const id = document.getElementById('blog-id').value;
  const title = document.getElementById('blog-title').value;
  const slug = document.getElementById('blog-slug').value;
  const author = document.getElementById('blog-author').value;
  const date = document.getElementById('blog-date').value;
  const excerpt = document.getElementById('blog-excerpt').value;
  const featured_image = document.getElementById('blog-image-url').value;
  
  // SEO
  const meta_title = document.getElementById('seo-title').value;
  const meta_description = document.getElementById('seo-description').value;
  const keywords = document.getElementById('seo-keywords').value;

  // Quill Content
  const content = quill.root.innerHTML;

  if (!title || !slug) {
    showToast("Title and Slug are required", true);
    return;
  }

  const blogData = {
    title,
    slug,
    author,
    date: date || new Date().toISOString().split('T')[0],
    excerpt,
    featured_image,
    content,
    seo: {
      meta_title,
      meta_description,
      keywords
    },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  const btn = document.getElementById('btn-save');
  btn.disabled = true;
  btn.innerText = "Saving...";

  try {
    if (id) {
      await db.collection("blogs").doc(id).update(blogData);
      showToast("Blog updated successfully!");
    } else {
      blogData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("blogs").add(blogData);
      showToast("Blog created successfully!");
    }
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = "Save Blog";
      showList();
    }, 1000);
  } catch (error) {
    console.error("Error saving blog:", error);
    showToast("Error saving blog", true);
    btn.disabled = false;
    btn.innerText = "Save Blog";
  }
}

// ---------- Edit Blog ----------
function editBlog(id) {
  const blog = currentBlogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-form').classList.remove('hidden');
  document.getElementById('form-title').innerText = "Edit Blog";

  document.getElementById('blog-id').value = blog.id;
  document.getElementById('blog-title').value = blog.title || '';
  document.getElementById('blog-slug').value = blog.slug || '';
  document.getElementById('blog-author').value = blog.author || '';
  document.getElementById('blog-date').value = blog.date || '';
  document.getElementById('blog-excerpt').value = blog.excerpt || '';
  
  // Image
  const previewWrapper = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  document.getElementById('blog-image-url').value = blog.featured_image || '';
  if (blog.featured_image) {
    previewImg.src = blog.featured_image;
    previewWrapper.style.display = 'block';
  } else {
    previewWrapper.style.display = 'none';
  }

  // SEO
  document.getElementById('seo-title').value = blog.seo?.meta_title || '';
  document.getElementById('seo-description').value = blog.seo?.meta_description || '';
  document.getElementById('seo-keywords').value = blog.seo?.keywords || '';

  // Quill
  quill.root.innerHTML = blog.content || '';
}

// ---------- Delete Blog ----------
async function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return;

  try {
    await db.collection("blogs").doc(id).delete();
    showToast("Blog deleted successfully");
    loadBlogs();
  } catch (error) {
    console.error("Error deleting blog:", error);
    showToast("Failed to delete blog", true);
  }
}

// ---------- Reset Form ----------
function resetForm() {
  document.getElementById('blog-id').value = '';
  document.getElementById('blog-title').value = '';
  document.getElementById('blog-slug').value = '';
  document.getElementById('blog-author').value = '';
  document.getElementById('blog-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('blog-excerpt').value = '';
  document.getElementById('blog-image').value = '';
  document.getElementById('blog-image-url').value = '';
  
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('preview-img').src = '';

  document.getElementById('seo-title').value = '';
  document.getElementById('seo-description').value = '';
  document.getElementById('seo-keywords').value = '';

  if (quill) quill.root.innerHTML = '';
}
