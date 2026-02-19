import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');

  // Complex Billing states
  const [extraCharges, setExtraCharges] = useState({ discount: 0, labour: 0, freight: 0 });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1, salePrice: item.retailPrice }]);
    }
  };

  const calculateSubTotal = () => cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);
  const finalTotal = () => calculateSubTotal() - extraCharges.discount + parseFloat(extraCharges.labour || 0) + parseFloat(extraCharges.freight || 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap');
    .pos-container { background: #000; min-height: 100vh; padding: 20px; padding-top: 70px; font-family: 'Outfit', sans-serif; color: #fff; }
    
    .main-grid { display: grid; grid-template-columns: 1fr 400px; gap: 25px; }

    .panel { background: #0a0a0a; border: 1px solid #222; border-radius: 35px; padding: 25px; }

    .item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; max-height: 70vh; overflow-y: auto; }
    
    .item-card { 
      background: #111; padding: 15px; border-radius: 20px; border: 1px solid #1a1a1a; 
      transition: 0.2s; cursor: pointer; text-align: center;
    }
    .item-card:hover { border-color: #D4AF37; background: #161616; }

    .bill-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #111; }
    
    .charge-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
    .charge-box { background: #111; padding: 12px; border-radius: 15px; border: 1px solid #222; }
    .charge-box label { font-size: 11px; color: #555; text-transform: uppercase; display: block; }
    .charge-box input { background: transparent; border: none; color: #D4AF37; width: 100%; font-size: 16px; font-weight: 900; outline: none; }

    .btn-checkout { 
      width: 100%; padding: 20px; background: #D4AF37; color: #000; border: none; 
      border-radius: 20px; font-weight: 900; font-size: 18px; margin-top: 20px; cursor: pointer;
      box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
    }

    @media (max-width: 950px) {
      .main-grid { grid-template-columns: 1fr; }
      .panel { border-radius: 25px; }
    }
  `;

  return (
    <div className="pos-container">
      <style>{styles}</style>
      
      <div className="main-grid">
        {/* Left: Inventory Section */}
        <div className="panel">
          <h2 style={{marginTop: 0, color: '#D4AF37'}}>INVENTORY TERMINAL</h2>
          <input 
            style={{width:'100%', padding:'15px', background:'#111', border:'1px solid #333', borderRadius:'15px', color:'#fff', marginBottom:'20px', fontSize:'16px'}}
            placeholder="Search items..." onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="item-grid">
            {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
              <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
                <div style={{fontWeight:600}}>{item.name}</div>
                <div style={{color:'#D4AF37', fontWeight:900}}>Rs. {item.retailPrice}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Bill Section */}
        <div className="panel" style={{borderColor: '#D4AF37', background: 'linear-gradient(180deg, #0a0a0a, #000)'}}>
          <h3 style={{marginTop: 0}}>BILL SUMMARY</h3>
          <input 
            style={{width:'100%', padding:'12px', background:'#111', border:'1px solid #333', borderRadius:'12px', color:'#fff', marginBottom:'15px'}}
            placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)}
          />

          <div style={{minHeight:'150px', maxHeight:'250px', overflowY:'auto'}}>
            {cart.map((c, i) => (
              <div className="bill-row" key={i}>
                <span>{c.name} <small style={{color:'#444'}}>x{c.quantity}</small></span>
                <span style={{fontWeight:900}}>Rs. {c.quantity * c.salePrice}</span>
              </div>
            ))}
          </div>

          <div className="charge-input-grid">
            <div className="charge-box"><label>Discount</label><input type="number" onChange={e => setExtraCharges({...extraCharges, discount: e.target.value})} /></div>
            <div className="charge-box"><label>Labour</label><input type="number" onChange={e => setExtraCharges({...extraCharges, labour: e.target.value})} /></div>
            <div className="charge-box"><label>Freight</label><input type="number" onChange={e => setExtraCharges({...extraCharges, freight: e.target.value})} /></div>
          </div>

          <div style={{marginTop:'25px', padding:'20px', background:'#111', borderRadius:'20px', textAlign:'center'}}>
            <span style={{fontSize:'12px', color:'#555'}}>TOTAL PAYABLE</span>
            <div style={{fontSize:'32px', fontWeight:900, color:'#D4AF37'}}>Rs. {finalTotal().toLocaleString()}</div>
          </div>

          <button className="btn-checkout">FINALIZE & PRINT</button>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
