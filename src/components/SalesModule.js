import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const SalesModule = ({ user }) => {
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
  
  const [paymentType, setPaymentType] = useState('cash'); 
  const [paidAmount, setPaidAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const calculateFinal = () => {
    const sub = cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);
    const getVal = (obj) => obj.type === 'percent' ? (sub * (parseFloat(obj.val || 0) / 100)) : parseFloat(obj.val || 0);
    
    return sub - getVal(discount) + getVal(rent) + getVal(loading) + getVal(unloading) + parseFloat(extraCharges || 0);
  };

  const printInvoice = (saleData) => {
    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; line-height:1.2; }
            .text-center { text-align: center; }
            .border-top { border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px; }
            table { width: 100%; margin-top: 10px; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3>GEMINI INVENTORY SYSTEM</h3>
            <p>Sales Receipt</p>
          </div>
          <div class="border-top">
            <p>Date: ${new Date().toLocaleString()}<br>
            Customer: ${saleData.customerName}<br>
            Salesman: ${saleData.salesman}</p>
          </div>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${saleData.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.salePrice}</td><td>${i.quantity * i.salePrice}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="border-top">
            <div class="flex"><span>Sub-Total:</span> <span>Rs. ${saleData.subTotal}</span></div>
            <div class="flex"><span>Adjustment (Charges/Disc):</span> <span>Rs. ${saleData.totalAmount - saleData.subTotal}</span></div>
            <div class="flex" style="font-weight:bold; font-size:14px;"><span>GRAND TOTAL:</span> <span>Rs. ${saleData.totalAmount}</span></div>
          </div>
          <div class="border-top text-center"><p>Thank You For Your Business!</p></div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSale = async () => {
    if (!customerName || cart.length === 0) return alert("Customer or Items missing!");
    setIsProcessing(true);
    const batch = writeBatch(db);
    const finalAmount = calculateFinal();

    try {
      const saleRef = doc(collection(db, "sales_records"));
      const saleData = {
        customerName,
        salesman: user?.name || "Admin",
        items: cart,
        subTotal: cart.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0),
        totalAmount: finalAmount,
        paymentStatus: paymentType,
        paidAmount: paymentType === 'cash' ? finalAmount : (paymentType === 'partial' ? parseFloat(paidAmount) : 0),
        createdAt: serverTimestamp(),
      };

      batch.set(saleRef, saleData);

      cart.forEach(product => {
        const itemRef = doc(db, "inventory_records", product.id);
        const newStockPcs = (parseFloat(product.totalPcs) || 0) - product.quantity;
        batch.update(itemRef, {
          totalPcs: newStockPcs,
          openingStock: (newStockPcs / (product.pcsPerBox || 1)).toFixed(2)
        });
      });

      await batch.commit();
      printInvoice(saleData);
      setCart([]); setCustomerName('');
      alert("Sale Finalized & Printed!");
    } catch (err) { alert(err.message); }
    setIsProcessing(false);
  };

  const styles = `
    .pos-container { display: flex; gap: 20px; padding: 20px; background: #000; min-height: 90vh; font-family: 'Inter', sans-serif; }
    .product-panel { flex: 1.5; background: #111; border-radius: 15px; padding: 20px; border: 1px solid #222; }
    .billing-panel { flex: 1; background: #111; border-radius: 15px; padding: 20px; border: 1px solid #222; border-top: 4px solid #f59e0b; display: flex; flex-direction: column; }
    
    .search-row { display: flex; gap: 10px; margin-bottom: 20px; }
    .pos-input { background: #222; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px; width: 100%; outline: none; }
    .pos-input:focus { border-color: #f59e0b; }

    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; overflow-y: auto; max-height: 70vh; }
    .product-card { background: #1a1a1a; padding: 15px; border-radius: 12px; cursor: pointer; border: 1px solid #222; transition: 0.2s; }
    .product-card:hover { border-color: #f59e0b; background: #222; }

    .cart-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
    .cart-table th { text-align: left; color: #888; padding-bottom: 10px; border-bottom: 1px solid #222; }
    .cart-table td { padding: 10px 0; border-bottom: 1px solid #1a1a1a; }

    .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; }
    .mini-field { background: #1a1a1a; padding: 8px; border-radius: 6px; border: 1px solid #333; }
    .mini-field label { font-size: 10px; color: #f59e0b; display: block; text-transform: uppercase; }
    .mini-field select, .mini-field input { background: transparent; border: none; color: #fff; width: 45%; outline: none; font-size: 12px; }

    .grand-total { background: #f59e0b; color: #000; padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center; }
    .btn-save { background: #10b981; color: #000; border: none; padding: 15px; border-radius: 10px; font-weight: 900; cursor: pointer; margin-top: 10px; width: 100%; }
  `;

  const filteredItems = items.filter(i => 
    (selectedWarehouse === 'All' || i.warehouse === selectedWarehouse) &&
    (i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pos-container">
      <style>{styles}</style>
      
      {/* Left: Product Section */}
      <div className="product-panel">
        <div className="search-row">
          <input className="pos-input" placeholder="Search Item or SKU..." onChange={e => setSearchTerm(e.target.value)} />
          <select className="pos-input" style={{width: '200px'}} onChange={e => setSelectedWarehouse(e.target.value)}>
            <option value="All">All Warehouses</option>
            {[...new Set(items.map(i => i.warehouse))].map(wh => <option key={wh} value={wh}>{wh}</option>)}
          </select>
        </div>

        <div className="product-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
              <div style={{fontWeight:'bold', fontSize:'14px'}}>{item.name}</div>
              <div style={{fontSize:'12px', color:'#f59e0b', marginTop:'5px'}}>Rs. {item.retailPrice}</div>
              <div style={{fontSize:'11px', color:'#555'}}>WH: {item.warehouse} | Stock: {item.totalPcs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Billing Section */}
      <div className="billing-panel">
        <h3 style={{margin:'0 0 15px 0', color:'#f59e0b'}}>CHECKOUT</h3>
        <input className="pos-input" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{marginBottom:'15px'}} />
        
        <div style={{overflowY:'auto', flex: 1}}>
          <table className="cart-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {cart.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.quantity}</td>
                  <td>{c.quantity * c.salePrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="calc-grid">
          <div className="mini-field"><label>Discount</label>
            <select onChange={e => setDiscount({...discount, type:e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" onChange={e => setDiscount({...discount, val:e.target.value})} />
          </div>
          <div className="mini-field"><label>Rent</label>
            <select onChange={e => setRent({...rent, type:e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" onChange={e => setRent({...rent, val:e.target.value})} />
          </div>
          <div className="mini-field"><label>Loading</label>
            <select onChange={e => setLoading({...loading, type:e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" onChange={e => setLoading({...loading, val:e.target.value})} />
          </div>
          <div className="mini-field"><label>Unloading</label>
            <select onChange={e => setUnloading({...unloading, type:e.target.value})}><option value="cash">Rs</option><option value="percent">%</option></select>
            <input type="number" onChange={e => setUnloading({...unloading, val:e.target.value})} />
          </div>
        </div>

        <div className="grand-total">
          <div style={{fontSize:'11px', textTransform:'uppercase'}}>Net Total</div>
          <div style={{fontSize:'22px', fontWeight:'900'}}>Rs. {calculateFinal().toLocaleString()}</div>
        </div>

        <button className="btn-save" onClick={handleSale} disabled={isProcessing}>
          {isProcessing ? "PROCESSING..." : "FINALIZE & PRINT BILL"}
        </button>
      </div>
    </div>
  );
};

export default SalesModule;
