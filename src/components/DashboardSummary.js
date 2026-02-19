import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => doc.data()));
    });
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc")), (snapshot) => {
      setSales(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return () => { unsubInventory(); unsubSales(); };
  }, []);

  // Stats Logic
  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const totalStockVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalSalesCount = sales.length;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .dash-wrapper { 
      padding: 30px; background: #000; min-height: 100vh; 
      font-family: 'Outfit', sans-serif; color: #fff;
    }

    .header-section { margin-bottom: 40px; }
    .gold-text { 
      color: #D4AF37; font-weight: 900; letter-spacing: 2px; 
      text-shadow: 0 0 15px rgba(212, 175, 55, 0.4); 
    }

    /* Glowing Stats Grid */
    .stats-grid { 
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: 25px; margin-bottom: 40px; 
    }

    .glow-card {
      background: linear-gradient(145deg, #0f0f0f, #050505);
      border: 1px solid rgba(212, 175, 55, 0.2);
      padding: 30px; border-radius: 25px; position: relative;
      overflow: hidden; transition: 0.4s ease;
    }
    .glow-card:hover {
      transform: translateY(-10px);
      border-color: #D4AF37;
      box-shadow: 0 15px 35px rgba(212, 175, 55, 0.15);
    }
    .glow-card::after {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    .stat-label { color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { 
      display: block; font-size: 32px; font-weight: 900; margin-top: 10px; 
      background: linear-gradient(to right, #D4AF37, #F9E2AF);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    /* Info Panels */
    .info-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }
    .glass-panel {
      background: rgba(15, 15, 15, 0.8); border: 1px solid #222;
      padding: 25px; border-radius: 30px; backdrop-filter: blur(10px);
    }
    .panel-title { 
      font-size: 18px; font-weight: 600; color: #D4AF37; 
      margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
    }

    .transaction-item {
      display: flex; justify-content: space-between; padding: 15px 0;
      border-bottom: 1px solid #1a1a1a; transition: 0.3s;
    }
    .transaction-item:hover { padding-left: 10px; color: #D4AF37; }

    .tag-gold {
      background: rgba(212, 175, 55, 0.1); color: #D4AF37;
      padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: bold; border: 1px solid #D4AF37;
    }

    .progress-track {
      width: 100%; height: 6px; background: #1a1a1a; border-radius: 10px; margin-top: 8px;
    }
    .progress-fill {
      height: 100%; background: #D4AF37; border-radius: 10px;
      box-shadow: 0 0 10px #D4AF37;
    }
  `;

  if (loading) return <div style={{background:'#000', color:'#D4AF37', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'900'}}>INITIALIZING LUXURY SUITE...</div>;

  return (
    <div className="dash-wrapper">
      <style>{styles}</style>
      
      <div className="header-section">
        <h1 className="gold-text" style={{margin:0}}>SYSTEM OVERVIEW</h1>
        <p style={{color:'#555', fontSize:'14px'}}>Welcome back, Admin. Here is your business at a glance.</p>
      </div>

      <div className="stats-grid">
        <div className="glow-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">Rs. {totalRevenue.toLocaleString()}</span>
          <div className="progress-track"><div className="progress-fill" style={{width: '75%'}}></div></div>
        </div>
        <div className="glow-card">
          <span className="stat-label">Stock Inventory Value</span>
          <span className="stat-value">Rs. {totalStockVal.toLocaleString()}</span>
          <div className="progress-track"><div className="progress-fill" style={{width: '60%'}}></div></div>
        </div>
        <div className="glow-card">
          <span className="stat-label">Active Sales</span>
          <span className="stat-value">{totalSalesCount} <small style={{fontSize:'12px', color:'#555', WebkitTextFillColor:'#555'}}>Invoices</small></span>
          <div className="progress-track"><div className="progress-fill" style={{width: '45%'}}></div></div>
        </div>
      </div>

      <div className="info-row">
        <div className="glass-panel">
          <div className="panel-title"><span>📜</span> Recent Transactions</div>
          {sales.slice(0, 5).map((s, i) => (
            <div className="transaction-item" key={i}>
              <div>
                <div style={{fontWeight:600}}>{s.customerName}</div>
                <small style={{color:'#444'}}>{s.createdAt?.toDate().toLocaleDateString()}</small>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:900, color:'#D4AF37'}}>+ Rs. {s.totalAmount?.toLocaleString()}</div>
                <span className="tag-gold">SUCCESS</span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel">
          <div className="panel-title"><span>⚠️</span> Low Stock Alerts</div>
          {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 5).map((item, i) => (
            <div className="transaction-item" key={i}>
              <div style={{color: '#888'}}>{item.name}</div>
              <div style={{color: '#ef4444', fontWeight:'bold'}}>{item.openingStock} Boxes</div>
            </div>
          ))}
          {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).length === 0 && 
            <div style={{textAlign:'center', color:'#555', marginTop:'40px'}}>Inventory Health: Excellent</div>
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
