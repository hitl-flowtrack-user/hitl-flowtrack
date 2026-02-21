import React, { useState } from 'react';
import './app.css';

// Exact paths matching your GitHub Image #4
import Dashboard from './components/dashboard';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';
import SalesModule from './components/salesmodule'; 
import Attendance from './components/attendance';
import Navbar from './components/navbar';

// Note: Agar dayclosing aur flowView files abhi nahi banayi, 
// to niche humne unhe placeholder se handle kiya hai taake error na aye.

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  return (
    <div className="app-container" style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hum Navbar ko sirf tab dikhayenge jab screen dashboard na ho, ya dashboard ke andar hi rakhenge */}
      
      <main className="content-area">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'additem' && (
          <AddItem 
            existingItem={editData} 
            onComplete={() => { setEditData(null); setActiveTab('inventory'); }} 
          />
        )}
        {activeTab === 'inventory' && <InventoryView onEdit={handleEdit} />}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'attendance' && <Attendance />}
        
        {/* Temporarily handling missing files to prevent Vercel error */}
        {activeTab === 'closing' && <div style={{color:'#fff', padding:'20px'}}>Day Closing Module Coming Soon...</div>}
        {activeTab === 'flow' && <div style={{color:'#fff', padding:'20px'}}>Cash Flow Module Coming Soon...</div>}
      </main>

      {/* Mobile Bottom Navbar (Optional but good for UX) */}
      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={backButtonStyle}
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}

const backButtonStyle = {
  position: 'fixed', bottom: '20px', right: '20px', background: '#f59e0b',
  color: '#000', border: 'none', padding: '10px 20px', borderRadius: '50px',
  fontWeight: 'bold', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', cursor: 'pointer'
};

export default App;
