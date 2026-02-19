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
    // Inventory load karein taake Purchase Price mil sakay
    const unsubInv = onSnapshot(collection(db, "inventory_records"), (s) => {
      setInventory(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Sales load karein
    const unsubSales = onSnapshot(collection(db, "sales_records"), (s) => {
      const allSales = s.docs.map(d => d.data());
      setSales(allSales);
      calculateStats(allSales);
    });

    return () => { unsubInv(); unsubSales(); };
  }, [inventory]); // Inventory update hone par calculations refresh hongi

  const calculateStats = (allSales) => {
    const today = new Date().toLocaleDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let tSale = 0;
    let mSale = 0;
    let tProfit = 0;
    const itemCounts = {};

    allSales.forEach(sale => {
      const saleAmount = parseFloat(sale.totalAmount || 0);
      
      // Today's Sale
      if (sale.dateString === today) {
        tSale += saleAmount;
      }

      // Monthly Sale Logic
      const [day, month, year] = sale.dateString.split('/'); 
      if (parseInt(month) - 1 === currentMonth && parseInt(year) === currentYear) {
        mSale += saleAmount;
      }

      // Profit Calculation
      if (sale.cart) {
        sale.cart.forEach(item => {
          const invItem = inventory.find(i => i.name === item.name);
          if (invItem) {
            const pPrice = parseFloat(invItem.purchasePrice || 0);
            const sPrice = parseFloat(item.retailPrice || 0);
            const profitPerUnit = sPrice - pPrice;
            tProfit += profitPerUnit * item.qty;
          }
          // Top Items count
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
        });
      }
    });

    const top = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    setReportData({ todaySale: tSale, monthlySale: mSale, totalProfit: tProfit, topItems: top });
  };

  const styles = `
    .rep-wrapper { background: #000; min-height: 100vh; padding: 25px; color: #fff; font-family: Arial; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; border-radius: 15px; border-bottom: 4px solid #D4AF37; text-align: center; }
    .stat-val { font-size: 28px; font-weight: 900; color: #D4AF37; margin-top: 10px; }
    .table-section { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; border-radius: 15px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { text-align: left; color: #444; font-size: 12px; padding: 10px; border-bottom: 1px solid #222; }
    td { padding: 12px 10px; border-bottom: 1px solid #111; font-size: 14px; }
    .top-item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #111; }
  `;

  return (
    <div className="rep-wrapper">
      <style>{styles}</style>
      <h2 style={{color: '#D4AF37', marginBottom: '25px'}}>BUSINESS REPORTS</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <small style={{color:'#666'}}>TODAY'S SALE</small>
          <div className="stat-val">Rs. {reportData.todaySale.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <small style={{color:'#666'}}>THIS MONTH'S SALE</small>
          <div className="stat-val">Rs. {reportData.monthlySale.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{borderColor: '#3fb950'}}>
          <small style={{color:'#666'}}>TOTAL ESTIMATED PROFIT</small>
          <div className="stat-val" style={{color: '#3fb950'}}>Rs. {reportData.totalProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
        <div className="table-section">
          <h3 style={{margin:0, color:'#D4AF37'}}>Recent Sales History</h3>
          <table>
            <thead>
              <tr>
                <th>INV #</th>
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
                  <td style={{color:'#D4AF37', fontWeight:'bold'}}>Rs. {s.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-section">
          <h3 style={{margin:0, color:'#D4AF37'}}>Top 5 Items</h3>
          <div style={{marginTop: '15px'}}>
            {reportData.topItems.map(([name, qty], i) => (
              <div key={i} className="top-item-row">
                <span>{name}</span>
                <span style={{color: '#D4AF37', fontWeight:'bold'}}>{qty} Pcs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
