import React, { useState } from 'react';
import InventoryView from './InventoryView';
import SalesModule from './SalesModule';
import Reports from './Reports'; // Reports import kiya

function App() {
  // Shuruat mein 'dashboard' ya 'sales' jo bhi aap rakhna chahen
  const [view, setView] = useState('sales');

  const navBtnStyle = (active) => ({
    padding: '12px 20px',
    background: active ? '#D4AF37' : '#111',
    color: active ? '#000' : '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  });

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ 
        padding: '15px 25px', 
        background: '#0a0a0a', 
        display: 'flex', 
        gap: '10px', 
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button 
          style={navBtnStyle(view === 'inventory')} 
          onClick={() => setView('inventory')}>
          INVENTORY
        </button>
        
        <button 
          style={navBtnStyle(view === 'sales')} 
          onClick={() => setView('sales')}>
          SALE TERMINAL
        </button>

        <button 
          style={navBtnStyle(view === 'reports')} 
          onClick={() => setView('reports')}>
          REPORTS & PROFIT
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div style={{ padding: '20px' }}>
        {view === 'inventory' && <InventoryView />}
        {view === 'sales' && <SalesModule />}
        {view === 'reports' && <Reports />}
      </div>

    </div>
  );
}

export default App;
