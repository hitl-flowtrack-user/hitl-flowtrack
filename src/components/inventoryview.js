import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // YAHA CHECK KAREIN: "inventory" wahi naam hona chahiye jo additem.js mein hai
    const q = query(collection(db, "inventory"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fetched Items:", itemList); // Console mein check karne ke liye
      setItems(itemList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', color: '#fff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b', marginBottom: '20px', letterSpacing: '1px' }}>
          STOCK INVENTORY
        </h2>

        {loading ? (
          <p style={{ color: '#444' }}>LOADING DATA...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0a0a0a', borderRadius: '15px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#111', textAlign: 'left' }}>
                  <th style={thStyle}>ITEM NAME</th>
                  <th style={thStyle}>CATEGORY</th>
                  <th style={thStyle}>QUANTITY</th>
                  <th style={thStyle}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={tdStyle}>{item.itemName || item.name || 'N/A'}</td>
                    <td style={tdStyle}>{item.category || 'General'}</td>
                    <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 'bold' }}>{item.quantity || 0}</td>
                    <td style={{ ...tdStyle, fontSize: '10px', color: '#555' }}>
                      {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#333' }}>
                      No items found in "inventory" collection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = { padding: '15px', fontSize: '12px', color: '#555', borderBottom: '2px solid #222' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#ccc' };

export default InventoryView;
