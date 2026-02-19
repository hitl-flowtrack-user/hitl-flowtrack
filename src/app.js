import React, { useState } from 'react';
// Components Import - Ensure these files exist in your 'src' folder
import InventoryView from './InventoryView';
import SalesModule from './SalesModule';
import Reports from './Reports'; 

function App() {
  // State to manage views
  const [view, setView] = useState('sales');

  // Navigation Button Styling (Maintaining your Premium Look)
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
    textTransform: 'uppercase',
    letterSpacing: '1px'
  });

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
    }}>
      
      {/* --- PREMIUM TOP NAVIGATION BAR --- */}
      <nav style={{ 
        padding: '15px 30px', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0,0,0,0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ 
            color: '#D4AF37', 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '900', 
            letterSpacing: '2px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            PREMIUM CERAMICS
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            style={navBtnStyle(view === 'inventory')} 
            onClick={() => setView('inventory')}>
            Inventory
          </button>
          
          <button 
            style={navBtnStyle(view === 'sales')} 
            onClick={() => setView('sales')}>
            Sales Terminal
          </button>

          <button 
            style={navBtnStyle(view === 'reports')} 
            onClick={() => setView('reports')}>
            Analytics & Reports
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#444' }}>
          v2.0.4 | <span style={{ color: '#D4AF37' }}>Online</span>
        </div>
      </nav>

      {/* --- MAIN PAGE CONTENT --- */}
      <div style={{ padding: '30px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Transition Wrapper */}
          <div className="view-container">
            {view === 'inventory' && <InventoryView />}
            {view === 'sales' && <SalesModule />}
            {view === 'reports' && <Reports />}
          </div>

        </div>
      </div>

      {/* Global CSS for Animations and Fixes */}
      <style>{`
        body { margin: 0; padding: 0; background: #000; }
        
        /* Smooth Fade In Animation */
        .view-container {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        button:hover {
          border-color: #D4AF37 !important;
          transform: scale(1.05);
        }

        button:active {
          transform: scale(0.95);
        }

        /* Custom Scrollbar for Premium Look */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
        }
      `}</style>

    </div>
  );
}

export default App;
