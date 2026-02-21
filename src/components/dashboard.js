import React from 'react';

const Dashboard = ({ setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'salesmodule', label: 'Sales Terminal', icon: '🛒' },
    { id: 'inventoryview', label: 'Inventory Room', icon: '📦' },
    { id: 'additem', label: 'Add New Stock', icon: '➕' },
    { id: 'attendance', label: 'Staff Attendance', icon: '👥' },
    { id: 'dayclosing', label: 'Day Closing', icon: '🏁' },
    { id: 'flowview', label: 'Cash Flow', icon: '💰' }
  ];

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* Top Header with Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#f59e0b', margin: 0 }}>HITL-FLOWTRACK</h2>
        <button onClick={onLogout} style={logoutBtnStyle}>🚪 Logout</button>
      </div>

      <div style={gridStyle}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            style={cardStyle}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{item.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '15px',
  marginTop: '20px'
};

const cardStyle = {
  background: '#111',
  padding: '25px 10px',
  borderRadius: '20px',
  border: '1px solid #333',
  cursor: 'pointer',
  transition: '0.3s'
};

const logoutBtnStyle = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '10px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default Dashboard;
