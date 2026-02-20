import React, { useState } from 'react';
import AddItem from './additem';
import InventoryView from './inventoryview';
import DashboardSummary from './DashboardSummary';
import SalesModule from './SalesModule';
import SalesHistory from './SalesHistory';
import Reports from './Reports'; 
import ExpenseTracker from './ExpenseTracker';

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
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'additem', label: 'Add Stock', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📋' },
    { id: 'sales', label: 'New Sale', icon: '🛒' },
    { id: 'history', label: 'Invoices', icon: '🧾' },
    { id: 'reports', label: 'Analytics', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
  ];

  const styles = `
    .app-container { min-height: 100vh; background: #f4f7fe; color: #333; font-family: 'Inter', sans-serif; }
    .header { background: #1e3a8a; color: white; padding: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 20px; max-width: 600px; margin: 0 auto; }
    .nav-card { background: white; padding: 25px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; border: 1px solid #e2e8f0; }
    .nav-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #3b82f6; }
    .nav-card i { fontSize: 30px; }
    .active-view { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .back-btn { background: #3b82f6; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
  `;

  return (
    <div className="app-container">
      <style>{styles}</style>
      <div className="header">
        <h2 style={{margin:0}}>Mahavir Traders</h2>
        <div style={{fontSize:'12px'}}>Online POS v3.0</div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="nav-grid">
          {menuItems.filter(i => i.id !== 'dashboard').map(item => (
            <div key={item.id} className="nav-card" onClick={() => setActiveTab(item.id)}>
              <span style={{fontSize: '32px'}}>{item.icon}</span>
              <span style={{fontWeight:'bold', color: '#1e3a8a'}}>{item.label}</span>
            </div>
          ))}
          <DashboardSummary />
        </div>
      ) : (
        <div className="active-view">
          <button className="back-btn" onClick={() => setActiveTab('dashboard')}>← Main Menu</button>
          {activeTab === 'additem' && <AddItem existingItem={editData} onComplete={() => { setEditData(null); setActiveTab('inventory'); }} />}
          {activeTab === 'inventory' && <InventoryView onEdit={handleEdit} />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'history' && <SalesHistory />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'expenses' && <ExpenseTracker />}
        </div>
      )}
    </div>
  );
}

export default App;
