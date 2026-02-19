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
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(15)), (snap) => {
      setSales(snap.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return () => { unsubInv(); unsubSales(); };
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const totalStockVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .dash-wrapper { background: #000; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #fff; padding: 20px; padding-top: 50px; }
    
    .title-row { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; border-left: 6px solid #D4AF37; padding-left: 20px; }
    .title-row h1 { font-size: 38px; font-weight: 900; margin: 0; letter-spacing: -1px; }

    .detailed-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }

    .info-card { 
      grid-column: span 4; background: linear-gradient(160deg, #111 0%, #050505 100%);
      border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 35px; padding: 25px;
      position: relative; overflow: hidden;
    }

    .hero-box { grid-column: span 8; background: #0a0a0a; border: 1px solid #222; border-radius: 40px; padding: 30px; }

    .stat-main { font-size: 45px; font-weight: 900; color: #D4AF37; display: block; margin: 10px 0; }
    .sub-label { color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

    .mini-badge { background: rgba(51, 255, 85, 0.1); color: #33ff55; padding: 5px 12px; border-radius: 50px; font-size: 11px; font-weight: 900; }

    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .data-table th { text-align: left; color: #444; font-size: 12px; padding: 10px; border-bottom: 1px solid #111; }
    .data-table td { padding: 15px 10px; border-bottom: 1px solid #111; font-size: 15px; }

    @media (max-width: 1024px) {
      .info-card { grid-column: span 6; }
      .hero-box { grid-column: span 12; }
    }
    @media (max-width: 650px) {
      .info-card { grid-column: span 12; }
      .stat-main { font-size: 32px; }
      .title-row h1 { font-size: 28px; }
    }
  `;

  return (
    <div className="dash-wrapper">
      <style>{styles}</style>
      
      <div className="title-row">
        <div>
          <span className="sub-label" style={{color: '#D4AF37'}}>Analytics Overview</span>
          <h1>COMMAND CENTER</h1>
        </div>
        <div style={{textAlign:'right'}} className="mini-badge">SYSTEM SECURE</div>
      </div>

      <div className="detailed-grid">
        {/* Total Revenue with Detail */}
        <div className="info-card">
          <span className="sub-label">Net Sales Revenue</span>
          <span className="stat-main">Rs. {totalRevenue.toLocaleString()}</span>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
            <span style={{color: '#3fb950', fontSize:'13px'}}>▲ 14% Growth</span>
            <span style={{color: '#555', fontSize:'13px'}}>Vs Last Month</span>
          </div>
          <div style={{marginTop:'20px', height:'5px', background:'#111', borderRadius:'10px'}}>
            <div style={{width:'75%', height:'100%', background:'#D4AF37', boxShadow:'0 0 15px #D4AF37'}}></div>
          </div>
        </div>

        {/* Stock with Detail */}
        <div className="info-card">
          <span className="sub-label">Inventory Assets</span>
          <span className="stat-main" style={{color: '#fff'}}>Rs. {totalStockVal.toLocaleString()}</span>
          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
             <span style={{fontSize:'12px', background:'#222', padding:'4px 8px', borderRadius:'6px'}}>ITEMS: {items.length}</span>
             <span style={{fontSize:'12px', background:'#222', padding:'4px 8px', borderRadius:'6px'}}>WH: 03</span>
          </div>
        </div>

        {/* Invoice Stats */}
        <div className="info-card">
          <span className="sub-label">Total Invoices</span>
          <span className="stat-main" style={{color: '#D4AF37'}}>{sales.length}</span>
          <p style={{margin:0, fontSize:'13px', color:'#555'}}>Transactions processed today</p>
        </div>

        {/* Big Table Area */}
        <div className="hero-box">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{margin:0, color:'#D4AF37'}}>RECENT TRANSACTIONS</h3>
            <button style={{background:'transparent', border:'1px solid #333', color:'#888', padding:'5px 15px', borderRadius:'10px', fontSize:'12px'}}>VIEW ALL</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>CUSTOMER</th><th>STATUS</th><th>TIME</th><th>TOTAL</th></tr>
            </thead>
            <tbody>
              {sales.slice(0, 6).map((s, i) => (
                <tr key={i}>
                  <td style={{fontWeight:900}}>{s.customerName}</td>
                  <td><span className="mini-badge">PAID</span></td>
                  <td style={{color:'#666'}}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td style={{color:'#D4AF37', fontWeight:900}}>Rs. {s.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
