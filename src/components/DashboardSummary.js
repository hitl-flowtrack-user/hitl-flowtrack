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
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => d.data())));
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(20)), (s) => 
      setSales(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubPurch = onSnapshot(query(collection(db, "purchase_records"), orderBy("createdAt", "desc"), limit(3)), (s) => 
      setPurchases(s.docs.map(d => d.data())));
    return () => { unsubInv(); unsubSales(); unsubPurch(); };
  }, []);

  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  const lowStock = items.filter(i => (parseFloat(i.totalPcs) || 0) < 10);

  const styles = `
    .dash-main { background: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: Arial, sans-serif; }
    .grid-master { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
    .card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; padding: 20px; }
    .gold-txt { color: #D4AF37; font-weight: 900; }
    
    .inv-link { background: #111; padding: 12px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; border: 1px solid #222; }
    .inv-link:hover { border-color: #D4AF37; background: #161616; }

    /* Modal Fix */
    .bill-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: flex; flex-direction: column; align-items: center; z-index: 10000; overflow-y: auto; padding: 20px; }
    .bill-paper { background: #fff !important; color: #000 !important; padding: 40px; border-radius: 2px; box-shadow: 0 0 20px rgba(255,255,255,0.1); margin-top: 60px; font-family: 'Courier New', Courier, monospace; }
    .A4 { width: 210mm; min-height: 297mm; }
    .A5 { width: 148mm; min-height: 210mm; }

    .modal-tools { position: fixed; top: 0; width: 100%; background: #111; padding: 10px; display: flex; justify-content: center; gap: 15px; z-index: 10001; border-bottom: 1px solid #333; }
    .btn-ui { padding: 10px 25px; border-radius: 5px; border: none; cursor: pointer; font-weight: bold; }

    @media print {
      body * { visibility: hidden; }
      .bill-paper, .bill-paper * { visibility: visible; }
      .bill-paper { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; margin: 0; }
      .modal-tools, .no-print { display: none !important; }
    }
  `;

  return (
    <div className="dash-main">
      <style>{styles}</style>
      <h1 className="gold-txt" style={{fontSize:'30px'}}>COMMAND CENTER</h1>

      <div className="grid-master">
        <div className="card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>TOTAL REVENUE (RECENT)</div>
          <div style={{fontSize:'28px'}} className="gold-txt">Rs. {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>LOW STOCK ALERT</div>
          <div style={{fontSize:'28px', color:'#ef4444'}}>{lowStock.length} ITEMS</div>
        </div>
        <div className="card" style={{gridColumn: 'span 4'}}>
          <div style={{fontSize:'12px', color:'#555'}}>LAST PURCHASE</div>
          <div style={{fontSize:'18px', marginTop:'5px'}}>{purchases[0]?.supplierName || 'N/A'}</div>
        </div>

        <div className="card" style={{gridColumn: 'span 8'}}>
          <h3 className="gold-txt">INVOICE FEED</h3>
          <div style={{maxHeight:'400px', overflowY:'auto'}}>
            {sales.map((s, i) => (
              <div key={i} className="inv-link" onClick={() => setSelectedBill(s)}>
                <span><strong>{s.customerName}</strong><br/><small style={{color:'#555'}}>{s.invoiceNo}</small></span>
                <span className="gold-txt">Rs. {s.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{gridColumn: 'span 4'}}>
          <h3 style={{color:'#ef4444'}}>CRITICAL STOCK</h3>
          {lowStock.map((item, i) => (
            <div key={i} style={{padding:'8px 0', borderBottom:'1px solid #111', display:'flex', justifyContent:'space-between', fontSize:'13px'}}>
              <span>{item.name}</span>
              <span style={{color:'#ef4444', fontWeight:'bold'}}>{item.totalPcs}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedBill && (
        <div className="bill-overlay">
          <div className="modal-tools">
            <select style={{padding:'8px'}} onChange={(e) => setPrintSize(e.target.value)}>
              <option value="A5">A5 Format</option>
              <option value="A4">A4 Format</option>
            </select>
            <button className="btn-ui" style={{background:'#3fb950', color:'#fff'}} onClick={() => window.print()}>PRINT</button>
            <button className="btn-ui" style={{background:'#ef4444', color:'#fff'}} onClick={() => setSelectedBill(null)}>CLOSE</button>
          </div>

          <div className={`bill-paper ${printSize}`}>
            <div style={{textAlign:'center', borderBottom:'2px solid #000', paddingBottom:'10px'}}>
              <h1 style={{margin:0}}>PREMIUM CERAMICS</h1>
              <p style={{margin:0}}>Official Invoice | Jaranwala Road</p>
              <p style={{margin:0}}>Phone: 0300-1234567</p>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
              <div><strong>CUSTOMER:</strong> {selectedBill.customerName}</div>
              <div style={{textAlign:'right'}}>
                <strong>INV#:</strong> {selectedBill.invoiceNo}<br/>
                <strong>DATE:</strong> {selectedBill.dateString}
              </div>
            </div>

            <table style={{width:'100%', marginTop:'20px', borderCollapse:'collapse'}}>
              <thead style={{borderBottom:'1px solid #000', borderTop:'1px solid #000'}}>
                <tr>
                  <th style={{textAlign:'left', padding:'8px'}}>DESCRIPTION</th>
                  <th style={{textAlign:'center', padding:'8px'}}>QTY</th>
                  <th style={{textAlign:'right', padding:'8px'}}>RATE</th>
                  <th style={{textAlign:'right', padding:'8px'}}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.cart.map((c, i) => (
                  <tr key={i}>
                    <td style={{padding:'8px'}}>{c.name}</td>
                    <td style={{textAlign:'center', padding:'8px'}}>{c.qty}</td>
                    <td style={{textAlign:'right', padding:'8px'}}>{c.retailPrice}</td>
                    <td style={{textAlign:'right', padding:'8px'}}>{c.qty * c.retailPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{marginTop:'30px', float:'right', width:'250px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>SUB TOTAL:</span><span>{selectedBill.subTotal}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>DISCOUNT:</span><span>{selectedBill.discount || 0}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px solid #000', fontWeight:'bold', fontSize:'18px'}}>
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
