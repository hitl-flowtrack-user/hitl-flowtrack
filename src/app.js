import React, { useState, useEffect } from 'react';
import './app.css';

// Firebase Services
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth";

// Components Imports (Lowercase as per your setup)
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
  // Default state false honi chahiye taake login page dikhe
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Ye function check karta hai ke user waqai login hai ya nahi
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User found:", user.email);
        setIsLoggedIn(true);
      } else {
        console.log("No user logged in.");
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Logout function (Aap dashboard mein use kar sakte hain)
  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  // 1. Loading screen
  if (authLoading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f59e0b' }}>
        <h3 style={{ letterSpacing: '2px' }}>HITL-FLOWTRACK...</h3>
      </div>
    );
  }

  // 2. STRICT LOGIN CHECK: Agar isLoggedIn false hai to sirf Login dikhaye
  if (isLoggedIn === false) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // 3. Main Dashboard (Sirf login hone par nazar ayega)
  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      
      {activeTab !== 'dashboard' && <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />}

      <main className="content-area" style={{ paddingBottom: '90px' }}>
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

      {/* Logout button (Temporary for testing) */}
      <button 
        onClick={handleLogout}
        style={{ position: 'fixed', top: '10px', right: '10px', background: 'red', color: 'white', border: '1px', padding: '5px 10px', borderRadius: '5px', fontSize: '20px', zIndex: 2000 }}
      >
        Logout
      </button>

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
