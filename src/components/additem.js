import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, doc } from "firebase/firestore";

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
    pcsPerBox: '', qty: '', 
    length: '', width: '', height: '',
    weight: '', purchasePrice: '', tradePrice: '', retailPrice: '',
    minStock: '', maxStock: '',
    barcodeData: '', qrCodeData: '', imageUrl: null 
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- RESPONSIVE CSS STYLES ---
  const styles = `
    .add-item-container { background-color: #000; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #fff; }
    .layout-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 25px; max-width: 1200px; margin: 0 auto; }
    
    .form-card { background-color: #111; padding: 30px; border-radius: 30px; border: 1px solid #222; }
    .preview-card { background-color: #111; padding: 25px; border-radius: 30px; border: 1px solid #222; text-align: center; position: sticky; top: 20px; height: fit-content; }
    
    .input-group { margin-bottom: 15px; }
    .label-text { display: block; color: #9ca3af; font-size: 11px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #333; background-color: #fff; color: #000; font-size: 14px; outline: none; box-sizing: border-box; }
    .readonly-input { width: 100%; padding: 12px; border-radius: 12px; border: none; background-color: #1a1a1a; color: #f59e0b; font-size: 14px; font-weight: bold; box-sizing: border-box; }
    
    .grid-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .grid-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    
    .btn-main { background-color: #f59e0b; color: #000; width: 100%; padding: 18px; border-radius: 20px; border: none; font-weight: 900; cursor: pointer; margin-top: 20px; text-transform: uppercase; transition: 0.3s; }
    .btn-plus { background-color: #f59e0b; color: #000; width: 35px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-left: 5px; }
    .btn-top { background-color: #f59e0b; color: #000; border: none; border-radius: 10px; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 12px; transition: 0.3s; }

    /* MOBILE ADJUSTMENTS */
    @media (max-width: 900px) {
      .layout-grid { grid-template-columns: 1fr; }
      .preview-card { position: relative; top: 0; margin-top: 10px; }
      .grid-row-3 { grid-template-columns: 1fr; }
      .grid-row-2 { grid-template-columns: 1fr; }
      .mobile-row-3 { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; gap: 10px; }
      .mobile-flex { display: flex !important; }
    }
  `;

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  useEffect(() => {
    if (formData.name && !editData) {
      const generatedCode = `${formData.name.substring(0, 3).toUpperCase()}-${formData.srNo}`;
      setFormData(prev => ({ 
        ...prev, 
        sku: generatedCode, 
        barcodeData: generatedCode, 
        qrCodeData: `ITEM:${formData.name} | CO:${formData.company} | PRICE:${formData.retailPrice}`
      }));
    }
  }, [formData.name, formData.company, formData.retailPrice, formData.srNo, editData]);

  const addOption = (label, list, setter) => {
    const val = prompt(`Add New ${label}:`);
    if (val) setter([...list, val.toUpperCase()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage('UPLOADING...');
      await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
      setStatusMessage('SUCCESS!');
      setTimeout(() => { setStatusMessage(''); setFormData(initialFormState); if(onComplete) onComplete(); }, 2000);
    } catch (err) { alert("Error: " + err.message); setStatusMessage(''); }
  };

  return (
    <div className="add-item-container">
      <style>{styles}</style>
      
      <div className="layout-grid">
        {/* LEFT: FORM SECTION */}
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0, fontSize: '24px' }}>FLOWTRACK INVENTORY</h2>
            <div className="mobile-flex">
              <button type="button" className="btn-top">Template</button>
              <button type="button" className="btn-top" style={{marginLeft:'10px'}} onClick={() => excelInputRef.current.click()}>Excel Import</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-row-2">
              <div className="input-group"><label className="label-text">Serial No</label><input className="readonly-input" value={formData.srNo} readOnly /></div>
              <div className="input-group"><label className="label-text">SKU</label><input className="readonly-input" value={formData.sku} readOnly /></div>
            </div>

            <div className="input-group">
              <label className="label-text">Item Name *</label>
              <input className="custom-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
            </div>

            <div className="grid-row-3">
              <div className="input-group">
                <label className="label-text">Company *</label>
                <div style={{display:'flex'}}><select className="custom-input" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} required><option value="">Select</option>{companies.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Company', companies, setCompanies)} className="btn-plus">+</button></div>
              </div>
              <div className="input-group">
                <label className="label-text">Category *</label>
                <div style={{display:'flex'}}><select className="custom-input" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} required><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Category', categories, setCategories)} className="btn-plus">+</button></div>
              </div>
              <div className="input-group">
                <label className="label-text">Sub-Category *</label>
                <div style={{display:'flex'}}><select className="custom-input" value={formData.subCategory} onChange={e=>setFormData({...formData, subCategory: e.target.value})} required><option value="">Select</option>{subCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Sub-Category', subCategories, setSubCategories)} className="btn-plus">+</button></div>
              </div>
            </div>

            <div className="grid-row-2">
              <div className="input-group"><label className="label-text">Pcs Per Box *</label><input type="number" className="custom-input" value={formData.pcsPerBox} onChange={e=>setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
              <div className="input-group"><label className="label-text">Quantity</label><input type="number" className="custom-input" value={formData.qty} onChange={e=>setFormData({...formData, qty: e.target.value})} /></div>
            </div>

            <div className="input-group">
              <label className="label-text">Volume (L x W x H)</label>
              <div className="mobile-row-3" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input placeholder="L" className="custom-input" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                <input placeholder="W" className="custom-input" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                <input placeholder="H" className="custom-input" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div className="input-group"><label className="label-text">Weight (Grams per box)</label><input type="number" className="custom-input" value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} /></div>

            <div className="grid-row-3">
              <div className="input-group"><label className="label-text">Purchase Price *</label><input type="number" className="custom-input" value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice: e.target.value})} required /></div>
              <div className="input-group"><label className="label-text">Trade Price *</label><input type="number" className="custom-input" value={formData.tradePrice} onChange={e=>setFormData({...formData, tradePrice: e.target.value})} required /></div>
              <div className="input-group"><label className="label-text">Retail Price *</label><input type="number" className="custom-input" value={formData.retailPrice} onChange={e=>setFormData({...formData, retailPrice: e.target.value})} required /></div>
            </div>

            <div className="grid-row-2">
              <div className="input-group"><label className="label-text">Min Stock *</label><input type="number" className="custom-input" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} required /></div>
              <div className="input-group"><label className="label-text">Max Stock *</label><input type="number" className="custom-input" value={formData.maxStock} onChange={e=>setFormData({...formData, maxStock: e.target.value})} required /></div>
            </div>

            <button type="submit" className="btn-main">{statusMessage || "SAVE ITEM TO CLOUD"}</button>
          </form>
        </div>

        {/* RIGHT: PREVIEW CARD SECTION */}
        <div className="preview-card">
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" /> : <span style={{ color: '#444', fontSize: '24px', fontWeight: 'bold' }}>IMAGE PREVIEW</span>}
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: '900', fontStyle: 'italic', margin: '10px 0' }}>{formData.name || "PRODUCT NAME"}</h3>
          <p style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>{formData.company || "COMPANY"}</p>

          <div style={{ textAlign: 'left', background: '#000', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #222' }}>
            <label className="label-text" style={{fontSize: '9px'}}>Barcode Text</label>
            <div style={{fontSize:'13px', color:'#f59e0b', fontWeight:'bold', marginBottom:'10px'}}>{formData.barcodeData || '---'}</div>
            <label className="label-text" style={{fontSize: '9px'}}>QR Text</label>
            <div style={{fontSize:'10px', color:'#888', wordBreak: 'break-all'}}>{formData.qrCodeData || '---'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '15px', color: '#000' }}>
               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>[ QR ]</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>QR CODE</span>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '15px', color: '#000' }}>
               <div style={{ fontSize: '16px', fontWeight: 'bold' }}>||||| || |</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>BARCODE</span>
            </div>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden onChange={e => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({...formData, imageUrl: reader.result}); reader.readAsDataURL(file); }
      }} />
      <input type="file" ref={excelInputRef} hidden accept=".xlsx, .xls" />
    </div>
  );
};

export default AddItem;
