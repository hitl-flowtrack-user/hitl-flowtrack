import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlzaGO8koBDOYvCdSglZjlvT8_UZCA9XI", // Apni sahi API key yahan rakhen
  authDomain: "elite-vault-93de5.firebaseapp.com",
  projectId: "elite-vault-93de5", // Check karein agar ye HITL-FlowTrack ho gaya hai
  storageBucket: "elite-vault-93de5.firebasestorage.app",
  messagingSenderId: "745842974621",
  appId: "1:745842974621:web:f63f46dc7d0938f3bb9974"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
