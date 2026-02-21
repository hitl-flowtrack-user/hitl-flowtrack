import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const Dayclosing = () => {
  const [report, setReport] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalExpenses: 0,
    netCash: 0
  });
  const [cashInHand, setCashInHand] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateTodayStats();
  }, []);

  const calculateTodayStats = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString();
    
    // 1. Get Today's Sales
    const salesRef = collection(db, "sales_records");
    const qSales = query(salesRef, where("date", "==", today));
    const salesSnap = await getDocs(qSales);
    
    let salesTotal = 0;
    let profitTotal = 0;

    salesSnap.forEach(doc => {
      const data = doc.data();
      salesTotal += data.totalAmount;
      
      // Har product ka profit calculate karna (Retail - Purchase)
      data.items.forEach(item => {
        const itemProfit = (item.retailPrice - (item.purchasePrice || 0)) * item.qty;
        profitTotal += itemProfit;
      });
    });

    // 2. Get Today's Expenses (Assuming you have an expenses_records collection)
    const expRef = collection(db, "expenses_records");
    const qExp = query(expRef, where("dateString", "==", today));
    const expSnap = await getDocs(qExp);
    
    let expTotal = 0;
    expSnap.forEach(doc => {
      expTotal += doc.data().amount;
    });

    setReport({
      totalSales: salesTotal,
      totalProfit: profitTotal,
      totalExpenses: expTotal,
      netCash: profitTotal - expTotal
    });
    setLoading(false);
  };

  const submitClosing = async () => {
    if (!cashInHand) return alert("Please enter Cash in Hand!");
    
    try {
      await addDoc(collection(db, "day_closings"), {
        ...report,
        actualCashInHand: parseFloat(cashInHand),
        difference: parseFloat(cashInHand) - report.totalSales,
        timestamp: new Date(),
        date: new Date().toLocaleDateString()
      });
      alert("Day Closed Successfully!");
      setCashInHand('');
    } catch (e) { alert("Error saving closing!"); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>⏳ Day Closing Report</h2>

      {loading ? <p style={{textAlign:'center'}}>Calculating...</p> : (
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
          
          {/* Sales Card */}
          <div style={statCard('#1e3a8a')}>
            <span style={labelStyle}>Today's Total Sales</span>
            <div style={valueStyle}>Rs. {report.totalSales.toLocaleString()}</div>
          </div>

          {/* Profit Card */}
          <div style={statCard('#10b981')}>
            <span style={labelStyle}>Gross Profit</span>
            <div style={valueStyle}>Rs. {report.totalProfit.toLocaleString()}</div>
          </div>

          {/* Expense Card */}
          <div style={statCard('#ef4444')}>
            <span style={labelStyle}>Total Expenses</span>
            <div style={valueStyle}>Rs. {report.totalExpenses.toLocaleString()}</div>
          </div>

          {/* Net Profit Card */}
          <div style={{...statCard('#f59e0b'), border: '2px solid #fff'}}>
            <span style={{...labelStyle, color: '#000'}}>NET PROFIT (Income)</span>
            <div style={{...valueStyle, color: '#000'}}>Rs. {report.netCash.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
        <h4 style={{marginTop: 0, color: '#f59e0b'}}>Physical Cash Verification</h4>
        <input 
          type="number" 
          placeholder="Enter Actual Cash in Counter" 
          style={inputStyle}
          value={cashInHand}
          onChange={(e) => setCashInHand(e.target.value)}
        />
        <button onClick={submitClosing} style={btnStyle}>FINALIZE DAY CLOSING</button>
      </div>
    </div>
  );
};

// --- Styles ---
const statCard = (bg) => ({
  background: bg, padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
});
const labelStyle = { fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' };
const valueStyle = { fontSize: '24px', fontWeight: 'bold', marginTop: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', background: '#000', color: '#fff', boxSizing: 'border-box', fontSize: '16px' };
const btnStyle = { width: '100%', marginTop: '15px', padding: '15px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#000', fontWeight: 'bold', cursor: 'pointer' };

export default Dayclosing;
