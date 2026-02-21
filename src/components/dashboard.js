import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, where, getDocs, limit, orderBy } from "firebase/firestore";

const Dashboard = ({ userData, setActiveTab, onLogout }) => {
  const [stats, setStats] = useState({ sale: 0, purchase: 0, profit: 0, staff: 0 });
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    // Real-time stats calculation
    const salesUnsub = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      let totalS = 0, totalP = 0;
      let dailyData = {}; // For Chart

      snapshot.forEach(doc => {
        const d = doc.data();
        totalS += d.total || 0;
        
        // Profit Calculation
        d.items?.forEach(item => {
          totalP += ((item.retailPrice - (item.purchasePrice || 0)) * item.qty);
        });

        // Weekly Logic
        if (d.timestamp) {
          const date = d.timestamp.toDate().toLocaleDateString('en-US', { weekday: 'short' });
          dailyData[date] = (dailyData[date] || 0) + (d.total || 0);
        }
      });

      setStats(prev => ({ ...prev, sale: totalS, profit: totalP }));
      
      // Transform for Chart
      const chartArray = Object.keys(dailyData).map(day => ({ day, amount: dailyData[day] }));
      setWeeklyData(chartArray.slice(-7)); // Last 7 days
    });

    // Staff presence
    const staffUnsub = onSnapshot(query(collection(db, "staff_members"), where("status", "==", "Present")), (snap) => {
      setStats(prev => ({ ...prev, staff: snap.size }));
    });

    return () => { salesUnsub(); staffUnsub(); };
  }, []);

  return (
    <div className="dashboard-wrapper">
      <header style={headerStyle}>
        <div>
          <p className="welcome-text">Business Snapshot</p>
          <h2 style={{ fontSize: '20px', margin: 0 }}>{auth.currentUser?.email.split('@')[0].toUpperCase()}</h2>
        </div>
        <div className="role-tag">{userData?.role}</div>
      </header>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Daily Sale</span>
          <h3 style={{ color: '#10b981' }}>Rs. {stats.sale.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Total Profit</span>
          <h3 style={{ color: '#f59e0b' }}>Rs. {stats.profit.toLocaleString()}</h3>
        </div>
      </div>

      {/* --- NEW: Performance Chart Section --- */}
      <div style={chartContainer}>
        <h4 style={{ fontSize: '11px', color: '#888', marginBottom: '15px' }}>WEEKLY SALES PERFORMANCE</h4>
        <div style={barWrapper}>
          {weeklyData.length > 0 ? weeklyData.map((data, i) => (
            <div key={i} style={barCol}>
              <div style={{ 
                height: `${Math.min((data.amount / (stats.sale || 1)) * 100 + 10, 100)}%`, 
                ...barStyle 
              }}></div>
              <span style={barLabel}>{data.day}</span>
            </div>
          )) : <p style={{fontSize:'10px', color:'#444'}}>No data yet</p>}
        </div>
      </div>

      <h4 style={{ fontSize: '12px', margin: '20px 0 10px 0', opacity: 0.6 }}>OPERATIONS</h4>
      
      <div className="module-list">
        <div className="module-item" onClick={() => setActiveTab('sales')}>
          <div className="icon-box">🛒</div>
          <div className="module-info"><strong>Sales</strong><p>Invoices & Orders</p></div>
        </div>
        <div className="module-item" onClick={() => setActiveTab('purchase')}>
          <div className="icon-box">🚚</div>
          <div className="module-info"><strong>Purchase</strong><p>Add Inventory</p></div>
        </div>
      </div>

      <button onClick={onLogout} style={logoutStyle}>LOGOUT SYSTEM</button>
    </div>
  );
};

// --- Styles ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const chartContainer = { background: '#111', padding: '15px', borderRadius: '20px', border: '1px solid #222', marginTop: '15px' };
const barWrapper = { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100px', gap: '5px' };
const barCol = { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%' };
const barStyle = { width: '12px', background: 'linear-gradient(to top, #f59e0b, #fbbf24)', borderRadius: '10px', transition: '0.5s' };
const barLabel = { fontSize: '8px', color: '#555', marginTop: '5px' };
const logoutStyle = { width: '100%', padding: '15px', background: 'transparent', color: '#ef4444', border: '1px solid #222', borderRadius: '15px', marginTop: '20px', fontSize: '12px' };

export default Dashboard;
