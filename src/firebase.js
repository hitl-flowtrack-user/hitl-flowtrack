import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlzaGO8koBDOYvCdSglZjlvT8_UZCA9XI",
  authDomain: "hitl-flowtrack.firebaseapp.com",
  projectId: "hitl-flowtrack",
  storageBucket: "hitl-flowtrack.firebasestorage.app",
  messagingSenderId: "745842974621",
  appId: "1:745842974621:web:f63f46dc7d0938f3bb9974"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable Offline Persistence for Speed
enableIndexedDbPersistence(db).catch((err) => {
    console.log("Persistence Error: ", err.code);
});
