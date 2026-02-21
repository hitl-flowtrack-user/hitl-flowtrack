import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where } from "firebase/firestore";

const PurchaseModule = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    supplier: '',
    purchasePrice: '',
    retailPrice: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Record the Purchase in History
      await addDoc(collection(db, "purchase_records"), {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        retailPrice: Number(formData.retailPrice),
        quantity: Number(formData.quantity),
        timestamp: serverTimestamp()
      });

      // 2. Update or Add to Inventory
      const invRef = collection(db, "inventory_records");
      const q = query(invRef, where("name", "==", formData.itemName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing item stock
        const itemDoc = querySnapshot.docs[0];
        const newStock = Number(itemDoc.data().stock) + Number(formData.quantity);
        await updateDoc(doc(db, "inventory_records", itemDoc.id), {
          stock: newStock,
          purchasePrice: Number(formData.purchasePrice),
          retailPrice: Number(formData.retailPrice)
        });
      } else {
        // Add as new item in inventory
        await addDoc(collection(db, "inventory_records"), {
          name: formData.itemName,
          stock: Number(formData.quantity),
          purchasePrice: Number(formData.purchasePrice),
          retailPrice: Number(formData.retailPrice),
          category: formData.supplier
        });
      }

      alert("Maal Record ho gaya aur Stock update ho gaya!");
      setFormData({ itemName: '', supplier: '', purchasePrice: '', retailPrice: '', quantity: '' });
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '15px' }}>
      <h2 style={{ color: '#f59e0b', fontSize: '18px' }}>🚚 STOCK PURCHASE (Inward)</h2>
      <form onSubmit={handlePurchase} style={formStyle}>
        <input 
          placeholder="Product Name (e.g. Lays Masala)" 
          value={formData.itemName}
          onChange={e => setFormData({...formData, itemName: e.target.value})} 
          required 
        />
        <input 
          placeholder="Supplier / Company Name" 
          value={formData.supplier}
          onChange={e => setFormData({...formData, supplier: e.target.value})} 
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input 
            type="number" placeholder="Purchase Price" 
            value={formData.purchasePrice}
            onChange={e => setFormData({...formData, purchasePrice: e.target.value})} 
            required 
          />
          <input 
            type="number" placeholder="Retail Price" 
            value={formData.retailPrice}
            onChange={e => setFormData({...formData, retailPrice: e.target.value})} 
            required 
          />
        </div>
        <input 
          type="number" placeholder="Quantity (Pcs/Boxes)" 
          value={formData.quantity}
          onChange={e => setFormData({...formData, quantity: e.target.value})} 
          required 
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Recording...' : 'ADD TO STOCK'}
        </button>
      </form>
    </div>
  );
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' };
const btnStyle = { padding: '15px', background: '#f59e0b', border: 'none', borderRadius: '12px', fontWeight: 'bold', color: '#000' };

export default PurchaseModule;
