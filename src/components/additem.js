import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp, getDocs, query, where, writeBatch, doc } from "firebase/firestore";

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

  const styles = `
    .add-item-container { background-color: #000; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #fff; }
    .layout-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 25px; max-width: 1200px; margin: 0 auto; }
    .form-card { background-color: #111; padding: 30px; border-radius: 30px; border: 1px solid #222; }
    .preview-card { background-color: #111; padding: 25px; border-radius: 30px; border: 1px solid #222; text-align: center; position: sticky; top: 20px; height: fit-content; }
    .input-group { margin-bottom: 20px; width: 100%; }
    .label-text { display: block; color: #9ca3af; font-size: 11px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #333; background-color: #fff; color: #000; font-size: 15px; outline: none; box-sizing: border-box; }
    .readonly-input { width: 100%; padding: 14px; border-radius: 12px; border: none; background-color: #1a1a1a; color: #f59e0b; font-size: 14px; font-weight: bold; box-sizing: border-box; }
    .grid-row-all { display: flex; flex-direction: column; gap: 5px; }
    .btn-main { background-color: #f59e0b; color: #000; width: 100%; padding: 20px; border-radius: 20px; border: none; font-weight: 900; cursor: pointer; margin-top: 25px; text-transform: uppercase; font-size: 16px; }
    .btn-top { background-color: #f59e0b; color: #000; border: none; border-radius: 10px; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 12px; }
    .btn-plus { background-color: #f59e0b; color: #000; width: 45px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-left: 8px; }
    @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } }
  `;

  // Auto Generate Barcode & QR Professional Text
  useEffect(() => {
    if (formData.name && !editData) {
      const nameUpper = formData.name.toUpperCase();
      const vol = `${formData.length}x${formData.width}x${formData.height}`;
      
      const bText = `SN:${formData.srNo}|PCS:${formData.pcsPerBox}|WT:${formData.weight}G|VOL:${vol}|PUR:${formData.purchasePrice}`;
      const qText = `SKU:${formData.sku}|ITEM:${nameUpper}|CO:${formData.company.toUpperCase()}|CAT:${formData.category.toUpperCase()}|SUB:${formData.subCategory.toUpperCase()}`;
      
      setFormData(prev => ({ 
        ...prev, 
        sku: `${nameUpper.substring(0, 3)}-${prev.srNo}`,
        barcodeData: bText, 
        qrCodeData: qText
      }));
    }
  }, [formData.name, formData.company, formData.pcsPerBox, formData.weight, formData.length, formData.width, formData.height, formData.purchasePrice, editData]);

  // Excel Import Logic
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatusMessage("IMPORTING...");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
        
        const batch = writeBatch(db);
        data.forEach((item) => {
          const newDocRef = doc(collection(db, "inventory_records"));
          batch.set(newDocRef, {
            ...item,
            name: item["Item Name"]?.toUpperCase() || "UNKNOWN",
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
        setStatusMessage("IMPORT SUCCESS!");
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (err) { alert("Import Error: " + err.message); setStatusMessage(""); }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const headers = [{ 
      "Item Name": "SAMPLE", "Company": "ELITE", "Category": "GENERAL", "Sub-Category": "STANDARD", 
      "Pcs Per Box": 10, "Opening Stock": 50, "Length": 5, "Width": 5, "Height": 5, 
      "Weight": 200, "Purchase Price": 500, "Trade Price": 600, "Retail Price": 800, 
      "Min Stock": 5, "Max Stock": 100 
    }];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Inventory_Template.xlsx");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage('SAVING...');
      const qName = query(collection(db, "inventory_records"), where("name", "==", formData.name.toUpperCase()));
      const snap = await getDocs(qName);
      if (!snap.empty) { alert("Item Name already exists!"); setStatusMessage(''); return; }

      await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
      setStatusMessage('SAVED!');
      setTimeout(() => { setStatusMessage(''); setFormData(initialFormState); }, 2000);
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
              <button type="button" className="btn-top" onClick={downloadTemplate}>Template</button>
              <button type="button" className="btn-top" style={{marginLeft:'10px'}} onClick={() => excelInputRef.current.click()}>Excel Import</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid-row-all">
            <div className="input-group"><label className="label-text">Serial No</label><input className="readonly-input" value={formData.srNo} readOnly /></div>
            <div className="input-group"><label className="label-text">SKU</label><input className="readonly-input" value={formData.sku} readOnly /></div>
            <div className="input-group"><label className="label-text">Item Name *</label><input className="custom-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required /></div>
            
            <div className="input-group"><label className="label-text">Company *</label>
              <div style={{display:'flex'}}><select className="custom-input" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value.toUpperCase()})} required><option value="">Select</option>{companies.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>setCompanies([...companies, prompt("New Company")?.toUpperCase()])} className="btn-plus">+</button></div>
            </div>

            <div className="input-group"><label className="label-text">Category *</label>
              <div style={{display:'flex'}}><select className="custom-input" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value.toUpperCase()})} required><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>setCategories([...categories, prompt("New Category")?.toUpperCase()])} className="btn-plus">+</button></div>
            </div>

            <div className="input-group"><label className="label-text">Sub-Category *</label>
              <div style={{display:'flex'}}><select className="custom-input" value={formData.subCategory} onChange={e=>setFormData({...formData, subCategory: e.target.value.toUpperCase()})} required><option value="">Select</option>{subCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>setSubCategories([...subCategories, prompt("New Sub-Category")?.toUpperCase()])} className="btn-plus">+</button></div>
            </div>

            <div className="input-group"><label className="label-text">Pcs Per Box *</label><input type="number" className="custom-input" value={formData.pcsPerBox} onChange={e=>setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
            <div className="input-group"><label className="label-text">Opening Stock</label><input type="number" className="custom-input" value={formData.openingStock} onChange={e=>setFormData({...formData, openingStock: e.target.value})} /></div>

            <div className="input-group"><label className="label-text">Volume (L x W x H) - INCHES</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input placeholder="L" className="custom-input" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                <input placeholder="W" className="custom-input" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                <input placeholder="H" className="custom-input" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div className="input-group"><label className="label-text">Weight (Grams)</label><input type="number" className="custom-input" value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} /></div>
            <div className="input-group"><label className="label-text">Purchase Price *</label><input type="number" className="custom-input" value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice: e.target.value})} required /></div>
            <div className="input-group"><label className="label-text">Trade Price *</label><input type="number" className="custom-input" value={formData.tradePrice} onChange={e=>setFormData({...formData, tradePrice: e.target.value})} required /></div>
            <div className="input-group"><label className="label-text">Retail Price *</label><input type="number" className="custom-input" value={formData.retailPrice} onChange={e=>setFormData({...formData, retailPrice: e.target.value})} required /></div>
            <div className="input-group"><label className="label-text">Min Stock *</label><input type="number" className="custom-input" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} required /></div>
            <div className="input-group"><label className="label-text">Max Stock *</label><input type="number" className="custom-input" value={formData.maxStock} onChange={e=>setFormData({...formData, maxStock: e.target.value})} required /></div>
            
            <div className="input-group"><label className="label-text">Barcode Text (Read Only)</label><input className="readonly-input" value={formData.barcodeData} readOnly /></div>
            <div className="input-group"><label className="label-text">QR Text (Read Only)</label><input className="readonly-input" value={formData.qrCodeData} readOnly /></div>

            <button type="submit" className="btn-main">{statusMessage || "SAVE ITEM TO CLOUD"}</button>
          </form>
        </div>

        <div className="preview-card">
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" /> : <span style={{ color: '#444', fontWeight: 'bold' }}>IMAGE</span>}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic' }}>{formData.name || "PRODUCT NAME"}</h3>
          <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>{formData.company || "COMPANY"}</p>

          <div style={{ textAlign: 'left', background: '#000', padding: '15px', borderRadius: '15px', marginTop: '20px', border: '1px solid #222' }}>
            <label className="label-text" style={{fontSize: '9px'}}>Barcode Text</label>
            <div style={{fontSize:'11px', color:'#f59e0b', marginBottom:'15px', wordBreak: 'break-all'}}>{formData.barcodeData}</div>
            <label className="label-text" style={{fontSize: '9px'}}>QR Text</label>
            <div style={{fontSize:'10px', color:'#888', wordBreak: 'break-all'}}>{formData.qrCodeData}</div>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden onChange={e => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({...formData, imageUrl: reader.result}); reader.readAsDataURL(file); }
      }} />
      <input type="file" ref={excelInputRef} hidden accept=".xlsx, .xls" onChange={handleExcelImport} />
    </div>
  );
};

export default AddItem;
