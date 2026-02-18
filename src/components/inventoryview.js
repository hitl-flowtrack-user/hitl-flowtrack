import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inventory_records"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', fontWeight: '900' }}>LIVE INVENTORY</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div key={item.id} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #222' }}>
            <h3 style={{ color: '#f59e0b', textTransform: 'uppercase' }}>{item.itemName}</h3>
            <p>SKU: {item.sku}</p>
            <p>Retail: Rs. {item.retailPrice}</p>
          </div>
        ))}
      </div>
      {items.length === 0 && !loading && <p>No items found.</p>}
    </div>
  );
};

export default InventoryView;