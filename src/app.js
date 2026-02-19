import React, { useState } from 'react';

// --- IMPORTS (Check spelling and small/capital letters here) ---
// Agar error aaye to check karen kya file ka naam inventoryview hai ya InventoryView
import InventoryView from './inventoryview'; 
import SalesModule from './salesmodule';
import Reports from './reports'; 

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
    fontSize: '14px',
    marginRight: '12px',
    transition: 'all 0.3s ease',
    boxShadow: active ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none',
    textTransform: 'uppercase'
  });

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Arial' }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ 
        padding: '15px 30px', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '22px', fontWeight: '900' }}>
          PREMIUM CERAMICS
        </h2>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button style={navBtnStyle(view === 'inventory')} onClick={() => setView('inventory')}>Inventory</button>
          <button style={navBtnStyle(view === 'sales')} onClick={() => setView('sales')}>Sales</button>
          <button style={navBtnStyle(view === 'reports')} onClick={() => setView('reports')}>Reports</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ padding: '30px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {view === 'inventory' && <InventoryView />}
          {view === 'sales' && <SalesModule />}
          {view === 'reports' && <Reports />}
        </div>
      </div>

      <style>{`
        body { margin: 0; background: #000; }
        button:hover { border-color: #D4AF37 !important; transform: scale(1.05); }
        button:active { transform: scale(0.95); }
      `}</style>

    </div>
  );
}

export default App;
