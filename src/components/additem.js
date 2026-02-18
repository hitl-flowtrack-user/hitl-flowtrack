import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp, getDocs, query, where, writeBatch, doc, updateDoc } from "firebase/firestore";

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [companies, setCompanies] = useState(['ELITE CO', 'GENERIC']);
  const [categories, setCategories] = useState(['ELECTRONICS', 'GENERAL']);
  const [subCategories, setSubCategories] = useState(['STANDARD']);

  const initialFormState = {
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: 'AUTO-GEN',
    name: '', company: '', category: '', subCategory: '', 
    pcsPerBox: '', openingStock: '', 
    length: '', width: '', height: '',
    weight: '', purchasePrice: '', tradePrice: '', retailPrice: '',
    minStock: '', maxStock: '',
    barcodeData: '', qrCodeData: '', imageUrl: null 
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editData) { setFormData({ ...editData }); } 
    else { setFormData(initialFormState); }
  }, [editData]);

  const styles = `
    .add-item-container { background-color: #000; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #fff; }
    .layout-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 25px; max-width: 1200px; margin: 0 auto; }
    .form-card { background-color: #111; padding: 30px; border-radius: 30px; border: 1px solid #222; }
    .preview-card { background-color: #111; padding: 25px; border-radius: 30px; border: 1px solid #222; text-align: center; position: sticky; top: 20px; height: fit-content; }
    
    .input-group-row { display: flex; gap: 15px; width: 60%; margin-bottom: 20px; }
    .input-group-single { width: 60%; margin-bottom: 20px; }
    .flex-1 { flex: 1; }
    
    .label-text { display: block; color: #9ca3af; font-size: 11px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #333; background-color: #fff; color: #000; font-size: 15px; outline: none; box-sizing: border-box; }
    .readonly-input { width: 100%; padding: 14px; border-radius: 12px; border: none; background-color: #1a1a1a; color: #f59e0b; font-size: 14px; font-weight: bold; box-sizing: border-box; }
    
    .btn-plus { background-color: #f59e0b; color: #000; width: 60px; height: 50px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-left: 8px; font-size: 26px; display: flex; align-items: center; justify-content: center; }
    .btn-main { background-color: #f59e0b; color: #000; width: 60%; padding: 20px; border-radius: 20px; border: none; font-weight: 900; cursor: pointer; margin-top: 25px; text-transform: uppercase; font-size: 16px; }
    .btn-top { background-color: #f59e0b; color: #000; border: none; border-radius: 10px; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 12px; }
    
    .preview-data-box { text-align: left; background: #000; padding: 15px; border-radius: 15px; margin-top: 15px; border: 1px solid #222; }
    .qr-preview-box { border: 2px solid #fff !important; }

    @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } .input-group-row, .input-group-single, .btn-main { width: 100%; } }
  `;

  useEffect(() => {
    if (formData.name && !editData) {
      const nameUpper = formData.name.toUpperCase();
      const L = formData.length || '0';
      const W = formData.width || '0';
      const H = formData.height || '0';
      const volStr = `|VOL:${L}x${W}x${H}`;
      const weightStr = `|WT:${formData.weight || '0'}G`;
      
      const bText = `SN:${formData.srNo}|SKU:${formData.sku}|PCS:${formData.pcsPerBox || 0}${volStr}${weightStr}|PUR:${formData.purchasePrice || 0}|MIN:${formData.minStock || 0}|MAX:${formData.maxStock || 0}`;
      const qText = `ITEM:${nameUpper}|CO:${(formData.company || '').toUpperCase()}|CAT:${(formData.category || '').toUpperCase()}|PCS:${formData.pcsPerBox || 0}`;
      
      setFormData(prev => ({ 
        ...prev, 
        sku: `${nameUpper.substring(0, 3)}-${prev.srNo}`,
        barcodeData: bText, 
        qrCodeData: qText
      }));
    }
  }, [formData.name, formData.company, formData.category, formData.subCategory, formData.pcsPerBox, formData.weight, formData.length, formData.width, formData.height, formData.purchasePrice, formData.minStock, formData.maxStock, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage('SAVING...');
      if (editData) {
        await updateDoc(doc(db, "inventory_records", editData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        const qName = query(collection(db, "inventory_records"), where("name", "==", formData.name.toUpperCase()));
        const snap = await getDocs(qName);
        if (!snap.empty) { alert("Item Name already exists!"); setStatusMessage(''); return; }
        await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
      }
      setStatusMessage('DONE!');
      setTimeout(() => { setStatusMessage(''); if(onComplete) onComplete(); setFormData(initialFormState); }, 1500);
    } catch (err) { alert(err.message); setStatusMessage(''); }
  };

  return (
    <div className="add-item-container">
      <style>{styles}</style>
      <div className="layout-grid">
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0 }}>FLOWTRACK INVENTORY</h2>
            <div>
              <button type="button" className="btn-top" onClick={() => {/*Template logic*/}}>Template</button>
              <button type="button" className="btn-top" style={{marginLeft:'10px'}} onClick={() => excelInputRef.current.click()}>Excel Import</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SR & SKU */}
            <div className="input-group-row">
              <div className="flex-1"><label className="label-text">Serial No</label><input className="readonly-input" value={formData.srNo} readOnly /></div>
              <div className="flex-1"><label className="label-text">SKU</label><input className="readonly-input" value={formData.sku} readOnly /></div>
            </div>

            {/* Name */}
            <div className="input-group-single"><label className="label-text">Item Name *</label><input className="custom-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required /></div>
            
            {/* Company, Category, Sub-Category */}
            {[ {label:'Company', key:'company', list:companies, set:setCompanies}, 
               {label:'Category', key:'category', list:categories, set:setCategories}, 
               {label:'Sub-Category', key:'subCategory', list:subCategories, set:setSubCategories} 
            ].map(item => (
              <div className="input-group-single" key={item.key}><label className="label-text">{item.label} *</label>
                <div style={{display:'flex'}}>
                  <select className="custom-input" value={formData[item.key]} onChange={e=>setFormData({...formData, [item.key]: e.target.value.toUpperCase()})} required>
                    <option value="">Select</option>{item.list.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" onClick={()=>item.set([...item.list, prompt(`New ${item.label}`)?.toUpperCase()])} className="btn-plus">+</button>
                </div>
              </div>
            ))}

            {/* Pcs per box & Weight */}
            <div className="input-group-row">
              <div className="flex-1"><label className="label-text">Pcs Per Box *</label><input type="number" className="custom-input" value={formData.pcsPerBox} onChange={e=>setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
              <div className="flex-1"><label className="label-text">Weight (Grams)</label><input type="number" className="custom-input" value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} /></div>
            </div>

            {/* Opening Stock & Purchase Price */}
            <div className="input-group-row">
              <div className="flex-1"><label className="label-text">Opening Stock</label><input type="number" className="custom-input" value={formData.openingStock} onChange={e=>setFormData({...formData, openingStock: e.target.value})} /></div>
              <div className="flex-1"><label className="label-text">Purchase Price *</label><input type="number" className="custom-input" value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice: e.target.value})} required /></div>
            </div>

            {/* Volume */}
            <div className="input-group-single"><label className="label-text">Volume (L x W x H)</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input placeholder="L" className="custom-input" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                <input placeholder="W" className="custom-input" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                <input placeholder="H" className="custom-input" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            {/* Trade Price & Retail Price */}
            <div className="input-group-row">
              <div className="flex-1"><label className="label-text">Trade Price *</label><input type="number" className="custom-input" value={formData.tradePrice} onChange={e=>setFormData({...formData, tradePrice: e.target.value})} required /></div>
              <div className="flex-1"><label className="label-text">Retail Price *</label><input type="number" className="custom-input" value={formData.retailPrice} onChange={e=>setFormData({...formData, retailPrice: e.target.value})} required /></div>
            </div>

            {/* Min & Max Stock */}
            <div className="input-group-row">
              <div className="flex-1"><label className="label-text">Min Stock *</label><input type="number" className="custom-input" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} required /></div>
              <div className="flex-1"><label className="label-text">Max Stock *</label><input type="number" className="custom-input" value={formData.maxStock} onChange={e=>setFormData({...formData, maxStock: e.target.value})} required /></div>
            </div>
            
            <button type="submit" className="btn-main">{statusMessage || (editData ? "UPDATE ITEM" : "SAVE ITEM")}</button>
          </form>
        </div>

        <div className="preview-card">
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" /> : <span style={{ color: '#444' }}>IMAGE</span>}
          </div>
          <h3 style={{ fontStyle: 'italic' }}>{formData.name || "PRODUCT NAME"}</h3>
          <div className="preview-data-box">
            <label className="label-text" style={{color: '#f59e0b'}}>Barcode Text</label>
            <div style={{fontSize:'11px', wordBreak: 'break-all'}}>{formData.barcodeData}</div>
          </div>
          <div className="preview-data-box qr-preview-box">
            <label className="label-text" style={{color: '#f59e0b'}}>QR Text</label>
            <div style={{fontSize:'10px', color:'#888', wordBreak: 'break-all'}}>{formData.qrCodeData}</div>
          </div>
        </div>
      </div>
      <input type="file" ref={excelInputRef} hidden accept=".xlsx, .xls" />
    </div>
  );
};

export default AddItem;
