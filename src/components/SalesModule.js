import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [isProcessing, setIsProcessing] = useState(false);

  // Advanced Charges
  const [discount, setDiscount] = useState({ type: 'cash', val: 0 });
  const [rent, setRent] = useState({ type: 'cash', val: 0 });
  const [loadingFee, setLoadingFee] = useState({ type: 'cash', val: 0 });
  const [unloadingFee, setUnloadingFee] = useState({ type: 'cash', val: 0 });
  const [extraCharges, setExtraCharges] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1, salePrice: item.retailPrice }]);
    }
  };

  const calculateTotal = () => {
    const sub = cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);
    const getVal = (obj) => obj.type === 'percent' ? (sub * (parseFloat(obj.val || 0) / 100)) : parseFloat(obj.val || 0);
    return sub - getVal(discount) + getVal(rent) + getVal(loadingFee) + getVal(unloadingFee) + parseFloat(extraCharges || 0);
  };

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Fill details first!");
    setIsProcessing(true);
    const batch = writeBatch(db);
    const finalAmt = calculateTotal();

    try {
      const saleRef = doc(collection(db, "sales_records"));
      const saleData = {
        customerName,
        salesman: user?.name || "Admin",
        items: cart,
        totalAmount: finalAmt,
        createdAt: serverTimestamp(),
      };
      batch.set(saleRef, saleData);

      // Inventory Update
      cart.forEach(item => {
        const itemRef = doc(db, "inventory_records", item.id);
        const newPcs = (item.totalPcs || 0) - item.quantity;
        batch.update(itemRef, { totalPcs: newPcs });
      });

      await batch.commit();
      alert("Sale Finalized!");
      setCart([]); setCustomerName('');
    } catch (e) { alert(e.message); }
    setIsProcessing(false);
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
    
    .pos-wrapper { 
      display: grid; grid-template-columns: 1.4fr 1fr; gap: 25px; 
      padding: 25px; background: #0a0d12; min-height: 90vh;
      font-family: 'Outfit', sans-serif; color: #fff;
    }

    .glass-panel { 
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px; padding: 25px; backdrop-filter: blur(10px);
    }

    .search-input {
      width: 100%; background: #161b22; border: 1px solid #30363d;
      padding: 15px; border-radius: 12px; color: #fff; font-size: 15px; margin-bottom: 20px;
    }

    .item-grid { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
      gap: 15px; max-height: 65vh; overflow-y: auto; padding-right: 10px;
    }

    .item-card {
      background: #1c2128; border-radius: 16px; padding: 15px; border: 1px solid transparent;
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
    }
    .item-card:hover { border-color: #58a6ff; transform: translateY(-5px); background: #21262d; }
    .item-name { font-weight: 600; font-size: 14px; margin-bottom: 5px; color: #e6edf3; }
    .item-price { color: #3fb950; font-weight: 900; font-size: 16px; }

    .checkout-header { font-size: 22px; font-weight: 900; margin-bottom: 20px; color: #58a6ff; }
    
    .cart-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid #30363d;
    }

    .charge-grid { 
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;
    }

    .charge-box {
      background: #161b22; padding: 10px; border-radius: 12px; border: 1px solid #30363d;
    }
    .charge-box label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; }
    .charge-box input { background: transparent; border: none; color: #fff; width: 50%; font-weight: bold; outline: none; }
    .charge-box select { background: transparent; border: none; color: #58a6ff; font-size: 12px; outline: none; }

    .total-container {
      margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #1f6feb 0%, #0969da 100%);
      border-radius: 18px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .total-label { font-size: 13px; opacity: 0.8; text-transform: uppercase; }
    .total-value { font-size: 32px; font-weight: 900; }

    .btn-finalize {
      width: 100%; padding: 18px; margin-top: 15px; border-radius: 15px; border: none;
      background: #238636; color: #fff; font-weight: 900; cursor: pointer; font-size: 16px;
      transition: 0.2s;
    }
    .btn-finalize:hover { background: #2ea043; transform: scale(1.02); }
  `;

  return (
    <div className="pos-wrapper">
      <style>{styles}</style>
      
      {/* Products Side */}
      <div className="glass-panel">
        <div style={{display:'flex', gap:'15px'}}>
          <input className="search-input" placeholder="🔍 Search items..." onChange={e => setSearchTerm(e.target.value)} />
          <select className="search-input" style={{width:'200px'}} onChange={e => setSelectedWarehouse(e.target.value)}>
            <option value="All">All Warehouses</option>
            {[...new Set(items.map(i => i.warehouse))].map(wh => <option key={wh} value={wh}>{wh}</option>)}
          </select>
        </div>

        <div className="item-grid">
          {items.filter(i => (selectedWarehouse === 'All' || i.warehouse === selectedWarehouse) && i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
              <div className="item-name">{item.name}</div>
              <div className="item-price">Rs. {item.retailPrice}</div>
              <div style={{fontSize:'11px', color:'#8b949e'}}>Stock: {item.totalPcs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Side */}
      <div className="glass-panel" style={{borderTop: '6px solid #1f6feb'}}>
        <div className="checkout-header">Order Summary</div>
        <input className="search-input" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />

        <div style={{minHeight:'150px', maxHeight:'250px', overflowY:'auto'}}>
          {cart.map(c => (
            <div className="cart-item" key={c.id}>
              <div>
                <div style={{fontWeight:600}}>{c.name}</div>
                <small style={{color:'#8b949e'}}>Qty: {c.quantity} x {c.salePrice}</small>
              </div>
              <div style={{fontWeight:900}}>Rs. {c.quantity * c.salePrice}</div>
            </div>
          ))}
        </div>

        <div className="charge-grid">
          <div className="charge-box"><label>Discount</label>
            <input type="number" onChange={e => setDiscount({...discount, val: e.target.value})} />
            <select onChange={e => setDiscount({...discount, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
          </div>
          <div className="charge-box"><label>Rent</label>
            <input type="number" onChange={e => setRent({...rent, val: e.target.value})} />
            <select onChange={e => setRent({...rent, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
          </div>
          <div className="charge-box"><label>Loading</label>
            <input type="number" onChange={e => setLoadingFee({...loadingFee, val: e.target.value})} />
            <select onChange={e => setLoadingFee({...loadingFee, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
          </div>
          <div className="charge-box"><label>Extra</label>
            <input type="number" style={{width:'100%'}} onChange={e => setExtraCharges(e.target.value)} />
          </div>
        </div>

        <div className="total-container">
          <div className="total-label">Payable Amount</div>
          <div className="total-value">Rs. {calculateTotal().toLocaleString()}</div>
        </div>

        <button className="btn-finalize" onClick={handleSale} disabled={isProcessing}>
          {isProcessing ? "PROCESSING..." : "FINALIZE & PRINT"}
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
