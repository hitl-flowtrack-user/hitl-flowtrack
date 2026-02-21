import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert("Stock Out!");
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setTotal(total + product.retailPrice);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      await addDoc(collection(db, "sales_records"), {
        items: cart,
        total: total,
        timestamp: serverTimestamp()
      });
      
      // Update Stock
      for (const item of cart) {
        const itemRef = doc(db, "inventory_records", item.id);
        await updateDoc(itemRef, { stock: item.stock - item.qty });
      }
      
      alert("Sale Successful!");
      setCart([]);
      setTotal(0);
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h3>🛒 SALES TERMINAL</h3>
      <div className="module-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
        {items.map(item => (
          <div key={item.id} className="module-item" onClick={() => addToCart(item)}>
            <div className="icon-box">📦</div>
            <div style={{ flex: 1 }}>
              <strong>{item.name}</strong>
              <p>Price: Rs.{item.retailPrice} | Stock: {item.stock}</p>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ background: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #f59e0b' }}>
          <h4>Current Bill: Rs. {total}</h4>
          {cart.map(c => <p key={c.id} style={{fontSize: '12px'}}>{c.name} x {c.qty}</p>)}
          <button onClick={checkout} style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#000', marginTop: '10px', borderRadius: '10px' }}>COMPLETE SALE</button>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
