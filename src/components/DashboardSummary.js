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
    
    .dash-outer {
      background: #000;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
      color: #fff;
      padding: 20px;
    }

    /* Grid Layout */
    .dash-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header Styling */
    .dash-header {
      grid-column: span 4;
      padding: 10px 0 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-glow {
      font-size: clamp(24px, 5vw, 36px);
      font-weight: 900;
      margin: 0;
      background: linear-gradient(to right, #D4AF37, #F9E2AF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
    }

    /* Card Styling */
    .bento-card {
      background: linear-gradient(145deg, #0d0d0d, #050505);
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 24px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: 0.3s ease;
    }

    .bento-card:hover {
      border-color: #D4AF37;
      box-shadow: 0 0 25px rgba(212, 175, 55, 0.1);
    }

    /* Stat Styles */
    .stat-hero { grid-column: span 2; grid-row: span 1; border-left: 4px solid #D4AF37; }
    .label { color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
    .val { font-size: clamp(24px, 4vw, 32px); font-weight: 900; color: #D4AF37; margin: 10px 0; display: block; }

    /* Lists */
    .list-panel { grid-column: span 2; background: #080808; }
    .row-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; background: rgba(255,255,255,0.03);
      border-radius: 15px; margin-bottom: 8px; border: 1px solid rgba(212,175,55,0.05);
    }

    /* Mobile Responsive Logic */
    @media (max-width: 900px) {
      .dash-grid { grid-template-columns: repeat(2, 1fr); }
      .dash-header { grid-column: span 2; flex-direction: column; align-items: flex-start; gap: 10px; }
      .stat-hero { grid-column: span 2; }
      .list-panel { grid-column: span 2; }
    }

    @media (max-width: 600px) {
      .dash-outer { padding: 15px; padding-top: 40px; } /* Space for mobile menu */
      .dash-grid { grid-template-columns: 1fr; gap: 12px; }
      .dash-header { grid-column: span 1; }
      .stat-hero { grid-column: span 1; }
      .bento-card { grid-column: span 1; }
      .list-panel { grid-column: span 1; }
      .title-glow { font-size: 28px; }
    }

    /* Glow Effect */
    .glow-dot { width: 8px; height: 8px; background: #3fb950; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #3fb950; margin-right: 8px; }
  `;

  if (loading) return <div style={{background:'#000', color:'#D4AF37', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'900'}}>SYNCING SYSTEM...</div>;

  return (
    <div className="dash-outer">
      <style>{styles}</style>
      
      <div className="dash-grid">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="title-glow">COMMAND CENTER</h1>
            <p style={{margin:0, color:'#444', fontSize:'13px'}}>Live System Intelligence</p>
          </div>
          <div style={{background:'#111', padding:'8px 15px', borderRadius:'12px', border:'1px solid #222', fontSize:'12px'}}>
            <span className="glow-dot"></span> LIVE STATUS
          </div>
        </div>

        {/* Stats Section */}
        <div className="bento-card stat-hero">
          <span className="label">Total Revenue</span>
          <span className="val">Rs. {totalRevenue.toLocaleString()}</span>
          <div style={{width:'100%', height:'4px', background:'#1a1a1a', borderRadius:'10px'}}>
             <div style={{width:'70%', height:'100%', background:'#D4AF37', borderRadius:'10px', boxShadow:'0 0 10px #D4AF37'}}></div>
          </div>
        </div>

        <div className="bento-card">
          <span className="label">Stock Value</span>
          <span className="val" style={{fontSize:'22px'}}>Rs. {totalStockVal.toLocaleString()}</span>
        </div>

        <div className="bento-card">
          <span className="label">Invoices</span>
          <span className="val" style={{fontSize:'22px'}}>{sales.length}</span>
        </div>

        {/* Lists Section */}
        <div className="bento-card list-panel">
          <h3 style={{fontSize:'16px', color:'#D4AF37', marginTop:0}}>RECENT SALES</h3>
          {sales.slice(0, 4).map((s, i) => (
            <div className="row-item" key={i}>
              <div style={{fontSize:'13px'}}>
                <div style={{fontWeight:600}}>{s.customerName}</div>
                <div style={{fontSize:'10px', color:'#555'}}>{new Date().toLocaleTimeString()}</div>
              </div>
              <div style={{fontWeight:900, color:'#D4AF37', fontSize:'14px'}}>Rs. {s.totalAmount}</div>
            </div>
          ))}
        </div>

        <div className="bento-card list-panel">
          <h3 style={{fontSize:'16px', color:'#ef4444', marginTop:0}}>LOW STOCK</h3>
          {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 4).map((item, i) => (
            <div className="row-item" key={i} style={{borderLeft:'3px solid #ef4444'}}>
              <div style={{fontSize:'13px', fontWeight:600}}>{item.name}</div>
              <div style={{color:'#ef4444', fontWeight:'bold', fontSize:'13px'}}>{item.openingStock} Box</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
