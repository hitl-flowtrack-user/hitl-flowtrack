import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const DashboardSummary = () => {
  const [stats, setStats] = useState({ purchase: 0, sales: 0, profit: 0 });

  useEffect(() => {
    onSnapshot(collection(db, "sales_records"), (snap) => {
      let totalS = 0;
      snap.docs.forEach(doc => totalS += doc.data().totalAmount);
      setStats(prev => ({ ...prev, sales: totalS }));
    });

    onSnapshot(collection(db, "inventory_records"), (snap) => {
      let totalP = 0;
      snap.docs.forEach(doc => totalP += (doc.data().purchasePrice * doc.data().stock));
      setStats(prev => ({ ...prev, purchase: totalP }));
    });
  }, []);

  return (
    <div style={{ gridColumn: '1 / -1', background: 'white', padding: '20px', borderRadius: '20px', marginTop: '10px', display: 'flex', justifyContent: 'space-around', border: '1px solid #e2e8f0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Total Purchase</div>
        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{stats.purchase.toLocaleString()}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Total Sale</div>
        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{stats.sales.toLocaleString()}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Gross Profit</div>
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>{stats.sales - stats.purchase > 0 ? (stats.sales - stats.purchase).toLocaleString() : 0}</div>
      </div>
    </div>
  );
};

export default DashboardSummary;
