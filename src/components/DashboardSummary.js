import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => doc.data()));
    });
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(10)), (snap) => {
      setSales(snap.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return () => { unsubInv(); unsubSales(); };
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const totalStockVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
    
    .dash-container {
      background: #000; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #fff;
      padding: 20px; padding-top: 60px; /* Added top padding for mobile menu space */
    }

    .header-text { margin-bottom: 25px; }
    .header-text h1 { 
      font-size: 32px; font-weight: 900; color: #D4AF37; margin: 0;
      text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
    }

    .bento-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
    }

    .glow-card {
      background: #0a0a0a; border: 2px solid #1a1a1a; border-radius: 25px;
      padding: 25px; transition: 0.3s; position: relative;
    }
    .glow-card:hover { border-color: #D4AF37; box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); }

    /* Text Sizes - Mobile Optimized */
    .stat-label { color: #888; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { 
      display: block; font-size: 36px; font-weight: 900; color: #D4AF37; margin-top: 10px;
      word-break: break-word; 
    }

    .list-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 15px; background: #111; border-radius: 15px; margin-bottom: 10px;
      border: 1px solid #1a1a1a;
    }
    .list-item span { font-size: 16px; font-weight: 700; }
    .list-item small { font-size: 12px; color: #666; }

    @media (max-width: 600px) {
      .header-text h1 { font-size: 28px; }
      .stat-value { font-size: 30px; }
      .list-item span { font-size: 14px; }
    }
  `;

  return (
    <div className="dash-container">
      <style>{styles}</style>
      <div className="header-text">
        <h1>COMMAND CENTER</h1>
        <p style={{color: '#444'}}>Real-time Business Analytics</p>
      </div>

      <div className="bento-grid">
        <div className="glow-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">Rs. {totalRevenue.toLocaleString()}</span>
        </div>
        <div className="glow-card">
          <span className="stat-label">Stock Value</span>
          <span className="stat-value">Rs. {totalStockVal.toLocaleString()}</span>
        </div>
        
        <div className="glow-card" style={{gridColumn: 'span 1'}}>
          <h3 style={{color:'#D4AF37', marginTop:0}}>RECENT SALES</h3>
          {sales.slice(0, 3).map((s, i) => (
            <div className="list-item" key={i}>
              <div><span>{s.customerName}</span><br/><small>{new Date().toLocaleTimeString()}</small></div>
              <span style={{color:'#D4AF37'}}>Rs. {s.totalAmount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
