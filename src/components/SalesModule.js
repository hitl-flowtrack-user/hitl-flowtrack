import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch items for selection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) return; // Already in cart

    setCart([...cart, { ...item, quantity: 1, salePrice: item.retailPrice }]);
  };

  const updateCartQty = (id, newQty) => {
    setCart(cart.map(c => c.id === id ? { ...c, quantity: parseInt(newQty) || 0 } : c));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, c) => acc + (parseFloat(c.salePrice) * c.quantity), 0);
  };

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Please add customer and items!");
    
    setLoading(true);
    try {
      // 1. Save Sale Record
      await addDoc(collection(db, "sales_records"), {
        customerName,
        items: cart,
        totalAmount: calculateTotal(),
        createdAt: serverTimestamp()
      });

      // 2. Update Inventory (Minus Stock)
      for (const product of cart) {
        const itemRef = doc(db, "inventory_records", product.id);
        const newStockPcs = (parseFloat(product.totalPcs) || 0) - product.quantity;
        // Calculate new boxes (pcs / pcsPerBox)
        const newBoxes = newStockPcs / (parseFloat(product.pcsPerBox) || 1);
        
        await updateDoc(itemRef, {
          totalPcs: newStockPcs,
          openingStock: newBoxes.toFixed(2) // Updating boxes accordingly
        });
      }

      alert("Sale Successful! Stock Updated.");
      setCart([]);
      setCustomerName('');
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const styles = `
    .sales-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
    .item-list { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; max-height: 80vh; overflow-y: auto; }
    .cart-panel { background: #111; padding: 25px; border-radius: 20px; border: 1px solid #222; border-top: 5px solid #10b981; }
    .search-input { width: 90%; padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 15px; }
    .product-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #222; cursor: pointer; }
    .product-row:hover { background: #1a1a1a; }
    .cart-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .cart-table th { text-align: left; color: #f59e0b; padding: 10px; font-size: 12px; }
    .qty-input { width: 50px; padding: 5px; background: #000; border: 1px solid #444; color: #fff; border-radius: 5px; }
    .checkout-btn { width: 100%; padding: 15px; background: #10b981; color: #000; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; margin-top: 20px; }
    .checkout-btn:disabled { background: #444; cursor: not-allowed; }
  `;

  return (
    <div className="sales-container">
      <style>{styles}</style>
      
      {/* Left Side: Product Selection */}
      <div className="item-list">
        <h3 style={{color: '#f59e0b', marginBottom:'20px'}}>Select Products</h3>
        <input type="text" className="search-input" placeholder="Search Item/SKU..." />
        {items.map(item => (
          <div className="product-row" key={item.id} onClick={() => addToCart(item)}>
            <div>
              <div style={{fontWeight:'bold'}}>{item.name}</div>
              <small style={{color:'#888'}}>Stock: {item.totalPcs} Pcs</small>
            </div>
            <div style={{color: '#10b981'}}>Rs. {item.retailPrice}</div>
          </div>
        ))}
      </div>

      {/* Right Side: Billing Cart */}
      <div className="cart-panel">
        <h3 style={{color: '#10b981', marginBottom:'20px'}}>Billing Invoice</h3>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Customer Name" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <table className="cart-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td><input type="number" className="qty-input" value={c.quantity} onChange={(e) => updateCartQty(c.id, e.target.value)} /></td>
                <td>{c.salePrice}</td>
                <td>{c.quantity * c.salePrice}</td>
                <td><button onClick={() => removeFromCart(c.id)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{marginTop:'30px', borderTop:'2px solid #222', paddingTop:'20px'}}>
          <div style={{display:'flex', justifyBetween:'space-between', fontSize:'20px', fontWeight:'900'}}>
            <span>Grand Total:</span>
            <span style={{color: '#10b981', marginLeft:'auto'}}>Rs. {calculateTotal().toLocaleString()}</span>
          </div>
          <button 
            className="checkout-btn" 
            onClick={handleSale}
            disabled={loading || cart.length === 0}
          >
            {loading ? "PROCESSING..." : "FINALIZE SALE & PRINT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
