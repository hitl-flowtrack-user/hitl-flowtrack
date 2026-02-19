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

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => 
      setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    
    const q = query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(10));
    onSnapshot(q, (s) => setHistory(s.docs.map(d => ({id: d.id, ...d.data()}))));
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
    
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    
    const saleData = {
      invoiceNo,
      customerName: customer || "Walking Customer",
      processedBy: userName,
      cart: [...cart], // Clone cart for safety
      subTotal,
      ...charges,
      totalAmount: grandTotal,
      createdAt: serverTimestamp(),
      dateString: now.toLocaleDateString(),
      timeString: now.toLocaleTimeString()
    };

    try {
      // 1. Save to Database
      await addDoc(collection(db, "sales_records"), saleData);
      
      // 2. Wait for UI to be ready, then Print
      setTimeout(() => {
        window.print();
        
        // 3. Clear everything ONLY AFTER print dialog opens
        setCart([]);
        setCustomer('');
        setCharges({ discount: 0, labour: 0, freight: 0 });
        setIsProcessing(false);
      }, 800);

    } catch(e) { 
      alert("Error: " + e.message);
      setIsProcessing(false);
    }
  };

  const styles = `
    .pos-main-wrapper { 
      background: #000; min-height: 100vh; display: grid; 
      grid-template-columns: 1fr 420px; gap: 20px; padding: 20px; 
      font-family: Arial, sans-serif; box-sizing: border-box;
    }
    .panel-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 20px; padding: 25px; display: flex; flex-direction: column; }
    .gold { color: #D4AF37; }
    .input-box { width: 100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 10px; color: #fff; margin-bottom: 12px; }
    .history-container { flex-grow: 1; margin-top: 20px; border-top: 1px solid #222; padding-top: 15px; overflow-y: auto; }
    .history-card { background: #111; padding: 12px; border-radius: 12px; margin-bottom: 8px; border-left: 4px solid #D4AF37; display: flex; justify-content: space-between; }

    /* CRITICAL FIX FOR PRINTING */
    @media print {
      body * { visibility: hidden !important; }
      #printable-invoice, #printable-invoice * { visibility: visible !important; }
      #printable-invoice { 
        position: absolute; left: 0; top: 0; width: 80mm !important; 
        display: block !important; background: #fff !important; color: #000 !important;
        padding: 5px; font-family: 'Courier New', monospace;
      }
      .pos-main-wrapper, .no-print { display: none !important; }
    }
  `;

  return (
    <div className="pos-main-wrapper">
      <style>{styles}</style>

      {/* Left Panel */}
      <div className="panel-card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
          <h2 className="gold">TERMINAL</h2>
          <div style={{color:'#666'}}>USER: <input value={userName} onChange={(e)=>setUserName(e.target.value)} style={{background:'none', border:'none', color:'#D4AF37', fontWeight:'bold', width:'80px'}} /></div>
        </div>
        <input className="input-box" placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'12px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'15px', cursor:'pointer', border:'1px solid #222', textAlign:'center', color:'#fff'}} onClick={() => addToCart(item)}>
              <strong>{item.name}</strong><br/><span className="gold">Rs. {item.retailPrice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="panel-card" style={{borderColor: '#D4AF37', height: 'calc(100vh - 40px)'}}>
        <h3 className="gold" style={{marginTop:0}}>CHECKOUT</h3>
        <input className="input-box" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{maxHeight:'180px', overflowY:'auto', background:'#000', borderRadius:'10px', padding:'10px', marginBottom:'15px'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', color:'#fff', borderBottom:'1px solid #111', fontSize:'13px'}}>
              <span>{c.name} x{c.qty}</span>
              <span className="gold">{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginBottom:'15px'}}>
           <input type="number" className="input-box" placeholder="Lab" value={charges.labour} onChange={e => setCharges({...charges, labour: e.target.value})} />
           <input type="number" className="input-box" placeholder="Frt" value={charges.freight} onChange={e => setCharges({...charges, freight: e.target.value})} />
           <input type="number" className="input-box" placeholder="Disc" value={charges.discount} onChange={e => setCharges({...charges, discount: e.target.value})} />
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'15px', textAlign:'center'}}>
          <div style={{fontSize:'28px', fontWeight:'bold'}}>Rs. {grandTotal.toLocaleString()}</div>
        </div>

        <button onClick={handleSaveAndPrint} disabled={isProcessing} style={{width:'100%', padding:'18px', background:'#3fb950', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'bold', fontSize:'16px', marginTop:'15px', cursor:'pointer'}}>
          {isProcessing ? "PROCESSING..." : "SAVE & PRINT"}
        </button>

        <div className="history-container">
          <h4 style={{margin:'0 0 10px 0', fontSize:'12px', color:'#555'}}>RECENT SALES</h4>
          {history.map((h, idx) => (
            <div key={idx} className="history-card">
              <span style={{fontSize:'12px'}}>{h.customerName} <br/> <small style={{color:'#444'}}>{h.invoiceNo}</small></span>
              <span className="gold">Rs. {h.totalAmount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- THIS IS THE PRINTABLE INVOICE (Hidden on screen, Visible on Print) --- */}
      <div id="printable-invoice" style={{display:'none'}}>
        <div style={{textAlign:'center', borderBottom:'1px dashed #000', paddingBottom:'10px'}}>
          <h2 style={{margin:0}}>PREMIUM CERAMICS</h2>
          <p style={{margin:0, fontSize:'10px'}}>Main Road, Jaranwala</p>
        </div>

        <div style={{marginTop:'10px', fontSize:'11px'}}>
          <div><strong>INV:</strong> {`INV-${Date.now().toString().slice(-6)}`}</div>
          <div><strong>DATE:</strong> {new Date().toLocaleDateString()}</div>
          <div><strong>USER:</strong> {userName}</div>
          <div><strong>CUST:</strong> {customer || 'Walking'}</div>
        </div>

        <table style={{width:'100%', marginTop:'10px', fontSize:'11px', borderCollapse:'collapse'}}>
          <thead style={{borderBottom:'1px solid #000'}}>
            <tr><th style={{textAlign:'left'}}>Item</th><th style={{textAlign:'right'}}>Price</th></tr>
          </thead>
          <tbody>
            {cart.map((c, i) => (
              <tr key={i}><td>{c.name} x{c.qty}</td><td style={{textAlign:'right'}}>{c.qty * c.retailPrice}</td></tr>
            ))}
          </tbody>
        </table>

        <div style={{marginTop:'10px', borderTop:'1px dashed #000', textAlign:'right', fontSize:'12px'}}>
           <div>Sub: {subTotal}</div>
           <div>Fees: {parseFloat(charges.labour||0) + parseFloat(charges.freight||0)}</div>
           <div>Disc: {charges.discount || 0}</div>
           <div style={{fontSize:'14px', fontWeight:'bold'}}>TOTAL: Rs. {grandTotal}</div>
        </div>
        
        <div style={{textAlign:'center', marginTop:'20px', fontSize:'10px'}}>
          <p>Time: {new Date().toLocaleTimeString()}</p>
          <p>*** Thank You ***</p>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
