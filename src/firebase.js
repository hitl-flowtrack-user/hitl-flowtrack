import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Environment variables se keys uthana (Security ke liye)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase ko initialize karna
const app = initializeApp(firebaseConfig);

// ERP ke mukhtalif hisson ke liye tools export karna
export const auth = getAuth(app);           // Logins ke liye
export const db = getFirestore(app);         // Data save karne ke liye
export const storage = getStorage(app);      // Files/Images ke liye

/**
 * HITL-FlowTrack Activity Logger
 * Ye function har kaam ka record rakhta hai (Audit Trail)
 */
export const logActivity = async (userId, companyId, actionType, moduleName, details) => {
  try {
    await addDoc(collection(db, "activity_logs"), {
      userId: userId,
      companyId: companyId,
      action: actionType, // Maslan: "Created Order", "Deleted Staff"
      module: moduleName, // Maslan: "Sales", "Inventory"
      details: details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Logging Error:", error);
  }
};