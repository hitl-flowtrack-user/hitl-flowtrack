import React, { useState, useEffect } from 'react';
import './app.css';

// Firebase Auth check
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";

// Tamam lowercase imports (Matching your GitHub files)
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

// Capitalized Components for React Rendering
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
  const [authLoading, setAuthLoading] = useState(true);

  // Check login status on start
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

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  // Loading screen during auth check
  if (authLoading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f59e0b' }}>
        <h3 style={{ letterSpacing: '2px' }}>LOADING MAHAVIR POS...</h3>
      </div>
    );
  }

  // Show Login Page if not logged in
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Top Navbar: Sirf tab dikhayenge jab hum dashboard se bahar hon */}
      {activeTab !== 'dashboard' && (
        <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
      )}

      <main className="content-area" style={{ paddingBottom: '90px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} />
        )}

        {activeTab === 'additem' && (
          <AddItem 
            existingItem={editData} 
            onComplete={() => { setEditData(null); setActiveTab('inventoryview'); }} 
          />
        )}

        {activeTab === 'inventoryview' && (
          <InventoryView onEdit={handleEdit} />
        )}

        {activeTab === 'salesmodule' && (
          <SalesModule />
        )}

        {activeTab === 'attendance' && (
          <Attendance />
        )}

        {activeTab === 'dayclosing' && (
          <DayClosing />
        )}

        {activeTab === 'flowview' && (
          <FlowView />
        )}

        {activeTab === 'reports' && (
          <Reports />
        )}
      </main>

      {/* Mobile-First Floating Home Button */}
      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={homeButtonStyle}
        >
          🏠 HOME MENU
        </button>
      )}
    </div>
  );
}

// --- Stylings ---
const homeButtonStyle = {
  position: 'fixed',
  bottom: '25px',
  right: '25px',
  background: '#f59e0b', // Gold color
  color: '#000',
  border: 'none',
  padding: '12px 25px',
  borderRadius: '50px',
  fontWeight: 'bold',
  fontSize: '14px',
  boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
  zIndex: 1000,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

export default App;
