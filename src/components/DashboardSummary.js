import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const DashboardSummary = () => {
  const [stats, setStats] = useState({ purchase: 0, sales: 0, stockCount: 0 });

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      let p = 0;
      snap.docs.forEach(doc => p += (parseFloat(doc.data().purchasePrice || 0) * parseFloat(doc.data().stock || 0)));
      setStats(prev => ({ ...prev, purchase: p, stockCount: snap.size }));
    });

    const unsubSales = onSnapshot(collection(db, "sales_records"), (snap) => {
      let s = 0;
      snap.docs.forEach(doc => s += parseFloat(doc.data().totalAmount || 0));
      setStats(prev => ({ ...prev, sales: s }));
    });

    return () => { unsubInv(); unsubSales(); };
  }, []);

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-around', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Inventory Value</div>
        <div style={{ fontWeight: 'bold', fontSize: '22px', color: '#1e3a8a' }}>Rs. {stats.purchase.toLocaleString()}</div>
      </div>
      <div style={{ width: '1px', background: '#e2e8f0' }}></div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales</div>
        <div style={{ fontWeight: 'bold', fontSize: '22px', color: '#10b981' }}>Rs. {stats.sales.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default DashboardSummary;
