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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    
    .dashboard-container {
      padding: 40px; background: #000; min-height: 100vh;
      font-family: 'Outfit', sans-serif; color: #fff;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px;
    }

    .header-area {
      grid-column: span 4; display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 20px; border-bottom: 1px solid #111; padding-bottom: 20px;
    }

    .premium-card {
      background: linear-gradient(145deg, #0a0a0a, #111);
      border: 1px solid rgba(212, 175, 55, 0.1);
      border-radius: 35px; padding: 30px; position: relative;
      transition: 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .premium-card:hover {
      border-color: #D4AF37; transform: scale(1.02);
      box-shadow: 0 20px 60px rgba(212, 175, 55, 0.08);
    }

    .main-stat { grid-column: span 2; grid-row: span 1; }
    
    .gold-accent { color: #D4AF37; font-weight: 800; }
    .stat-title { color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
    .stat-value { font-size: 48px; font-weight: 800; margin: 15px 0; display: block; }
    
    .chart-stub {
      height: 60px; width: 100%; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
      border-radius: 15px; margin-top: 20px; position: relative; overflow: hidden;
    }
    .chart-stub::after {
      content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 2px;
      background: #D4AF37; box-shadow: 0 0 15px #D4AF37;
    }

    .list-panel { grid-column: span 2; background: #080808; border-radius: 35px; padding: 30px; border: 1px solid #111; }
    
    .data-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px; background: #0c0c0c; border-radius: 20px; margin-bottom: 12px;
      border: 1px solid transparent; transition: 0.3s;
    }
    .data-row:hover { border-color: rgba(212, 175, 55, 0.2); background: #111; }

    .indicator { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 10px; }
  `;

  if (loading) return <div style={{background:'#000', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'#D4AF37', fontFamily:'Outfit'}}>INITIALIZING...</div>;

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      {/* 1. Dynamic Header */}
      <div className="header-area">
        <div>
          <span className="gold-accent" style={{letterSpacing: '5px'}}>PREMIUM ACCESS</span>
          <h1 style={{margin:'5px 0 0 0', fontSize:'40px', fontWeight: 800}}>COMMAND <span className="gold-accent">CENTER</span></h1>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'12px', color:'#444'}}>SYSTEM STATUS</div>
          <div style={{color:'#3fb950', fontWeight:'bold'}}><span className="indicator" style={{background:'#3fb950'}}></span>ONLINE</div>
        </div>
      </div>

      {/* 2. Top Large Metrics */}
      <div className="premium-card main-stat">
        <span className="stat-title">Gross Revenue (Total)</span>
        <span className="stat-value">Rs. {totalRevenue.toLocaleString()}<span style={{fontSize:'18px', color:'#3fb950', marginLeft:'15px'}}>+12%</span></span>
        <div className="chart-stub"></div>
      </div>

      <div className="premium-card">
        <span className="stat-title">Inventory Net Worth</span>
        <span className="stat-value" style={{fontSize:'32px'}}>Rs. {totalStockVal.toLocaleString()}</span>
        <p style={{color:'#444', fontSize:'12px', margin:0}}>Based on purchase prices</p>
      </div>

      <div className="premium-card">
        <span className="stat-title">Total Transactions</span>
        <span className="stat-value" style={{fontSize:'32px'}}>{sales.length}</span>
        <div style={{display:'flex', gap:'5px'}}>
            <div style={{width:'20%', height:'4px', background:'#D4AF37', borderRadius:'10px'}}></div>
            <div style={{width:'80%', height:'4px', background:'#222', borderRadius:'10px'}}></div>
        </div>
      </div>

      {/* 3. Bottom Panels */}
      <div className="list-panel">
        <h3 style={{marginTop:0, marginBottom:'25px', fontSize:'18px'}} className="gold-accent">LIVE FEED</h3>
        {sales.slice(0, 4).map((sale, i) => (
          <div className="data-row" key={i}>
            <div>
              <div style={{fontWeight: 600}}>{sale.customerName}</div>
              <div style={{fontSize:'11px', color:'#444'}}>{new Date().toLocaleTimeString()}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="gold-accent" style={{fontSize:'16px'}}>Rs. {sale.totalAmount}</div>
              <div style={{fontSize:'10px', color:'#3fb950'}}>CONFIRMED</div>
            </div>
          </div>
        ))}
      </div>

      <div className="list-panel">
        <h3 style={{marginTop:0, marginBottom:'25px', fontSize:'18px'}} className="gold-accent">INVENTORY ALERT</h3>
        {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 4).map((item, i) => (
          <div className="data-row" key={i} style={{borderLeft: '4px solid #ef4444'}}>
            <div>
              <div style={{fontWeight: 600}}>{item.name}</div>
              <div style={{fontSize:'11px', color:'#444'}}>Stock Ref: {item.sku || 'N/A'}</div>
            </div>
            <div style={{color:'#ef4444', fontWeight:'bold'}}>{item.openingStock} Left</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardSummary;
