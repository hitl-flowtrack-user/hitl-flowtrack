import React, { useState } from 'react';
import InventoryView from './InventoryView';
import SalesModule from './SalesModule';
import Reports from './Reports'; // Spelling check: Reports.js hi hona chahiye

function App() {
  const [view, setView] = useState('sales');

  const navBtnStyle = (active) => ({
    padding: '12px 24px',
    background: active ? '#D4AF37' : '#111',
    color: active ? '#000' : '#fff',
    border: '1px solid #333',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '10px'
  });

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Arial' }}>
      <nav style={{ padding: '20px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', display: 'flex' }}>
        <button style={navBtnStyle(view === 'inventory')} onClick={() => setView('inventory')}>INVENTORY</button>
        <button style={navBtnStyle(view === 'sales')} onClick={() => setView('sales')}>SALE TERMINAL</button>
        <button style={navBtnStyle(view === 'reports')} onClick={() => setView('reports')}>REPORTS</button>
      </nav>

      <div style={{ padding: '20px' }}>
        {view === 'inventory' && <InventoryView />}
        {view === 'sales' && <SalesModule />}
        {view === 'reports' && <Reports />}
      </div>
    </div>
  );
}

export default App;
