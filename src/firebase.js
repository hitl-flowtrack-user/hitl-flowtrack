import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⚠️ Sab se pehle Firebase Console se naye details copy karein
const firebaseConfig = {
  apiKey: "AIzaSy........................", // Yahan apni API Key bina kisi space ke likhen
  authDomain: "hitl-flowtrack.firebaseapp.com",
  projectId: "hitl-flowtrack",
  storageBucket: "hitl-flowtrack.appspot.com",
  messagingSenderId: "367341951508", 
  appId: "1:367341951508:web:abcdef123456" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const db = getFirestore(app);
export const auth = getAuth(app);
