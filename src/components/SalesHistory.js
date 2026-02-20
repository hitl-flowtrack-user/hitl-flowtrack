import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const SalesHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sales_records"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ color: '#1e3a8a' }}>Recent Invoices</h3>
      {history.map(sale => (
        <div key={sale.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>{sale.customerName}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{sale.dateString}</div>
          </div>
          <div style={{ fontWeight: 'bold', color: '#10b981' }}>Rs. {sale.totalAmount}</div>
        </div>
      ))}
    </div>
  );
};

export default SalesHistory;
