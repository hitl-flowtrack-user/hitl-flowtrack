import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

const SalesHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const fetchHistory = async (dateStr) => {
    setLoading(true);
    try {
      let q;
      if (dateStr) {
        // Filter by specific date
        const start = new Date(dateStr);
        start.setHours(0,0,0,0);
        const end = new Date(dateStr);
        end.setHours(23,59,59,999);
        
        q = query(collection(db, "sales_records"), 
              where("timestamp", ">=", start), 
              where("timestamp", "<=", end),
              orderBy("timestamp", "desc"));
      } else {
        // Last 50 sales
        q = query(collection(db, "sales_records"), orderBy("timestamp", "desc"));
      }
      
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div>
      <h3>📜 SALES HISTORY</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', color: '#888' }}>Filter by Date:</label>
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => {
            setFilterDate(e.target.value);
            fetchHistory(e.target.value);
          }} 
        />
        {filterDate && <button onClick={() => { setFilterDate(''); fetchHistory(); }} style={{ fontSize: '10px', color: '#f59e0b', background: 'none' }}>Clear Filter</button>}
      </div>

      {loading ? <p className="tab-loader">Searching...</p> : (
        <div className="module-list">
          {history.length === 0 && <p style={{textAlign:'center', color:'#555'}}>No records found.</p>}
          {history.map(sale => (
            <div key={sale.id} className="module-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 'bold' }}>Inv #{sale.id.slice(0,5)}</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Rs. {sale.total}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                {sale.items?.map(item => `${item.name} (x${item.qty})`).join(', ')}
              </div>
              <small style={{ fontSize: '10px', marginTop: '5px', opacity: 0.4 }}>
                {sale.timestamp?.toDate().toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
