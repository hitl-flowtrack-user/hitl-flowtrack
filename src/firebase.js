import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⚠️ YAHAN APNI ASAL DETAILS FIREBASE CONSOLE SE COPY KARKE PASTE KAREN
const firebaseConfig = {
  apiKey: "AIzaSyA...", // Ye puri sahi honi chahiye
  authDomain: "hitl-flowtrack.firebaseapp.com",
  projectId: "hitl-flowtrack",
  storageBucket: "hitl-flowtrack.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const db = getFirestore(app);
export const auth = getAuth(app);
