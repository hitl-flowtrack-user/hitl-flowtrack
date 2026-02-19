import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');

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

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
    
    .pos-root { background: #000; min-height: 100vh; padding: 20px; padding-top: 60px; font-family: 'Outfit', sans-serif; }
    
    .search-bar { 
      width: 100%; padding: 18px; background: #0a0a0a; border: 2px solid #222; 
      border-radius: 20px; color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 25px;
    }
    .search-bar:focus { border-color: #D4AF37; outline: none; box-shadow: 0 0 20px rgba(212,175,55,0.1); }

    .items-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; margin-bottom: 120px; }
    
    .item-box {
      background: #0d0d0d; border: 1px solid #1a1a1a; padding: 20px; border-radius: 25px; 
      text-align: center; transition: 0.3s; cursor: pointer; border-bottom: 4px solid #D4AF37;
    }
    .item-box:hover { transform: translateY(-5px); background: #111; }
    .item-box strong { display: block; font-size: 18px; margin-bottom: 8px; }
    .item-box span { color: #D4AF37; font-weight: 900; font-size: 16px; }

    .floating-checkout {
      position: fixed; bottom: 20px; left: 20px; right: 20px;
      background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(20px);
      border: 1px solid rgba(212,175,55,0.3); border-radius: 30px;
      padding: 20px; display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    }

    .btn-pay {
      background: #D4AF37; color: #000; padding: 15px 30px; border-radius: 18px;
      font-weight: 900; border: none; font-size: 18px; cursor: pointer;
    }

    @media (max-width: 600px) {
      .floating-checkout { flex-direction: column; gap: 15px; text-align: center; }
      .btn-pay { width: 100%; }
    }
  `;

  const total = cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);

  return (
    <div className="pos-root">
      <style>{styles}</style>
      
      <h2 style={{color: '#D4AF37', fontWeight: 900, fontSize: '30px'}}>SALES TERMINAL</h2>
      <input className="search-bar" placeholder="🔍 Search Product Name..." onChange={e => setSearchTerm(e.target.value)} />
      
      <div className="items-container">
        {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
          <div key={item.id} className="item-box" onClick={() => addToCart(item)}>
            <strong>{item.name}</strong>
            <span>Rs. {item.retailPrice}</span>
            <div style={{fontSize:'10px', color:'#444', marginTop:'5px'}}>STOCK: {item.totalPcs}</div>
          </div>
        ))}
      </div>

      <div className="floating-checkout">
        <div>
          <input 
            style={{background: 'transparent', border:'none', borderBottom:'1px solid #333', color:'#fff', padding:'5px', marginBottom:'5px', fontSize:'16px', outline:'none'}} 
            placeholder="Customer Name..."
            onChange={e => setCustomerName(e.target.value)}
          />
          <div style={{color: '#888', fontSize:'12px'}}>TOTAL PAYABLE: <span style={{color:'#D4AF37', fontWeight:900, fontSize:'20px'}}>Rs. {total.toLocaleString()}</span></div>
        </div>
        <button className="btn-pay" onClick={() => alert("Printing Bill...")}>FINALIZE & PRINT</button>
      </div>
    </div>
  );
};

export default SalesModule;
