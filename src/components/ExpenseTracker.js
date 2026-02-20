import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const Reports = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "sales_records"), (snap) => {
      setData(snap.docs.map(doc => doc.data()));
    });
  }, []);

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px' }}>
      <h3 style={{ color: '#1e3a8a' }}>Business Analysis Report</h3>
      <div style={{ height: '2px', background: '#f0f0f0', margin: '15px 0' }}></div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Customer</th>
            <th style={{ padding: '12px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px' }}>{sale.dateString}</td>
              <td style={{ padding: '12px' }}>{sale.customerName}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Rs. {sale.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
