import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsS...", // Aapki asli API Key yahan hogi
  authDomain: "elite-vault-93de5.firebaseapp.com",
  projectId: "elite-vault-93de5",
  storageBucket: "elite-vault-93de5.firebasestorage.app",
  messagingSenderId: "1056525143360",
  appId: "1:1056525143360:web:8078864779667793de5da7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);