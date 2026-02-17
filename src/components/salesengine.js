import React, { useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Scanner, ShoppingCart, Trash2, Printer, User, Plus, Minus, CreditCard } from 'lucide-react';

const SalesEngine = () => {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const printRef = useRef();

  // --- TOUCH FRIENDLY QTY CONTROL ---
  const updateQty = (idx, delta) => {
    const newCart = [...cart];
    newCart[idx].qty = Math.max(1, newCart[idx].qty + delta);
    setCart(newCart);
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.retailPrice * item.qty), 0);

  // --- THERMAL PRINT LOGIC ---
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '', 'height=700,width=400');
    win.document.write(`
      <html>
        <head>
          <title>Stream-Receipt</title>
          <style>
            @page { size: 80mm 200mm; margin: 0; }
            body { font-family: 'Courier New', monospace; width: 75mm; padding: 2mm; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; margin: 5px 0; }
            .flex { display: flex; justify-content: space-between; }
            .urdu { font-family: 'Courier New'; direction: rtl; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-black text-white p-2 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Cart & Touch Controls */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 rounded-[2rem] p-4 lg:p-6 border border-white/5">
            <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
              <ShoppingCart className="text-amber-500" /> Mobile-Trade Hub
            </h2>

            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm uppercase italic text-amber-500">{item.nameEN}</p>
                    <p className="text-[10px] text-zinc-500 tracking-tighter uppercase">{item.sku} | SHADE: {item.shadeNo || 'NA'}</p>
                  </div>
                  
                  {/* BIG TOUCH BUTTONS */}
                  <div className="flex items-center justify-between gap-4 bg-zinc-900 p-2 rounded-xl border border-white/5">
                    <button onClick={() => updateQty(idx, -1)} className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-red-500 active:bg-red-500 active:text-white"><Minus size={20}/></button>
                    <span className="text-lg font-black w-8 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(idx, 1)} className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-emerald-500 active:bg-emerald-500 active:text-white"><Plus size={20}/></button>
                  </div>
                  
                  <div className="text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                    <p className="text-xs text-zinc-500 font-mono">@ Rs.{item.retailPrice}</p>
                    <p className="font-black text-white">Rs.{(item.retailPrice * item.qty).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment & Summary */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <div className="bg-white rounded-[2.5rem] p-6 text-black shadow-2xl">
            <h3 className="text-lg font-black uppercase mb-4 italic border-b pb-2">Checkout</h3>
            
            <div className="space-y-4 mb-6">
              <input 
                type="text" placeholder="CUSTOMER NAME" 
                className="w-full bg-zinc-100 p-4 rounded-xl outline-none font-black uppercase text-sm border-2 border-transparent focus:border-amber-500 transition-all"
                value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Credit', 'Bank'].map(m => (
                  <button key={m} onClick={() => setPaymentMode(m)} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${paymentMode === m ? 'bg-black text-white border-black shadow-lg scale-105' : 'border-zinc-200 text-zinc-400'}`}>{m}</button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 text-white p-6 rounded-[2rem] mb-6">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Amount</p>
              <h2 className="text-3xl font-black text-amber-500 italic leading-none">Rs.{calculateTotal().toLocaleString()}</h2>
            </div>

            <button 
              onClick={handlePrint}
              className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl"
            >
              <Printer size={20}/> Save & Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* --- HIDDEN PRINT TEMPLATE (80mm) --- */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="center">
            <h2 className="bold">HITL FLOWTRACK</h2>
            <p>Smart Trade Solutions</p>
            <div className="border-b"></div>
            <p className="flex"><span>Date:</span> <span>${new Date().toLocaleDateString()}</span></p>
            <p className="flex"><span>Cust:</span> <span className="bold">${customerName || "WALKING"}</span></p>
            <div className="border-b"></div>
          </div>
          <table style={{ width: '100%' }}>
            {cart.map((item, i) => (
              <tr key={i}>
                <td colSpan="2">
                  <div className="bold">${item.nameEN}</div>
                  <div className="flex">
                    <span>${item.qty} x ${item.retailPrice}</span>
                    <span className="bold">${(item.qty * item.retailPrice).toLocaleString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </table>
          <div className="border-b"></div>
          <div className="flex bold" style={{ fontSize: '16px' }}>
            <span>NET TOTAL:</span>
            <span>Rs.${calculateTotal().toLocaleString()}</span>
          </div>
          <div className="border-b"></div>
          <div className="center" style={{ marginTop: '10px' }}>
             <p>Thank You For Your Business!</p>
             <p className="bold italic">Software By: HITL-FlowTrack</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesEngine;