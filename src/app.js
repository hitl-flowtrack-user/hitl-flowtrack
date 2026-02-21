import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Lazy loading for extreme speed
const Login = lazy(() => import('./components/login'));
const Dashboard = lazy(() => import('./components/dashboard'));
const SalesModule = lazy(() => import('./components/salesmodule'));
const InventoryView = lazy(() => import('./components/inventoryview'));
const Attendance = lazy(() => import('./components/attendance'));
const PurchaseModule = lazy(() => import('./components/purchase'));
const SalesHistory = lazy(() => import('./components/saleshistory')); // New Module

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'user' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Sirf 1 bar role fetch karna hai
        const roleSnap = await getDoc(doc(db, "authorized_users", currentUser.uid));
        if (roleSnap.exists()) setUserData(roleSnap.data());
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="fast-loader"><div className="spinner"></div></div>;
  if (!user) return <Suspense fallback={null}><Login /></Suspense>;

  return (
    <div className="app-main">
      <Suspense fallback={<div className="tab-loader">⚡ Loading...</div>}>
        <main className="screen-container">
          {activeTab === 'dashboard' && <Dashboard userData={userData} setActiveTab={setActiveTab} />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'inventory' && <InventoryView role={userData?.role} />}
          {activeTab === 'purchase' && <PurchaseModule />}
          {activeTab === 'history' && <SalesHistory />}
          {activeTab === 'staff' && <Attendance />}
        </main>
      </Suspense>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊</button>
        <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'active' : ''}>🛒</button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>📜</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>📦</button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'active' : ''}>👥</button>
      </nav>
    </div>
  );
}

export default App;
