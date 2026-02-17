import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const InventoryView = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 1. Hum "inventory" naam ke folder se data mangwa rahe hain
    const myFolder = collection(db, "inventory");

    // 2. Jaise hi koi naya item add hoga, ye khud hi screen update kar dega
    const unsubscribe = onSnapshot(myFolder, (snapshot) => {
      const dataAagaya = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(dataAagaya);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>MERA SAMAN (INVENTORY)</h2>
      <table border="1" style={{ width: '100%', borderColor: '#333', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: '#f59e0b' }}>
            <th>NAME</th>
            <th>QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {/* Yahan check karein ke kya aapne additem mein 'itemName' likha tha ya 'name' */}
              <td>{item.itemName || item.name}</td> 
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryView;
