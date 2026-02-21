import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Path as per Image 4
import { collection, onSnapshot } from "firebase/firestore";

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ totalSales: 0 });

  useEffect(() => {
    // Real-time listener for Sales to show in the header card
    const unsub = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => total += (doc.data().totalAmount || 0));
      setStats({ totalSales: total });
    });
    return () => unsub();
  }, []);

  // Quick Action Buttons matching Image 2
  const menuItems = [
    { id: 'attendance', label: 'Attendance', icon: '👤' },
    { id: 'sales', label: 'New Sale', icon: '📝' },
    { id: 'inventory', label: 'Stock View', icon: '📋' },
    { id: 'additem', label: 'Add Item', icon: '➕' },
    { id: 'closing', label: 'Day Closing', icon: '⏳' },
    { id: 'flow', label: 'Cash Flow', icon: '🔄' }
  ];

  return (
    <div style={containerStyle}>
      {/* 1. Header Section - Matching Image 2 */}
      <div style={headerCardStyle}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Mahavir Traders</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>POS Management System</div>
        <div style={balanceCardStyle}>
          <div style={{ fontSize: '14px' }}>Total Sales (Today)</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>
            Rs. {stats.totalSales.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Grid Menu - Matching Image 2 layout */}
      <div style={gridContainerStyle}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            style={gridItemStyle} 
            onClick={() => setActiveTab(item.id)}
          >
            <div style={iconCircleStyle}>{item.icon}</div>
            <span style={labelStyle}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Styles (Mobile Optimized) ---
const containerStyle = {
  background: '#000',
  minHeight: '100vh',
  paddingBottom: '20px',
  fontFamily: 'sans-serif',
  color: '#fff'
};

const headerCardStyle = {
  background: '#1e3a8a', // Deep Blue matching Image 2 top
  padding: '25px 20px 40px 20px',
  borderBottomLeftRadius: '30px',
  borderBottomRightRadius: '30px',
  textAlign: 'center'
};

const balanceCardStyle = {
  background: '#fff',
  color: '#000',
  padding: '20px',
  borderRadius: '20px',
  marginTop: '20px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  border: '2px solid #f59e0b' // Gold Border
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns like Image 2
  gap: '15px',
  padding: '20px',
  marginTop: '-20px' // Overlapping with header for modern look
};

const gridItemStyle = {
  background: '#111',
  borderRadius: '20px',
  padding: '25px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: '1px solid #333',
  transition: '0.3s'
};

const iconCircleStyle = {
  fontSize: '30px',
  marginBottom: '10px',
  background: '#222',
  width: '60px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: '1px solid #f59e0b' // Gold Icon Border
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#f59e0b' // Gold Text
};

export default Dashboard;
