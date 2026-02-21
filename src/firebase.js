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

// --- Ye line Offline Support enable karti hai ---
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
        console.log("The current browser does not support all of the features needed to enable persistence");
    }
});
