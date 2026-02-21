import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

const Dashboard = lazy(() => import('./components/dashboard'));
const SalesModule = lazy(() => import('./components/salesmodule'));
const InventoryView = lazy(() => import('./components/inventoryview'));
const Attendance = lazy(() => import('./components/attendance'));
const PurchaseModule = lazy(() => import('./components/purchase'));
const SalesHistory = lazy(() => import('./components/saleshistory'));
const Login = lazy(() => import('./components/login'));

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'user' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/Offline status monitor
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          // Timeout ke saath role fetch karna taake infinite loading na ho
          const docRef = doc(db, "authorized_users", u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.log("Working in offline mode or error fetching role.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="fast-loader"><div className="spinner"></div><p style={{marginTop: '10px', fontSize: '12px'}}>Connecting...</p></div>;
  
  if (!user) return <Suspense fallback={null}><Login /></Suspense>;

  return (
    <div className="app-main">
      {!isOnline && (
        <div style={{ background: '#ef4444', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '5px' }}>
          ⚠️ You are offline. Data will sync when connection returns.
        </div>
      )}

      <Suspense fallback={<div className="tab-loader">⚡ Loading Page...</div>}>
        <div className="screen-container">
          {activeTab === 'dashboard' && <Dashboard userData={userData} setActiveTab={setActiveTab} onLogout={() => auth.signOut()} />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'inventory' && <InventoryView role={userData.role} />}
          {activeTab === 'purchase' && <PurchaseModule />}
          {activeTab === 'history' && <SalesHistory />}
          {activeTab === 'staff' && <Attendance />}
        </div>
      </Suspense>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊</button>
        <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'active' : ''}>🛒</button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>📜</button>
        <button onClick={() => setActiveTab('purchase')} className={activeTab === 'purchase' ? 'active' : ''}>🚚</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>📦</button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'active' : ''}>👥</button>
      </nav>
    </div>
  );
}

export default App;
