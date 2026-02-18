import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddItem = () => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '', company: 'ELITE CO', category: 'ELECTRONICS', subClass: 'STANDARD', 
    weight: 0, pcsPerBox: '', purchasePrice: '', retailPrice: '', 
    minStock: '', maxStock: '', specsEN: '', specsUR: '', imageUrl: null, sku: 'AUTO-GEN'
  });

  useEffect(() => {
    if (formData.name) {
      const generatedSKU = `${formData.name.substring(0, 3).toUpperCase()}-${formData.weight}KG-${formData.srNo}`;
      setFormData(prev => ({ ...prev, sku: generatedSKU }));
    }
  }, [formData.name, formData.weight, formData.srNo]);

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

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, imageUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '15px', border: 'none', marginBottom: '10px', backgroundColor: '#fff', color: '#000' };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', color: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#111', padding: '30px', borderRadius: '30px' }}>
        <h1 style={{ fontStyle: 'italic', fontWeight: '900' }}>ADD ITEM</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input placeholder="SR NO" value={formData.srNo} readOnly style={{...inputStyle, backgroundColor: '#333', color: '#888'}} />
            <input placeholder="SKU" value={formData.sku} readOnly style={{...inputStyle, backgroundColor: '#333', color: '#888'}} />
          </div>
          <input placeholder="ITEM NAME *" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <select style={inputStyle} onChange={e => setFormData({...formData, company: e.target.value})}><option>ELITE CO</option><option>GENERIC</option></select>
            <select style={inputStyle} onChange={e => setFormData({...formData, category: e.target.value})}><option>ELECTRONICS</option><option>GENERAL</option></select>
            <select style={inputStyle} onChange={e => setFormData({...formData, subClass: e.target.value})}><option>STANDARD</option></select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="number" placeholder="PURCHASE PRICE" style={inputStyle} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
            <input type="number" placeholder="RETAIL PRICE" style={inputStyle} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
          </div>
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed #333', padding: '20px', textAlign: 'center', cursor: 'pointer', borderRadius: '20px', marginBottom: '10px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} width="100" alt="preview" /> : "UPLOAD IMAGE"}
          </div>
          <input type="file" ref={fileInputRef} hidden onChange={handleImage} />
          <button type="submit" style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>
            {status || "SAVE ITEM TO CLOUD"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;