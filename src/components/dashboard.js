import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, where } from "firebase/firestore";

const Dashboard = ({ userData, setActiveTab, onLogout }) => {
  const [stats, setStats] = useState({ sale: 0, profit: 0, purchase: 0, staff: 0 });
  const [weeklySales, setWeeklySales] = useState([]);

  useEffect(() => {
    const salesUnsub = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      let totalS = 0, totalP = 0;
      let dailyMap = {};

      snapshot.forEach(doc => {
        const d = doc.data();
        totalS += d.total || 0;
        d.items?.forEach(item => {
          totalP += ((item.retailPrice - (item.purchasePrice || 0)) * item.qty);
        });
        if (d.timestamp) {
          const day = d.timestamp.toDate().toLocaleDateString('en-US', { weekday: 'short' });
          dailyMap[day] = (dailyMap[day] || 0) + (d.total || 0);
        }
      });
      setStats(prev => ({ ...prev, sale: totalS, profit: totalP }));
      setWeeklySales(Object.keys(dailyMap).map(day => ({ day, amount: dailyMap[day] })));
    });

    return () => salesUnsub();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p className="welcome-text">Assalam-o-Alaikum,</p>
          <h2 style={{ fontSize: '20px' }}>{auth.currentUser?.email.split('@')[0].toUpperCase()}</h2>
        </div>
        <div className="role-tag">{userData?.role}</div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Daily Sale</span>
          <h3 style={{ color: '#10b981' }}>Rs. {stats.sale.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Net Profit</span>
          <h3 style={{ color: '#f59e0b' }}>Rs. {stats.profit.toLocaleString()}</h3>
        </div>
      </div>

      <div style={{ background: '#111', padding: '15px', borderRadius: '20px', marginTop: '15px', border: '1px solid #222' }}>
        <h4 style={{ fontSize: '10px', color: '#666', marginBottom: '15px' }}>WEEKLY SALES GRAPH</h4>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '80px', gap: '8px' }}>
          {weeklySales.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', background: '#f59e0b', height: `${(d.amount/stats.sale)*100 || 10}%`, borderRadius: '4px' }}></div>
              <span style={{ fontSize: '8px', marginTop: '5px' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="module-list" style={{ marginTop: '20px' }}>
        <div className="module-item" onClick={() => setActiveTab('sales')}>
          <div className="icon-box">🛒</div>
          <div className="module-info"><strong>Create New Sale</strong><p>Generate Bill/Invoice</p></div>
        </div>
        <div className="module-item" onClick={() => setActiveTab('inventory')}>
          <div className="icon-box">📦</div>
          <div className="module-info"><strong>Inventory</strong><p>Manage Stock Levels</p></div>
        </div>
      </div>

      <button onClick={onLogout} style={{ width: '100%', marginTop: '20px', padding: '15px', background: 'none', border: '1px solid #333', color: '#ef4444', borderRadius: '12px' }}>LOGOUT</button>
    </div>
  );
};

export default Dashboard;
