import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddItem = () => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '', company: 'Select Company', category: 'Select Category', subClass: 'Select SubClass', 
    weight: 0, pcsPerBox: '', purchasePrice: '', retailPrice: '', 
    minStock: '', maxStock: '', specsEN: '', specsUR: '', imageUrl: null, sku: 'AUTO-GEN'
  });

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '15px', border: 'none', backgroundColor: '#fff', color: '#000', fontSize: '14px' };
  const labelStyle = { color: '#9ca3af', fontSize: '12px', marginBottom: '5px', display: 'block', fontWeight: 'bold' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('SAVING...');
    try {
      await addDoc(collection(db, "inventory_records"), {
        ...formData,
        itemName: formData.name.toUpperCase(),
        createdAt: serverTimestamp()
      });
      setStatus('SUCCESS!');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) { alert(err.message); setStatus(''); }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#111', padding: '40px', borderRadius: '40px', border: '1px solid #222' }}>
        <h1 style={{ color: '#fff', fontStyle: 'italic', fontWeight: '900', marginBottom: '30px' }}>ADD ITEM</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Serial No</label><input style={{...inputStyle, backgroundColor: '#333', color: '#888'}} value={formData.srNo} readOnly /></div>
            <div><label style={labelStyle}>SKU</label><input style={{...inputStyle, backgroundColor: '#333', color: '#888'}} value={formData.sku} readOnly /></div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
             <div><label style={labelStyle}>Company *</label><select style={inputStyle} onChange={e => setFormData({...formData, company: e.target.value})}><option>Select Company</option><option>ELITE CO</option></select></div>
             <div><label style={labelStyle}>Category *</label><select style={inputStyle} onChange={e => setFormData({...formData, category: e.target.value})}><option>Select Category</option></select></div>
             <div><label style={labelStyle}>SubClass *</label><select style={inputStyle} onChange={e => setFormData({...formData, subClass: e.target.value})}><option>Select SubClass</option></select></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Purchase Price *</label><input type="number" style={inputStyle} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} required /></div>
            <div><label style={labelStyle}>Retail Price *</label><input type="number" style={inputStyle} onChange={e => setFormData({...formData, retailPrice: e.target.value})} required /></div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '18px', cursor: 'pointer', marginTop: '20px' }}>
            {status || "SAVE ITEM TO CLOUD"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
