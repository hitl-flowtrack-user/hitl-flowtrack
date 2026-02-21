import React, { useState } from 'react';
import './app.css';

// Tamam imports ab lowercase hain jaisa aapne GitHub par kiya
import dashboard from './components/dashboard';
import additem from './components/additem';
import inventoryview from './components/inventoryview';
import salesmodule from './components/salesmodule'; // 's' and 'm' now lowercase
import attendance from './components/attendance';
import navbar from './components/navbar';

// React components ka pehla letter hamesha Capital hona chahiye (Code mein)
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
    <div className="app-container" style={{ background: '#000', minHeight: '100vh' }}>
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
        
        {/* Missing files placeholders to prevent build crash */}
        {activeTab === 'dayclosing' && <div style={{color:'#fff', padding:'20px'}}>Day Closing Coming Soon...</div>}
        {activeTab === 'flowview' && <div style={{color:'#fff', padding:'20px'}}>Cash Flow Coming Soon...</div>}
      </main>

      {/* Floating Home Button for Mobile View */}
      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={homeButtonStyle}
        >
          🏠 Home
        </button>
      )}
    </div>
  );
}

const homeButtonStyle = {
  position: 'fixed', bottom: '20px', right: '20px', background: '#f59e0b',
  color: '#000', border: 'none', padding: '12px 20px', borderRadius: '50px',
  fontWeight: 'bold', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', cursor: 'pointer', zIndex: 1000
};

export default App;
