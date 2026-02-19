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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&display=swap');
    
    .dash-bg { background: #000; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #fff; padding: 20px; padding-top: 50px; }
    
    /* Header Style */
    .top-header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
    .title-main { font-size: clamp(30px, 8vw, 45px); font-weight: 900; background: linear-gradient(to right, #D4AF37, #F9E2AF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
    
    /* Bento Grid */
    .grid-master { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    
    .luxury-card {
      background: linear-gradient(145deg, #111111, #050505);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 30px; padding: 25px; position: relative; overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .luxury-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: #D4AF37; opacity: 0.6;
    }

    .hero-stat { grid-column: span 2; }
    .stat-val { font-size: clamp(34px, 6vw, 48px); font-weight: 900; color: #D4AF37; display: block; margin: 10px 0; }
    .stat-label { color: #666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }

    .feed-list { grid-column: span 2; max-height: 350px; overflow-y: auto; }
    .feed-item { 
      background: rgba(255,255,255,0.03); padding: 15px; border-radius: 20px; 
      margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;
      border: 1px solid rgba(255,255,255,0.05);
    }

    @media (max-width: 1024px) { .grid-master { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { 
      .grid-master { grid-template-columns: 1fr; } 
      .hero-stat { grid-column: span 1; }
      .feed-list { grid-column: span 1; }
    }
  `;

  return (
    <div className="dash-bg">
      <style>{styles}</style>
      <div className="top-header">
        <h1 className="title-main">COMMAND CENTER</h1>
        <p style={{color: '#555', margin: 0, fontWeight: 600}}>REAL-TIME BUSINESS INTELLIGENCE</p>
      </div>

      <div className="grid-master">
        <div className="luxury-card hero-stat">
          <span className="stat-label">Total Net Revenue</span>
          <span className="stat-val">Rs. {totalRevenue.toLocaleString()}</span>
          <div style={{width:'100%', height:'6px', background:'#111', borderRadius:'10px'}}>
             <div style={{width:'80%', height:'100%', background:'#D4AF37', borderRadius:'10px', boxShadow:'0 0 15px #D4AF37'}}></div>
          </div>
        </div>

        <div className="luxury-card">
          <span className="stat-label">Inventory Worth</span>
          <span className="stat-val" style={{fontSize: '28px', color:'#fff'}}>Rs. {totalStockVal.toLocaleString()}</span>
        </div>

        <div className="luxury-card">
          <span className="stat-label">System Active</span>
          <span className="stat-val" style={{fontSize: '28px'}}>{sales.length} Sales</span>
        </div>

        <div className="luxury-card feed-list">
          <h3 style={{color:'#D4AF37', marginTop:0}}>LATEST SALES</h3>
          {sales.slice(0, 5).map((s, i) => (
            <div className="feed-item" key={i}>
              <div><strong style={{fontSize:'16px'}}>{s.customerName}</strong><br/><small style={{color:'#555'}}>{new Date().toLocaleTimeString()}</small></div>
              <div style={{color:'#D4AF37', fontWeight:900, fontSize:'18px'}}>Rs. {s.totalAmount}</div>
            </div>
          ))}
        </div>

        <div className="luxury-card feed-list" style={{borderLeft: '5px solid #ef4444'}}>
          <h3 style={{color:'#ef4444', marginTop:0}}>LOW STOCK ALERTS</h3>
          {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 5).map((item, i) => (
            <div className="feed-item" key={i}>
              <span style={{fontWeight: 600}}>{item.name}</span>
              <span style={{color:'#ef4444', fontWeight:900}}>{item.openingStock} BOXES</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
