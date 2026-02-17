import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";

// Helper for UI consistent style
const labelStyle = { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px', display: 'block' };
const inputBase = { width: '100%', padding: '14px', borderRadius: '15px', border: 'none', fontSize: '14px', outline: 'none' };

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [status, setStatus] = useState('');
  
  // Lists for dropdowns
  const [companies, setCompanies] = useState(['ELITE CO', 'GENERIC']);
  const [categories, setCategories] = useState(['ELECTRONICS', 'GENERAL']);
  const [subClasses, setSubClasses] = useState(['STANDARD']);

  const initialForm = {
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '', company: 'ELITE CO', category: 'ELECTRONICS', subClass: 'STANDARD', 
    weight: 0, pcsPerBox: '', purchasePrice: '', retailPrice: '', 
    minStock: '', maxStock: '', specsEN: '', specsUR: '', imageUrl: null,
    sku: 'AUTO-GEN'
  };

  const [formData, setFormData] = useState(initialForm);

  // SKU Logic
  useEffect(() => {
    if (formData.name && !editData) {
      const generatedSKU = `${formData.name.substring(0, 3).toUpperCase()}-${formData.weight}KG-${formData.srNo}`;
      setFormData(prev => ({ ...prev, sku: generatedSKU }));
    }
  }, [formData.name, formData.weight, formData.srNo, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('SAVING TO CLOUD...');
    try {
      // Logic: Hamesha "inventory_records" collection use hogi
      if (editData) {
        await updateDoc(doc(db, "inventory_records", editData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
      }
      setStatus('SAVED SUCCESSFULLY!');
      setTimeout(() => { setStatus(''); setFormData(initialForm); if(onComplete) onComplete(); }, 2000);
    } catch (err) { alert("Error: " + err.message); setStatus(''); }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, imageUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#111', borderRadius: '40px', padding: '40px', border: '1px solid #222' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '900', fontStyle: 'italic' }}>ADD ITEM</h1>
          <button onClick={() => excelInputRef.current.click()} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>EXCEL IMPORT</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Serial No</label><input style={{...inputBase, backgroundColor: '#333', color: '#888'}} value={formData.srNo} readOnly /></div>
            <div><label style={labelStyle}>SKU</label><input style={{...inputBase, backgroundColor: '#333', color: '#888'}} value={formData.sku} readOnly /></div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Name *</label>
            <input style={{...inputBase, backgroundColor: '#fff', color: '#000', fontWeight: 'bold'}} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Company *</label><select style={inputBase} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}>{companies.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={labelStyle}>Category *</label><select style={inputBase} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={labelStyle}>SubClass *</label><select style={inputBase} value={formData.subClass} onChange={e => setFormData({...formData, subClass: e.target.value})}>{subClasses.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Weight (KG)</label><input type="number" style={inputBase} value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
            <div><label style={labelStyle}>Pcs Per Box *</label><input type="number" style={inputBase} value={formData.pcsPerBox} onChange={e => setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Purchase Price *</label><input type="number" style={inputBase} value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} required /></div>
            <div><label style={labelStyle}>Retail Price *</label><input type="number" style={inputBase} value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} required /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Min Stock *</label><input type="number" style={inputBase} value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} required /></div>
            <div><label style={labelStyle}>Max Stock *</label><input type="number" style={inputBase} value={formData.maxStock} onChange={e => setFormData({...formData, maxStock: e.target.value})} required /></div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Specs (English)</label>
            <input style={inputBase} value={formData.specsEN} onChange={e => setFormData({...formData, specsEN: e.target.value})} />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Specs (Urdu)</label>
            <textarea dir="rtl" style={{...inputBase, height: '80px'}} value={formData.specsUR} onChange={e => setFormData({...formData, specsUR: e.target.value})} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {status || "SAVE ITEM TO CLOUD"}
          </button>
        </form>

        <input type="file" ref={excelInputRef} hidden accept=".xlsx,.xls" />
      </div>
    </div>
  );
};

export default AddItem;