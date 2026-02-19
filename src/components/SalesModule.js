import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => { // User prop contains login ID/Name
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  
  // Advanced Billing States
  const [discount, setDiscount] = useState({ type: 'cash', val: 0 });
  const [rent, setRent] = useState({ type: 'cash', val: 0 });
  const [loading, setLoading] = useState({ type: 'cash', val: 0 });
  const [unloading, setUnloading] = useState({ type: 'cash', val: 0 });
  const [extraCharges, setExtraCharges] = useState(0);
  
  // Payment States
  const [paymentType, setPaymentType] = useState('cash'); // cash, credit, partial
  const [paidAmount, setPaidAmount] = useState(0);

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

  // Calculation Logic
  const getSubTotal = () => cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);
  
  const calculateFinal = () => {
    const sub = getSubTotal();
    const getVal = (obj) => obj.type === 'percent' ? (sub * (obj.val / 100)) : parseFloat(obj.val || 0);
    
    const discVal = getVal(discount);
    const rentVal = getVal(rent);
    const loadVal = getVal(loading);
    const unloadVal = getVal(unloading);
    
    return sub - discVal + rentVal + loadVal + unloadVal + parseFloat(extraCharges || 0);
  };

  const finalAmount = calculateFinal();

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Details missing!");
    setLoading(true);
    const batch = writeBatch(db);

    try {
      const saleRef = doc(collection(db, "sales_records"));
      const saleData = {
        customerName,
        salesman: user?.name || "Admin",
        salesmanId: user?.uid || "admin01",
        items: cart,
        subTotal: getSubTotal(),
        discounts: discount,
        charges: { rent, loading, unloading, extra: extraCharges },
        totalAmount: finalAmount,
        paymentStatus: paymentType,
        paidAmount: paymentType === 'cash' ? finalAmount : (paymentType === 'credit' ? 0 : paidAmount),
        balance: paymentType === 'credit' ? finalAmount : (paymentType === 'partial' ? finalAmount - paidAmount : 0),
        warehouse: selectedWarehouse,
        createdAt: serverTimestamp(),
      };

      batch.set(saleRef, saleData);

      // Inventory Minus
      cart.forEach(product => {
        const itemRef = doc(db, "inventory_records", product.id);
        const newStockPcs = (parseFloat(product.totalPcs) || 0) - product.quantity;
        batch.update(itemRef, {
          totalPcs: newStockPcs,
          openingStock: (newStockPcs / (product.pcsPerBox || 1)).toFixed(2)
        });
      });

      await batch.commit();
      alert("Sale Recorded Successfully!");
      setCart([]); setCustomerName('');
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    (selectedWarehouse === 'All' || item.warehouse === selectedWarehouse) &&
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const styles = `
    .pos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #000; color: #fff; padding: 10px; }
    .item-box { background: #111; padding: 15px; border-radius: 12px; height: 85vh; overflow-y: auto; border: 1px solid #222; }
    .bill-box { background: #111; padding: 15px; border-radius: 12px; border-top: 4px solid #f59e0b; }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .calc-field { background: #1a1a1a; padding: 10px; border-radius: 8px; margin-top: 5px; border: 1px solid #333; }
    .calc-field select, .calc-field input { background: transparent; color: #fff; border: none; outline: none; width: 45%; }
    .total-banner { background: #f59e0b; color: #000; padding: 15px; border-radius: 10px; text-align: center; font-size: 24px; font-weight: 900; margin-top: 15px; }
    .search-bar { width: 100%; padding: 10px; border-radius: 8px; background: #222; border: 1px solid #444; color: #fff; margin-bottom: 10px; }
  `;

  return (
    <div className="pos-grid">
      <style>{styles}</style>
      
      {/* Search & Warehouse Selection */}
      <div className="item-box">
        <div className="input-row">
          <input type="text" className="search-bar" placeholder="Search Product..." onChange={e => setSearchTerm(e.target.value)} />
          <select className="search-bar" onChange={e => setSelectedWarehouse(e.target.value)}>
            <option value="All">All Warehouses</option>
            {[...new Set(items.map(i => i.warehouse))].map(wh => <option key={wh} value={wh}>{wh}</option>)}
          </select>
        </div>
        
        {filteredItems.map(item => (
          <div key={item.id} className="calc-field" style={{cursor:'pointer'}} onClick={() => addToCart(item)}>
            <div style={{fontWeight:'bold'}}>{item.name} <small style={{color:'#f59e0b'}}>({item.warehouse})</small></div>
            <div style={{fontSize:'12px', color:'#888'}}>Stock: {item.totalPcs} | Rs. {item.retailPrice}</div>
          </div>
        ))}
      </div>

      {/* Advanced Billing */}
      <div className="bill-box">
        <input type="text" className="search-bar" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        
        <div style={{maxHeight:'200px', overflowY:'auto', borderBottom:'1px solid #222', marginBottom:'10px'}}>
          <table width="100%" style={{fontSize:'13px'}}>
            <thead><tr style={{color:'#f59e0b'}}><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {cart.map(c => (
                <tr key={c.id}><td>{c.name}</td><td>{c.quantity}</td><td>{c.quantity * c.salePrice}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Adjustments */}
        <div className="input-row">
          <div className="calc-field">
            <span style={{fontSize:'10px'}}>DISCOUNT</span><br/>
            <select onChange={e => setDiscount({...discount, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" placeholder="0" onChange={e => setDiscount({...discount, val: e.target.value})} />
          </div>
          <div className="calc-field">
            <span style={{fontSize:'10px'}}>RENT / FREIGHT</span><br/>
            <select onChange={e => setRent({...rent, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" placeholder="0" onChange={e => setRent({...rent, val: e.target.value})} />
          </div>
        </div>

        <div className="input-row">
          <div className="calc-field">
            <span style={{fontSize:'10px'}}>LOADING</span><br/>
            <select onChange={e => setLoading({...loading, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" placeholder="0" onChange={e => setLoading({...loading, val: e.target.value})} />
          </div>
          <div className="calc-field">
            <span style={{fontSize:'10px'}}>UNLOADING</span><br/>
            <select onChange={e => setUnloading({...unloading, type: e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" placeholder="0" onChange={e => setUnloading({...unloading, val: e.target.value})} />
          </div>
        </div>

        <div className="calc-field">
          <span style={{fontSize:'10px'}}>EXTRA CHARGES / MISC</span>
          <input style={{width:'100%'}} type="number" placeholder="Enter amount" onChange={e => setExtraCharges(e.target.value)} />
        </div>

        {/* Payment Split */}
        <div className="input-row" style={{marginTop:'10px'}}>
          <select className="search-bar" onChange={e => setPaymentType(e.target.value)}>
            <option value="cash">Full Cash</option>
            <option value="credit">Full Credit (Udhaar)</option>
            <option value="partial">Partial (Some Cash + Credit)</option>
          </select>
          {paymentType === 'partial' && <input type="number" className="search-bar" placeholder="Paid Amount" onChange={e => setPaidAmount(e.target.value)} />}
        </div>

        <div className="total-banner">
          <div style={{fontSize:'12px', fontWeight:'normal'}}>Net Payable Amount</div>
          Rs. {finalAmount.toLocaleString()}
        </div>

        <button className="checkout-btn" style={{width:'100%', padding:'15px', marginTop:'10px', background:'#10b981', fontWeight:'bold', cursor:'pointer'}} onClick={handleSale}>
          FINALIZE SALE & PRINT
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
