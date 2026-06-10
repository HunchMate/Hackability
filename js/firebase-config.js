// ===========================
// Firebase Configuration (Shared)
// ===========================
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
