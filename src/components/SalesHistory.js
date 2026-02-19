import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sales records ko latest date ke hisab se fetch karna
    const q = query(collection(db, "sales_records"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const styles = `
    .history-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .history-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
    
    .sales-list-panel { background: #111; border-radius: 20px; border: 1px solid #222; overflow: hidden; }
    .sale-card { 
      padding: 15px; border-bottom: 1px solid #222; cursor: pointer; transition: 0.3s; 
      display: flex; justify-content: space-between; align-items: center;
    }
    .sale-card:hover { background: #1a1a1a; border-left: 4px solid #f59e0b; }
    .active-sale { background: #1a1a1a; border-left: 4px solid #f59e0b; }
    
    .details-panel { background: #111; padding: 25px; border-radius: 20px; border: 1px solid #222; position: sticky; top: 20px; height: fit-content; }
    .status-pill { background: #10b981; color: #000; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; }
    
    .detail-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .detail-table th { text-align: left; color: #888; font-size: 11px; padding: 10px; border-bottom: 1px solid #333; }
    .detail-table td { padding: 10px; border-bottom: 1px solid #222; font-size: 13px; }
    
    .total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #333; }
  `;

  return (
    <div className="history-container">
      <style>{styles}</style>
      <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', marginBottom: '25px' }}>SALES HISTORY</h2>

      <div className="history-grid">
        {/* Left Side: Sales List */}
        <div className="sales-list-panel">
          <div style={{padding:'15px', background:'#1a1a1a', color:'#f59e0b', fontWeight:'bold', fontSize:'12px'}}>ALL TRANSACTIONS</div>
          {loading ? <p style={{padding:'20px'}}>Loading history...</p> : 
            sales.map((sale) => (
              <div 
                key={sale.id} 
                className={`sale-card ${selectedSale?.id === sale.id ? 'active-sale' : ''}`}
                onClick={() => setSelectedSale(sale)}
              >
                <div>
                  <div style={{fontWeight:'bold'}}>{sale.customerName}</div>
                  <div style={{fontSize:'11px', color:'#666'}}>
                    {sale.createdAt?.toDate().toLocaleString()}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color: '#10b981', fontWeight:'900'}}>Rs. {sale.totalAmount?.toLocaleString()}</div>
                  <span className="status-pill">PAID</span>
                </div>
              </div>
            ))
          }
        </div>

        {/* Right Side: Detailed View */}
        <div className="details-panel">
          {selectedSale ? (
            <>
              <h3 style={{color: '#f59e0b', margin:'0 0 5px 0'}}>INVOICE DETAILS</h3>
              <p style={{fontSize:'12px', color:'#555'}}>ID: {selectedSale.id}</p>
              
              <div style={{marginTop:'20px'}}>
                <strong>Customer:</strong> {selectedSale.customerName} <br/>
                <strong>Date:</strong> {selectedSale.createdAt?.toDate().toLocaleString()}
              </div>

              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.salePrice}</td>
                      <td>{(item.quantity * item.salePrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-row">
                <span style={{fontSize:'18px', fontWeight:'900'}}>GRAND TOTAL:</span>
                <span style={{fontSize:'18px', fontWeight:'900', color:'#10b981'}}>
                  Rs. {selectedSale.totalAmount?.toLocaleString()}
                </span>
              </div>
              
              <button 
                onClick={() => window.print()} 
                style={{width:'100%', marginTop:'20px', padding:'12px', borderRadius:'10px', background:'#222', color:'#fff', border:'1px solid #333', cursor:'pointer'}}
              >
                RE-PRINT INVOICE
              </button>
            </>
          ) : (
            <div style={{textAlign:'center', paddingTop:'50px', color:'#444'}}>
              <div style={{fontSize:'50px'}}>📄</div>
              <p>Select a sale from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
