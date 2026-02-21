import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './app.css';

// Modules
import Login from './components/login';
import Dashboard from './components/dashboard';
import SalesTerminal from './components/salesmodule';
import InventoryHub from './components/inventoryview';
import StaffManager from './components/attendance';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "authorized_users", currentUser.uid));
        setUserData(userDoc.exists() ? userDoc.data() : { role: 'user' });
        setUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loader"><span>ORDERFLOW</span></div>;

  // Condition 1 & 2: No Login, No Work
  if (!user) return <Login />;

  return (
    <div className="app-main">
      <main className="screen-container">
        {activeTab === 'dashboard' && <Dashboard userData={userData} setActiveTab={setActiveTab} />}
        {activeTab === 'sales' && <SalesTerminal />}
        {activeTab === 'inventory' && <InventoryHub role={userData?.role} />}
        {activeTab === 'staff' && <StaffManager />}
      </main>

      {/* Floating Bottom Navigation */}
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
