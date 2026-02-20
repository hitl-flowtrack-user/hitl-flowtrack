import React, { useState } from 'react';
import './app.css';

// Components Imports (Files inside components folder)
import Dashboard from './components/dashboard';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';
import SalesModule from './components/SalesModule';
import Attendance from './components/attendance';
import DayClosing from './components/dayclosing';
import FlowView from './components/flowView';
import Navbar from './components/navbar';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);

  const handleEdit = (item) => {
    setEditData(item);
    setActiveTab('additem');
  };

  return (
    <div className="app-container">
      <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
      
      <main className="content-area" style={{ padding: '20px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'additem' && (
          <AddItem 
            existingItem={editData} 
            onComplete={() => { setEditData(null); setActiveTab('inventory'); }} 
          />
        )}
        {activeTab === 'inventory' && <InventoryView onEdit={handleEdit} />}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'flow' && <FlowView />}
        {activeTab === 'closing' && <DayClosing />}
      </main>
    </div>
  );
}

export default App;
