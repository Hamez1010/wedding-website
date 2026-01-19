// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8G65T-ZQ6I3HGaJYKd_VGLzZsdA0DYwE",
  authDomain: "weddingwebsite-6950e.firebaseapp.com",
  projectId: "weddingwebsite-6950e",
  storageBucket: "weddingwebsite-6950e.firebasestorage.app",
  messagingSenderId: "129681301943",
  appId: "1:129681301943:web:5d8ff0e76df4900ecfc832",
  measurementId: "G-LQ28J47V8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
