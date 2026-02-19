import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addToCart = (item) => {
    const exist = cart.find(c => c.id === item.id);
    if (exist) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const subTotal = cart.reduce((acc, c) => acc + (c.retailPrice * c.qty), 0);
  const grandTotal = subTotal - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleProcessSale = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const saleData = {
      customerName: customer,
      cart,
      subTotal,
      ...charges,
      totalAmount: grandTotal,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, "sales_records"), saleData);
      alert("Sale Saved Successfully!");
      window.print(); // Triggers Print
      setCart([]); setCustomer('');
    } catch (e) { console.error(e); }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
    .pos-wrapper { background: #000; min-height: 100vh; padding: 20px; font-family: 'Outfit', sans-serif; display: grid; grid-template-columns: 1fr 450px; gap: 20px; }
    
    .inventory-panel { background: #0a0a0a; border-radius: 30px; padding: 25px; border: 1px solid #1a1a1a; }
    .billing-panel { background: #0d0d0d; border-radius: 30px; padding: 25px; border: 1px solid #D4AF37; position: sticky; top: 20px; height: fit-content; }

    .item-card { 
      background: #111; padding: 15px; border-radius: 20px; text-align: center; border: 1px solid #222; cursor: pointer; transition: 0.2s;
    }
    .item-card:hover { border-color: #D4AF37; transform: scale(1.02); }

    .input-pro { width: 100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 12px; color: #fff; margin-bottom: 15px; outline: none; }
    .input-pro:focus { border-color: #D4AF37; }

    .total-display { background: #D4AF37; color: #000; padding: 20px; border-radius: 20px; text-align: center; margin-top: 20px; }
    
    @media print {
      .inventory-panel, .input-pro, .btn-main { display: none !important; }
      .billing-panel { border: none; width: 100%; position: static; color: #000 !important; background: #fff !important; }
      .pos-wrapper { display: block; background: #fff; }
    }
    @media (max-width: 900px) { .pos-wrapper { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="pos-wrapper">
      <style>{styles}</style>
      
      <div className="inventory-panel">
        <h2 style={{color:'#D4AF37', marginTop:0}}>TERMINAL</h2>
        <input className="input-pro" placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'12px'}}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
              <div style={{fontWeight:700, fontSize:'14px'}}>{item.name}</div>
              <div style={{color:'#D4AF37', fontWeight:900}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="billing-panel">
        <h3 style={{marginTop:0, color:'#D4AF37'}}>BILLING CONSOLE</h3>
        <input className="input-pro" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        
        <div style={{maxHeight:'200px', overflowY:'auto', borderBottom:'1px solid #222'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display:'flex', justifyBetween:'space-between', padding:'10px 0'}}>
              <span style={{flex:1}}>{c.name} x{c.qty}</span>
              <span style={{fontWeight:900}}>Rs. {c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'15px'}}>
          <div><label style={{fontSize:'10px'}}>DISC</label><input className="input-pro" type="number" onChange={e => setCharges({...charges, discount: e.target.value})} /></div>
          <div><label style={{fontSize:'10px'}}>LABOUR</label><input className="input-pro" type="number" onChange={e => setCharges({...charges, labour: e.target.value})} /></div>
          <div><label style={{fontSize:'10px'}}>FRT</label><input className="input-pro" type="number" onChange={e => setCharges({...charges, freight: e.target.value})} /></div>
        </div>

        <div className="total-display">
          <div style={{fontSize:'12px', fontWeight:700}}>GRAND TOTAL</div>
          <div style={{fontSize:'36px', fontWeight:900}}>Rs. {grandTotal.toLocaleString()}</div>
        </div>

        <button className="btn-main" onClick={handleProcessSale} style={{width:'100%', padding:'20px', background:'#3fb950', border:'none', borderRadius:'20px', color:'#fff', fontWeight:900, fontSize:'18px', marginTop:'15px', cursor:'pointer'}}>
          SAVE & PRINT BILL
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
