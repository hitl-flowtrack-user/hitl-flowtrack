import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [printSize, setPrintSize] = useState('A5');

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => d.data())));
    onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(20)), (s) => 
      setSales(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(query(collection(db, "purchase_records"), orderBy("createdAt", "desc"), limit(3)), (s) => 
      setPurchases(s.docs.map(d => d.data())));
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const lowStock = items.filter(i => (parseFloat(i.totalPcs) || 0) < 10);

  const styles = `
    .dash-main { background: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .grid-container { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
    .stat-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 20px; padding: 25px; }
    .gold-text { color: #D4AF37; font-weight: bold; }
    
    .inv-item { background: #111; padding: 15px; border-radius: 12px; margin-bottom: 10px; cursor: pointer; display: flex; justify-content: space-between; transition: 0.2s; border: 1px solid transparent; }
    .inv-item:hover { border-color: #D4AF37; background: #161616; }

    /* Fix Modal Styling */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; overflow-y: auto; padding: 40px 0; }
    .invoice-card { background: #fff; color: #000; padding: 40px; border-radius: 4px; box-shadow: 0 0 30px rgba(0,0,0,0.5); position: relative; margin-bottom: 50px; }
    .A4 { width: 210mm; min-height: 297mm; }
    .A5 { width: 148mm; min-height: 210mm; }

    .modal-nav { position: fixed; top: 10px; right: 20px; display: flex; gap: 10px; z-index: 10000; background: #1a1a1a; padding: 10px; border-radius: 10px; }
    .btn-close { background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
    .btn-print { background: #3fb950; color: #fff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }

    @media print {
      body * { visibility: hidden; }
      .invoice-card, .invoice-card * { visibility: visible; }
      .invoice-card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
      .modal-nav, .no-print { display: none !important; }
    }
  `;

  return (
    <div className="dash-main">
      <style>{styles}</style>
      <h1 className="gold-text" style={{fontSize:'35px', letterSpacing:'-1px'}}>COMMAND CENTER</h1>

      <div className="grid-container">
        {/* Top 3 Detailed Cards */}
        <div className="stat-card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>TOTAL GROSS REVENUE</div>
          <div style={{fontSize:'32px', fontWeight:'900'}} className="gold-text">Rs. {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>LOW STOCK ALERT</div>
          <div style={{fontSize:'32px', fontWeight:'900', color:'#ef4444'}}>{lowStock.length} Items</div>
        </div>
        <div className="stat-card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>RECENT PURCHASES</div>
          <div style={{fontSize:'18px', fontWeight:'bold', marginTop:'10px'}}>
             {purchases[0] ? `${purchases[0].supplierName} - Rs.${purchases[0].totalBill}` : 'No Record'}
          </div>
        </div>

        {/* Clickable Invoices List */}
        <div className="stat-card" style={{gridColumn: 'span 8'}}>
          <h3 className="gold-text">DAILY INVOICES</h3>
          <div style={{maxHeight:'400px', overflowY:'auto'}}>
            {sales.map((s, i) => (
              <div key={i} className="inv-item" onClick={() => setSelectedBill(s)}>
                <div>
                  <div style={{fontWeight:'bold'}}>{s.customerName}</div>
                  <small style={{color:'#555'}}>{s.invoiceNo} | {s.dateString}</small>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="gold-text">Rs. {s.totalAmount}</div>
                  <small style={{color:'#3fb950'}}>CLICK TO VIEW</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Low Stock Sidebar */}
        <div className="stat-card" style={{gridColumn: 'span 4'}}>
          <h3 style={{color:'#ef4444'}}>CRITICAL ITEMS</h3>
          {lowStock.map((item, i) => (
            <div key={i} style={{padding:'8px 0', borderBottom:'1px dotted #222', display:'flex', justifyContent:'space-between', fontSize:'14px'}}>
              <span>{item.name}</span>
              <span style={{fontWeight:'bold', color:'#ef4444'}}>{item.totalPcs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Invoice Viewer Modal */}
      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-nav">
             <select style={{padding:'8px'}} onChange={(e) => setPrintSize(e.target.value)}>
               <option value="A5">A5 Format</option>
               <option value="A4">A4 Format</option>
             </select>
             <button className="btn-print" onClick={() => window.print()}>PRINT BILL</button>
             <button className="btn-close" onClick={() => setSelectedBill(null)}>CLOSE (X)</button>
          </div>

          <div className={`invoice-card ${printSize}`}>
            <div style={{textAlign:'center', borderBottom:'2px solid #000', paddingBottom:'20px'}}>
              <h1 style={{margin:0, fontSize:'28px'}}>PREMIUM CERAMICS</h1>
              <p style={{margin:0}}>Main Jaranwala Road, Near Business Center</p>
              <p style={{margin:0}}>Phone: 0300-1234567 | NTN: 1234567-8</p>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
              <div>
                <strong>TO:</strong> {selectedBill.customerName}<br/>
                <strong>INV NO:</strong> {selectedBill.invoiceNo}
              </div>
              <div style={{textAlign:'right'}}>
                <strong>DATE:</strong> {selectedBill.dateString}<br/>
                <strong>TIME:</strong> {selectedBill.timeString || 'N/A'}
              </div>
            </div>

            <table style={{width:'100%', marginTop:'30px', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f0f0f0'}}>
                  <th style={{border:'1px solid #000', padding:'8px', textAlign:'left'}}>SR#</th>
                  <th style={{border:'1px solid #000', padding:'8px', textAlign:'left'}}>DESCRIPTION</th>
                  <th style={{border:'1px solid #000', padding:'8px', textAlign:'center'}}>QTY</th>
                  <th style={{border:'1px solid #000', padding:'8px', textAlign:'right'}}>RATE</th>
                  <th style={{border:'1px solid #000', padding:'8px', textAlign:'right'}}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.cart.map((c, i) => (
                  <tr key={i}>
                    <td style={{border:'1px solid #000', padding:'8px'}}>{i+1}</td>
                    <td style={{border:'1px solid #000', padding:'8px'}}>{c.name}</td>
                    <td style={{border:'1px solid #000', padding:'8px', textAlign:'center'}}>{c.qty}</td>
                    <td style={{border:'1px solid #000', padding:'8px', textAlign:'right'}}>{c.retailPrice}</td>
                    <td style={{border:'1px solid #000', padding:'8px', textAlign:'right'}}>{c.qty * c.retailPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{marginTop:'30px', float:'right', width:'300px'}}>
              <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span>SUB TOTAL:</span><span>Rs. {selectedBill.subTotal}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span>FREIGHT / LABOUR:</span><span>Rs. {parseFloat(selectedBill.freight || 0) + parseFloat(selectedBill.labour || 0)}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span>DISCOUNT:</span><span>- Rs. {selectedBill.discount || 0}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'2px solid #000', fontSize:'22px', fontWeight:'bold'}}>
                <span>NET TOTAL:</span><span>Rs. {selectedBill.totalAmount}</span>
              </div>
            </div>

            <div style={{marginTop:'150px', borderTop:'1px solid #ccc', paddingTop:'10px', textAlign:'center', fontSize:'12px'}}>
              <p>Certified Official Invoice. Received goods in perfect condition.</p>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:'40px'}}>
                <span>_______________________<br/>Customer Signature</span>
                <span>_______________________<br/>Authorized Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
