import React from 'react';
import { auth } from '../firebase';

const Dashboard = ({ userData, setActiveTab, onLogout }) => {
  // Demo Data (Inshallah next step mein hum ise live Firestore se connect karenge)
  const reports = [
    { label: 'Daily Sale', value: 'Rs. 0', color: '#10b981' },
    { label: 'Daily Purchase', value: 'Rs. 0', color: '#ef4444' },
    { label: 'Daily Profit', value: 'Rs. 0', color: '#f59e0b' },
    { label: 'Stock Value', value: 'Rs. 0', color: '#3b82f6' }
  ];

  return (
    <div className="dashboard-wrapper" style={{ padding: '15px', textAlign: 'left' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>System Active</p>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>
            {auth.currentUser?.email.split('@')[0].toUpperCase()}
          </h2>
        </div>
        <div className="role-tag" style={{ background: '#f59e0b', color: '#000', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold' }}>
          {userData?.role || 'USER'}
        </div>
      </header>

      {/* Reports Grid - Condition 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
        {reports.map((report, index) => (
          <div key={index} style={{ background: '#111', padding: '15px', borderRadius: '18px', border: '1px solid #222' }}>
            <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>{report.label}</span>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '16px', color: report.color }}>{report.value}</h3>
          </div>
        ))}
      </div>

      <h4 style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '15px', letterSpacing: '1px' }}>QUICK OPERATIONS</h4>

      {/* Module Links - Beautiful List Style */}
      <div className="module-list">
        <div className="module-item" onClick={() => setActiveTab('sales')} style={itemStyle}>
          <div style={iconBoxStyle}>🛒</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Sales Terminal</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Create new invoice/order</p>
          </div>
          <span style={{ color: '#333' }}>→</span>
        </div>

        <div className="module-item" onClick={() => setActiveTab('inventory')} style={itemStyle}>
          <div style={iconBoxStyle}>📦</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Inventory Hub</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Manage stock & purchase price</p>
          </div>
          <span style={{ color: '#333' }}>→</span>
        </div>

        <div className="module-item" onClick={() => setActiveTab('staff')} style={itemStyle}>
          <div style={iconBoxStyle}>👥</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Staff & Attendance</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Duty management & tracking</p>
          </div>
          <span style={{ color: '#333' }}>→</span>
        </div>
      </div>

      <button 
        onClick={onLogout}
        style={{ width: '100%', marginTop: '30px', padding: '15px', background: 'transparent', border: '1px solid #333', borderRadius: '12px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}
      >
        SECURE LOGOUT
      </button>
    </div>
  );
};

// Inline Styles for Dashboard Items
const itemStyle = {
  background: '#111', display: 'flex', alignItems: 'center', padding: '15px', 
  borderRadius: '18px', marginBottom: '12px', border: '1px solid #222', cursor: 'pointer'
};

const iconBoxStyle = {
  width: '45px', height: '45px', background: '#1a1a1a', borderRadius: '12px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '15px'
};

export default Dashboard;
