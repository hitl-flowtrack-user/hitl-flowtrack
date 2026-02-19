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

  const totalRevenue = sales.reduce((a, s) => a + (s.totalAmount || 0), 0);
  const totalStock = items.reduce((a, c) => a + (parseFloat(c.totalPcs) || 0), 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .dash-container { 
      padding: 30px; background: #050505; min-height: 100vh; 
      font-family: 'Outfit', sans-serif; color: #fff;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: auto auto auto;
      gap: 20px;
    }

    /* Reference Image Style - Grid Spanning */
    .header-box { grid-column: span 4; display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; }
    
    .main-chart-box { 
      grid-column: span 2; grid-row: span 2; 
      background: linear-gradient(145deg, #111, #000);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 30px; padding: 30px;
      position: relative; overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .stat-small-box { 
      grid-column: span 1; 
      background: #111; border-radius: 25px; padding: 25px;
      border: 1px solid #222; transition: 0.3s;
    }
    .stat-small-box:hover { border-color: #D4AF37; transform: translateY(-5px); }

    .activity-box { 
      grid-column: span 2; 
      background: #0a0a0a; border-radius: 30px; padding: 25px;
      border: 1px solid #1a1a1a;
    }

    /* Glowing Elements */
    .gold-glow-text {
      color: #D4AF37; font-weight: 900; 
      text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
    }

    .circle-progress {
      width: 120px; height: 120px; border-radius: 50%;
      border: 8px solid #1a1a1a; border-top: 8px solid #D4AF37;
      display: flex; align-items: center; justify-content: center;
      margin: 20px auto; box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
    }

    .list-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 15px; background: rgba(255,255,255,0.03);
      border-radius: 15px; margin-bottom: 10px; border: 1px solid transparent;
    }
    .list-item:hover { border-color: rgba(212, 175, 55, 0.4); background: rgba(212, 175, 55, 0.05); }

    .btn-gold {
      background: #D4AF37; color: #000; border: none; padding: 10px 20px;
      border-radius: 12px; font-weight: bold; cursor: pointer;
    }

    .mini-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  `;

  if (loading) return <div style={{background:'#000', color:'#D4AF37', textAlign:'center', paddingTop:'20%'}}>Loading Premium Dashboard...</div>;

  return (
    <div className="dash-container">
      <style>{styles}</style>
      
      {/* 1. Header Area */}
      <div className="header-box">
        <div>
          <h1 style={{margin:0, fontSize:'28px'}} className="gold-glow-text">DASHBOARD</h1>
          <p style={{color:'#444', margin:0}}>Real-time business performance analytics</p>
        </div>
        <button className="btn-gold">+ Generate Report</button>
      </div>

      {/* 2. Main Analytics Box (Inspired by the big chart in your image) */}
      <div className="main-chart-box">
        <span className="mini-label">Sales Revenue Performance</span>
        <h2 style={{fontSize:'42px', margin:'10px 0'}} className="gold-glow-text">Rs. {totalRevenue.toLocaleString()}</h2>
        <div style={{color:'#3fb950', fontSize:'14px'}}>▲ 12.5% since last month</div>
        
        <div className="circle-progress">
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'24px', fontWeight:'900'}}>75%</div>
            <div style={{fontSize:'10px', color:'#555'}}>TARGET</div>
          </div>
        </div>
        
        <div style={{marginTop:'30px'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
            <span>Efficiency</span>
            <span style={{color:'#D4AF37'}}>92%</span>
          </div>
          <div style={{width:'100%', height:'8px', background:'#222', borderRadius:'10px'}}>
            <div style={{width:'92%', height:'100%', background:'#D4AF37', borderRadius:'10px', boxShadow:'0 0 10px #D4AF37'}}></div>
          </div>
        </div>
      </div>

      {/* 3. Small Stat Boxes */}
      <div className="stat-small-box">
        <span className="mini-label">Total Stock</span>
        <h3 style={{fontSize:'24px', margin:'10px 0'}}>{totalStock.toLocaleString()} Pcs</h3>
        <div style={{color:'#888', fontSize:'12px'}}>Available in 3 Warehouses</div>
      </div>

      <div className="stat-small-box">
        <span className="mini-label">Total Orders</span>
        <h3 style={{fontSize:'24px', margin:'10px 0'}}>{sales.length}</h3>
        <div style={{color:'#888', fontSize:'12px'}}>Completed Invoices</div>
      </div>

      {/* 4. Activity / Recent Sales (Side Panel style) */}
      <div className="activity-box">
        <h4 style={{margin:'0 0 20px 0', color:'#D4AF37'}}>RECENT ACTIVITY</h4>
        {sales.slice(0, 4).map((sale, i) => (
          <div className="list-item" key={i}>
            <div>
              <div style={{fontWeight:600, fontSize:'14px'}}>{sale.customerName}</div>
              <small style={{color:'#555'}}>{new Date().toLocaleTimeString()}</small>
            </div>
            <div style={{color:'#D4AF37', fontWeight:'900'}}>Rs. {sale.totalAmount}</div>
          </div>
        ))}
      </div>

      {/* 5. Inventory Alert Box */}
      <div className="activity-box">
        <h4 style={{margin:'0 0 20px 0', color:'#D4AF37'}}>INVENTORY ALERTS</h4>
        {items.filter(item => (parseFloat(item.openingStock) || 0) < 10).slice(0, 4).map((item, i) => (
          <div className="list-item" key={i} style={{borderColor: 'rgba(239, 68, 68, 0.2)'}}>
            <span style={{fontSize:'14px'}}>{item.name}</span>
            <span style={{color:'#ef4444', fontWeight:'bold'}}>{item.openingStock} Left</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardSummary;
