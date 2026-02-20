import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addToCart = (item) => {
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.retailPrice * item.qty), 0);

  const completeSale = async () => {
    if (!customer || cart.length === 0) return alert("Fill details!");
    await addDoc(collection(db, "sales_records"), {
      customerName: customer,
      cart: cart,
      totalAmount: calculateTotal(),
      dateString: new Date().toLocaleDateString(),
      timestamp: new Date()
    });
    alert("Invoice Generated!");
    setCart([]);
    setCustomer('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
      <div>
        <h2 style={{ color: '#f59e0b' }}>🛒 New Sale</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '20px' }}>
          {items.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} style={{ background: '#111', padding: '15px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #222' }}>
              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
              <div style={{ color: '#f59e0b', fontSize: '12px' }}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
        <h3>Invoice</h3>
        <input style={{ ...inputStyle, width: '100%', marginBottom: '15px' }} placeholder="Customer Name" value={customer} onChange={(e)=>setCustomer(e.target.value)} />
        {cart.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>{c.name} x {c.qty}</span>
            <span>{c.retailPrice * c.qty}</span>
          </div>
        ))}
        <hr style={{ borderColor: '#222' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', margin: '20px 0' }}>Total: Rs. {calculateTotal()}</div>
        <button onClick={completeSale} style={{ width: '100%', padding: '12px', background: '#10b981', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>PRINT & SAVE</button>
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '5px' };

export default SalesModule;
