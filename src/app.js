import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Lazy loading with immediate fallback
const Login = lazy(() => import('./components/login'));
const Dashboard = lazy(() => import('./components/dashboard'));
const SalesModule = lazy(() => import('./components/salesmodule'));
const InventoryView = lazy(() => import('./components/inventoryview'));
const Attendance = lazy(() => import('./components/attendance'));
const PurchaseModule = lazy(() => import('./components/purchase'));

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'user' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Role fetch karein par software ko rokain nahi
          const userDoc = await getDoc(doc(db, "authorized_users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (e) {
          console.log("Role fetch error, using default.");
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return (
    <div className="fast-loader">
      <div className="spinner"></div>
      <h3 style={{color:'#f59e0b', marginTop:'20px'}}>ORDERFLOW LOADING...</h3>
    </div>
  );

  if (!user) return <Suspense fallback={null}><Login /></Suspense>;

  return (
    <div className="app-main">
      <Suspense fallback={<div className="tab-loader">Loading Page...</div>}>
        <main className="screen-container" style={{ paddingBottom: '90px' }}>
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
