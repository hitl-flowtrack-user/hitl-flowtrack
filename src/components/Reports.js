import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const Reports = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "sales_records"), (snap) => {
      setSales(snap.docs.map(doc => doc.data()));
    });
  }, []);

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ color: '#1e3a8a' }}>Sales Analytics</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Customer</th>
            <th style={{ padding: '12px' }}>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px' }}>{s.dateString}</td>
              <td style={{ padding: '12px' }}>{s.customerName}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Rs. {s.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
