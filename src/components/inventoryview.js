import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Collection name 'inventory_records' jo additem.js mein bhi hai
    const q = query(collection(db, "inventory_records"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory_records", id));
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', color: '#f59e0b', margin: 0 }}>LIVE INVENTORY</h2>
            <p style={{ fontSize: '10px', color: '#444', letterSpacing: '2px' }}>REAL-TIME STOCK TRACKING</p>
          </div>
          <div style={{ backgroundColor: '#111', padding: '10px 20px', borderRadius: '15px', border: '1px solid #222' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>TOTAL ITEMS: </span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{items.length}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#f59e0b', fontWeight: 'bold' }}>SYNCING WITH CLOUD...</div>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: '#0a0a0a', borderRadius: '25px', border: '1px solid #1a1a1a' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#111', borderBottom: '2px solid #222' }}>
                  <th style={thStyle}>IMAGE</th>
                  <th style={thStyle}>ITEM DETAILS</th>
                  <th style={thStyle}>CATEGORY / SKU</th>
                  <th style={thStyle}>RETAIL PRICE</th>
                  <th style={thStyle}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #161616', transition: '0.3s' }}>
                    <td style={tdStyle}>
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="pic" />
                        ) : (
                          <div style={{ fontSize: '8px', padding: '15px', color: '#333' }}>NO IMG</div>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>{item.itemName || item.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.company}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '13px' }}>{item.category}</div>
                      <div style={{ fontSize: '10px', color: '#f59e0b' }}>{item.sku}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold', color: '#10b981' }}>Rs. {item.retailPrice || 0}</div>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                      DATABASE IS EMPTY. PLEASE ADD ITEMS.
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

const thStyle = { padding: '20px', fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' };
const tdStyle = { padding: '20px', fontSize: '14px' };

export default InventoryView;
