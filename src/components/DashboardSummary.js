import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [printSize, setPrintSize] = useState('A5');

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => d.data())));
    onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(15)), (s) => 
      setSales(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
    .dash-container { background: #000; min-height: 100vh; padding: 25px; color: #fff; font-family: 'Inter', sans-serif; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .stat-card { background: #0a0a0a; padding: 25px; border-radius: 20px; border: 1px solid #1a1a1a; }
    .invoice-list { margin-top: 30px; background: #0a0a0a; border-radius: 20px; padding: 20px; border: 1px solid #1a1a1a; }
    .inv-row { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #111; cursor: pointer; transition: 0.2s; }
    .inv-row:hover { background: #161616; border-radius: 12px; }

    /* Professional Invoice Modal */
    .modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); display: flex; align-items:center; justify-content:center; z-index:9999; }
    .invoice-box { background: #fff; color: #000; padding: 40px; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.5); position: relative; }
    .A4 { width: 210mm; min-height: 297mm; }
    .A5 { width: 148mm; min-height: 210mm; }
    
    .print-controls { position: absolute; top: -50px; right: 0; display: flex; gap: 10px; }
    .btn-action { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; }

    @media print {
      body * { visibility: hidden; }
      .invoice-box, .invoice-box * { visibility: visible; }
      .invoice-box { position: absolute; left: 0; top: 0; width: 100%; border: none; }
      .print-controls, .close-btn { display: none !important; }
    }
  `;

  return (
    <div className="dash-container">
      <style>{styles}</style>
      <h1 style={{fontWeight: 800, color: '#D4AF37', letterSpacing: '-1px'}}>DASHBOARD</h1>
      
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{fontSize:'12px', color:'#666'}}>REVENUE (LAST 15 SALES)</div>
          <div style={{fontSize:'32px', fontWeight:800, color:'#D4AF37'}}>Rs. {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div style={{fontSize:'12px', color:'#666'}}>LOW STOCK ALERT</div>
          <div style={{fontSize:'32px', fontWeight:800, color:'#ef4444'}}>{items.filter(i => i.totalPcs < 10).length} Items</div>
        </div>
      </div>

      <div className="invoice-list">
        <h3 style={{marginTop: 0}}>RECENT INVOICES</h3>
        {sales.map((s, i) => (
          <div key={i} className="inv-row" onClick={() => setSelectedBill(s)}>
            <span><strong>{s.invoiceNo}</strong> - {s.customerName}</span>
            <span style={{color: '#D4AF37', fontWeight: 700}}>Rs. {s.totalAmount}</span>
          </div>
        ))}
      </div>

      {selectedBill && (
        <div className="modal">
          <div className={`invoice-box ${printSize}`}>
            <div className="print-controls no-print">
               <select onChange={(e) => setPrintSize(e.target.value)} style={{padding:'10px', borderRadius:'8px'}}>
                 <option value="A5">A5 Size</option>
                 <option value="A4">A4 Size</option>
               </select>
               <button className="btn-action" style={{background:'#3fb950', color:'#fff'}} onClick={handlePrint}>PRINT</button>
               <button className="btn-action" style={{background:'#ef4444', color:'#fff'}} onClick={() => setSelectedBill(null)}>CLOSE</button>
            </div>

            {/* Professional Invoice Content */}
            <div style={{textAlign:'center', fontFamily: 'serif'}}>
              <h1 style={{margin:0, fontSize: '30px', fontWeight: 900}}>PREMIUM CERAMICS</h1>
              <p style={{margin:0}}>Official Sale Invoice | Jaranwala Road</p>
              <p style={{margin:0}}>Contact: 0300-1234567</p>
              <div style={{display:'flex', justifyContent:'space-between', marginTop: '30px', borderBottom:'2px solid #000', paddingBottom:'10px'}}>
                <span><strong>Invoice:</strong> {selectedBill.invoiceNo}</span>
                <span><strong>Date:</strong> {selectedBill.dateString || new Date().toLocaleDateString()}</span>
              </div>
              <div style={{textAlign:'left', marginTop:'10px'}}><strong>Customer:</strong> {selectedBill.customerName}</div>
            </div>

            <table style={{width:'100%', marginTop:'30px', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f4f4f4'}}>
                  <th style={{padding:'10px', textAlign:'left', border:'1px solid #ddd'}}>Description</th>
                  <th style={{padding:'10px', textAlign:'center', border:'1px solid #ddd'}}>Qty</th>
                  <th style={{padding:'10px', textAlign:'right', border:'1px solid #ddd'}}>Price</th>
                  <th style={{padding:'10px', textAlign:'right', border:'1px solid #ddd'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.cart.map((c, i) => (
                  <tr key={i}>
                    <td style={{padding:'10px', border:'1px solid #ddd'}}>{c.name}</td>
                    <td style={{padding:'10px', textAlign:'center', border:'1px solid #ddd'}}>{c.qty}</td>
                    <td style={{padding:'10px', textAlign:'right', border:'1px solid #ddd'}}>{c.retailPrice}</td>
                    <td style={{padding:'10px', textAlign:'right', border:'1px solid #ddd'}}>{c.qty * c.retailPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{marginTop:'30px', float:'right', width:'250px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Sub-Total:</span><span>Rs. {selectedBill.subTotal}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Discount:</span><span>Rs. {selectedBill.discount || 0}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', borderTop:'2px solid #000', marginTop:'10px', fontWeight:900, fontSize:'20px'}}>
                <span>NET TOTAL:</span><span>Rs. {selectedBill.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
