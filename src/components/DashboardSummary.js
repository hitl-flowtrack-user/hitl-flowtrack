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

  // Logical Calculations
  const totalItems = items.length;
  const totalStockPcs = items.reduce((a, c) => a + (parseFloat(c.totalPcs) || 0), 0);
  const totalPurchaseVal = items.reduce((a, c) => a + ((parseFloat(c.purchasePrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalRetailVal = items.reduce((a, c) => a + ((parseFloat(c.retailPrice) || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalWeight = items.reduce((a, c) => a + (parseFloat(c.totalWeight) || 0), 0);
  
  // Warehouse Breakdown Logic
  const warehouseData = items.reduce((acc, item) => {
    const wh = item.warehouse || "Unassigned";
    if (!acc[wh]) acc[wh] = { boxes: 0, pcs: 0 };
    acc[wh].boxes += (parseFloat(item.openingStock) || 0);
    acc[wh].pcs += (parseFloat(item.totalPcs) || 0);
    return acc;
  }, {});

  // Low Stock Alert (Below 10 boxes)
  const lowStockItems = items.filter(item => (parseFloat(item.openingStock) || 0) < 10);

  const styles = `
    .dashboard-container { padding: 25px; background: #000; min-height: 100vh; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .dash-card { background: #111; padding: 25px; border-radius: 20px; border: 1px solid #222; border-top: 4px solid #f59e0b; }
    .card-title { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .card-val { display: block; font-size: 26px; font-weight: 900; color: #f59e0b; margin-top: 10px; }
    
    .bottom-section { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
    .panel { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; }
    .panel-title { color: #f59e0b; font-size: 16px; margin-bottom: 20px; font-weight: 900; text-transform: uppercase; }
    
    .list-item { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #222; }
    .wh-name { font-weight: bold; color: #f59e0b; }
    .wh-stats { font-size: 13px; color: #888; }
    
    .low-stock-box { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 10px; margin-bottom: 10px; font-size: 13px; }
  `;

  if (loading) return <div style={{color:'#f59e0b', padding:'50px', textAlign:'center', fontWeight:'bold'}}>SYSTEM INITIALIZING...</div>;

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0 }}>DASHBOARD OVERVIEW</h2>
        <div style={{fontSize:'12px', color:'#555'}}>Status: Live Inventory</div>
      </div>

      {/* Financial Overview Cards */}
      <div className="dash-grid">
        <div className="dash-card">
          <span className="card-title">Stock Valuation (Purchase)</span>
          <span className="card-val">Rs. {totalPurchaseVal.toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Market Value (Retail)</span>
          <span className="card-val">Rs. {totalRetailVal.toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Expected Profit</span>
          <span className="card-val" style={{color: '#10b981'}}>Rs. {(totalRetailVal - totalPurchaseVal).toLocaleString()}</span>
        </div>
        <div className="dash-card">
          <span className="card-title">Total Dead Weight</span>
          <span className="card-val">{totalWeight.toFixed(2)} KG</span>
        </div>
      </div>

      <div className="bottom-section">
        {/* Warehouse Breakdown */}
        <div className="panel">
          <h3 className="panel-title">Warehouse Wise Distribution</h3>
          {Object.keys(warehouseData).length > 0 ? Object.keys(warehouseData).map((wh) => (
            <div className="list-item" key={wh}>
              <div>
                <div className="wh-name">{wh}</div>
                <div className="wh-stats">{warehouseData[wh].boxes} Boxes In Stock</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:'bold'}}>{warehouseData[wh].pcs} Pcs</div>
                <div style={{fontSize:'11px', color:'#444'}}>Available</div>
              </div>
            </div>
          )) : <p>No warehouse data available.</p>}
        </div>

        {/* Low Stock Alerts */}
        <div className="panel">
          <h3 className="panel-title">Critical Stock Alerts</h3>
          {lowStockItems.length > 0 ? lowStockItems.map((item, index) => (
            <div className="low-stock-box" key={index}>
              <strong>{item.name}</strong> - Only {item.openingStock} Boxes left!
              <div style={{fontSize:'10px', marginTop:'5px'}}>Location: {item.warehouse}</div>
            </div>
          )) : (
            <div style={{textAlign:'center', padding:'20px', color:'#10b981'}}>
              <div style={{fontSize:'40px'}}>✅</div>
              <p>Inventory is healthy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
