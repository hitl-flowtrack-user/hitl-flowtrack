import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const querySnapshot = await getDocs(collection(db, "inventory_records"));
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setInventory(items);
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.retailPrice * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart khali hai!");

    try {
      const orderData = {
        items: cart,
        total: calculateTotal(),
        timestamp: serverTimestamp(),
      };

      // 1. Save Sale Record
      const docRef = await addDoc(collection(db, "sales_records"), orderData);
      
      // 2. Update Inventory Stock
      for (const item of cart) {
        const itemRef = doc(db, "inventory_records", item.id);
        const newStock = Number(item.stock) - item.qty;
        await updateDoc(itemRef, { stock: newStock });
      }

      setLastOrder({ ...orderData, id: docRef.id });
      setShowReceipt(true);
      setCart([]);
      fetchInventory(); // Refresh stock
    } catch (err) {
      alert("Checkout Error: " + err.message);
    }
  };

  if (showReceipt) {
    return (
      <div style={receiptOverlay}>
        <div style={receiptBox}>
          <h2 style={{ color: '#f59e0b' }}>HITL-FLOWTRACK</h2>
          <p style={{ fontSize: '12px' }}>Date: {new Date().toLocaleString()}</p>
          <hr style={{ borderColor: '#333' }} />
          <div style={{ textAlign: 'left', margin: '20px 0' }}>
            {lastOrder.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{item.name} x {item.qty}</span>
                <span>Rs. {item.retailPrice * item.qty}</span>
              </div>
            ))}
          </div>
          <hr style={{ borderColor: '#333' }} />
          <h3 style={{ color: '#f59e0b' }}>Total: Rs. {lastOrder.total}</h3>
          <p style={{ fontSize: '10px', marginTop: '20px' }}>Shukriya! Phir Tashreef Layye ga.</p>
          <button onClick={() => window.print()} style={printBtn}>🖨️ Print Receipt</button>
          <button onClick={() => setShowReceipt(false)} style={closeBtn}>Back to Sales</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>🛒 SALES TERMINAL</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        {/* Items List */}
        <div style={gridStyle}>
          {inventory.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} style={itemCard}>
              <div style={{ fontSize: '24px' }}>📦</div>
              <h4 style={{ margin: '10px 0 5px' }}>{item.name}</h4>
              <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>Rs. {item.retailPrice}</p>
              <p style={{ fontSize: '10px', color: '#666' }}>Stock: {item.stock}</p>
            </div>
          ))}
        </div>

        {/* Cart / Billing Section */}
        <div style={cartSection}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Current Order</h3>
          <div style={{ height: '350px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={cartItem}>
                <span>{item.name} x {item.qty}</span>
                <span>Rs. {item.retailPrice * item.qty}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '2px solid #f59e0b', paddingTop: '15px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#f59e0b' }}>Rs. {calculateTotal()}</span>
            </div>
            <button onClick={handleCheckout} style={checkoutBtn}>COMPLETE CHECKOUT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' };
const itemCard = { background: '#111', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #333', cursor: 'pointer' };
const cartSection = { background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #333', height: 'fit-content' };
const cartItem = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222', fontSize: '14px' };
const checkoutBtn = { width: '100%', padding: '15px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' };
const receiptOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const receiptBox = { background: '#111', padding: '30px', borderRadius: '20px', width: '320px', textAlign: 'center', border: '1px solid #f59e0b' };
const printBtn = { background: '#f59e0b', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', margin: '10px', cursor: 'pointer' };
const closeBtn = { background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };

export default SalesModule;
