// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVXNFBOSr3uMCm9H6rvg2TA6ZDXW2PHOE",
  authDomain: "hitl-flowtrack.firebaseapp.com",
  projectId: "hitl-flowtrack",
  storageBucket: "hitl-flowtrack.firebasestorage.app",
  messagingSenderId: "288372161222",
  appId: "1:288372161222:web:68d0bbbdb50d338d07f5c7",
  measurementId: "G-NDQR04LH70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);