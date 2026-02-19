import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [userName, setUserName] = useState('Admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [nextInvoiceNo, setNextInvoiceNo] = useState('');
  
  // New States for Printing
  const [printSize, setPrintSize] = useState('A5'); 
  const [activePrintBill, setActivePrintBill] = useState(null); // For Re-printing

  useEffect(() => {
    setNextInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => 
      setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const q = query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(15));
    const unsubHist = onSnapshot(q, (s) => setHistory(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubInv(); unsubHist(); };
  }, []);

  const addToCart = (i) => {
    const ex = cart.find(c => c.id === i.id);
    if(ex) setCart(cart.map(c => c.id === i.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...i, qty: 1}]);
  };

  const subTotal = cart.reduce((a, c) => a + (parseFloat(c.retailPrice || 0) * c.qty), 0);
  const grandTotal = subTotal - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleSaveAndPrint = async () => {
    if(cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    
    const now = new Date();
    const currentData = {
      invoiceNo: nextInvoiceNo,
      customerName: customer || "Walking Customer",
      processedBy: userName,
      cart: [...cart], 
      subTotal,
      ...charges,
      totalAmount: grandTotal,
      dateString: now.toLocaleDateString(),
      timeString: now.toLocaleTimeString()
    };

    try {
      await addDoc(collection(db, "sales_records"), { ...currentData, createdAt: serverTimestamp() });
      setActivePrintBill(currentData); // Set this as the bill to print
      
      setTimeout(() => {
        window.print();
        setCart([]);
        setCustomer('');
        setCharges({ discount: 0, labour: 0, freight: 0 });
        setNextInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
        setIsProcessing(false);
        setActivePrintBill(null);
      }, 700);
    } catch(e) { 
      alert("Error: " + e.message);
      setIsProcessing(false);
    }
  };

  // Re-print from History
  const rePrint = (bill) => {
    setActivePrintBill(bill);
    setTimeout(() => {
      window.print();
      setActivePrintBill(null);
    }, 500);
  };

  const styles = `
    .pos-wrapper { background: #000; min-height: 100vh; display: grid; grid-template-columns: 1fr 420px; gap: 20px; padding: 20px; font-family: Arial; color: #fff; }
    .panel { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; }
    .gold { color: #D4AF37; }
    .input-ui { width: 100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 8px; color: #fff; margin-bottom: 10px; box-sizing: border-box; }
    
    .hist-scroll { flex-grow: 1; overflow-y: auto; margin-top: 15px; border-top: 1px solid #222; padding-top: 10px; }
    .hist-card { background: #111; padding: 10px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; border-left: 4px solid #D4AF37; display: flex; justify-content: space-between; transition: 0.3s; }
    .hist-card:hover { background: #1a1a1a; transform: scale(1.02); }

    /* PRINT LAYOUTS */
    @media print {
      .pos-wrapper, .no-print { display: none !important; }
      #print-area { display: block !important; background: #fff !important; color: #000 !important; margin: 0 auto; padding: 20px; }
      .A4 { width: 210mm; min-height: 297mm; }
      .A5 { width: 148mm; min-height: 210mm; }
    }
    #print-area { display: none; }
  `;

  return (
    <div className="pos-wrapper">
      <style>{styles}</style>

      {/* LEFT SIDE */}
      <div className="panel">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
          <h2 className="gold">SALE TERMINAL</h2>
          <input value={userName} onChange={(e)=>setUserName(e.target.value)} style={{background:'none', border:'none', color:'#D4AF37', fontWeight:'bold', textAlign:'right'}} />
        </div>

        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
          <input className="input-ui" style={{flex:2}} placeholder="Search Products..." onChange={e => setSearchTerm(e.target.value)} />
          <select className="input-ui" style={{flex:1, color:'#D4AF37'}} onChange={(e) => setPrintSize(e.target.value)}>
            <option value="A5">A5 Size</option>
            <option value="A4">A4 Size</option>
          </select>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'10px', overflowY:'auto'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'10px', cursor:'pointer', border:'1px solid #222', textAlign:'center'}} onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold'}}>{item.name}</div>
              <div className="gold">Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="panel" style={{borderColor: '#D4AF37', height: 'calc(100vh - 40px)'}}>
        <h3 className="gold" style={{marginTop:0}}>BILL DETAILS</h3>
        <input className="input-ui" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{height:'150px', overflowY:'auto', background:'#000', padding:'10px', borderRadius:'8px', marginBottom:'10px'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'4px 0', borderBottom:'1px solid #111'}}>
              <span>{c.name} x{c.qty}</span>
              <span className="gold">{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px'}}>
           <input type="number" className="input-ui" placeholder="Lab" value={charges.labour} onChange={e => setCharges({...charges, labour: e.target.value})} />
           <input type="number" className="input-ui" placeholder="Frt" value={charges.freight} onChange={e => setCharges({...charges, freight: e.target.value})} />
           <input type="number" className="input-ui" placeholder="Disc" value={charges.discount} onChange={e => setCharges({...charges, discount: e.target.value})} />
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'10px', textAlign:'center', fontWeight:'bold', fontSize:'24px'}}>
          Rs. {grandTotal.toLocaleString()}
        </div>

        <button onClick={handleSaveAndPrint} disabled={isProcessing} style={{width:'100%', padding:'15px', background:'#3fb950', border:'none', borderRadius:'10px', color:'#fff', fontWeight:'bold', marginTop:'10px', cursor:'pointer'}}>
          {isProcessing ? "SAVING..." : `SAVE & PRINT (${printSize})`}
        </button>

        <div className="hist-scroll">
          <small style={{color:'#444'}}>CLICK TO RE-PRINT PREVIOUS BILLS</small>
          {history.map((h, idx) => (
            <div key={idx} className="hist-card" onClick={() => rePrint(h)}>
              <div style={{fontSize:'12px'}}>
                <strong>{h.customerName}</strong><br/>
                <small style={{color:'#555'}}>{h.invoiceNo}</small>
              </div>
              <div style={{textAlign:'right', fontWeight:'bold'}} className="gold">
                Rs. {h.totalAmount}<br/>
                <small style={{fontSize:'9px', color:'#333'}}>{h.timeString}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- UNIVERSAL PRINT AREA (A4/A5) --- */}
      {activePrintBill && (
        <div id="print-area" className={printSize}>
          <div style={{textAlign:'center', borderBottom:'2px solid #000', paddingBottom:'10px'}}>
            <h1 style={{margin:0}}>PREMIUM CERAMICS</h1>
            <p style={{margin:0}}>Jaranwala Road | 0300-1234567</p>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
            <div>
              <strong>INVOICE TO:</strong><br/>
              {activePrintBill.customerName}<br/>
              User: {activePrintBill.processedBy}
            </div>
            <div style={{textAlign:'right'}}>
              <strong>INV NO:</strong> {activePrintBill.invoiceNo}<br/>
              <strong>DATE:</strong> {activePrintBill.dateString}<br/>
              <strong>TIME:</strong> {activePrintBill.timeString}
            </div>
          </div>

          <table style={{width:'100%', marginTop:'20px', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f5f5f5'}}>
                <th style={{border:'1px solid #ddd', padding:'10px', textAlign:'left'}}>Description</th>
                <th style={{border:'1px solid #ddd', padding:'10px', textAlign:'center'}}>Qty</th>
                <th style={{border:'1px solid #ddd', padding:'10px', textAlign:'right'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {activePrintBill.cart.map((item, i) => (
                <tr key={i}>
                  <td style={{border:'1px solid #ddd', padding:'10px'}}>{item.name}</td>
                  <td style={{border:'1px solid #ddd', padding:'10px', textAlign:'center'}}>{item.qty}</td>
                  <td style={{border:'1px solid #ddd', padding:'10px', textAlign:'right'}}>{item.qty * item.retailPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{marginTop:'20px', float:'right', width:'250px'}}>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px'}}><span>Sub Total:</span><span>Rs. {activePrintBill.subTotal}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px'}}><span>Labour/Frt:</span><span>Rs. {parseFloat(activePrintBill.labour||0) + parseFloat(activePrintBill.freight||0)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px'}}><span>Discount:</span><span>- Rs. {activePrintBill.discount||0}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'10px', background:'#f5f5f5', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>
              <span>NET TOTAL:</span><span>Rs. {activePrintBill.totalAmount}</span>
            </div>
          </div>
          <div style={{clear:'both', marginTop:'100px', textAlign:'center', borderTop:'1px solid #eee', paddingTop:'20px'}}>
            <p>Printed at: {new Date().toLocaleString()}</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
