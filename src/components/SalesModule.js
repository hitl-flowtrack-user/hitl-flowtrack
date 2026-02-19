import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [userName, setUserName] = useState('Admin'); // Default User
  const [searchTerm, setSearchTerm] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load Inventory
    onSnapshot(collection(db, "inventory_records"), (s) => 
      setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // Load Last 10 Invoices (History)
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
      cart,
      subTotal,
      ...charges,
      totalAmount: grandTotal,
      createdAt: serverTimestamp(),
      dateString: now.toLocaleDateString(),
      timeString: now.toLocaleTimeString()
    };

    try {
      await addDoc(collection(db, "sales_records"), saleData);
      
      // Automatic Print
      setTimeout(() => {
        window.print();
        setCart([]);
        setCustomer('');
        setCharges({ discount: 0, labour: 0, freight: 0 });
      }, 700);

    } catch(e) { 
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = `
    .pos-main-wrapper { 
      background: #000; min-height: 100vh; display: grid; 
      grid-template-columns: 1fr 420px; gap: 20px; padding: 20px; 
      font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box;
    }
    .panel-card { 
      background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 20px; 
      padding: 25px; display: flex; flex-direction: column; 
    }
    .gold-highlight { color: #D4AF37; }
    
    /* Inputs */
    .input-box { 
      width: 100%; padding: 12px; background: #000; border: 1px solid #333; 
      border-radius: 10px; color: #fff; margin-bottom: 12px; outline: none;
    }
    .input-box:focus { border-color: #D4AF37; }

    /* Grid for charges */
    .fees-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }

    /* History stretching to bottom */
    .history-container { 
      flex-grow: 1; margin-top: 20px; border-top: 1px solid #222; 
      padding-top: 15px; overflow-y: auto;
    }
    .history-card { 
      background: #111; padding: 12px; border-radius: 12px; margin-bottom: 8px; 
      border-left: 4px solid #D4AF37; display: flex; justify-content: space-between; align-items: center;
    }

    /* Print Logic */
    @media print {
      .pos-main-wrapper, .no-print { display: none !important; }
      .thermal-invoice { 
        display: block !important; width: 80mm; padding: 10px; 
        color: #000; background: #fff; font-family: 'Courier New', monospace; font-size: 12px;
      }
    }
    .thermal-invoice { display: none; }
  `;

  return (
    <div className="pos-main-wrapper">
      <style>{styles}</style>

      {/* Left: Inventory / Product Selection */}
      <div className="panel-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2 className="gold-highlight" style={{margin:0}}>TERMINAL v2.1</h2>
          <div style={{color:'#444', fontSize:'12px'}}>LOGGED IN: <input value={userName} onChange={(e)=>setUserName(e.target.value)} style={{background:'none', border:'none', color:'#D4AF37', fontWeight:'bold', width:'80px'}} /></div>
        </div>
        
        <input className="input-box" placeholder="Search item name..." onChange={e => setSearchTerm(e.target.value)} />
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'12px', overflowY:'auto'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'15px', cursor:'pointer', border:'1px solid #222', textAlign:'center', color:'#fff'}} onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold', marginBottom:'5px'}}>{item.name}</div>
              <div className="gold-highlight" style={{fontSize:'13px'}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Checkout & History */}
      <div className="panel-card" style={{borderColor: '#D4AF37', height: 'calc(100vh - 40px)'}}>
        <h3 className="gold-highlight" style={{marginTop:0}}>BILLING CONSOLE</h3>
        
        <input className="input-box" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        {/* Cart Display */}
        <div style={{maxHeight:'180px', overflowY:'auto', background:'#000', borderRadius:'10px', padding:'10px', marginBottom:'15px'}}>
          {cart.length === 0 && <div style={{color:'#333', textAlign:'center', fontSize:'12px'}}>Cart is empty</div>}
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', color:'#fff', borderBottom:'1px solid #111', fontSize:'13px'}}>
              <span>{c.name} (x{c.qty})</span>
              <span className="gold-highlight">{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div className="fees-grid">
           <div><small style={{color:'#666', fontSize:'10px'}}>LABOUR</small><input type="number" className="input-box" value={charges.labour} onChange={e => setCharges({...charges, labour: e.target.value})} /></div>
           <div><small style={{color:'#666', fontSize:'10px'}}>FREIGHT</small><input type="number" className="input-box" value={charges.freight} onChange={e => setCharges({...charges, freight: e.target.value})} /></div>
           <div><small style={{color:'#666', fontSize:'10px'}}>DISC</small><input type="number" className="input-box" value={charges.discount} onChange={e => setCharges({...charges, discount: e.target.value})} /></div>
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'15px', textAlign:'center', marginBottom:'15px'}}>
          <small style={{fontWeight:'bold'}}>TOTAL AMOUNT</small>
          <div style={{fontSize:'32px', fontWeight:'900'}}>Rs. {grandTotal.toLocaleString()}</div>
        </div>

        <button onClick={handleSaveAndPrint} disabled={isProcessing} style={{width:'100%', padding:'18px', background:'#3fb950', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}>
          {isProcessing ? "SAVING DATA..." : "FINALIZE & PRINT"}
        </button>

        {/* History Section (Now Stretches to Bottom) */}
        <div className="history-container">
          <h4 style={{margin:'0 0 10px 0', fontSize:'12px', color:'#555', letterSpacing:'1px'}}>RECENT ACTIVITY</h4>
          {history.map((h, idx) => (
            <div key={idx} className="history-card">
              <div style={{fontSize:'12px', color:'#fff'}}>
                <strong>{h.customerName}</strong><br/>
                <small style={{color:'#555'}}>{h.invoiceNo}</small>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="gold-highlight" style={{fontWeight:'bold'}}>Rs. {h.totalAmount}</div>
                <div style={{fontSize:'9px', color:'#333'}}>{h.timeString}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- HIDDEN PRINT TEMPLATE --- */}
      <div className="thermal-invoice">
        <div style={{textAlign:'center', borderBottom:'1px dashed #000', paddingBottom:'10px'}}>
          <h2 style={{margin:0}}>PREMIUM CERAMICS</h2>
          <p style={{margin:0}}>Main Road, Business Hub, Jaranwala</p>
          <p style={{margin:0}}>Contact: 0300-1234567</p>
        </div>

        <div style={{marginTop:'10px', fontSize:'11px'}}>
          <div><strong>INVOICE:</strong> {`INV-${Date.now().toString().slice(-6)}`}</div>
          <div><strong>CUSTOMER:</strong> {customer || 'Walking Customer'}</div>
          <div><strong>USER:</strong> {userName}</div>
          <div style={{borderTop:'1px solid #000', marginTop:'5px', paddingTop:'5px'}}>
            <strong>Order Date:</strong> {new Date().toLocaleDateString()}<br/>
            <strong>Created at:</strong> {new Date().toLocaleTimeString()}<br/>
            <strong>Printed at:</strong> {new Date().toLocaleTimeString()}
          </div>
        </div>

        <table style={{width:'100%', marginTop:'15px', fontSize:'12px', borderCollapse:'collapse'}}>
          <thead style={{borderBottom:'1px solid #000'}}>
            <tr>
              <th style={{textAlign:'left'}}>Item</th>
              <th style={{textAlign:'center'}}>Qty</th>
              <th style={{textAlign:'right'}}>Price</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td style={{textAlign:'center'}}>{c.qty}</td>
                <td style={{textAlign:'right'}}>{c.qty * c.retailPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{marginTop:'15px', borderTop:'1px dashed #000', paddingTop:'5px', textAlign:'right'}}>
          <div>Sub Total: Rs. {subTotal}</div>
          <div>Labour/Frt: Rs. {parseFloat(charges.labour||0) + parseFloat(charges.freight||0)}</div>
          <div>Discount: Rs. {charges.discount || 0}</div>
          <div style={{fontSize:'16px', fontWeight:'bold', marginTop:'5px'}}>NET TOTAL: Rs. {grandTotal}</div>
        </div>

        <div style={{textAlign:'center', marginTop:'30px', borderTop:'1px solid #000', paddingTop:'10px'}}>
          <p>Thank you for your visit!</p>
          <small>Software by Gemini Tech 2026</small>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
