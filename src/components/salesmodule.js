import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    const querySnapshot = await getDocs(collection(db, "inventory_records"));
    setInventory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addToCart = (item) => {
    if (item.stock <= 0) return alert("Stock khatam hai!");
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
      const orderData = { items: cart, total: calculateTotal(), timestamp: serverTimestamp() };
      const docRef = await addDoc(collection(db, "sales_records"), orderData);
      for (const item of cart) {
        const itemRef = doc(db, "inventory_records", item.id);
        await updateDoc(itemRef, { stock: Number(item.stock) - item.qty });
      }
      setLastOrder({ ...orderData, id: docRef.id });
      setShowReceipt(true);
      setCart([]);
      fetchInventory();
    } catch (err) { alert("Error: " + err.message); }
  };

  if (showReceipt) {
    return (
      <div style={receiptOverlay}>
        <div style={receiptBox}>
          <h2 style={{ color: '#f59e0b' }}>HITL-FLOWTRACK</h2>
          <div style={{ textAlign: 'left', margin: '15px 0', fontSize: '14px' }}>
            {lastOrder.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} x{item.qty}</span>
                <span>Rs.{item.retailPrice * item.qty}</span>
              </div>
            ))}
          </div>
          <h3 style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>Total: Rs.{lastOrder.total}</h3>
          <button onClick={() => { window.print(); setShowReceipt(false); }} style={printBtn}>Print & Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center', fontSize: '1.2rem' }}>🛒 SALES TERMINAL</h2>
      
      {/* Responsive Layout Wrapper */}
      <div className="sales-layout" style={layoutWrapper}>
        
        {/* Inventory Section */}
        <div style={inventorySection}>
          <div style={mobileGrid}>
            {inventory.map(item => (
              <div key={item.id} onClick={() => addToCart(item)} style={itemCard}>
                <div style={{fontSize: '20px'}}>📦</div>
                <div style={{fontWeight: 'bold', fontSize: '13px'}}>{item.name}</div>
                <div style={{color: '#f59e0b', fontSize: '12px'}}>Rs.{item.retailPrice}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating/Bottom Cart for Mobile */}
        <div style={cartSection}>
          <h4 style={{margin: '0 0 10px 0', borderBottom: '1px solid #333'}}>Current Order ({cart.length})</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
            {cart.map(item => (
              <div key={item.id} style={cartItem}>
                <span>{item.name} x{item.qty}</span>
                <span>Rs.{item.retailPrice * item.qty}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{fontSize: '18px', fontWeight: 'bold'}}>Total: Rs.{calculateTotal()}</span>
            <button onClick={handleCheckout} style={checkoutBtn}>CHECKOUT</button>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Mobile-First CSS (In JS) ---
const containerStyle = { padding: '10px', background: '#000', minHeight: '100vh', color: '#fff' };
const layoutWrapper = { display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '15px' };
const inventorySection = { flex: 1, marginBottom: window.innerWidth < 768 ? '180px' : '0' };
const mobileGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' };
const itemCard = { background: '#111', padding: '10px', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' };
const cartSection = { 
  background: '#1a1a1a', padding: '15px', borderRadius: '20px 20px 0 0', borderTop: '2px solid #f59e0b',
  position: window.innerWidth < 768 ? 'fixed' : 'sticky', 
  bottom: 0, left: 0, right: 0, zIndex: 100,
  width: window.innerWidth < 768 ? '100%' : '350px',
  boxSizing: 'border-box'
};
const cartItem = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' };
const checkoutBtn = { background: '#f59e0b', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold' };
const receiptOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const receiptBox = { background: '#111', padding: '20px', borderRadius: '15px', width: '90%', maxWidth: '300px', textAlign: 'center', border: '1px solid #f59e0b' };
const printBtn = { background: '#f59e0b', border: 'none', padding: '10px', borderRadius: '5px', width: '100%', marginTop: '15px', fontWeight: 'bold' };

export default SalesModule;
