import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load Inventory
    onSnapshot(collection(db, "inventory_records"), (s) => 
      setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // Load Last 10 Invoices for Sidebar
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
    
    const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const saleData = {
      invoiceNo,
      customerName: customer || "Walking Customer",
      cart,
      subTotal,
      discount: charges.discount,
      labour: charges.labour,
      freight: charges.freight,
      totalAmount: grandTotal,
      createdAt: serverTimestamp(),
      dateString: new Date().toLocaleDateString(),
      timeString: new Date().toLocaleTimeString()
    };

    try {
      await addDoc(collection(db, "sales_records"), saleData);
      
      // Auto-Print Trigger
      setTimeout(() => {
        window.print();
        setCart([]);
        setCustomer('');
        setCharges({ discount: 0, labour: 0, freight: 0 });
      }, 500);

    } catch(e) { 
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = `
    .pos-layout { background: #000; min-height: 100vh; display: grid; grid-template-columns: 1fr 400px; gap: 20px; padding: 20px; font-family: Arial, sans-serif; }
    .card-panel { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; }
    .gold { color: #D4AF37; }
    
    /* Input Grid Fix */
    .charges-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 15px; }
    .input-field { width: 100%; padding: 10px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; box-sizing: border-box; }
    
    .history-section { margin-top: 25px; border-top: 1px solid #222; paddingTop: 15px; }
    .hist-row { display: flex; justify-content: space-between; font-size: 11px; padding: 8px; background: #111; border-radius: 6px; margin-bottom: 5px; border-left: 3px solid #D4AF37; }

    /* Thermal Print Style (Directly in Component) */
    @media print {
      .pos-layout, .no-print { display: none !important; }
      .print-bill { display: block !important; width: 80mm; padding: 5px; color: #000; background: #fff; font-family: 'Courier New', Courier, monospace; }
    }
    .print-bill { display: none; }
  `;

  return (
    <div className="pos-layout">
      <style>{styles}</style>

      {/* Product Selection */}
      <div className="card-panel">
        <h2 className="gold">TERMINAL</h2>
        <input className="input-field" style={{marginBottom:'15px'}} placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'10px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'12px', borderRadius:'8px', cursor:'pointer', border:'1px solid #222', textAlign:'center', color:'#fff'}} onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold', fontSize:'13px'}}>{item.name}</div>
              <div className="gold" style={{fontSize:'12px'}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="card-panel" style={{borderColor: '#D4AF37'}}>
        <h3 className="gold" style={{marginTop:0}}>CURRENT BILL</h3>
        <input className="input-field" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{maxHeight:'200px', overflowY:'auto', margin:'15px 0', borderBottom:'1px solid #222'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', color:'#fff', fontSize:'12px'}}>
              <span>{c.name} x{c.qty}</span>
              <span>{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div className="charges-grid">
           <div><label style={{fontSize:'10px', color:'#666'}}>LABOUR</label><input type="number" className="input-field" value={charges.labour} onChange={e => setCharges({...charges, labour: e.target.value})} /></div>
           <div><label style={{fontSize:'10px', color:'#666'}}>FREIGHT</label><input type="number" className="input-field" value={charges.freight} onChange={e => setCharges({...charges, freight: e.target.value})} /></div>
           <div><label style={{fontSize:'10px', color:'#666'}}>DISC</label><input type="number" className="input-field" value={charges.discount} onChange={e => setCharges({...charges, discount: e.target.value})} /></div>
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'8px', textAlign:'center'}}>
          <div style={{fontSize:'28px', fontWeight:'900'}}>Rs. {grandTotal}</div>
        </div>

        <button onClick={handleSaveAndPrint} disabled={isProcessing} style={{width:'100%', padding:'15px', background:'#3fb950', border:'none', borderRadius:'10px', color:'#fff', fontWeight:'bold', marginTop:'15px', cursor:'pointer'}}>
          {isProcessing ? "SAVING..." : "SAVE & PRINT"}
        </button>

        {/* History Section Below Save Button */}
        <div className="history-section">
          <h4 style={{margin:'10px 0', fontSize:'12px', color:'#555'}}>RECENT 10 INVOICES</h4>
          <div style={{maxHeight:'200px', overflowY:'auto'}}>
            {history.map((h, idx) => (
              <div key={idx} className="hist-row">
                <span>{h.customerName} <br/> <small style={{color:'#666'}}>{h.invoiceNo}</small></span>
                <span className="gold">Rs. {h.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Thermal Invoice for Printing */}
      <div className="print-bill">
        <div style={{textAlign:'center'}}>
          <h2 style={{margin:0}}>PREMIUM CERAMICS</h2>
          <p style={{fontSize:'12px', margin:0}}>Jaranwala Road, PK</p>
          <hr/>
        </div>
        <div style={{fontSize:'12px'}}>
          <span>Date: {new Date().toLocaleDateString()}</span><br/>
          <span>Inv: {customer || 'Walking'}</span>
        </div>
        <table style={{width:'100%', marginTop:'10px', fontSize:'12px'}}>
          {cart.map((c, i) => (
            <tr key={i}>
              <td>{c.name} x{c.qty}</td>
              <td style={{textAlign:'right'}}>{c.qty * c.retailPrice}</td>
            </tr>
          ))}
        </table>
        <hr/>
        <div style={{textAlign:'right', fontWeight:'bold'}}>TOTAL: Rs. {grandTotal}</div>
      </div>
    </div>
  );
};

export default SalesModule;
