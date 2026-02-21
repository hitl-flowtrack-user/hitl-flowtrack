import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";

const SalesHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async (date = null) => {
    setLoading(true);
    try {
      let q = query(collection(db, "sales_records"), orderBy("timestamp", "desc"));
      if (date) {
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        q = query(collection(db, "sales_records"), where("timestamp", ">=", start), where("timestamp", "<=", end));
      }
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div>
      <h3>📜 SALES HISTORY</h3>
      <input type="date" onChange={(e) => fetchRecords(e.target.value)} />
      <div className="module-list">
        {loading ? <p>Loading...</p> : history.map(h => (
          <div key={h.id} className="module-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <strong>Rs. {h.total}</strong>
              <small>{h.timestamp?.toDate().toLocaleDateString()}</small>
            </div>
            <p style={{ fontSize: '10px', color: '#666' }}>{h.items?.map(i => i.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesHistory;
