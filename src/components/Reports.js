import React, { useState } from 'react';

// Components Import - Spelling aur Capitalization check kar len
import InventoryView from './InventoryView'; 
import SalesModule from './SalesModule';
import Reports from './Reports'; // <--- Check karein kya file ka naam Reports.js hi hai?

function App() {
  const [view, setView] = useState('sales');

  const navBtnStyle = (active) => ({
    padding: '12px 20px',
    background: active ? '#D4AF37' : '#111',
    color: active ? '#000' : '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '10px',
    fontSize: '14px'
  });

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      
      {/* NAVIGATION MENU */}
      <nav style={{ 
        padding: '15px 25px', 
        background: '#0a0a0a', 
        display: 'flex', 
        gap: '5px', 
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1000
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
        {/* Safe Rendering Logic */}
        {view === 'inventory' && <InventoryView />}
        {view === 'sales' && <SalesModule />}
        {view === 'reports' && <Reports />}
      </div>

      <style>{`
        button:hover { border-color: #D4AF37 !important; color: #D4AF37 !important; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

export default App;
