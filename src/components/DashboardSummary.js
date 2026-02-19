import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const DashboardSummary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      const itemList = snapshot.docs.map(doc => doc.data());
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculations
  const totalItems = items.length;
  const totalStockPcs = items.reduce((a, c) => a + (parseFloat(c.totalPcs) || 0), 0);
  const totalPurchaseVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalRetailVal = items.reduce((a, c) => a + ((parseFloat(c.retailPrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalWeight = items.reduce((a, c) => a + (parseFloat(c.totalWeight) || 0), 0);
  
  // Low Stock Alert (Items with less than 10 boxes)
  const lowStockItems = items.filter(item => (parseFloat(item.openingStock) || 0) < 10);

  const styles = `
    .dashboard-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .dash-card { background: #111; padding: 25px; border-radius: 20px; border: 1px solid #222; position: relative; overflow: hidden; }
    .dash-card::after { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: #f59e0b; }
    .card-title { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .card-val { display: block; font-size: 28px; font-weight: 900; color: #f59e0b; margin-top: 10px; }
    
    .summary-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .low-stock-panel { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; }
    .alert-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #222; font-size: 14px; }
    .alert-name { color: #eee; font-weight: 500; }
    .alert-qty { color: #ef4444; font-weight: bold; }
    
    .warehouse-chip { background: #1a1a1a; padding: 15px; border-radius: 12px; margin-bottom: 10px; border-left: 3px solid #f59e0b; }
  `;

  if (loading) return <div style={{color:'#f59e0b', padding:'50px', textAlign:'center'}}>Generating Insights...</div>;

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', marginBottom: '30px' }}>BUSINESS SUMMARY</h2>

      <div className="dash-grid">
        <div className="dash-card">
          <span className="card-title">Total Investment (Purchase)</span>
          <span className="card-val">Rs. {totalPurchaseVal.toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Expected Revenue (Retail)</span>
          <span className="card-val">Rs. {totalRetailVal.toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Net Margin (Expected)</span>
          <span className="card-val" style={{color: '#10b981'}}>Rs. {(totalRetailVal - totalPurchaseVal).toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Total Inventory Weight</span>
          <span className="card-val">{totalWeight.toFixed(2)} KG</span>
        </div>
      </div>

      <div className="summary-section">
        <div className="low-stock-panel">
          <h3 style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '15px' }}>⚠️ LOW STOCK ALERTS (Below 10 Boxes)</h3>
          {lowStockItems.length > 0 ? lowStockItems.map((item, index) => (
            <div className="alert-item" key={index}>
              <span className="alert-name">{item.name} <small style={{color:'#555'}}>({item.sku})</small></span>
              <span className="alert-qty">{item.openingStock} Boxes Left</span>
            </div>
          )) : <p style={{color: '#555'}}>All items are well stocked.</p>}
        </div>

        <div>
          <h3 style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '15px' }}>📦 QUICK STATS</h3>
          <div className="warehouse-chip">
            <div style={{fontSize:'12px', color:'#888'}}>TOTAL UNIQUE PRODUCTS</div>
            <div style={{fontSize:'20px', fontWeight:'bold'}}>{totalItems}</div>
          </div>
          <div className="warehouse-chip">
            <div style={{fontSize:'12px', color:'#888'}}>TOTAL QUANTITY (PCS)</div>
            <div style={{fontSize:'20px', fontWeight:'bold'}}>{totalStockPcs.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
