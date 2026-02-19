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

  useEffect(() => {
    onSnapshot(collection(db, "inventory_records"), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const addToCart = (i) => {
    const ex = cart.find(c => c.id === i.id);
    if(ex) setCart(cart.map(c => c.id === i.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...i, qty: 1}]);
  };

  const subTotal = cart.reduce((a, c) => a + (parseFloat(c.retailPrice) * c.qty), 0);
  const grandTotal = subTotal - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleSaveSale = async () => {
    if(cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
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
      alert("✅ SALE SAVED SUCCESSFULLY!");
      setCart([]); setCustomer('');
      setCharges({ discount: 0, labour: 0, freight: 0 });
    } catch(e) { 
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{background:'#000', minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 400px', padding:'20px', gap:'20px', fontFamily:'Arial'}}>
      {/* Product Area */}
      <div style={{background:'#0a0a0a', padding:'25px', borderRadius:'15px', border:'1px solid #1a1a1a'}}>
        <h2 style={{color:'#D4AF37', marginTop:0}}>SALE TERMINAL</h2>
        <input style={{width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#fff', marginBottom:'20px'}} placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'10px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} style={{background:'#111', padding:'15px', borderRadius:'10px', cursor:'pointer', border:'1px solid #222', textAlign:'center', color:'#fff'}} onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold', fontSize:'14px'}}>{item.name}</div>
              <div style={{color:'#D4AF37', fontSize:'12px'}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Calculation Area */}
      <div style={{background:'#0d0d0d', padding:'20px', borderRadius:'15px', border:'1px solid #D4AF37', height:'fit-content'}}>
        <h3 style={{color:'#D4AF37', marginTop:0}}>BILL DETAILS</h3>
        <input style={{width:'100%', padding:'10px', background:'#000', color:'#fff', border:'1px solid #333', borderRadius:'5px', marginBottom:'15px'}} placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{maxHeight:'250px', overflowY:'auto', borderBottom:'1px solid #222', marginBottom:'15px'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', color:'#fff', fontSize:'13px'}}>
              <span>{c.name} (x{c.qty})</span>
              <span>{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'15px'}}>
           <input type="number" placeholder="Labour" style={{padding:'8px', background:'#000', color:'#fff', border:'1px solid #333'}} onChange={e => setCharges({...charges, labour: e.target.value})} />
           <input type="number" placeholder="Freight" style={{padding:'8px', background:'#000', color:'#fff', border:'1px solid #333'}} onChange={e => setCharges({...charges, freight: e.target.value})} />
           <input type="number" placeholder="Discount" style={{padding:'8px', background:'#000', color:'#fff', border:'1px solid #333'}} onChange={e => setCharges({...charges, discount: e.target.value})} />
        </div>

        <div style={{background:'#D4AF37', color:'#000', padding:'15px', borderRadius:'10px', textAlign:'center'}}>
          <div style={{fontSize:'30px', fontWeight:'900'}}>Rs. {grandTotal}</div>
        </div>

        <button onClick={handleSaveSale} disabled={isProcessing} style={{width:'100%', padding:'15px', background:'#3fb950', border:'none', borderRadius:'10px', color:'#fff', fontWeight:'bold', marginTop:'15px', cursor:'pointer'}}>
          {isProcessing ? "SAVING..." : "SAVE & PROCESS"}
        </button>
        <p style={{fontSize:'10px', color:'#555', textAlign:'center', marginTop:'10px'}}>*Open Dashboard to View/Print Invoice</p>
      </div>
    </div>
  );
};

export default SalesModule;
