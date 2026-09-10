import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyDogSyKdXc_qMr_W7FX1TCIy1FSx7-lTNM",
    authDomain: "recipe-book-1b3b6.firebaseapp.com",
    projectId: "recipe-book-1b3b6",
    storageBucket: "recipe-book-1b3b6.firebasestorage.app",
    messagingSenderId: "132613965630",
    appId: "1:132613965630:web:1639089f12a704e22b0e6f"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };