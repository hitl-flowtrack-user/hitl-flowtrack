import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Dashboard = ({ userData, setActiveTab, onLogout }) => {
  const [stats, setStats] = useState({
    dailySale: 0,
    dailyPurchase: 0,
    dailyProfit: 0,
    activeStaff: 0
  });

  useEffect(() => {
    // 1. Aaj ki date range set karna
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 2. Real-time Sales & Profit Calculation
    const salesQuery = query(collection(db, "sales_records")); // Aap yahan date filter add kar sakte hain
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      let totalS = 0;
      let totalP = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalS += data.total || 0;
        
        // Profit calculation: (Retail - Purchase) * Qty
        data.items?.forEach(item => {
          const profitPerUnit = (item.retailPrice || 0) - (item.purchasePrice || 0);
          totalP += (profitPerUnit * (item.qty || 1));
        });
      });

      setStats(prev => ({ ...prev, dailySale: totalS, dailyProfit: totalP }));
    });

    // 3. Active Staff Count
    const staffQuery = query(collection(db, "staff_members"), where("status", "==", "Present"));
    const unsubscribeStaff = onSnapshot(staffQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeStaff: snapshot.size }));
    });

    return () => {
      unsubscribeSales();
      unsubscribeStaff();
    };
  }, []);

  const reportCards = [
    { label: 'Daily Sale', value: `Rs. ${stats.dailySale}`, color: '#10b981' },
    { label: 'Daily Profit', value: `Rs. ${stats.dailyProfit}`, color: '#f59e0b' },
    { label: 'Active Staff', value: stats.activeStaff, color: '#3b82f6' },
    { label: 'Total Purchase', value: `Rs. ${stats.dailyPurchase}`, color: '#ef4444' }
  ];

  return (
    <div className="dashboard-wrapper" style={{ padding: '15px' }}>
      <header style={headerStyle}>
        <div>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>HITL-FLOWTRACK</p>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>
            {auth.currentUser?.email.split('@')[0].toUpperCase()}
          </h2>
        </div>
        <div style={roleBadgeStyle}>{userData?.role || 'USER'}</div>
      </header>

      {/* Real-time Cards */}
      <div style={gridStyle}>
        {reportCards.map((card, i) => (
          <div key={i} style={cardStyle}>
            <span style={{ fontSize: '10px', color: '#666' }}>{card.label}</span>
            <h3 style={{ margin: '5px 0 0', fontSize: '16px', color: card.color }}>{card.value}</h3>
          </div>
        ))}
      </div>

      <h4 style={sectionTitleStyle}>OPERATIONS CONTROL</h4>

      <div className="module-list">
        <div onClick={() => setActiveTab('sales')} style={itemStyle}>
          <div style={iconBox}>🛒</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Sales Terminal</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Create orders & invoices</p>
          </div>
          <span>→</span>
        </div>

        <div onClick={() => setActiveTab('inventory')} style={itemStyle}>
          <div style={iconBox}>📦</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Inventory Hub</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Stock levels & pricing</p>
          </div>
          <span>→</span>
        </div>

        <div onClick={() => setActiveTab('staff')} style={itemStyle}>
          <div style={iconBox}>👥</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '14px' }}>Staff & Attendance</strong>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Track duty & shifts</p>
          </div>
          <span>→</span>
        </div>
      </div>

      <button onClick={onLogout} style={logoutButtonStyle}>SECURE LOGOUT</button>
    </div>
  );
};

// --- Styles ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const roleBadgeStyle = { background: '#f59e0b', color: '#000', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' };
const cardStyle = { background: '#111', padding: '15px', borderRadius: '18px', border: '1px solid #222' };
const sectionTitleStyle = { fontSize: '11px', color: '#f59e0b', marginBottom: '15px', letterSpacing: '1px' };
const itemStyle = { background: '#111', display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #222', cursor: 'pointer' };
const iconBox = { width: '40px', height: '40px', background: '#1a1a1a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginRight: '15px' };
const logoutButtonStyle = { width: '100%', marginTop: '20px', padding: '15px', background: 'transparent', border: '1px solid #333', borderRadius: '12px', color: '#ef4444', fontSize: '12px' };

export default Dashboard;
