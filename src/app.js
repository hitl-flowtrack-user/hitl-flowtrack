import React, { useState } from 'react';

// --- FIXED IMPORTS (Matching your file names exactly) ---
import InventoryView from './inventoryview'; // Small letters as per your details
import SalesModule from './salesmodule';     // Small letters as per your details
import Reports from './Reports';             // Capital as per your details
import ExpenseTracker from './ExpenseTracker'; // Capital as per your details
import DashboardSummary from './Dashboard Summary'; // Capital as per your details
import SalesHistory from './SalesHistory';   // Capital as per your details

function App() {
  // State to manage views
  const [view, setView] = useState('sales');

  // Navigation Button Styling
  const navBtnStyle = (active) => ({
    padding: '12px 20px',
    background: active ? '#D4AF37' : '#111',
    color: active ? '#000' : '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    marginRight: '8px',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  });

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: "'Segoe UI', Roboto, sans-serif" 
    }}>
      
      {/* --- PREMIUM NAVIGATION --- */}
      <nav style={{ 
        padding: '15px 25px', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '2px' }}>
          PREMIUM CERAMICS
        </h2>

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button style={navBtnStyle(view === 'inventory')} onClick={() => setView('inventory')}>
            Inventory
          </button>
          <button style={navBtnStyle(view === 'sales')} onClick={() => setView('sales')}>
            Sales Terminal
          </button>
          <button style={navBtnStyle(view === 'reports')} onClick={() => setView('reports')}>
            Reports
          </button>
          <button style={navBtnStyle(view === 'expenses')} onClick={() => setView('expenses')}>
            Expenses
          </button>
          <button style={navBtnStyle(view === 'history')} onClick={() => setView('history')}>
            History
          </button>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <div style={{ padding: '25px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
          <div className="view-container">
            {/* Dashboard Summary hamesha top par dikhayen agar aap chahte hain */}
            {view === 'sales' && <DashboardSummary />}

            {/* View switching logic */}
            {view === 'inventory' && <InventoryView />}
            {view === 'sales' && <SalesModule />}
            {view === 'reports' && <Reports />}
            {view === 'expenses' && <ExpenseTracker />}
            {view === 'history' && <SalesHistory />}
          </div>

        </div>
      </div>

      {/* Global CSS for Styling & Animations */}
      <style>{`
        body { margin: 0; padding: 0; background: #000; overflow-x: hidden; }
        
        .view-container {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        button:hover {
          background: #D4AF37 !important;
          color: #000 !important;
          transform: translateY(-2px);
        }

        ::-webkit-scrollbar {
          width: 6px;
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
