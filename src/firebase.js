import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Console se fresh copy karke yahan paste karen
const firebaseConfig = {
  apiKey: "AIzaSy........................", // Sirf ye string check karen
  authDomain: "hitl-flowtrack.firebaseapp.com",
  projectId: "hitl-flowtrack",
  storageBucket: "hitl-flowtrack.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
