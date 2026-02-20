import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const DashboardSummary = () => {
  const [counts, setCounts] = useState({ items: 0, sales: 0, lowStock: 0 });

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      const items = snap.docs.map(doc => doc.data());
      const low = items.filter(i => parseInt(i.stock) < 10).length;
      setCounts(prev => ({ ...prev, items: snap.size, lowStock: low }));
    });

    const unsubSales = onSnapshot(collection(db, "sales_records"), (snap) => {
      setCounts(prev => ({ ...prev, sales: snap.size }));
    });

    return () => { unsubInv(); unsubSales(); };
  }, []);

  return (
    <div style={{ padding: '10px' }}>
      <h1 style={{ color: '#f59e0b', fontSize: '24px' }}>Welcome to GEMINI IMS</h1>
      <p style={{ color: '#666' }}>Yahan aapka business ka mukammal khulasa (Summary) hai.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={cardStyle('#f59e0b')}>
          <span style={{ fontSize: '30px' }}>📦</span>
          <h3>Total Items</h3>
          <h2 style={{ margin: 0 }}>{counts.items}</h2>
        </div>
        <div style={cardStyle('#10b981')}>
          <span style={{ fontSize: '30px' }}>💰</span>
          <h3>Total Sales</h3>
          <h2 style={{ margin: 0 }}>{counts.sales}</h2>
        </div>
        <div style={cardStyle('#ef4444')}>
          <span style={{ fontSize: '30px' }}>⚠️</span>
          <h3>Low Stock</h3>
          <h2 style={{ margin: 0 }}>{counts.lowStock} Items</h2>
        </div>
      </div>
    </div>
  );
};

const cardStyle = (color) => ({
  background: '#111', padding: '25px', borderRadius: '15px', borderLeft: `5px solid ${color}`,
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
});

export default DashboardSummary;
