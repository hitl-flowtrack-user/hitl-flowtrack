import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const SalesModule = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [charges, setCharges] = useState({ discount: 0, labour: 0, freight: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const printRef = useRef();

  // Load Inventory & Recent Sales
  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
      setRecentSales(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubInv(); unsubSales(); };
  }, []);

  const addToCart = (item) => {
    const exist = cart.find(c => c.id === item.id);
    if (exist) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const calculateSubTotal = () => cart.reduce((acc, c) => acc + (parseFloat(c.retailPrice) * c.qty), 0);
  const grandTotal = calculateSubTotal() - parseFloat(charges.discount || 0) + parseFloat(charges.labour || 0) + parseFloat(charges.freight || 0);

  const handleProcessSale = async () => {
    if (cart.length === 0 || isProcessing) return;
    
    setIsProcessing(true); // Stop double clicks
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    
    const saleData = {
      invoiceNo,
      customerName: customer || "Walking Customer",
      cart,
      subTotal: calculateSubTotal(),
      ...charges,
      totalAmount: grandTotal,
      createdAt: serverTimestamp(),
      dateString: new Date().toLocaleDateString(),
      timeString: new Date().toLocaleTimeString()
    };

    try {
      await addDoc(collection(db, "sales_records"), saleData);
      window.print();
      setCart([]);
      setCustomer('');
      setCharges({ discount: 0, labour: 0, freight: 0 });
    } catch (e) {
      console.error("Error saving sale:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    
    .pos-container { 
      background: #050505; min-height: 100vh; padding: 20px; 
      font-family: 'Inter', sans-serif; display: grid; 
      grid-template-columns: 1fr 420px; gap: 20px; 
    }

    /* Left Panel: Items */
    .item-panel { background: #0a0a0a; border-radius: 25px; padding: 25px; border: 1px solid #1a1a1a; }
    .search-input { 
      width: 100%; padding: 18px; background: #000; border: 2px solid #222; 
      border-radius: 15px; color: #fff; font-size: 16px; margin-bottom: 20px;
    }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .p-card { 
      background: #111; padding: 15px; border-radius: 18px; text-align: center; 
      border: 1px solid #222; cursor: pointer; transition: 0.2s;
    }
    .p-card:hover { border-color: #D4AF37; transform: translateY(-3px); }

    /* Right Panel: Billing */
    .billing-panel { background: #0d0d0d; border-radius: 25px; padding: 25px; border: 1px solid #D4AF37; position: sticky; top: 20px; height: fit-content; }
    .cart-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
    
    .total-section { background: #D4AF37; color: #000; padding: 20px; border-radius: 20px; margin-top: 20px; text-align: center; }
    
    .btn-pay { 
      width: 100%; padding: 18px; background: #3fb950; border: none; 
      border-radius: 15px; color: #fff; font-weight: 900; font-size: 18px; 
      margin-top: 15px; cursor: pointer; transition: 0.3s;
    }
    .btn-pay:disabled { background: #222; cursor: not-allowed; }

    /* Recent Sales Reprint List */
    .recent-list { margin-top: 20px; background: #0a0a0a; border-radius: 20px; padding: 15px; }
    .recent-row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: 1px dotted #222; }

    /* Print Specific Styles */
    @media print {
      body * { visibility: hidden; }
      #print-area, #print-area * { visibility: visible; }
      #print-area { position: absolute; left: 0; top: 0; width: 80mm; background: #fff !important; color: #000 !important; padding: 10px; font-family: 'Courier New', Courier, monospace; }
      .no-print { display: none !important; }
    }

    @media (max-width: 900px) { .pos-container { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="pos-container">
      <style>{styles}</style>
      
      {/* Left Side */}
      <div className="item-panel no-print">
        <h2 style={{color:'#D4AF37', marginTop:0}}>TERMINAL</h2>
        <input className="search-input" placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
        <div className="product-grid">
          {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div key={item.id} className="p-card" onClick={() => addToCart(item)}>
              <div style={{fontWeight:700}}>{item.name}</div>
              <div style={{color:'#D4AF37', fontWeight:900}}>Rs. {item.retailPrice}</div>
            </div>
          ))}
        </div>

        <div className="recent-list">
          <h4 style={{margin:0, color:'#555'}}>REPRINT RECENT BILLS</h4>
          {recentSales.map((s, i) => (
            <div key={i} className="recent-row">
              <span>{s.invoiceNo} - {s.customerName}</span>
              <button onClick={() => window.print()} style={{background:'#222', color:'#D4AF37', border:'none', borderRadius:'5px', fontSize:'10px', cursor:'pointer'}}>REPRINT</button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side / Invoice Area */}
      <div className="billing-panel" id="print-area">
        <div style={{textAlign:'center', marginBottom:'20px'}}>
          <h2 style={{margin:0}}>PREMIUM CERAMICS</h2>
          <p style={{fontSize:'12px', margin:0}}>Main Road, Business Center, Jaranwala</p>
          <p style={{fontSize:'12px', margin:0}}>Contact: 0300-1234567</p>
          <hr style={{border:'0.5px dashed #333'}} />
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', marginTop:'10px'}}>
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <div style={{textAlign:'left', fontSize:'11px', fontWeight:'bold', marginTop:'5px'}}>INV-NO: {`INV-${Date.now().toString().slice(-6)}`}</div>
        </div>

        <div style={{minHeight:'150px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'bold', borderBottom:'1px solid #333', paddingBottom:'5px'}}>
            <span>Description</span>
            <span>Amount</span>
          </div>
          {cart.map((c, i) => (
            <div key={i} className="cart-item">
              <span>{c.name} (x{c.qty})</span>
              <span>{c.qty * c.retailPrice}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:'15px', fontSize:'13px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><span>Sub Total:</span><span>Rs. {calculateSubTotal()}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}} className="no-print"><span>Discount:</span><input type="number" style={{width:'60px', background:'transparent', color:'#D4AF37', border:'1px solid #333', textAlign:'right'}} onChange={e => setCharges({...charges, discount: e.target.value})} /></div>
          <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'16px', marginTop:'10px'}}><span>GRAND TOTAL:</span><span>Rs. {grandTotal}</span></div>
        </div>

        <button className="btn-pay no-print" disabled={isProcessing} onClick={handleProcessSale}>
          {isProcessing ? "PROCESSING..." : "FINALIZE & PRINT"}
        </button>

        <div style={{textAlign:'center', marginTop:'20px', fontSize:'10px'}} className="print-only">
          <p>Thank you for your business!</p>
          <p>Software by Gemini Tech 2026</p>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
