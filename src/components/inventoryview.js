import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const InventoryView = ({ role, onEdit }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#f59e0b', fontSize: '18px', marginBottom: '15px' }}>📦 INVENTORY HUB</h2>
      
      <div className="module-list">
        {items.map(item => {
          const isLow = item.stock <= 5;
          return (
            <div key={item.id} className="module-item" style={{ 
              borderLeft: isLow ? '4px solid #ef4444' : '1px solid #222',
              position: 'relative'
            }}>
              <div className="icon-box" style={{ background: isLow ? '#450a0a' : '#1a1a1a' }}>
                {isLow ? '⚠️' : '📦'}
              </div>
              <div className="module-info">
                <strong>{item.name}</strong>
                <p style={{ color: isLow ? '#f87171' : '#666' }}>
                  Stock: <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.stock}</span>
                  {isLow && " (ORDER SOON!)"}
                </p>
                <p style={{ fontSize: '10px' }}>RP: Rs.{item.retailPrice} | CP: Rs.{item.purchasePrice}</p>
              </div>
              
              {role === 'super-admin' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => onEdit(item)} style={actionBtn}>✏️</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const actionBtn = { background: 'none', border: 'none', fontSize: '16px', padding: '5px' };

export default InventoryView;
