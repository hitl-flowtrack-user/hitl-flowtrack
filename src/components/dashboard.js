import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, where } from "firebase/firestore";

const Dashboard = ({ userData, setActiveTab, onLogout }) => {
  const [stats, setStats] = useState({
    sale: 0,
    purchase: 0,
    profit: 0,
    staff: 0
  });

  useEffect(() => {
    // Reports calculation logic
    const salesUnsub = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      let totalS = 0, totalP = 0;
      snapshot.forEach(doc => {
        const d = doc.data();
        totalS += d.total || 0;
        d.items?.forEach(item => {
          totalP += ((item.retailPrice - (item.purchasePrice || 0)) * item.qty);
        });
      });
      setStats(prev => ({ ...prev, sale: totalS, profit: totalP }));
    });

    const purUnsub = onSnapshot(collection(db, "purchase_records"), (snapshot) => {
      let totalPur = 0;
      snapshot.forEach(doc => {
        totalPur += (doc.data().purchasePrice * doc.data().quantity);
      });
      setStats(prev => ({ ...prev, purchase: totalPur }));
    });

    const staffUnsub = onSnapshot(query(collection(db, "staff_members"), where("status", "==", "Present")), (snapshot) => {
      setStats(prev => ({ ...prev, staff: snapshot.size }));
    });

    return () => { salesUnsub(); purUnsub(); staffUnsub(); };
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 5px' }}>
        <div>
          <p className="welcome-text">Assalam-o-Alaikum,</p>
          <h2 style={{ fontSize: '20px', margin: 0 }}>{auth.currentUser?.email.split('@')[0].toUpperCase()}</h2>
        </div>
        <div style={{ background: '#f59e0b', color: '#000', padding: '5px 12px', borderRadius: '50px', fontWeight: 'bold', fontSize: '10px', height: 'fit-content' }}>
          {userData?.role?.toUpperCase()}
        </div>
      </header>

      {/* Condition 3: Dashboard Reports */}
      <div className="stats-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <span>Daily Sale</span>
          <h3 style={{ color: '#10b981' }}>Rs. {stats.sale.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Daily Profit</span>
          <h3 style={{ color: '#f59e0b' }}>Rs. {stats.profit.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Purchases</span>
          <h3 style={{ color: '#ef4444' }}>Rs. {stats.purchase.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Present Staff</span>
          <h3 style={{ color: '#3b82f6' }}>{stats.staff}</h3>
        </div>
      </div>

      <h4 style={{ fontSize: '12px', margin: '20px 0 10px 5px', opacity: 0.6 }}>MAIN OPERATIONS</h4>

      {/* Module Links */}
      <div className="module-list">
        <div className="module-item" onClick={() => setActiveTab('sales')}>
          <div className="icon-box">🛒</div>
          <div className="module-info">
            <strong>Sales Terminal</strong>
            <p>Direct billing & invoice generation</p>
          </div>
        </div>

        <div className="module-item" onClick={() => setActiveTab('purchase')}>
          <div className="icon-box">🚚</div>
          <div className="module-info">
            <strong>Purchase / Inward</strong>
            <p>Add new stock & record buying price</p>
          </div>
        </div>

        <div className="module-item" onClick={() => setActiveTab('inventory')}>
          <div className="icon-box">📦</div>
          <div className="module-info">
            <strong>Inventory Hub</strong>
            <p>Check stock levels & distribution</p>
          </div>
        </div>
      </div>

      <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'transparent', color: '#ef4444', border: '1px solid #222', borderRadius: '15px', marginTop: '30px', fontSize: '12px' }}>
        LOGOUT SYSTEM
      </button>
    </div>
  );
};

export default Dashboard;
