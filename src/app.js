import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Components (Hamesha Capital se start karen)
import Login from './components/login';
import Dashboard from './components/dashboard';
import SalesModule from './components/salesmodule';
import InventoryView from './components/inventoryview';
import Attendance from './components/attendance';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Authorized users check
          const userDoc = await getDoc(doc(db, "authorized_users", currentUser.uid));
          setUserData(userDoc.exists() ? userDoc.data() : { role: 'user' });
          setUser(currentUser);
        } catch (err) {
          console.error("Firestore Error:", err);
          setUserData({ role: 'user' });
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{background:'#000', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <h3 style={{color:'#f59e0b', letterSpacing:'3px'}}>HITL-FLOWTRACK</h3>
    </div>
  );

  // Requirements 1 & 2: No login, no access
  if (!user) return <Login />;

  return (
    <div className="app-main">
      <main className="screen-container" style={{ paddingBottom: '80px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard userData={userData} setActiveTab={setActiveTab} onLogout={() => auth.signOut()} />
        )}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'inventory' && <InventoryView role={userData?.role} />}
        {activeTab === 'staff' && <Attendance />}
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊</button>
        <button onClick={() => setActiveTab('sales')} className={activeTab === 'sales' ? 'active' : ''}>🛒</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>📦</button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'active' : ''}>👥</button>
      </nav>
    </div>
  );
}

export default App;
