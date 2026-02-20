import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addToCart = (item) => {
    if (parseInt(item.stock) <= 0) return alert("Out of Stock!");
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    try {
      const total = cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0);
      await addDoc(collection(db, "sales_records"), {
        customerName: customer || "Cash Customer",
        cart,
        totalAmount: total,
        timestamp: new Date(),
        dateString: new Date().toLocaleDateString()
      });

      // Stock auto-deduct logic
      for (const item of cart) {
        const itemRef = doc(db, "inventory_records", item.id);
        await updateDoc(itemRef, { stock: increment(-item.qty) });
      }

      alert("Sale Successful!");
      setCart([]);
      setCustomer('');
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px' }}>
        <input 
          placeholder="Search Products..." 
          style={{ width: '95%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '20px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} onClick={() => addToCart(item)} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{fontWeight: 'bold'}}>{item.name}</div>
              <div style={{color: '#3b82f6', fontSize: '14px'}}>Rs. {item.retailPrice}</div>
              <div style={{fontSize: '11px', color: '#999'}}>Stock: {item.stock}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#1e3a8a', color: 'white', padding: '25px', borderRadius: '15px', position: 'sticky', top: '20px', height: 'fit-content' }}>
        <h3>Current Order</h3>
        <input 
          placeholder="Customer Name" 
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', marginBottom: '15px' }}
          value={customer} onChange={(e) => setCustomer(e.target.value)}
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          {cart.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ffffff22', paddingBottom: '5px' }}>
              <span>{c.name} x{c.qty}</span>
              <span>{c.retailPrice * c.qty}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', borderTop: '2px solid white', paddingTop: '15px' }}>
          Total: Rs. {cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0)}
        </div>
        <button onClick={completeSale} style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          PAY & GENERATE INVOICE
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
