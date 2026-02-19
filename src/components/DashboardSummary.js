import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => doc.data()));
    });
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(20)), (snap) => {
      setSales(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
      setLoading(false);
    });
    // Assuming you have a purchase_records collection
    const unsubPurch = onSnapshot(query(collection(db, "purchase_records"), orderBy("createdAt", "desc"), limit(3)), (snap) => {
      setPurchases(snap.docs.map(doc => doc.data()));
    });
    return () => { unsubInv(); unsubSales(); unsubPurch(); };
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const lowStockItems = items.filter(item => (parseFloat(item.totalPcs) || 0) < 10);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    .dash-main { background: #000; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #fff; padding: 20px; padding-top: 60px; }
    
    .main-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
    
    .card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 20px; position: relative; transition: 0.3s; }
    .card:hover { border-color: #D4AF37; box-shadow: 0 0 20px rgba(212,175,55,0.05); }

    .span-4 { grid-column: span 4; }
    .span-8 { grid-column: span 8; }
    .span-12 { grid-column: span 12; }

    .gold-text { color: #D4AF37; font-weight: 900; }
    .label { font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1.5px; font-weight: 700; }
    .big-val { font-size: 32px; font-weight: 900; display: block; margin: 5px 0; }

    .scroll-list { max-height: 300px; overflow-y: auto; margin-top: 15px; }
    .list-row { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 12px; border-bottom: 1px solid #111; cursor: pointer; border-radius: 12px;
    }
    .list-row:hover { background: #111; }

    .badge-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
    .badge-gold { background: rgba(212, 175, 55, 0.1); color: #D4AF37; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }

    @media (max-width: 900px) { .span-4, .span-8 { grid-column: span 12; } }
  `;

  return (
    <div className="dash-main">
      <style>{styles}</style>
      <div style={{marginBottom:'30px'}}>
        <h1 className="gold-text" style={{fontSize:'36px', margin:0}}>COMMAND CENTER</h1>
        <p style={{color:'#444', fontWeight:600}}>SYSTEM INTELLIGENCE v2.0</p>
      </div>

      <div className="main-grid">
        {/* Top Stats */}
        <div className="card span-4">
          <span className="label">Daily Gross Revenue</span>
          <span className="big-val gold-text">Rs. {totalRevenue.toLocaleString()}</span>
          <span style={{fontSize:'12px', color:'#3fb950'}}>+8% From Yesterday</span>
        </div>

        <div className="card span-4">
          <span className="label">Inventory Health</span>
          <span className="big-val">{items.length} Products</span>
          <span className="badge-red">{lowStockItems.length} Low Stock Alerts</span>
        </div>

        <div className="card span-4">
          <span className="label">Active Sessions</span>
          <span className="big-val">04 Users</span>
          <span className="badge-gold">Online Now</span>
        </div>

        {/* Daily Invoices (Clickable) */}
        <div className="card span-8">
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h3 className="gold-text" style={{margin:0}}>DAILY INVOICES</h3>
            <span className="label">Live Feed</span>
          </div>
          <div className="scroll-list">
            {sales.map((sale, i) => (
              <div key={i} className="list-row" onClick={() => alert(`Invoice ID: ${sale.id}\nItems: ${sale.cart?.length || 0}\nAmount: ${sale.totalAmount}`)}>
                <div>
                  <div style={{fontWeight:700}}>{sale.customerName || 'Walking Customer'}</div>
                  <div style={{fontSize:'11px', color:'#444'}}>{new Date().toLocaleTimeString()}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="gold-text">Rs. {sale.totalAmount}</div>
                  <div style={{fontSize:'10px', color:'#3fb950'}}>CLICK TO VIEW</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Detailed */}
        <div className="card span-4">
          <h3 style={{margin:0, color:'#ef4444'}}>CRITICAL STOCK</h3>
          <div className="scroll-list">
            {lowStockItems.map((item, i) => (
              <div key={i} className="list-row">
                <span style={{fontSize:'14px'}}>{item.name}</span>
                <span className="badge-red">{item.totalPcs} Pcs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last 3 Purchases */}
        <div className="card span-12">
          <h3 className="gold-text" style={{margin:0}}>LAST 3 INVENTORY UPDATES (PURCHASES)</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'15px', marginTop:'15px'}}>
            {purchases.length > 0 ? purchases.map((p, i) => (
              <div key={i} style={{background:'#111', padding:'15px', borderRadius:'15px', border:'1px solid #222'}}>
                <div className="label">{p.supplierName}</div>
                <div style={{fontWeight:900, fontSize:'18px', margin:'5px 0'}}>Rs. {p.totalBill}</div>
                <div style={{fontSize:'12px', color:'#666'}}>{p.date}</div>
              </div>
            )) : <div style={{color:'#444'}}>No recent purchases recorded.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
