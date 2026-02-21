import React, { useState, useEffect } from 'react';
import './app.css';

// Firebase Services
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth";

// Components Imports
import login from './components/login';
import dashboard from './components/dashboard';
import additem from './components/additem';
import inventoryview from './components/inventoryview';
import salesmodule from './components/salesmodule';
import attendance from './components/attendance';
import dayclosing from './components/dayclosing';
import flowview from './components/flowview';
import navbar from './components/navbar';

const Login = login;
const Dashboard = dashboard;
const AddItem = additem;
const InventoryView = inventoryview;
const SalesModule = salesmodule;
const Attendance = attendance;
const DayClosing = dayclosing;
const FlowView = flowview;
const Navbar = navbar;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  if (authLoading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f59e0b' }}>
        <h3 style={{ letterSpacing: '2px' }}>HITL-FLOWTRACK...</h3>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      
      {activeTab !== 'dashboard' && <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />}

      <main className="content-area">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} onLogout={handleLogout} />
        )}
        
        {activeTab === 'additem' && (
          <AddItem 
            existingItem={editData} 
            onComplete={() => { setEditData(null); setActiveTab('inventoryview'); }} 
          />
        )}
        
        {activeTab === 'inventoryview' && <InventoryView onEdit={handleEdit} />}
        {activeTab === 'salesmodule' && <SalesModule />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'dayclosing' && <DayClosing />}
        {activeTab === 'flowview' && <FlowView />}
      </main>

      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={homeButtonStyle}
        >
          🏠 Home Menu
        </button>
      )}
    </div>
  );
}

const homeButtonStyle = {
  position: 'fixed', bottom: '25px', right: '25px', background: '#f59e0b',
  color: '#000', border: 'none', padding: '12px 25px', borderRadius: '50px',
  fontWeight: 'bold', boxShadow: '0 5px 15px rgba(245, 158, 11, 0.4)', zIndex: 1000
};

export default App;
