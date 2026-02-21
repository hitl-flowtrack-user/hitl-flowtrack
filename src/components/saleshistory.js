import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const SalesHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, "sales_records"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) return <p style={{textAlign:'center', color:'#f59e0b'}}>Fetching Records...</p>;

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>📜 SALES HISTORY</h2>
      {history.map(sale => (
        <div key={sale.id} className="module-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <strong style={{ color: '#f59e0b' }}>Inv #{sale.id.slice(0,5)}</strong>
            <span style={{ fontSize: '12px', color: '#10b981' }}>Rs. {sale.total}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {sale.items?.map(item => `${item.name} x ${item.qty}`).join(', ')}
          </div>
          <small style={{ fontSize: '9px', opacity: 0.5 }}>{sale.timestamp?.toDate().toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default SalesHistory;
