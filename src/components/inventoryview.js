import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const InventoryView = ({ role }) => {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory_records"), (snap) => {
      setStock(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h3>📦 INVENTORY HUB</h3>
      <div className="module-list">
        {stock.map(s => (
          <div key={s.id} className="module-item" style={{ borderLeft: s.stock < 5 ? '4px solid #ef4444' : '1px solid #222' }}>
            <div className="icon-box">{s.stock < 5 ? '⚠️' : '📦'}</div>
            <div className="module-info">
              <strong>{s.name}</strong>
              <p>Current Stock: {s.stock}</p>
              {role === 'super-admin' && <p style={{color: '#888'}}>Cost: Rs.{s.purchasePrice}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryView;
