import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => doc.data()));
    });
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(20)), (snap) => {
      setSales(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
      setLoading(false);
    });
    const unsubPurch = onSnapshot(query(collection(db, "purchase_records"), orderBy("createdAt", "desc"), limit(3)), (snap) => {
      setPurchases(snap.docs.map(doc => doc.data()));
    });
    return () => { unsubInv(); unsubSales(); unsubPurch(); };
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const lowStockItems = items.filter(item => (parseFloat(item.totalPcs) || 0) < 10);

  const styles = `
    .dash-wrapper { background: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Outfit', sans-serif; }
    .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-top: 20px; }
    .card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 25px; padding: 25px; position: relative; }
    .gold-glow { border-color: #D4AF37; box-shadow: 0 0 15px rgba(212, 175, 55, 0.1); }
    
    .invoice-row { 
      display: flex; justify-content: space-between; padding: 15px; background: #111; 
      border-radius: 15px; margin-bottom: 10px; cursor: pointer; border: 1px solid transparent;
    }
    .invoice-row:hover { border-color: #D4AF37; background: #161616; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .bill-popup { background: #fff; color: #000; width: 350px; padding: 30px; border-radius: 20px; font-family: 'Courier New', monospace; }
  `;

  return (
    <div className="dash-wrapper">
      <style>{styles}</style>
      <h1 style={{color: '#D4AF37', fontWeight: 900}}>COMMAND CENTER</h1>

      <div className="bento-grid">
        {/* Stats Cards */}
        <div className="card" style={{gridColumn: 'span 4'}}>
          <small style={{color:'#666'}}>REVENUE TODAY</small>
          <h2 style={{fontSize: '32px', margin: '5px 0', color: '#D4AF37'}}>Rs. {totalRevenue.toLocaleString()}</h2>
        </div>
        
        <div className="card" style={{gridColumn: 'span 4'}}>
          <small style={{color:'#666'}}>LOW STOCK ITEMS</small>
          <h2 style={{fontSize: '32px', margin: '5px 0', color: '#ef4444'}}>{lowStockItems.length}</h2>
        </div>

        <div className="card" style={{gridColumn: 'span 4'}}>
          <small style={{color:'#666'}}>TOTAL INVENTORY</small>
          <h2 style={{fontSize: '32px', margin: '5px 0'}}>{items.length} SKUs</h2>
        </div>

        {/* Daily Invoices Feed */}
        <div className="card" style={{gridColumn: 'span 8'}}>
          <h3 style={{marginTop: 0, color:'#D4AF37'}}>DAILY INVOICES <small style={{fontSize:'10px', color:'#444'}}>(CLICK TO VIEW)</small></h3>
          <div style={{maxHeight:'400px', overflowY:'auto'}}>
            {sales.map((sale, i) => (
              <div key={i} className="invoice-row" onClick={() => setSelectedBill(sale)}>
                <div>
                  <div style={{fontWeight: 900}}>{sale.customerName}</div>
                  <div style={{fontSize:'12px', color:'#555'}}>{sale.invoiceNo} | {sale.timeString}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{color: '#D4AF37', fontWeight: 900}}>Rs. {sale.totalAmount}</div>
                  <div style={{fontSize:'10px', color: '#3fb950'}}>PAID</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Sidebar */}
        <div className="card" style={{gridColumn: 'span 4'}}>
          <h3 style={{marginTop: 0, color:'#ef4444'}}>CRITICAL STOCK</h3>
          {lowStockItems.slice(0, 8).map((item, i) => (
            <div key={i} style={{padding:'10px 0', borderBottom:'1px solid #111', display:'flex', justifyContent:'space-between'}}>
              <span>{item.name}</span>
              <span style={{color:'#ef4444', fontWeight:'bold'}}>{item.totalPcs}</span>
            </div>
          ))}
        </div>

        {/* Last 3 Purchases */}
        <div className="card" style={{gridColumn: 'span 12'}}>
          <h3 style={{marginTop: 0, color: '#D4AF37'}}>LAST 3 PURCHASES</h3>
          <div style={{display:'flex', gap:'20px'}}>
            {purchases.map((p, i) => (
              <div key={i} style={{flex:1, background:'#111', padding:'15px', borderRadius:'15px'}}>
                <div style={{fontSize:'12px', color:'#555'}}>{p.supplierName}</div>
                <div style={{fontSize:'20px', fontWeight:900, color:'#D4AF37'}}>Rs. {p.totalBill}</div>
                <div style={{fontSize:'11px'}}>{p.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {selectedBill && (
        <div className="modal-overlay" onClick={() => setSelectedBill(null)}>
          <div className="bill-popup" onClick={e => e.stopPropagation()}>
            <div style={{textAlign:'center'}}>
              <h3>PREMIUM CERAMICS</h3>
              <p style={{fontSize:'12px'}}>Invoice: {selectedBill.invoiceNo}</p>
              <hr/>
            </div>
            <div style={{minHeight: '100px', fontSize:'14px'}}>
              {selectedBill.cart.map((item, idx) => (
                <div key={idx} style={{display:'flex', justifyContent:'space-between'}}>
                  <span>{item.name} x{item.qty}</span>
                  <span>{item.qty * item.retailPrice}</span>
                </div>
              ))}
            </div>
            <hr/>
            <div style={{fontWeight:'bold', fontSize:'18px', display:'flex', justifyContent:'space-between'}}>
              <span>TOTAL:</span>
              <span>Rs. {selectedBill.totalAmount}</span>
            </div>
            <button onClick={() => setSelectedBill(null)} style={{width:'100%', marginTop:'20px', padding:'10px', background:'#000', color:'#fff', border:'none', borderRadius:'10px'}}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
