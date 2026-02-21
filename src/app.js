import React, { useState } from 'react';
import './app.css';

// Sab lowercase paths as per your new setup
import dashboard from './components/dashboard';
import additem from './components/additem';
import inventoryview from './components/inventoryview';
import salesmodule from './components/salesmodule'; // Isay lowercase hi rehne den
import attendance from './components/attendance';
import navbar from './components/navbar';

// React components starting with Capital letters
const Dashboard = dashboard;
const AddItem = additem;
const InventoryView = inventoryview;
const SalesModule = salesmodule;
const Attendance = attendance;
const Navbar = navbar;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <main className="content-area">
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
        
        {/* Placeholders for missing files to avoid errors */}
        {activeTab === 'dayclosing' && <div style={{padding:'20px'}}>Day Closing Module</div>}
        {activeTab === 'flowview' && <div style={{padding:'20px'}}>Cash Flow Module</div>}
      </main>

      {/* Floating Home Button for Mobile View */}
      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{
            position: 'fixed', bottom: '20px', right: '20px', background: '#f59e0b',
            color: '#000', border: 'none', padding: '12px 25px', borderRadius: '50px',
            fontWeight: 'bold', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', zIndex: 1000
          }}
        >
          🏠 Home
        </button>
      )}
    </div>
  );
}

export default App;
