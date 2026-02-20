import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const addToCart = (item) => {
    if(item.stock <= 0) return alert("Stock empty!");
    setCart([...cart, item]);
  };

  const handleCheckout = async () => {
    const total = cart.reduce((acc, i) => acc + i.retailPrice, 0);
    await addDoc(collection(db, "sales_records"), {
      totalAmount: total,
      timestamp: new Date(),
      date: new Date().toLocaleDateString()
    });
    alert("Sold!");
    setCart([]);
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1, background: 'white', padding: '15px', borderRadius: '10px' }}>
        {items.map(i => <button key={i.id} onClick={() => addToCart(i)} style={{margin:'5px'}}>{i.name}</button>)}
      </div>
      <div style={{ width: '300px', background: '#eee', padding: '15px', borderRadius: '10px' }}>
        <h3>Cart Total: {cart.reduce((acc, i) => acc + i.retailPrice, 0)}</h3>
        <button onClick={handleCheckout} style={{width:'100%', padding:'10px', background:'green', color:'white'}}>Checkout</button>
      </div>
    </div>
  );
};

export default SalesModule;
