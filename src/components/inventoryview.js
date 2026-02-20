import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // src folder mein bahar hai isliye ../
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const Inventoryview = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, kya aap waqai ye item delete karna chahte hain?")) {
      await deleteDoc(doc(db, "inventory_records", id));
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f59e0b', paddingBottom: '10px' }}>
        <h2 style={{ color: '#f59e0b', margin: 0 }}>📦 Stock Inventory</h2>
        <input 
          type="text" 
          placeholder="Search items..." 
          style={searchStyle}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Responsive Grid for Mobile/Desktop */}
      <div className="inventory-grid" style={gridStyle}>
        {filteredItems.map(item => (
          <div key={item.id} style={itemCardStyle(parseInt(item.stock) < 10)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#f59e0b', fontSize: '18px' }}>{item.name}</h3>
                <span style={{ fontSize: '12px', color: '#aaa', background: '#222', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.category || 'General'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{item.stock}</div>
                <div style={{ fontSize: '10px', color: '#f59e0b' }}>QTY LEFT</div>
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', paddingTop: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#666' }}>RETAIL PRICE</div>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>Rs. {item.retailPrice}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => onEdit(item)} style={actionBtn('#f59e0b')}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={actionBtn('#ef4444')}>🗑️</button>
              </div>
            </div>
            
            {parseInt(item.stock) < 10 && (
              <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '5px', fontWeight: 'bold' }}>
                ⚠️ Low Stock Warning!
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        @media (max-width: 600px) {
          .inventory-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// --- Styles ---
const searchStyle = {
  background: '#111', border: '1px solid #f59e0b', color: '#fff', padding: '8px 15px', borderRadius: '20px', width: '40%', outline: 'none'
};

const gridStyle = { marginTop: '10px' };

const itemCardStyle = (isLow) => ({
  background: '#111', padding: '20px', borderRadius: '12px', border: `1px solid ${isLow ? '#ef4444' : '#333'}`, boxShadow: '0 4px 15px rgba(0,0,0,0.5)', position: 'relative'
});

const actionBtn = (color) => ({
  background: 'transparent', border: `1px solid ${color}`, color: color, padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px'
});

export default Inventoryview;
