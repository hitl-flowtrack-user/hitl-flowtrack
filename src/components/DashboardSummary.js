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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .dash-container {
      background: radial-gradient(circle at top right, #1a1a1a, #000);
      min-height: 100vh; font-family: 'Outfit', sans-serif; color: #fff;
      padding: 20px; padding-top: 80px;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 30px; padding: 25px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      position: relative; overflow: hidden;
      margin-bottom: 20px;
    }

    .glass-card::before {
      content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
      transition: 0.5s;
    }
    .glass-card:hover::before { left: 100%; }

    .gold-gradient-text {
      background: linear-gradient(45deg, #D4AF37, #f9e2af);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      font-weight: 900;
    }

    .stat-val { font-size: clamp(32px, 8vw, 42px); font-weight: 900; margin: 10px 0; display: block; }
    .stat-label { color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }

    .grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }

    .pulse-dot {
      width: 10px; height: 10px; background: #D4AF37; border-radius: 50%;
      display: inline-block; margin-right: 10px; box-shadow: 0 0 10px #D4AF37;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

    .list-item-stylish {
      background: rgba(212, 175, 55, 0.05);
      border-radius: 20px; padding: 15px; margin-bottom: 12px;
      display: flex; justify-content: space-between; align-items: center;
      border: 1px solid rgba(212, 175, 55, 0.1);
    }
  `;

  return (
    <div className="dash-container">
      <style>{styles}</style>
      
      <div style={{marginBottom: '30px'}}>
        <span className="stat-label" style={{color: '#D4AF37'}}><span className="pulse-dot"></span>System Live</span>
        <h1 className="gold-gradient-text" style={{fontSize: '40px', margin: '5px 0'}}>COMMAND CENTER</h1>
      </div>

      <div className="grid-layout">
        <div className="glass-card" style={{gridColumn: 'span 1'}}>
          <span className="stat-label">Total Net Revenue</span>
          <span className="stat-val gold-gradient-text">Rs. {totalRevenue.toLocaleString()}</span>
          <div style={{height: '4px', background: 'rgba(212,175,55,0.2)', borderRadius: '10px'}}>
            <div style={{width: '75%', height: '100%', background: '#D4AF37', boxShadow: '0 0 15px #D4AF37'}}></div>
          </div>
        </div>

        <div className="glass-card">
          <span className="stat-label">Inventory Worth</span>
          <span className="stat-val" style={{color: '#fff'}}>Rs. {totalStockVal.toLocaleString()}</span>
        </div>

        <div className="glass-card" style={{gridRow: 'span 2'}}>
          <h3 className="gold-gradient-text" style={{marginTop: 0}}>RECENT ACTIVITY</h3>
          {sales.slice(0, 5).map((s, i) => (
            <div className="list-item-stylish" key={i}>
              <div><strong style={{fontSize: '16px'}}>{s.customerName}</strong><br/><small style={{color:'#666'}}>{new Date().toLocaleTimeString()}</small></div>
              <div style={{color: '#D4AF37', fontWeight: 900}}>Rs. {s.totalAmount}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{borderLeft: '5px solid #ef4444'}}>
          <span className="stat-label" style={{color: '#ef4444'}}>Low Stock Alerts</span>
          <div style={{marginTop: '15px'}}>
            {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 2).map((item, i) => (
              <div key={i} style={{marginBottom: '10px', fontSize: '18px', fontWeight: 700}}>
                {item.name} <span style={{color: '#ef4444'}}>({item.openingStock})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
