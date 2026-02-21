import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Lazy loading components taake shuru mein load kam ho
const Login = lazy(() => import('./components/login'));
const Dashboard = lazy(() => import('./components/dashboard'));
const SalesModule = lazy(() => import('./components/salesmodule'));
const InventoryView = lazy(() => import('./components/inventoryview'));
const Attendance = lazy(() => import('./components/attendance'));
const PurchaseModule = lazy(() => import('./components/purchase'));

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_role');
    return saved ? { role: saved } : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Agar role pehle se nahi hai to hi fetch karein
        if (!userData) {
          const userDoc = await getDoc(doc(db, "authorized_users", currentUser.uid));
          const data = userDoc.exists() ? userDoc.data() : { role: 'user' };
          setUserData(data);
          localStorage.setItem('user_role', data.role);
        }
      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('user_role');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userData]);

  if (loading) return (
    <div className="fast-loader">
      <div className="spinner"></div>
      <h3 style={{color:'#f59e0b', marginTop:'20px'}}>HITL-FLOWTRACK</h3>
    </div>
  );

  if (!user) return (
    <Suspense fallback={<div>Loading Login...</div>}>
      <Login />
    </Suspense>
  );

  return (
    <div className="app-main">
      <Suspense fallback={<div className="tab-loader">Opening {activeTab}...</div>}>
        <main className="screen-container">
          {activeTab === 'dashboard' && <Dashboard userData={userData} setActiveTab={setActiveTab} onLogout={() => auth.signOut()} />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'inventory' && <InventoryView role={userData?.role} />}
          {activeTab === 'staff' && <Attendance />}
          {activeTab === 'purchase' && <PurchaseModule />}
        </main>
      </Suspense>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊</button>
        <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'active' : ''}>🛒</button>
        <button onClick={() => setActiveTab('purchase')} className={activeTab === 'purchase' ? 'active' : ''}>🚚</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>📦</button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'active' : ''}>👥</button>
      </nav>
    </div>
  );
}

export default App;
