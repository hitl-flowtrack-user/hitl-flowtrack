import React, { useState } from 'react';

// --- FIXED IMPORTS: Exact naming matching for Vercel ---
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';
import DashboardSummary from './components/DashboardSummary';
import SalesModule from './components/SalesModule'; // S aur M capital rakha hai jaisa aapke working code mein tha
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports'; 
import ExpenseTracker from './components/ExpenseTracker';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'additem', label: 'Add New Item', icon: '➕' },
    { id: 'inventory', label: 'Stock View', icon: '📦' },
    { id: 'sales', label: 'New Sale (POS)', icon: '💰' },
    { id: 'history', label: 'Sales History', icon: '📜' },
    { id: 'reports', label: 'Reports & Profit', icon: '📈' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
  ];

  const styles = `
    .app-wrapper { display: flex; background: #000; min-height: 100vh; color: #fff; position: relative; }
    .sidebar { 
      width: 260px; background: #111; height: 100vh; position: fixed; 
      left: ${isSidebarOpen ? '0' : '-260px'}; 
      transition: 0.3s; z-index: 1000; border-right: 1px solid #222; padding-top: 60px;
    }
    .sidebar-overlay {
      display: ${isSidebarOpen ? 'block' : 'none'}; position: fixed; top: 0; left: 0; 
      width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;
    }
    .menu-btn { 
      position: fixed; top: 15px; left: 15px; z-index: 1001; background: #D4AF37; 
      border: none; border-radius: 5px; padding: 8px 12px; cursor: pointer; color: #000; font-weight: bold;
    }
    .nav-item { 
      padding: 15px 25px; cursor: pointer; display: flex; align-items: center; gap: 15px;
      transition: 0.2s; font-weight: 500; color: #aaa;
    }
    .nav-item:hover { background: #1a1a1a; color: #D4AF37; }
    .nav-item.active { background: #1a1a1a; color: #D4AF37; border-left: 4px solid #D4AF37; }
    .main-content { flex: 1; margin-left: 0; transition: 0.3s; width: 100%; padding: 20px; padding-top: 70px; }
    .logo-area { padding: 0 25px 30px; border-bottom: 1px solid #222; margin-bottom: 20px; }
    .logo-text { font-style: italic; font-weight: 900; color: #D4AF37; font-size: 20px; }
  `;

  return (
    <div className="app-wrapper">
      <style>{styles}</style>

      <button className="menu-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕ Close' : '☰ Menu'}
      </button>

      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>

      <nav className="sidebar">
        <div className="logo-area">
          <div className="logo-text">PREMIUM IMS</div>
          <small style={{color:'#444'}}>v2.1 Stable</small>
        </div>
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
              if(item.id !== 'additem') setEditData(null);
            }}
          >
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardSummary />}
        
        {activeTab === 'additem' && (
          <AddItem 
            existingItem={editData} 
            onComplete={() => {
              setEditData(null);
              setActiveTab('inventory');
            }} 
          />
        )}
        
        {activeTab === 'inventory' && (
          <InventoryView onEdit={handleEdit} />
        )}

        {activeTab === 'sales' && <SalesModule />}
        
        {activeTab === 'history' && <SalesHistory />}

        {activeTab === 'reports' && <Reports />}

        {activeTab === 'expenses' && <ExpenseTracker />}
      </main>
    </div>
  );
}

export default App;
