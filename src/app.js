import React, { useState } from 'react';

// Files Import - Inke names aur spelling bilkul sahi honi chahiye
import InventoryView from './InventoryView';
import SalesModule from './SalesModule';
import Reports from './Reports';

function App() {
  // Default view hum 'sales' rakhte hain
  const [view, setView] = useState('sales');

  // Navigation Buttons ka Style
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
    boxShadow: active ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none'
  });

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav style={{ 
        padding: '15px 25px', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ marginRight: '30px' }}>
          <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '20px', letterSpacing: '1px' }}>
            PREMIUM CERAMICS
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
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
        </div>
      </nav>

      {/* --- MAIN PAGE CONTENT --- */}
      <div style={{ padding: '25px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Conditional Rendering - Based on selection */}
          {view === 'inventory' && (
            <section animation-fade-in="true">
              <InventoryView />
            </section>
          )}

          {view === 'sales' && (
            <section animation-fade-in="true">
              <SalesModule />
            </section>
          )}

          {view === 'reports' && (
            <section animation-fade-in="true">
              <Reports />
            </section>
          )}

        </div>
      </div>

      {/* Global CSS for Smoothness */}
      <style>{`
        body { margin: 0; padding: 0; overflow-x: hidden; }
        button:hover {
          border-color: #D4AF37 !important;
          transform: translateY(-2px);
        }
        button:active {
          transform: translateY(0);
        }
        /* Fade in animation */
        section {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

export default App;
