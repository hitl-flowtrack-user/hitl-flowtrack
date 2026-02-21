import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from "firebase/firestore";

const Reports = () => {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const salesSnap = await getDocs(collection(db, "sales_records"));
      const expensesSnap = await getDocs(collection(db, "expenses_records"));

      const monthlyData = {};

      // 1. Process Sales for Monthly Totals
      salesSnap.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp?.toDate() || new Date();
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { sales: 0, profit: 0, expenses: 0 };
        }

        monthlyData[monthYear].sales += data.totalAmount || 0;
        
        // Calculate Profit from items in sale
        data.items?.forEach(item => {
          const p = (item.retailPrice - (item.purchasePrice || 0)) * item.qty;
          monthlyData[monthYear].profit += p;
        });
      });

      // 2. Process Expenses for Monthly Totals
      expensesSnap.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp?.toDate() || new Date();
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (monthlyData[monthYear]) {
          monthlyData[monthYear].expenses += data.amount || 0;
        }
      });

      // Convert object to array for display
      const statsArray = Object.keys(monthlyData).map(month => ({
        month,
        ...monthlyData[month],
        netIncome: monthlyData[month].profit - monthlyData[month].expenses
      }));

      setMonthlyStats(statsArray);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center', marginBottom: '20px' }}>📊 Monthly Performance</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#f59e0b' }}>Loading analytics...</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {monthlyStats.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No records found yet.</p>
          ) : (
            monthlyStats.map((item, index) => (
              <div key={index} style={reportCardStyle}>
                <div style={monthHeaderStyle}>{item.month}</div>
                
                <div style={rowStyle}>
                  <span>Total Sales:</span>
                  <span style={{ color: '#3b82f6' }}>Rs. {item.sales.toLocaleString()}</span>
                </div>

                <div style={rowStyle}>
                  <span>Gross Profit:</span>
                  <span style={{ color: '#10b981' }}>Rs. {item.profit.toLocaleString()}</span>
                </div>

                <div style={rowStyle}>
                  <span>Expenses:</span>
                  <span style={{ color: '#ef4444' }}>Rs. {item.expenses.toLocaleString()}</span>
                </div>

                <div style={{ ...rowStyle, borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>NET INCOME:</span>
                  <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '18px' }}>
                    Rs. {item.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const reportCardStyle = {
  background: '#111',
  padding: '20px',
  borderRadius: '15px',
  border: '1px solid #333',
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
};

const monthHeaderStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#f59e0b',
  borderBottom: '2px solid #f59e0b',
  paddingBottom: '10px',
  marginBottom: '15px'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  fontSize: '14px'
};

export default Reports;
