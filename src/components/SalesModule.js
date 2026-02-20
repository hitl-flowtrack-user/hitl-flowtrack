import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addToCart = (item) => {
    if (parseInt(item.stock) <= 0) return alert("Stock khatam hai!");
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const submitSale = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0);
    
    try {
      await addDoc(collection(db, "sales_records"), {
        customerName: customer || "Cash Customer",
        cart,
        totalAmount: total,
        timestamp: new Date(),
        dateString: new Date().toLocaleDateString()
      });

      for (const item of cart) {
        await updateDoc(doc(db, "inventory_records", item.id), { stock: increment(-item.qty) });
      }

      alert("Sale Saved!");
      setCart([]); setCustomer('');
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
        <h3>Select Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
          {items.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
              <div style={{ color: '#3b82f6' }}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#1e3a8a', color: 'white', padding: '20px', borderRadius: '15px' }}>
        <h3>Order Summary</h3>
        <input style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none' }} placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
        <div style={{ minHeight: '150px' }}>
          {cart.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
              <span>{c.name} x{c.qty}</span>
              <span>{c.retailPrice * c.qty}</span>
            </div>
          ))}
        </div>
        <h2 style={{ borderTop: '1px solid #ffffff33', paddingTop: '10px' }}>Total: Rs. {cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0)}</h2>
        <button onClick={submitSale} style={{ width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>COMPLETE SALE</button>
      </div>
    </div>
  );
};

export default SalesModule;
