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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .pos-wrapper {
      background: #000; min-height: 100vh; padding: 20px; padding-top: 80px;
      font-family: 'Outfit', sans-serif; color: #fff;
      display: flex; flex-direction: column; gap: 20px;
    }

    .stylish-input {
      width: 100%; padding: 20px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(212,175,55,0.3); border-radius: 20px;
      color: #fff; font-size: 18px; font-weight: 600; outline: none; transition: 0.3s;
    }
    .stylish-input:focus { border-color: #D4AF37; box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }

    .item-grid-stylish {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;
    }

    .product-box {
      background: linear-gradient(145deg, #111, #050505);
      padding: 20px; border-radius: 25px; border: 1px solid #222;
      text-align: center; transition: 0.3s; cursor: pointer;
    }
    .product-box:hover { border-color: #D4AF37; transform: translateY(-5px); }
    .product-box strong { font-size: 18px; display: block; margin-bottom: 5px; }
    .product-box span { color: #D4AF37; font-weight: 900; }

    .checkout-glass {
      background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px);
      border-radius: 40px 40px 0 0; padding: 30px;
      border: 1px solid rgba(212, 175, 55, 0.2);
      position: sticky; bottom: 0; margin: 0 -20px;
    }

    .btn-checkout {
      width: 100%; padding: 20px; background: linear-gradient(45deg, #D4AF37, #f9e2af);
      color: #000; border: none; border-radius: 20px; font-size: 20px; font-weight: 900;
      cursor: pointer; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
    }

    @media (min-width: 900px) {
      .pos-wrapper { flex-direction: row; align-items: flex-start; }
      .checkout-glass { position: sticky; top: 100px; width: 400px; border-radius: 40px; margin: 0; }
    }
  `;

  const total = cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);

  return (
    <div className="pos-wrapper">
      <style>{styles}</style>
      
      <div style={{flex: 1}}>
        <h2 className="gold-gradient-text" style={{fontSize: '30px', marginBottom: '20px'}}>SELECT ITEMS</h2>
        <input className="stylish-input" placeholder="Search product name..." onChange={e => setSearchTerm(e.target.value)} style={{marginBottom: '20px'}} />
        
        <div className="item-grid-stylish">
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="product-box" onClick={() => addToCart(item)}>
              <strong>{item.name}</strong>
              <span>Rs. {item.retailPrice}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="checkout-glass">
        <h2 className="gold-gradient-text" style={{marginTop: 0}}>CHECKOUT</h2>
        <input className="stylish-input" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{marginBottom: '20px'}} />
        
        <div style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '20px'}}>
          {cart.map((c, i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222'}}>
              <span style={{fontSize: '18px', fontWeight: 600}}>{c.name} x{c.quantity}</span>
              <span style={{fontWeight: 900}}>Rs. {c.quantity * c.salePrice}</span>
            </div>
          ))}
        </div>

        <div style={{textAlign: 'center', marginBottom: '20px'}}>
          <span style={{color: '#888', fontSize: '14px'}}>TOTAL PAYABLE</span>
          <div style={{fontSize: '40px', fontWeight: 900, color: '#D4AF37'}}>Rs. {total.toLocaleString()}</div>
        </div>

        <button className="btn-checkout">FINALIZE & PRINT</button>
      </div>
    </div>
  );
};

export default SalesModule;
