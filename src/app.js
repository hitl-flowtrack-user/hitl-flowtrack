import React, { useState, useEffect } from 'react';
import './app.css';

// Firebase Auth check karne ke liye (Optional but recommended)
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";

// Tamam Files Lowercase Imports (As per your GitHub structure)
import login from './components/login';
import dashboard from './components/dashboard';
import additem from './components/additem';
import inventoryview from './components/inventoryview';
import salesmodule from './components/salesmodule';
import attendance from './components/attendance';
import dayclosing from './components/dayclosing';
import flowview from './components/flowview';
import reports from './components/reports';
import navbar from './components/navbar';

// React Components (Capitalized for JSX)
const Login = login;
const Dashboard = dashboard;
const AddItem = additem;
const InventoryView = inventoryview;
const SalesModule = salesmodule;
const Attendance = attendance;
const DayClosing = dayclosing;
const FlowView = flowview;
const Reports = reports;
const Navbar = navbar;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Listener: Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  // 1. Loading Screen
  if (loading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f59e0b' }}>
        <h2>MAHAVIR TRADERS...</h2>
      </div>
    );
  }

  // 2. Login Screen (If not logged in)
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // 3. Main App (After Login)
  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      
      {/* Navbar sirf Dashboard ke ilawa tabs par dikhayen (Ya jaisa aap chahen) */}
      {activeTab !== 'dashboard' && (
        <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
      )}

      <main className="content-area" style={{ paddingBottom: '80px' }}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        
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
        
        {activeTab === 'reports' && <Reports />}
      </main>

      {/* Floating Back-to-Home Button for Mobile */}
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

// --- Floating Button Style ---
const homeButtonStyle = {
  position: 'fixed',
  bottom: '25px',
  right: '25px',
  background: '#f59e0b',
  color: '#000',
  border: 'none',
  padding: '12px 20px',
  borderRadius: '50px',
  fontWeight: 'bold',
  fontSize: '14px',
  boxShadow: '0 5px 20px rgba(245, 158, 11, 0.4)',
  cursor: 'pointer',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

export default App;
