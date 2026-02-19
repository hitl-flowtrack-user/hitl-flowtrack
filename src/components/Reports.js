import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Check karein firebase.js isi folder mein hai?
import { collection, onSnapshot } from "firebase/firestore";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reportData, setReportData] = useState({
    todaySale: 0,
    monthlySale: 0,
    totalProfit: 0,
    topItems: []
  });

  useEffect(() => {
    // 1. Inventory Load
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => {
      setInventory(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Sales Load & Analysis
    const unsubSales = onSnapshot(collection(db, "sales_records"), (s) => {
      const allSales = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setSales(allSales);
      
      const today = new Date().toLocaleDateString();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let tSale = 0;
      let mSale = 0;
      let tProfit = 0;
      const itemCounts = {};

      allSales.forEach(sale => {
        // Safe conversion to Number
        const saleAmount = parseFloat(sale.totalAmount || 0);
        
        // Today's Sale Check
        if (sale.dateString === today) tSale += saleAmount;

        // Monthly Sale Check (Safe Date Split)
        if (sale.dateString && sale.dateString.includes('/')) {
          const parts = sale.dateString.split('/');
          const sMonth = parseInt(parts[1]) - 1;
          const sYear = parseInt(parts[2]);
          if (sMonth === currentMonth && sYear === currentYear) {
            mSale += saleAmount;
          }
        }

        // Profit & Top Items Logic (With Safety Checks)
        if (sale.cart && Array.isArray(sale.cart)) {
          sale.cart.forEach(item => {
            // Find in inventory for Purchase Price
            const invItem = inventory.find(i => i.name === item.name);
            if (invItem) {
              const pPrice = parseFloat(invItem.purchasePrice || 0);
              const sPrice = parseFloat(item.retailPrice || 0);
              const qty = parseFloat(item.qty || 0);
              tProfit += (sPrice - pPrice) * qty;
            }
            // Count Item Popularity
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 0);
          });
        }
      });

      // Top 5 Items Sorting
      const top = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      setReportData({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: top });
    });

    return () => { unsubInv(); unsubSales(); };
  }, [inventory]); // Refreshes stats when inventory loads

  const cardStyle = {
    background: '#111',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #222',
    textAlign: 'center'
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2 style={{ color: '#D4AF37', marginBottom: '25px' }}>BUSINESS ANALYTICS</h2>
      
      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ ...cardStyle, borderBottom: '4px solid #D4AF37' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>TODAY'S SALE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4AF37' }}>Rs. {reportData.todaySale.toLocaleString()}</div>
        </div>
        <div style={{ ...cardStyle, borderBottom: '4px solid #D4AF37' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>THIS MONTH</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4AF37' }}>Rs. {reportData.monthlySale.toLocaleString()}</div>
        </div>
        <div style={{ ...cardStyle, borderBottom: '4px solid #3fb950' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>GROSS PROFIT</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>Rs. {reportData.totalProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Recent Sales Table */}
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '15px', border: '1px solid #1a1a1a' }}>
          <h4 style={{ color: '#D4AF37', marginTop: 0 }}>RECENT TRANSACTIONS</h4>
          {sales.slice(0, 8).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', fontSize: '13px' }}>
              <span>{s.customerName || 'Walking Customer'}</span>
              <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>Rs. {s.totalAmount}</span>
            </div>
          ))}
        </div>

        {/* Top Products List */}
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '15px', border: '1px solid #1a1a1a' }}>
          <h4 style={{ color: '#D4AF37', marginTop: 0 }}>TOP SELLING ITEMS</h4>
          {reportData.topItems.map(([name, qty], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', fontSize: '13px' }}>
              <span>{name}</span>
              <span style={{ color: '#3fb950', fontWeight: 'bold' }}>{qty} Pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
