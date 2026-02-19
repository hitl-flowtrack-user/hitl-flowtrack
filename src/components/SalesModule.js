import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [printSize, setPrintSize] = useState('A5');

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const addToCart = (i) => {
    const ex = cart.find(c => c.id === i.id);
    if(ex) setCart(cart.map(c => c.id === i.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...i, qty: 1}]);
  };

  const subTotal = cart.reduce((a, c) => a + (c.retailPrice * c.qty), 0);
  const grandTotal = subTotal - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleProcess = async () => {
    if(cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const invNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const data = {
      invoiceNo: invNo, customerName: customer || "Walking Customer",
      cart, subTotal, ...charges, totalAmount: grandTotal,
      createdAt: serverTimestamp(), dateString: new Date().toLocaleDateString()
    };
    await addDoc(collection(db, "sales_records"), data);
    window.print();
    setCart([]); setCustomer(''); setIsProcessing(false);
  };

  return (
    <div style={{background:'#000', minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 450px', padding:'20px', gap:'20px', fontFamily:'Inter'}}>
      
      {/* Left Selection */}
      <div style={{background:'#0a0a0a', padding:'25px', borderRadius:'20px', border:'1px solid #1a1a1a'}}>
        <h2 style={{color:'#D4AF37', fontWeight:800}}>POINT OF SALE</h2>
        <input style={{width:'100%', padding:'15px', background:'#000', border:'1px solid #333', borderRadius:'10px', color:'#fff', marginBottom:'20px'}} placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'15px', cursor:'pointer', border:'1px solid #222', textAlign:'center', color:'#fff'}} onClick={() => addToCart(item)}>
              <strong>{item.name}</strong><br/>Rs. {item.retailPrice}
            </div>
          ))}
        </div>
      </div>

      {/* Right Billing & Live Preview */}
      <div style={{background:'#0d0d0d', padding:'25px', borderRadius:'20px', border:'2px solid #D4AF37', height:'fit-content', position:'sticky', top:'20px'}}>
        <h3 style={{color:'#D4AF37', marginTop:0}}>BILLING TERMINAL</h3>
        <input style={{width:'100%', padding:'10px', background:'#000', color:'#fff', border:'1px solid #333', borderRadius:'8px'}} placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{margin:'20px 0', borderBottom:'1px solid #222', maxHeight:'200px', overflowY:'auto'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', color:'#fff'}}>
              <span>{c.name} x{c.qty}</span>
              <span>{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
           <select style={{padding:'10px', background:'#000', color:'#D4AF37', border:'1px solid #333'}} onChange={(e) => setPrintSize(e.target.value)}>
             <option value="A5">A5 Print</option>
             <option value="A4">A4 Print</option>
           </select>
           <input type="number" placeholder="Discount" style={{padding:'10px', background:'#000', color:'#fff', border:'1px solid #333'}} onChange={e => setCharges({...charges, discount: e.target.value})} />
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'20px', borderRadius:'15px', textAlign:'center'}}>
          <div style={{fontSize:'12px', fontWeight:800}}>GRAND TOTAL</div>
          <div style={{fontSize:'36px', fontWeight:900}}>Rs. {grandTotal}</div>
        </div>

        <button onClick={handleProcess} disabled={isProcessing} style={{width:'100%', padding:'18px', background:'#3fb950', border:'none', borderRadius:'15px', color:'#fff', fontWeight:900, marginTop:'15px', cursor:'pointer'}}>
          {isProcessing ? "PROCESSING..." : "FINALIZE & PRINT"}
        </button>
      </div>

      {/* Hidden Professional Print Area */}
      <div className={`invoice-box ${printSize}`} id="printable-bill" style={{display:'none'}}>
        {/* Invoice structure same as dashboard */}
      </div>
    </div>
  );
};

export default SalesModule;
