import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot } from "firebase/firestore";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ todaySale: 0, monthlySale: 0, totalProfit: 0, topItems: [] });

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setInventory(snapshot.docs.map(doc => doc.data()));
    });

    const unsubSales = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      const salesData = snapshot.docs.map(doc => doc.data());
      setSales(salesData);

      const today = new Date().toLocaleDateString();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let tSale = 0, mSale = 0, tProfit = 0;
      const itemCounts = {};

      salesData.forEach(sale => {
        const amt = parseFloat(sale.totalAmount || 0);
        if (sale.dateString === today) tSale += amt;
        
        const dateParts = sale.dateString?.split('/') || [];
        if (parseInt(dateParts[1]) - 1 === currentMonth && parseInt(dateParts[2]) === currentYear) {
          mSale += amt;
        }

        sale.cart?.forEach(item => {
          const invItem = inventory.find(i => i.name === item.name);
          if (invItem) {
            const cost = parseFloat(invItem.purchasePrice || 0);
            tProfit += (parseFloat(item.retailPrice) - cost) * item.qty;
          }
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
        });
      });

      const top = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
      setStats({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: top });
    });

    return () => { unsubInv(); unsubSales(); };
  }, [inventory]);

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', marginBottom: '25px' }}>Business Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
          <small style={{ color: '#666' }}>TODAY'S REVENUE</small>
          <h2 style={{ margin: '10px 0', color: '#f59e0b' }}>Rs. {stats.todaySale.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
          <small style={{ color: '#666' }}>MONTHLY TOTAL</small>
          <h2 style={{ margin: '10px 0', color: '#f59e0b' }}>Rs. {stats.monthlySale.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <small style={{ color: '#666' }}>TOTAL NET PROFIT</small>
          <h2 style={{ margin: '10px 0', color: '#10b981' }}>Rs. {stats.totalProfit.toLocaleString()}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#111', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#f59e0b', fontSize: '16px' }}>Top Selling Products</h3>
          {stats.topItems.map(([name, qty], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #222' }}>
              <span>{name}</span>
              <span style={{ color: '#10b981' }}>{qty} Units</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
