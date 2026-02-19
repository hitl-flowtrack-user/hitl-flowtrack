import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inventory and Sales dono ka data real-time fetch ho raha hai
    const unsubInventory = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => doc.data()));
    });

    const unsubSales = onSnapshot(query(collection(db, "sales_records"), orderBy("createdAt", "desc")), (snapshot) => {
      setSales(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });

    return () => { unsubInventory(); unsubSales(); };
  }, []);

  // 1. Inventory Stats
  const totalPurchaseVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalWeight = items.reduce((a, c) => a + (parseFloat(c.totalWeight) || 0), 0);
  
  // 2. Sales & Profit Stats (All Time)
  const totalRevenue = sales.reduce((a, s) => a + (parseFloat(s.totalAmount) || 0), 0);
  
  // Profit calculation logic: Sale Price - Original Purchase Price
  let totalProfit = 0;
  sales.forEach(sale => {
    sale.items.forEach(soldItem => {
      const purchasePrice = parseFloat(soldItem.purchasePrice) || 0;
      const salePrice = parseFloat(soldItem.salePrice) || 0;
      const qty = parseFloat(soldItem.quantity) || 0;
      totalProfit += (salePrice - purchasePrice) * qty;
    });
  });

  // 3. Low Stock & Top Selling Logic
  const lowStockItems = items.filter(item => (parseFloat(item.openingStock) || 0) < 10);

  const styles = `
    .dash-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #111; padding: 20px; border-radius: 15px; border-bottom: 4px solid #333; transition: 0.3s; }
    .stat-card:hover { transform: translateY(-5px); border-color: #f59e0b; }
    .label { color: #888; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .value { display: block; font-size: 24px; font-weight: 900; margin-top: 10px; color: #f59e0b; }
    
    .grid-2 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    .panel { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; }
    .panel-header { font-size: 16px; font-weight: 900; color: #f59e0b; margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px; }
    
    .list-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #222; font-size: 14px; }
    .profit-text { color: #10b981; font-weight: bold; }
  `;

  if (loading) return <div style={{textAlign:'center', color:'#f59e0b', padding:'50px'}}>Gathering Business Intel...</div>;

  return (
    <div className="dash-container">
      <style>{styles}</style>
      
      <div style={{marginBottom:'30px'}}>
        <h2 style={{margin:0, fontStyle:'italic', fontWeight:'900', color:'#f59e0b'}}>BUSINESS INTELLIGENCE</h2>
        <p style={{margin:0, color:'#555', fontSize:'12px'}}>Real-time performance analytics</p>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="label">Total Sales Revenue</span>
          <span className="value">Rs. {totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Estimated Net Profit</span>
          <span className="value" style={{color:'#10b981'}}>Rs. {totalProfit.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Inventory Value (Stock)</span>
          <span className="value">Rs. {totalPurchaseVal.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Dead Weight in WH</span>
          <span className="value">{totalWeight.toFixed(1)} KG</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">RECENT TRANSACTIONS</div>
          {sales.slice(0, 6).map((sale, i) => (
            <div className="list-item" key={i}>
              <span>{sale.customerName} <br/><small style={{color:'#444'}}>{sale.createdAt?.toDate().toLocaleDateString()}</small></span>
              <span className="profit-text">+ Rs. {sale.totalAmount.toLocaleString()}</span>
            </div>
          ))}
          {sales.length === 0 && <p style={{color:'#444'}}>No sales recorded yet.</p>}
        </div>

        <div className="panel">
          <div className="panel-header">STOCK REPLENISHMENT</div>
          {lowStockItems.length > 0 ? lowStockItems.map((item, i) => (
            <div className="list-item" key={i} style={{borderLeft:'3px solid #ef4444', marginBottom:'5px', background:'#1a1111'}}>
              <span>{item.name}</span>
              <span style={{color:'#ef4444', fontWeight:'bold'}}>{item.openingStock} Boxes</span>
            </div>
          )) : <div style={{textAlign:'center', padding:'20px', color:'#10b981'}}>✓ All stock levels optimal</div>}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
