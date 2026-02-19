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

  // Auto-generated Invoice Number (State to hold it before saving)
  const [nextInvoiceNo, setNextInvoiceNo] = useState('');

  useEffect(() => {
    // Generate Initial Invoice ID
    setNextInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);

    // Load Inventory
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => 
      setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // Load History (Last 10)
    const q = query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(10));
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
    const finalInvoiceNo = nextInvoiceNo; // Use the pre-generated ID

    const saleData = {
      invoiceNo: finalInvoiceNo,
      customerName: customer || "Walking Customer",
      processedBy: userName,
      cart: [...cart], 
      subTotal,
      ...charges,
      totalAmount: grandTotal,
      createdAt: serverTimestamp(),
      dateString: now.toLocaleDateString(),
      timeString: now.toLocaleTimeString()
    };

    try {
      // 1. Database mein save karein
      await addDoc(collection(db, "sales_records"), saleData);
      
      // 2. Print trigger karein (Bina state clear kiye taake data nazar aaye)
      setTimeout(() => {
        window.print();
        
        // 3. Print dialog khulne ke BAAD reset karein
        setCart([]);
        setCustomer('');
        setCharges({ discount: 0, labour: 0, freight: 0 });
        setNextInvoiceNo(`INV-${Date.now().toString().slice(-6)}`); // New ID for next sale
        setIsProcessing(false);
      }, 1000);

    } catch(e) { 
      alert("Error saving sale: " + e.message);
      setIsProcessing(false);
    }
  };

  const styles = `
    .pos-container { background: #000; min-height: 100vh; display: grid; grid-template-columns: 1fr 420px; gap: 20px; padding: 20px; font-family: 'Segoe UI', Arial; color: #fff; }
    .main-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; }
    .gold-text { color: #D4AF37; }
    .input-style { width: 100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 8px; color: #fff; margin-bottom: 10px; box-sizing: border-box; }
    .input-style:focus { border-color: #D4AF37; outline: none; }
    
    .history-list { flex-grow: 1; overflow-y: auto; margin-top: 15px; border-top: 1px solid #222; padding-top: 10px; }
    .history-item { background: #111; padding: 10px; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid #D4AF37; display: flex; justify-content: space-between; }

    @media print {
      body * { visibility: hidden !important; }
      #thermal-print-area, #thermal-print-area * { visibility: visible !important; }
      #thermal-print-area { position: absolute; left: 0; top: 0; width: 80mm !important; display: block !important; color: #000 !important; background: #fff !important; padding: 10px; }
      .no-print { display: none !important; }
    }
    #thermal-print-area { display: none; }
  `;

  return (
    <div className="pos-container">
      <style>{styles}</style>

      {/* LEFT: Products */}
      <div className="main-card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
          <h2 className="gold-text" style={{margin:0}}>SALES TERMINAL</h2>
          <div style={{fontSize:'12px'}}>
            <span style={{color:'#555'}}>USER: </span>
            <input value={userName} onChange={(e)=>setUserName(e.target.value)} style={{background:'none', border:'none', color:'#D4AF37', fontWeight:'bold', width:'100px', cursor:'pointer'}} />
          </div>
        </div>

        <div style={{marginBottom:'15px', display:'flex', gap:'10px'}}>
           <div style={{flex:1}}><input className="input-style" placeholder="Search Items..." onChange={e => setSearchTerm(e.target.value)} /></div>
           <div style={{padding:'10px', background:'#111', borderRadius:'8px', border:'1px solid #333', fontSize:'12px'}}>
             ID: <span className="gold-text">{nextInvoiceNo}</span>
           </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'10px', overflowY:'auto'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'12px', cursor:'pointer', border:'1px solid #222', textAlign:'center'}} onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold', fontSize:'14px'}}>{item.name}</div>
              <div className="gold-text">Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Billing & History */}
      <div className="main-card" style={{borderColor: '#D4AF37', height: 'calc(100vh - 40px)'}}>
        <h3 className="gold-text" style={{marginTop:0}}>CHECKOUT</h3>
        
        <input className="input-style" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        {/* Cart List */}
        <div style={{height:'180px', overflowY:'auto', background:'#000', borderRadius:'10px', padding:'10px', marginBottom:'15px', border:'1px solid #111'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #111', fontSize:'13px'}}>
              <span>{c.name} x{c.qty}</span>
              <span className="gold-text">{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'15px'}}>
           <div><small style={{color:'#444'}}>Labour</small><input type="number" className="input-style" value={charges.labour} onChange={e => setCharges({...charges, labour: e.target.value})} /></div>
           <div><small style={{color:'#444'}}>Freight</small><input type="number" className="input-style" value={charges.freight} onChange={e => setCharges({...charges, freight: e.target.value})} /></div>
           <div><small style={{color:'#444'}}>Discount</small><input type="number" className="input-style" value={charges.discount} onChange={e => setCharges({...charges, discount: e.target.value})} /></div>
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'12px', textAlign:'center', marginBottom:'15px'}}>
          <small style={{fontWeight:'bold'}}>NET PAYABLE</small>
          <div style={{fontSize:'30px', fontWeight:'900'}}>Rs. {grandTotal.toLocaleString()}</div>
        </div>

        <button onClick={handleSaveAndPrint} disabled={isProcessing} style={{width:'100%', padding:'18px', background:'#3fb950', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'bold', cursor:'pointer'}}>
          {isProcessing ? "SAVING..." : "SAVE & PRINT INVOICE"}
        </button>

        {/* History (Full Length) */}
        <div className="history-list">
          <h4 style={{margin:'0 0 10px 0', fontSize:'12px', color:'#555'}}>RECENT TRANSACTIONS</h4>
          {history.map((h, idx) => (
            <div key={idx} className="history-item">
              <div style={{fontSize:'12px'}}>
                <strong>{h.customerName}</strong><br/>
                <small style={{color:'#444'}}>{h.invoiceNo}</small>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="gold-text" style={{fontWeight:'bold'}}>Rs. {h.totalAmount}</div>
                <div style={{fontSize:'9px', color:'#333'}}>{h.timeString}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- HIDDEN INVOICE FOR THERMAL PRINT --- */}
      <div id="thermal-print-area">
        <div style={{textAlign:'center', borderBottom:'1px dashed #000', paddingBottom:'10px'}}>
          <h2 style={{margin:0}}>PREMIUM CERAMICS</h2>
          <p style={{margin:0, fontSize:'10px'}}>Official Sale Receipt</p>
        </div>

        <div style={{marginTop:'10px', fontSize:'11px', lineHeight:'1.4'}}>
          <div><strong>INV NO:</strong> {nextInvoiceNo}</div>
          <div><strong>DATE:</strong> {new Date().toLocaleDateString()}</div>
          <div><strong>TIME:</strong> {new Date().toLocaleTimeString()}</div>
          <div><strong>CUST:</strong> {customer || 'Walking Customer'}</div>
          <div><strong>CASHIER:</strong> {userName}</div>
        </div>

        <table style={{width:'100%', marginTop:'10px', fontSize:'11px', borderCollapse:'collapse'}}>
          <thead style={{borderBottom:'1px solid #000'}}>
            <tr><th style={{textAlign:'left'}}>Description</th><th style={{textAlign:'right'}}>Total</th></tr>
          </thead>
          <tbody>
            {cart.map((c, i) => (
              <tr key={i}>
                <td>{c.name} (x{c.qty})</td>
                <td style={{textAlign:'right'}}>{c.qty * c.retailPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{marginTop:'10px', borderTop:'1px dashed #000', paddingTop:'5px', textAlign:'right', fontSize:'11px'}}>
          <div>Sub Total: Rs. {subTotal}</div>
          <div>Service/Frt: Rs. {parseFloat(charges.labour||0) + parseFloat(charges.freight||0)}</div>
          <div>Discount: Rs. {charges.discount || 0}</div>
          <div style={{fontSize:'14px', fontWeight:'bold', marginTop:'5px'}}>NET TOTAL: Rs. {grandTotal}</div>
        </div>

        <div style={{textAlign:'center', marginTop:'25px', fontSize:'10px', borderTop:'1px solid #000', paddingTop:'5px'}}>
          <p>Print Time: {new Date().toLocaleTimeString()}</p>
          <strong>THANK YOU FOR SHOPPING!</strong>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
