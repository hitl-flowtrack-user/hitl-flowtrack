import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      updateCartQty(item.id, existing.quantity + 1);
    } else {
      setCart([...cart, { ...item, quantity: 1, salePrice: item.retailPrice }]);
    }
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

  const printInvoice = (saleData) => {
    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${saleData.customerName}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
            .total-sec { text-align: right; margin-top: 20px; font-size: 1.2em; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header"><h1>INVENTORY STORE</h1><p>Sales Receipt</p></div>
          <p><strong>Customer:</strong> ${saleData.customerName}</p>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${saleData.items.map(item => `
                <tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.salePrice}</td><td>${(item.quantity * item.salePrice).toLocaleString()}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-sec">Grand Total: Rs. ${saleData.totalAmount.toLocaleString()}</div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Please add customer and items!");
    
    setLoading(true);
    const batch = writeBatch(db);

    try {
      // 1. Create a reference for the new sale document
      const saleRef = doc(collection(db, "sales_records"));
      const saleData = {
        customerName,
        items: cart,
        totalAmount: calculateTotal(),
        createdAt: serverTimestamp()
      };

      // 2. Add Sale Record to Batch
      batch.set(saleRef, saleData);

      // 3. Add Inventory Updates to Batch
      cart.forEach(product => {
        const itemRef = doc(db, "inventory_records", product.id);
        const currentPcs = parseFloat(product.totalPcs) || 0;
        const newStockPcs = currentPcs - product.quantity;
        const pcsPerBox = parseFloat(product.pcsPerBox) || 1;
        const newBoxes = newStockPcs / pcsPerBox;
        
        batch.update(itemRef, {
          totalPcs: newStockPcs,
          openingStock: newBoxes.toFixed(2)
        });
      });

      // 4. Commit all changes at once
      await batch.commit();

      printInvoice(saleData);
      setCart([]);
      setCustomerName('');
      alert("Sale Successful & Fast Saved!");

    } catch (err) {
      console.error(err);
      alert("Error processing sale: " + err.message);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = `
    .sales-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; }
    .item-list { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; max-height: 85vh; overflow-y: auto; }
    .cart-panel { background: #111; padding: 25px; border-radius: 20px; border: 1px solid #222; border-top: 5px solid #10b981; position: sticky; top: 20px; }
    .search-input { width: 100%; padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 15px; box-sizing: border-box; }
    .product-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #222; cursor: pointer; border-radius: 8px; }
    .product-row:hover { background: #1a1a1a; color: #f59e0b; }
    .cart-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    .cart-table th { text-align: left; color: #f59e0b; padding: 10px; border-bottom: 2px solid #222; }
    .cart-table td { padding: 10px; border-bottom: 1px solid #222; }
    .qty-input { width: 60px; padding: 5px; background: #000; border: 1px solid #444; color: #fff; text-align: center; border-radius: 5px; }
    .checkout-btn { width: 100%; padding: 18px; background: #10b981; color: #000; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; margin-top: 20px; font-size: 16px; }
  `;

  return (
    <div className="sales-container">
      <style>{styles}</style>
      <div className="item-list">
        <h3 style={{color: '#f59e0b'}}>SELECT PRODUCTS</h3>
        <input type="text" className="search-input" placeholder="Search Item..." onChange={(e) => setSearchTerm(e.target.value)} />
        {filteredItems.map(item => (
          <div className="product-row" key={item.id} onClick={() => addToCart(item)}>
            <div>
              <div style={{fontWeight:'bold'}}>{item.name}</div>
              <small style={{color:'#888'}}>Stock: {item.totalPcs} Pcs</small>
            </div>
            <div style={{fontWeight:'bold'}}>Rs. {item.retailPrice}</div>
          </div>
        ))}
      </div>

      <div className="cart-panel">
        <h3 style={{color: '#10b981', margin:'0 0 20px 0'}}>INVOICE</h3>
        <input type="text" className="search-input" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <div style={{maxHeight:'40vh', overflowY:'auto'}}>
          <table className="cart-table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Total</th><th></th></tr>
            </thead>
            <tbody>
              {cart.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><input type="number" className="qty-input" value={c.quantity} onChange={(e) => updateCartQty(c.id, e.target.value)} /></td>
                  <td>{(c.quantity * c.salePrice).toLocaleString()}</td>
                  <td><button onClick={() => removeFromCart(c.id)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:'20px', borderTop:'2px solid #222', paddingTop:'20px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'22px', fontWeight:'900'}}>
            <span>TOTAL:</span>
            <span style={{color: '#10b981'}}>Rs. {calculateTotal().toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={handleSale} disabled={loading || cart.length === 0}>
            {loading ? "SAVING..." : "FINALIZE SALE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
