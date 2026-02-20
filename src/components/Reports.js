import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Path matching: '../' kyunke Reports components folder mein hai
import { collection, onSnapshot } from "firebase/firestore";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    todaySale: 0,
    monthlySale: 0,
    totalProfit: 0,
    topItems: []
  });

  useEffect(() => {
    // 1. Fetch Inventory for Cost Price Analysis
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      const invData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(invData);
    });

    // 2. Fetch Sales and Calculate Business Intelligence
    const unsubSales = onSnapshot(collection(db, "sales_records"), (snapshot) => {
      const salesData = snapshot.docs.map(doc => doc.data());
      setSales(salesData);

      const today = new Date().toLocaleDateString();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let tSale = 0;
      let mSale = 0;
      let tProfit = 0;
      const itemCounts = {};

      salesData.forEach(sale => {
        const amount = parseFloat(sale.totalAmount || 0);
        
        // Daily Sale
        if (sale.dateString === today) tSale += amount;

        // Monthly Sale
        if (sale.dateString) {
          const parts = sale.dateString.split('/');
          if (parseInt(parts[1]) - 1 === currentMonth && parseInt(parts[2]) === currentYear) {
            mSale += amount;
          }
        }

        // Profit & Popularity Logic
        if (sale.cart && Array.isArray(sale.cart)) {
          sale.cart.forEach(item => {
            // Profit: (Sale Price - Purchase Price) * Qty
            const invItem = inventory.find(i => i.name === item.name);
            if (invItem) {
              const pPrice = parseFloat(invItem.purchasePrice || 0);
              const sPrice = parseFloat(item.retailPrice || 0);
              tProfit += (sPrice - pPrice) * (item.qty || 0);
            }
            // Count for Top Items
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 0);
          });
        }
      });

      const topProducts = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      setStats({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: topProducts });
    });

    return () => { unsubInv(); unsubSales(); };
  }, [inventory]);

  // Premium CSS Styles
  const cardStyle = {
    background: '#111',
    padding: '25px',
    borderRadius: '15px',
    border: '1px solid #222',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden'
  };

  const goldGradient = {
    color: '#f59e0b',
    fontSize: '28px',
    fontWeight: '900',
    margin: '10px 0'
  };

  return (
    <div style={{ padding: '10px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#f59e0b', margin: 0, fontSize: '24px', letterSpacing: '1px' }}>BUSINESS ANALYTICS</h1>
        <p style={{ color: '#555', margin: '5px 0' }}>Real-time performance tracking and profit analysis</p>
      </div>

      {/* --- TOP ROW: KPI CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}>TODAY'S REVENUE</div>
          <div style={goldGradient}>Rs. {stats.todaySale.toLocaleString()}</div>
          <div style={{ width: '100%', height: '4px', background: '#f59e0b', position: 'absolute', bottom: 0, left: 0 }}></div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}>MONTHLY PERFORMANCE</div>
          <div style={goldGradient}>Rs. {stats.monthlySale.toLocaleString()}</div>
          <div style={{ width: '100%', height: '4px', background: '#f59e0b', position: 'absolute', bottom: 0, left: 0, opacity: 0.5 }}></div>
        </div>

        <div style={{ ...cardStyle, border: '1px solid #1a472a' }}>
          <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}>ESTIMATED NET PROFIT</div>
          <div style={{ ...goldGradient, color: '#10b981' }}>Rs. {stats.totalProfit.toLocaleString()}</div>
          <div style={{ width: '100%', height: '4px', background: '#10b981', position: 'absolute', bottom: 0, left: 0 }}></div>
        </div>
      </div>

      {/* --- BOTTOM ROW: TABLES --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Recent Sales List */}
        <div style={{ ...cardStyle, background: '#080808' }}>
          <h3 style={{ borderBottom: '1px solid #222', paddingBottom: '10px', fontSize: '16px', color: '#f59e0b' }}>Recent Transactions</h3>
          {sales.slice(-6).reverse().map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', fontSize: '14px' }}>
              <div>
                <span style={{ display: 'block' }}>{s.customerName || 'Walking Customer'}</span>
                <small style={{ color: '#444' }}>{s.dateString}</small>
              </div>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>Rs. {s.totalAmount}</span>
            </div>
          ))}
        </div>

        {/* Top Selling Products */}
        <div style={{ ...cardStyle, background: '#080808' }}>
          <h3 style={{ borderBottom: '1px solid #222', paddingBottom: '10px', fontSize: '16px', color: '#f59e0b' }}>Top Selling Items</h3>
          {stats.topItems.map(([name, qty], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #111' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#f59e0b', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {i + 1}
                </div>
                <span>{name}</span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>{qty} sold</span>
            </div>
          ))}
          {stats.topItems.length === 0 && <p style={{ color: '#444', textAlign: 'center', marginTop: '20px' }}>No sales data yet</p>}
        </div>

      </div>
    </div>
  );
};

export default Reports;
