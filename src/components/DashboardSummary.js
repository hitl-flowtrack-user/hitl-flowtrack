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
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: auto 180px 350px;
      gap: 20px;
      padding: 30px;
      background-color: #050505;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
      color: #fff;
    }

    /* Top Welcome Bar */
    .welcome-bar {
      grid-column: span 4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    /* Premium Glow Card Base */
    .bento-card {
      background: rgba(18, 18, 18, 0.6);
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 28px;
      padding: 25px;
      backdrop-filter: blur(12px);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }
    .bento-card:hover {
      border-color: #D4AF37;
      box-shadow: 0 10px 40px rgba(212, 175, 55, 0.1);
      transform: translateY(-5px);
    }

    /* Hero Card (Large Revenue) */
    .hero-card {
      grid-column: span 2;
      grid-row: span 1;
      background: linear-gradient(135deg, #111 0%, #050505 100%);
      border-left: 5px solid #D4AF37;
    }

    /* Statistics Labels */
    .label { color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .amount { font-size: 38px; font-weight: 800; color: #D4AF37; margin-top: 10px; display: block; }
    
    /* Charts/Visual Placeholders */
    .visual-glow {
      position: absolute; bottom: -20px; right: -20px;
      width: 150px; height: 150px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
    }

    /* Lists */
    .activity-list {
      grid-column: span 2;
      grid-row: span 1;
      overflow-y: auto;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      background: rgba(255,255,255,0.02);
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .item-row:hover { background: rgba(212, 175, 55, 0.05); }

    /* Tags */
    .status-tag {
      background: rgba(212, 175, 55, 0.1);
      color: #D4AF37;
      padding: 5px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    /* Mini Progress */
    .progress-container { width: 100%; height: 6px; background: #1a1a1a; border-radius: 10px; margin-top: 15px; }
    .progress-bar { height: 100%; background: #D4AF37; border-radius: 10px; box-shadow: 0 0 10px #D4AF37; }
  `;

  if (loading) return <div style={{background:'#050505', color:'#D4AF37', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <h2 style={{fontFamily:'Outfit'}}>LOADING PREMIER ANALYTICS...</h2>
  </div>;

  return (
    <div className="dashboard-grid">
      <style>{styles}</style>
      
      {/* Top Section */}
      <div className="welcome-bar">
        <div>
          <h1 style={{margin:0, fontWeight: 800, fontSize: '32px'}}>COMMAND <span style={{color:'#D4AF37'}}>CENTER</span></h1>
          <p style={{color:'#444', margin:0, fontWeight: 400}}>Overview of your business performance & stock.</p>
        </div>
        <div style={{background:'#111', padding:'10px 20px', borderRadius:'15px', border:'1px solid #222'}}>
          <span style={{color:'#666', fontSize:'12px'}}>DATE:</span> <span style={{fontWeight:'bold'}}>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Row 1: Big Stats */}
      <div className="bento-card hero-card">
        <span className="label">Total Revenue</span>
        <span className="amount">Rs. {totalRevenue.toLocaleString()}</span>
        <div className="progress-container"><div className="progress-bar" style={{width:'70%'}}></div></div>
        <p style={{fontSize:'12px', color:'#3fb950', marginTop:'10px'}}>+ 18% Increase from last week</p>
        <div className="visual-glow"></div>
      </div>

      <div className="bento-card">
        <span className="label">Inventory Value</span>
        <span className="amount" style={{fontSize:'28px'}}>Rs. {totalStockVal.toLocaleString()}</span>
        <div className="progress-container"><div className="progress-bar" style={{width:'45%', background:'#666', boxShadow:'none'}}></div></div>
        <div className="visual-glow"></div>
      </div>

      <div className="bento-card">
        <span className="label">Total Invoices</span>
        <span className="amount" style={{fontSize:'28px'}}>{sales.length}</span>
        <span className="status-tag" style={{marginTop:'10px', display:'inline-block'}}>ACTIVE SALES</span>
      </div>

      {/* Row 2: Detailed Lists */}
      <div className="bento-card activity-list">
        <h3 style={{margin:'0 0 20px 0', fontSize:'18px', color:'#D4AF37'}}>LATEST TRANSACTIONS</h3>
        {sales.slice(0, 4).map((sale, i) => (
          <div className="item-row" key={i}>
            <div>
              <div style={{fontWeight:600, fontSize:'14px'}}>{sale.customerName}</div>
              <div style={{fontSize:'11px', color:'#444'}}>{new Date().toLocaleTimeString()}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:800, color:'#D4AF37'}}>Rs. {sale.totalAmount}</div>
              <div style={{fontSize:'9px', color:'#3fb950'}}>PAID</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bento-card activity-list">
        <h3 style={{margin:'0 0 20px 0', fontSize:'18px', color:'#D4AF37'}}>CRITICAL STOCK</h3>
        {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 4).map((item, i) => (
          <div className="item-row" key={i} style={{borderLeft: '4px solid #ef4444'}}>
            <div>
              <div style={{fontWeight:600, fontSize:'14px'}}>{item.name}</div>
              <div style={{fontSize:'11px', color:'#444'}}>WH: {item.warehouse}</div>
            </div>
            <div style={{color:'#ef4444', fontWeight:'bold'}}>{item.openingStock} Box</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;
