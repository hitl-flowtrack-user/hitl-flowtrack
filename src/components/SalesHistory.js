import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const SalesHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sales_records"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  return (
    <div>
      <h2 style={{ color: '#f59e0b', marginBottom: '20px' }}>📜 Sales History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {history.map(sale => (
          <div key={sale.id} style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{sale.customerName}</span>
              <span style={{ color: '#666' }}>{sale.dateString}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#aaa' }}>
              {sale.cart?.map((c, i) => (
                <div key={i}>{c.name} (x{c.qty}) - Rs. {c.retailPrice * c.qty}</div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #222', paddingTop: '10px' }}>
              Total Amount: Rs. {sale.totalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesHistory;
