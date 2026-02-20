import React from 'react';

const Navbar = ({ setActiveTab, activeTab }) => {
  const menu = [
    { id: 'dashboard', label: 'Home' },
    { id: 'sales', label: 'POS' },
    { id: 'inventory', label: 'Stock' },
    { id: 'additem', label: 'Add' },
    { id: 'attendance', label: 'Staff' },
    { id: 'flow', label: 'Flow' },
    { id: 'closing', label: 'Closing' }
  ];

  return (
    <nav style={{ background: '#1e3a8a', padding: '10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
      {menu.map(item => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          style={{
            padding: '10px 15px', borderRadius: '5px', border: 'none',
            background: activeTab === item.id ? '#3b82f6' : 'transparent',
            color: 'white', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default Navbar;
