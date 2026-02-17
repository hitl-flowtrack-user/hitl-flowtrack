import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your exact web app's Firebase configuration from console
const firebaseConfig = {
  apiKey: "AIzaSyDlzaGO8koBDOYvCdSglZjlvT8_UZCA9XI",
  authDomain: "elite-vault-93de5.firebaseapp.com",
  projectId: "elite-vault-93de5",
  storageBucket: "elite-vault-93de5.firebasestorage.app",
  messagingSenderId: "745842974621",
  appId: "1:745842974621:web:f63f46dc7d0938f3bb9974"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app);