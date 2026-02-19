import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(5)), (s) => setRecentSales(s.docs.map(d => d.data())));
  }, []);

  const addToCart = (i) => {
    const ex = cart.find(c => c.id === i.id);
    if(ex) setCart(cart.map(c => c.id === i.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...i, qty: 1}]);
  };

  const subTotal = cart.reduce((a, c) => a + (c.retailPrice * c.qty), 0);
  const grandTotal = subTotal - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleSave = async () => {
    if(cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const inv = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const data = {
      invoiceNo: inv, customerName: customer || "Walking Customer",
      cart, totalAmount: grandTotal, subTotal, ...charges,
      createdAt: serverTimestamp(), timeString: new Date().toLocaleTimeString()
    };
    await addDoc(collection(db, "sales_records"), data);
    window.print();
    setCart([]); setCustomer(''); setIsProcessing(false);
  };

  const styles = `
    .pos-main { background: #000; min-height: 100vh; display: grid; grid-template-columns: 1fr 400px; padding: 20px; font-family: 'Inter', sans-serif; gap: 20px; }
    .panel { background: #0a0a0a; border-radius: 30px; border: 1px solid #1a1a1a; padding: 25px; }
    .item-btn { background: #111; border: 1px solid #222; border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; color: #fff; }
    .item-btn:hover { border-color: #D4AF37; }
    .bill-box { background: #0d0d0d; border: 1px solid #D4AF37; border-radius: 30px; padding: 20px; position: sticky; top: 20px; }
    .print-only { display: none; }
    
    @media print {
      body * { display: none; }
      .print-only { display: block !important; width: 80mm; padding: 10px; font-family: 'Courier New'; color: #000; }
      .print-only * { display: block; }
    }
  `;

  return (
    <div className="pos-main">
      <style>{styles}</style>
      
      {/* Inventory Panel */}
      <div className="panel">
        <h2 style={{color: '#D4AF37'}}>SALES TERMINAL</h2>
        <input style={{width:'100%', padding:'15px', background:'#000', border:'1px solid #333', borderRadius:'12px', color:'#fff', marginBottom:'20px'}} placeholder="Search items..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'10px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="item-btn" onClick={() => addToCart(item)}>
              <strong>{item.name}</strong><br/><span style={{color:'#D4AF37'}}>Rs. {item.retailPrice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Panel */}
      <div className="bill-box">
        <h3 style={{color:'#D4AF37', marginTop:0}}>BILL SUMMARY</h3>
        <input style={{width:'100%', padding:'10px', background:'#000', border:'1px solid #222', color:'#fff', borderRadius:'10px', marginBottom:'15px'}} placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{maxHeight: '200px', overflowY:'auto', borderBottom:'1px solid #222', marginBottom:'15px'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'14px', color:'#fff'}}>
              <span>{c.name} x{c.qty}</span>
              <span>{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px'}}>
          <input style={{padding:'8px', background:'#000', color:'#D4AF37', border:'1px solid #222'}} placeholder="Disc" onChange={e => setCharges({...charges, discount: e.target.value})} />
          <input style={{padding:'8px', background:'#000', color:'#D4AF37', border:'1px solid #222'}} placeholder="Lab" onChange={e => setCharges({...charges, labour: e.target.value})} />
          <input style={{padding:'8px', background:'#000', color:'#D4AF37', border:'1px solid #222'}} placeholder="Frt" onChange={e => setCharges({...charges, freight: e.target.value})} />
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'20px', borderRadius:'15px', textAlign:'center', marginTop:'15px'}}>
          <small>GRAND TOTAL</small>
          <h2 style={{margin:0, fontSize:'30px'}}>Rs. {grandTotal}</h2>
        </div>

        <button onClick={handleSave} disabled={isProcessing} style={{width:'100%', padding:'18px', background:'#3fb950', border:'none', borderRadius:'15px', color:'#fff', fontWeight:900, fontSize:'16px', marginTop:'15px', cursor:'pointer'}}>
          {isProcessing ? "PROCESSING..." : "FINALIZE & PRINT"}
        </button>
      </div>

      {/* Professional Print Invoice (Hidden on Screen) */}
      <div className="print-only">
        <div style={{textAlign:'center'}}>
          <h2>PREMIUM CERAMICS</h2>
          <p>Address: Jaranwala Road</p>
          <hr/>
        </div>
        {cart.map((c, i) => (
          <div key={i} style={{display:'flex', justifyContent:'space-between'}}>
            <span>{c.name} x{c.qty}</span>
            <span>{c.qty * c.retailPrice}</span>
          </div>
        ))}
        <hr/>
        <div style={{fontWeight:'bold'}}>TOTAL: Rs. {grandTotal}</div>
        <p style={{textAlign:'center', marginTop:'20px'}}>Thank you!</p>
      </div>
    </div>
  );
};

export default SalesModule;
