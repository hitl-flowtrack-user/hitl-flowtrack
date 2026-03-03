import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        /* ================= USER DOCUMENT NOT EXISTS ================= */
        if (!userSnap.exists()) {
          const defaultUser = {
            email: firebaseUser.email,
            role: "Admin",
            companyId: firebaseUser.uid, // default company = user uid
            createdAt: serverTimestamp()
          };

          await setDoc(userRef, defaultUser);

          setUser({
            uid: firebaseUser.uid,
            ...defaultUser
          });

        } else {
          const data = userSnap.data();

          // If companyId missing → auto fix
          if (!data.companyId) {
            await setDoc(userRef, {
              ...data,
              companyId: firebaseUser.uid
            }, { merge: true });

            data.companyId = firebaseUser.uid;
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...data
          });
        }

      } catch (error) {
        console.error("Auth Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}