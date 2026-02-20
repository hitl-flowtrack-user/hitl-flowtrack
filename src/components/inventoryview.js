import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const Inventoryview = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Query ko optimize kiya hai taake data foran aye
    const q = query(collection(db, "inventory_records"), orderBy("timestamp", "desc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(inventoryData);
      setLoading(false); // Data load hote hi loading khatam
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, kya aap ye item delete karna chahte hain?")) {
      try {
        await deleteDoc(doc(db, "inventory_records", id));
      } catch (err) {
        alert("Delete karne mein masla aya: " + err.message);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '10px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Search Bar - Full Width for Mobile */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#f59e0b', fontSize: '22px', marginBottom: '15px', textAlign: 'center' }}>📦 LIVE STOCK</h2>
        <input 
          type="text" 
          placeholder="Search items..." 
          style={searchStyle}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#f59e0b', marginTop: '50px' }}>
          <div className="spinner"></div>
          <p>Loading Inventory...</p>
        </div>
      ) : (
        <div className="inventory-grid" style={gridStyle}>
          {filteredItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', width: '100%' }}>No items found.</p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} style={itemCardStyle(parseInt(item.stock) < 10)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0', color: '#f59e0b', fontSize: '18px', textTransform: 'uppercase' }}>{item.name}</h3>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Price: <span style={{color: '#10b981'}}>Rs. {item.retailPrice}</span></div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#222', padding: '5px 15px', borderRadius: '10px', border: '1px solid #f59e0b' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{item.stock}</div>
                    <div style={{ fontSize: '9px', color: '#f59e0b' }}>STOCK</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '15px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                  <button onClick={() => onEdit(item)} style={actionBtn('#f59e0b')}>EDIT</button>
                  <button onClick={() => handleDelete(item.id)} style={actionBtn('#ef4444')}>DEL</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .spinner {
          border: 4px solid #111;
          border-top: 4px solid #f59e0b;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
        }
        @media (max-width: 600px) {
          .inventory-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const searchStyle = {
  background: '#111', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '16px'
};

const gridStyle = { width: '100%' };

const itemCardStyle = (isLow) => ({
  background: '#111', padding: '15px', borderRadius: '12px', border: `1px solid ${isLow ? '#ef4444' : '#333'}`, boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
});

const actionBtn = (color) => ({
  background: 'transparent', border: `1px solid ${color}`, color: color, padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
});

export default Inventoryview;
