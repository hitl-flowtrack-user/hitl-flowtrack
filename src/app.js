import React, { useState } from 'react';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';
import DashboardSummary from './components/DashboardSummary';
import SalesModule from './components/SalesModule';
import SalesHistory from './components/SalesHistory';
import ExpenseTracker from './components/ExpenseTracker'; // Naya module import kiya

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
    { id: 'expenses', label: 'Expense Tracker', icon: '💸' }, // Naya Menu Item
  ];

  const styles = `
    .app-wrapper { display: flex; background: #000; min-height: 100vh; color: #fff; position: relative; }
    
    .sidebar { 
      width: 260px; background: #111; height: 100vh; position: fixed; left: ${isSidebarOpen ? '0' : '-260px'}; 
      transition: 0.3s; z-index: 1000; border-right: 1px solid #222; display: flex; flex-direction: column;
    }
    .sidebar-overlay {
      display: ${isSidebarOpen ? 'block' : 'none'}; position: fixed; top: 0; left: 0; 
      width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999;
    }
    
    .menu-btn { 
      position: fixed; top: 15px; left: 15px; z-index: 1001; background: #f59e0b; 
      border: none; border-radius: 5px; padding: 8px 12px; cursor: pointer; color: #000; font-weight: bold;
    }

    .nav-list { flex-grow: 1; padding-top: 60px; }
    .nav-item { 
      padding: 15px 25px; cursor: pointer; display: flex; align-items: center; gap: 15px;
      transition: 0.2s; font-weight: 500; color: #aaa;
    }
    .nav-item:hover { background: #1a1a1a; color: #f59e0b; }
    .nav-item.active { background: #1a1a1a; color: #f59e0b; border-left: 4px solid #f59e0b; }

    .logout-btn {
      padding: 20px 25px; border-top: 1px solid #222; color: #ef4444; cursor: pointer;
      display: flex; align-items: center; gap: 15px; font-weight: bold;
    }

    .main-content { 
      flex: 1; margin-left: 0; transition: 0.3s; width: 100%;
      padding: 20px; padding-top: 70px; 
    }

    .logo-area { padding: 20px 25px; border-bottom: 1px solid #222; }
    .logo-text { font-style: italic; font-weight: 900; color: #f59e0b; font-size: 20px; }
  `;

  return (
    <div className="app-wrapper">
      <style>{styles}</style>

      <button className="menu-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰ Menu'}
      </button>

      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>

      <nav className="sidebar">
        <div className="logo-area">
          <div className="logo-text">GEMINI IMS</div>
        </div>
        
        <div className="nav-list">
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
        </div>

        <div className="logout-btn" onClick={() => alert("Logging out...")}>
          <span>🚪</span> Logout
        </div>
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

        {activeTab === 'expenses' && <ExpenseTracker />}
      </main>
    </div>
  );
}

export default App;
