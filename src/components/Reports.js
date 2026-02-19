import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Check karein aapka firebase.js isi folder mein hai?
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

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
    // Inventory load karein
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => {
      setInventory(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Sales load karein
    const unsubSales = onSnapshot(collection(db, "sales_records"), (s) => {
      const allSales = s.docs.map(d => d.data());
      setSales(allSales);
      
      // Calculate Stats
      const today = new Date().toLocaleDateString();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let tSale = 0;
      let mSale = 0;
      let tProfit = 0;
      const itemCounts = {};

      allSales.forEach(sale => {
        const saleAmount = parseFloat(sale.totalAmount || 0);
        if (sale.dateString === today) tSale += saleAmount;

        // Date parsing for month
        if (sale.dateString) {
          const parts = sale.dateString.split('/');
          if (parseInt(parts[1]) - 1 === currentMonth && parseInt(parts[2]) === currentYear) {
            mSale += saleAmount;
          }
        }

        // Profit logic
        if (sale.cart) {
          sale.cart.forEach(item => {
            const invItem = inventory.find(i => i.name === item.name);
            if (invItem) {
              const pPrice = parseFloat(invItem.purchasePrice || 0);
              const sPrice = parseFloat(item.retailPrice || 0);
              tProfit += (sPrice - pPrice) * item.qty;
            }
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
          });
        }
      });

      const top = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      setReportData({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: top });
    });

    return () => { unsubInv(); unsubSales(); };
  }, [inventory]);

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ color: '#D4AF37' }}>BUSINESS ANALYTICS</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderBottom: '3px solid #D4AF37' }}>
          <small style={{ color: '#666' }}>TODAY'S SALE</small>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4AF37' }}>Rs. {reportData.todaySale.toLocaleString()}</div>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderBottom: '3px solid #D4AF37' }}>
          <small style={{ color: '#666' }}>MONTHLY SALE</small>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4AF37' }}>Rs. {reportData.monthlySale.toLocaleString()}</div>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderBottom: '3px solid #3fb950' }}>
          <small style={{ color: '#666' }}>EST. PROFIT</small>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>Rs. {reportData.totalProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '10px' }}>
          <h4 style={{ color: '#D4AF37', marginTop: 0 }}>RECENT SALES</h4>
          {sales.slice(0, 5).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #111', fontSize: '13px' }}>
              <span>{s.customerName}</span>
              <span style={{ color: '#D4AF37' }}>Rs. {s.totalAmount}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '10px' }}>
          <h4 style={{ color: '#D4AF37', marginTop: 0 }}>TOP ITEMS</h4>
          {reportData.topItems.map(([name, qty], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #111', fontSize: '13px' }}>
              <span>{name}</span>
              <span style={{ color: '#3fb950' }}>{qty} Pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
