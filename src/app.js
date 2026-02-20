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
  const [editData, setEditData] = useState(null);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'sales', label: 'POS Sale', icon: '🛒' },
    { id: 'inventory', label: 'Stock', icon: '📋' },
    { id: 'additem', label: 'Add Item', icon: '📦' },
    { id: 'history', label: 'Invoices', icon: '🧾' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fe', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#1e3a8a', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Mahavir Traders</h2>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>POS System v3.1</div>
      </header>

      {activeTab === 'dashboard' ? (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          <DashboardSummary />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {navItems.filter(i => i.id !== 'dashboard').map(item => (
              <div key={item.id} onClick={() => setActiveTab(item.id)} style={cardStyle}>
                <span style={{ fontSize: '30px' }}>{item.icon}</span>
                <span style={{ fontWeight: 'bold', color: '#1e3a8a', marginTop: '10px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
            ← Back to Home
          </button>
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

const cardStyle = { background: 'white', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: '0.3s' };

export default App;
