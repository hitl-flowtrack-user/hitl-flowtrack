import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment, query, orderBy } from "firebase/firestore";

const Salesmodule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Inventory for Sales
  useEffect(() => {
    const q = query(collection(db, "inventory_records"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  // 2. Add to Cart Logic
  const addToCart = (item) => {
    const stockQty = parseInt(item.stock) || 0;
    const inCart = cart.find(c => c.id === item.id);
    const currentCartQty = inCart ? inCart.qty : 0;

    if (stockQty <= currentCartQty) {
      alert("Stock khatam hai!");
      return;
    }

    if (inCart) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // 3. Remove/Decrease from Cart
  const removeFromCart = (id) => {
    const item = cart.find(c => c.id === id);
    if (item.qty > 1) {
      setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c));
    } else {
      setCart(cart.filter(c => c.id !== id));
    }
  };

  // 4. Final Checkout & Stock Update
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart khali hai!");
    const total = cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0);

    try {
      // Create Sale Record
      await addDoc(collection(db, "sales_records"), {
        customerName: customer || "Cash Customer",
        items: cart,
        totalAmount: total,
        timestamp: new Date(),
        date: new Date().toLocaleDateString()
      });

      // Update Inventory Stock (Deduct)
      for (const product of cart) {
        const itemRef = doc(db, "inventory_records", product.id);
        await updateDoc(itemRef, {
          stock: increment(-product.qty)
        });
      }

      alert("Sale Successful! Stock updated.");
      setCart([]);
      setCustomer('');
    } catch (err) {
      console.error(err);
      alert("Error in sale!");
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '10px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center', fontSize: '20px' }}>🛒 NEW SALE</h2>

      {/* Search & Customer Info */}
      <div style={{ marginBottom: '15px' }}>
        <input 
          style={inputStyle} placeholder="Search Product..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input 
          style={{...inputStyle, marginTop: '10px', borderColor: '#333'}} 
          placeholder="Customer Name (Optional)" 
          value={customer} onChange={(e) => setCustomer(e.target.value)}
        />
      </div>

      {/* Product Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', maxHeight: '250px', overflowY: 'auto', padding: '5px', background: '#111', borderRadius: '10px' }}>
        {filteredItems.map(item => (
          <div key={item.id} onClick={() => addToCart(item)} style={productCard}>
            <div style={{fontSize: '12px', fontWeight: 'bold'}}>{item.name}</div>
            <div style={{fontSize: '10px', color: '#10b981'}}>Rs. {item.retailPrice}</div>
            <div style={{fontSize: '9px', color: '#666'}}>Stock: {item.stock}</div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div style={cartSection}>
        <h4 style={{margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px', color: '#f59e0b'}}>Current Order</h4>
        <div style={{maxHeight: '150px', overflowY: 'auto'}}>
          {cart.map(c => (
            <div key={c.id} style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #222'}}>
              <span>{c.name} (x{c.qty})</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>Rs. {c.retailPrice * c.qty}</span>
                <button onClick={() => removeFromCart(c.id)} style={{background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0 5px'}}>-</button>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: '18px', fontWeight: 'bold'}}>Total: Rs. {cart.reduce((acc, i) => acc + (i.retailPrice * i.qty), 0)}</span>
          <button onClick={handleCheckout} style={checkoutBtn}>CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f59e0b', background: '#000', color: '#fff', boxSizing: 'border-box' };
const productCard = { background: '#222', padding: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #333' };
const cartSection = { marginTop: '20px', background: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #333' };
const checkoutBtn = { background: '#f59e0b', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default Salesmodule;
