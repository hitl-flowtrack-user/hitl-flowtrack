import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Ek level bahar jane ke liye ../ use kiya
import { collection, onSnapshot } from "firebase/firestore";

const Dashboard = () => {
  const [stats, setStats] = useState({ stock: 0, sales: 0 });

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (snap) => setStats(p => ({...p, stock: snap.size})));
    onSnapshot(collection(db, "sales_records"), (snap) => {
      let total = 0;
      snap.docs.forEach(doc => total += (doc.data().totalAmount || 0));
      setStats(p => ({...p, sales: total}));
    });
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={cardStyle('#3b82f6')}>
        <h3>Total Items</h3>
        <h2>{stats.stock}</h2>
      </div>
      <div style={cardStyle('#10b981')}>
        <h3>Total Sales</h3>
        <h2>Rs. {stats.sales.toLocaleString()}</h2>
      </div>
    </div>
  );
};

const cardStyle = (color) => ({
  background: 'white', padding: '25px', borderRadius: '15px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
});

export default Dashboard;
