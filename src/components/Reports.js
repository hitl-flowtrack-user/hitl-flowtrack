import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
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
    // Load Sales & Inventory to calculate profit
    const unsubSales = onSnapshot(collection(db, "sales_records"), (s) => {
      const allSales = s.docs.map(d => d.data());
      setSales(allSales);
      calculateStats(allSales);
    });

    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => {
      setInventory(s.docs.map(d => d.data()));
    });

    return () => { unsubSales(); unsubInv(); };
  }, [inventory]);

  const calculateStats = (allSales) => {
    const today = new Date().toLocaleDateString();
    const currentMonth = new Date().getMonth();
    
    let tSale = 0;
    let mSale = 0;
    let tProfit = 0;
    const itemCounts = {};

    allSales.forEach(sale => {
      const saleAmount = parseFloat(sale.totalAmount || 0);
      
      // Today's Sale
      if (sale.dateString === today) tSale += saleAmount;

      // Monthly Sale
      // Note: Assuming dateString format is DD/MM/YYYY or similar
      const saleMonth = new Date(sale.dateString).getMonth();
      if (saleMonth === currentMonth) mSale += saleAmount;

      // Profit Calculation (Sale Price - Purchase Price)
      sale.cart.forEach(item => {
        const invItem = inventory.find(i => i.name === item.name);
        if (invItem) {
          const purchasePrice = parseFloat(invItem.purchasePrice || 0);
          const profitPerUnit = parseFloat(item.retailPrice) - purchasePrice;
          tProfit += profitPerUnit * item.qty;
        }
        
        // Count for Top Selling
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      });
    });

    // Sort Top Items
    const top = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    setReportData({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: top });
  };

  const styles = `
    .rep-container { background: #000; min-height: 100vh; padding: 30px; color: #fff; font-family: 'Segoe UI', Arial; }
    .rep-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .rep-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 25px; border-radius: 20px; text-align: center; border-bottom: 4px solid #D4AF37; }
    .gold-val { font-size: 32px; font-weight: 900; color: #D4AF37; margin-top: 10px; }
    .table-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 25px; border-radius: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { text-align: left; color: #555; font-size: 12px; padding: 10px; border-bottom: 1px solid #222; }
    td { padding: 15px 10px; border-bottom: 1px solid #111; font-size: 14px; }
  `;

  return (
    <div className="rep-container">
      <style>{styles}</style>
      <h1 className="gold-val" style={{fontSize:'24px', marginBottom:'30px'}}>BUSINESS ANALYTICS</h1>

      <div className="rep-grid">
        <div className="rep-card">
          <div style={{fontSize:'12px', color:'#555', letterSpacing:'1px'}}>TODAY'S REVENUE</div>
          <div className="gold-val">Rs. {reportData.todaySale.toLocaleString()}</div>
        </div>
        <div className="rep-card">
          <div style={{fontSize:'12px', color:'#555', letterSpacing:'1px'}}>MONTHLY REVENUE</div>
          <div className="gold-val">Rs. {reportData.monthlySale.toLocaleString()}</div>
        </div>
        <div className="rep-card" style={{borderColor:'#3fb950'}}>
          <div style={{fontSize:'12px', color:'#555', letterSpacing:'1px'}}>ESTIMATED PROFIT</div>
          <div className="gold-val" style={{color:'#3fb950'}}>Rs. {reportData.totalProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px'}}>
        <div className="table-card">
          <h3 style={{margin:0, color:'#D4AF37'}}>Recent Detailed Sales</h3>
          <table>
            <thead>
              <tr>
                <th>INVOICE</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 10).map((s, i) => (
                <tr key={i}>
                  <td>{s.invoiceNo}</td>
                  <td>{s.customerName}</td>
                  <td>{s.dateString}</td>
                  <td className="gold-val" style={{fontSize:'14px'}}>Rs. {s.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3 style={{margin:0, color:'#D4AF37'}}>Top 5 Selling Items</h3>
          <div style={{marginTop:'20px'}}>
            {reportData.topItems.map(([name, qty], i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #111'}}>
                <span>{name}</span>
                <span className="gold-val" style={{fontSize:'14px'}}>{qty} Pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
