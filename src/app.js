import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Direct Imports for instant loading
import Login from './components/login';
import Dashboard from './components/dashboard';
import SalesModule from './components/salesmodule';
import InventoryView from './components/inventoryview';
import Attendance from './components/attendance';
import PurchaseModule from './components/purchase';
import SalesHistory from './components/saleshistory';
import UserManagement from './components/usermanagement';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ role: 'user' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Background fetch role - don't block the UI
        try {
          const userDoc = await getDoc(doc(db, "authorized_users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (e) {
          console.log("Working in cached mode.");
        }
      } else {
        setUser(null);
        setUserData({ role: 'user' });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="fast-loader">
      <div className="spinner"></div>
      <h3 style={{color:'#f59e0b', marginTop:'20px'}}>SYSTEM STARTING...</h3>
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className="app-main">
      <main className="screen-container">
        {activeTab === 'dashboard' && <Dashboard userData={userData} setActiveTab={setActiveTab} onLogout={() => auth.signOut()} />}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'inventory' && <InventoryView role={userData.role} />}
        {activeTab === 'purchase' && <PurchaseModule />}
        {activeTab === 'history' && <SalesHistory />}
        {activeTab === 'staff' && <Attendance />}
        {activeTab === 'users' && <UserManagement />}
      </main>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊</button>
        <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'active' : ''}>🛒</button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>📜</button>
        <button onClick={() => setActiveTab('purchase')} className={activeTab === 'purchase' ? 'active' : ''}>🚚</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>📦</button>
        {userData.role === 'super-admin' && (
          <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>⚙️</button>
        )}
      </nav>
    </div>
  );
}

export default App;
