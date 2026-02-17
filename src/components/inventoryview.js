import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Address: inventory_records (Matching with AddItem)
    const q = query(collection(db, "inventory_records"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '40px', color: '#fff' }}>
      <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#f59e0b', marginBottom: '30px' }}>INVENTORY LIST</h2>
      
      {loading ? <p>SYNCING DATABASE...</p> : (
        <div style={{ overflowX: 'auto', backgroundColor: '#111', borderRadius: '30px', border: '1px solid #222' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #222', color: '#444', fontSize: '12px' }}>
                <th style={{ padding: '20px' }}>ITEM NAME</th>
                <th style={{ padding: '20px' }}>SKU</th>
                <th style={{ padding: '20px' }}>STOCK</th>
                <th style={{ padding: '20px' }}>RETAIL</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.name}</td>
                  <td style={{ padding: '20px', color: '#666' }}>{item.sku}</td>
                  <td style={{ padding: '20px', color: '#f59e0b', fontWeight: '900' }}>{item.pcsPerBox}</td>
                  <td style={{ padding: '20px' }}>Rs. {item.retailPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p style={{ padding: '40px', textAlign: 'center', color: '#333' }}>NO DATA FOUND</p>}
        </div>
      )}
    </div>
  );
};

export default InventoryView;