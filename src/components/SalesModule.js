import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  
  // Billing States
  const [discount, setDiscount] = useState({ type: 'cash', val: 0 });
  const [rent, setRent] = useState({ type: 'cash', val: 0 });
  const [loading, setLoading] = useState({ type: 'cash', val: 0 });

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

  const calculateFinal = () => {
    const sub = cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);
    const getVal = (obj) => obj.type === 'percent' ? (sub * (parseFloat(obj.val || 0) / 100)) : parseFloat(obj.val || 0);
    return sub - getVal(discount) + getVal(rent) + getVal(loading);
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
    
    .pos-layout {
      display: flex; flex-direction: column; background: #000; min-height: 100vh;
      font-family: 'Outfit', sans-serif; color: #fff; padding: 15px; padding-top: 60px;
    }

    .search-section { margin-bottom: 20px; }
    .pos-input { 
      width: 100%; padding: 15px; background: #111; border: 2px solid #222; 
      color: #fff; border-radius: 15px; font-size: 18px; /* Bigger Text */
      margin-bottom: 10px; box-sizing: border-box;
    }
    .pos-input:focus { border-color: #D4AF37; outline: none; }

    .item-scroll { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
      gap: 15px; max-height: 40vh; overflow-y: auto; margin-bottom: 20px;
    }
    .item-card { 
      background: #111; padding: 15px; border-radius: 20px; border: 1px solid #222; 
      text-align: center; cursor: pointer;
    }
    .item-card:active { transform: scale(0.95); background: #D4AF37; color: #000; }

    .bill-section { 
      background: #0a0a0a; border: 2px solid #D4AF37; border-radius: 25px; padding: 20px;
    }
    
    .cart-row { 
      display: flex; justify-content: space-between; padding: 10px 0; 
      border-bottom: 1px solid #1a1a1a; font-size: 16px; font-weight: bold;
    }

    .total-box { 
      background: #D4AF37; color: #000; padding: 20px; border-radius: 20px; 
      text-align: center; margin-top: 20px;
    }
    .total-box h2 { margin: 0; font-size: 32px; font-weight: 900; }

    @media (min-width: 900px) {
      .pos-layout { flex-direction: row; gap: 20px; }
      .search-section { flex: 1.5; }
      .bill-section { flex: 1; height: fit-content; position: sticky; top: 70px; }
    }
  `;

  return (
    <div className="pos-layout">
      <style>{styles}</style>
      
      <div className="search-section">
        <h2 style={{color: '#D4AF37'}}>ITEMS</h2>
        <input className="pos-input" placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div className="item-scroll">
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
              <div style={{fontWeight:900, fontSize:'16px'}}>{item.name}</div>
              <div style={{color:'#D4AF37', marginTop:5}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bill-section">
        <h2 style={{color: '#D4AF37', marginTop: 0}}>BILLING</h2>
        <input className="pos-input" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        
        <div style={{maxHeight:'200px', overflowY:'auto'}}>
          {cart.map((c, i) => (
            <div className="cart-row" key={i}>
              <span>{c.name} (x{c.quantity})</span>
              <span>Rs. {c.quantity * c.salePrice}</span>
            </div>
          ))}
        </div>

        <div className="total-box">
          <small>PAYABLE AMOUNT</small>
          <h2>Rs. {calculateFinal().toLocaleString()}</h2>
        </div>
        
        <button style={{width:'100%', padding:'20px', background:'#3fb950', border:'none', borderRadius:'20px', color:'#fff', fontWeight:900, fontSize:'18px', marginTop:'15px', cursor:'pointer'}}>
          FINALIZE & PRINT
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
