import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp, getDocs, query, writeBatch, doc, updateDoc, onSnapshot } from "firebase/firestore";

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const initialFormState = {
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: 'AUTO-GEN',
    name: '', company: '', category: '', subCategory: '', warehouse: '',
    pcsPerBox: '', openingStock: '', totalPcs: 0,
    length: '', width: '', height: '',
    weightKg: '', totalWeight: 0, purchasePrice: '', tradePrice: '', retailPrice: '',
    minStock: '', maxStock: '',
    barcodeData: '', qrCodeData: '', imageUrl: null 
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch unique values for searchable dropdowns
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory_records"), (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      
      const uniqueComps = [...new Set(docs.map(item => item.company))].filter(Boolean);
      const uniqueCats = [...new Set(docs.map(item => item.category))].filter(Boolean);
      const uniqueSubs = [...new Set(docs.map(item => item.subCategory))].filter(Boolean);
      const uniqueWHs = [...new Set(docs.map(item => item.warehouse))].filter(Boolean);

      setCompanies(uniqueComps.length > 0 ? uniqueComps : ['ELITE CO', 'GENERIC']);
      setCategories(uniqueCats.length > 0 ? uniqueCats : ['ELECTRONICS', 'GENERAL']);
      setSubCategories(uniqueSubs.length > 0 ? uniqueSubs : ['STANDARD']);
      setWarehouses(uniqueWHs.length > 0 ? uniqueWHs : ['MAIN STORE', 'WAREHOUSE A']);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editData) { setFormData({ ...editData }); } 
    else { setFormData(initialFormState); }
  }, [editData]);

  // Real-time Calculations
  useEffect(() => {
    const stock = parseFloat(formData.openingStock) || 0;
    const pcsBox = parseFloat(formData.pcsPerBox) || 0;
    const weightVal = parseFloat(formData.weightKg) || 0;

    const totalPcsCalc = stock * pcsBox;
    const totalWeightCalc = (stock * weightVal).toFixed(2);

    const nameUpper = (formData.name || '').toUpperCase();
    const L = formData.length || '0';
    const W = formData.width || '0';
    const H = formData.height || '0';
    
    const bText = `SN:${formData.srNo}|SKU:${formData.sku}|PCS:${formData.pcsPerBox || 0}|VOL:${L}x${W}x${H}|WT:${formData.weightKg || 0}KG|PUR:${formData.purchasePrice || 0}|MIN:${formData.minStock || 0}|MAX:${formData.maxStock || 0}`;
    const qText = `ITEM:${nameUpper}|CO:${(formData.company || '').toUpperCase()}|WH:${(formData.warehouse || '').toUpperCase()}|TPCS:${totalPcsCalc}`;

    setFormData(prev => ({ 
      ...prev, 
      totalPcs: totalPcsCalc,
      totalWeight: totalWeightCalc,
      sku: nameUpper ? `${nameUpper.substring(0, 3)}-${prev.srNo}` : prev.sku,
      barcodeData: bText,
      qrCodeData: qText
    }));
  }, [formData.name, formData.openingStock, formData.pcsPerBox, formData.company, formData.warehouse, formData.length, formData.width, formData.height, formData.weightKg, formData.purchasePrice, formData.minStock, formData.maxStock]);

  const styles = `
    .add-item-container { background-color: #000; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #fff; }
    .layout-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 25px; max-width: 1200px; margin: 0 auto; }
    .form-card { background-color: #111; padding: 20px; border-radius: 30px; border: 1px solid #222; display: flex; flex-direction: column; align-items: center; width: fit-content; margin: 0 auto; }
    .form-inner-container { width: 500px; display: flex; flex-direction: column; padding: 10px; }
    .preview-card { background-color: #111; padding: 25px; border-radius: 30px; border: 1px solid #222; text-align: center; position: sticky; top: 20px; height: fit-content; }
    .input-group-row { display: flex; gap: 15px; width: 100%; margin-bottom: 15px; }
    .input-group-single { width: 100%; margin-bottom: 15px; }
    .flex-1-5 { flex: 1.5; }
    .flex-1 { flex: 1; }
    .label-text { display: block; color: #9ca3af; font-size: 11px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
    .custom-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #333; background-color: #fff; color: #000; font-size: 14px; outline: none; box-sizing: border-box; }
    .readonly-input { width: 100%; padding: 12px; border-radius: 10px; border: none; background-color: #1a1a1a; color: #f59e0b; font-size: 13px; font-weight: bold; box-sizing: border-box; }
    .btn-plus { background-color: #f59e0b; color: #000; width: 45px; height: 42px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-left: 5px; font-size: 20px; display: flex; align-items: center; justify-content: center; }
    .btn-main { background-color: #f59e0b; color: #000; width: 100%; padding: 18px; border-radius: 15px; border: none; font-weight: 900; cursor: pointer; margin-top: 20px; text-transform: uppercase; font-size: 15px; }
    .btn-top { background-color: #f59e0b; color: #000; border: none; border-radius: 8px; padding: 8px 12px; font-weight: bold; cursor: pointer; font-size: 10px; flex: 1; }
    .preview-data-box { text-align: left; background: #000; padding: 12px; border-radius: 20px; margin-top: 10px; border: 2px solid #f59e0b; }
    @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } .form-inner-container { width: 100%; } }
  `;

  // Download Template Logic
  const downloadTemplate = () => {
    const headers = [["Item Name", "Company", "Category", "Sub-Category", "Warehouse", "Opening Stock", "Pcs Per Box", "Weight KG", "Length", "Width", "Height", "Purchase Price", "Trade Price", "Retail Price", "Min Stock", "Max Stock"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryTemplate");
    XLSX.writeFile(wb, "Inventory_Import_Template.xlsx");
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatusMessage("IMPORTING...");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const batch = writeBatch(db);
        
        data.forEach((item) => {
          const newDocRef = doc(collection(db, "inventory_records"));
          const sr = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
          const name = (item["Item Name"] || "UNKNOWN").toUpperCase();
          const openStock = parseFloat(item["Opening Stock"]) || 0;
          const wt = parseFloat(item["Weight KG"]) || 0;
          const pBox = parseFloat(item["Pcs Per Box"]) || 0;
          
          batch.set(newDocRef, {
            name, srNo: sr, sku: `${name.substring(0, 3)}-${sr}`,
            company: (item["Company"] || "GENERIC").toUpperCase(),
            category: (item["Category"] || "GENERAL").toUpperCase(),
            subCategory: (item["Sub-Category"] || "STANDARD").toUpperCase(),
            warehouse: (item["Warehouse"] || "MAIN STORE").toUpperCase(),
            pcsPerBox: pBox,
            openingStock: openStock,
            totalPcs: openStock * pBox,
            totalWeight: (openStock * wt).toFixed(2),
            length: item["Length"] || '0',
            width: item["Width"] || '0',
            height: item["Height"] || '0',
            weightKg: wt,
            purchasePrice: item["Purchase Price"] || 0,
            tradePrice: item["Trade Price"] || 0,
            retailPrice: item["Retail Price"] || 0,
            minStock: item["Min Stock"] || 0,
            maxStock: item["Max Stock"] || 0,
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
        setStatusMessage("SUCCESS!");
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (err) { alert("Import Error: " + err.message); setStatusMessage(""); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage('SAVING...');
      if (editData) {
        await updateDoc(doc(db, "inventory_records", editData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
      }
      setStatusMessage('DONE!');
      setTimeout(() => { setStatusMessage(''); if(onComplete) onComplete(); setFormData(initialFormState); }, 1500);
    } catch (err) { alert(err.message); setStatusMessage(''); }
  };

  return (
    <div className="add-item-container">
      <style>{styles}</style>
      <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', textAlign:'center', marginBottom: '20px' }}>PRODUCT REGISTRATION</h2>
      <div className="layout-grid">
        <div className="form-card">
          <div className="form-inner-container">
            <form onSubmit={handleSubmit}>
              <div className="input-group-single"><label className="label-text">Item Name *</label><input className="custom-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required /></div>
              
              <div className="input-group-row">
                <div className="flex-1-5"><label className="label-text">Company *</label>
                  <div style={{display:'flex'}}>
                    <input list="company-list" className="custom-input" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value.toUpperCase()})} placeholder="Search/Select" required />
                    <datalist id="company-list">{companies.map(c=><option key={c} value={c} />)}</datalist>
                    <button type="button" onClick={()=>setCompanies([...companies, prompt("New Company")?.toUpperCase()])} className="btn-plus">+</button>
                  </div>
                </div>
                <div className="flex-1-5"><label className="label-text">Category *</label>
                  <div style={{display:'flex'}}>
                    <input list="category-list" className="custom-input" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value.toUpperCase()})} placeholder="Search/Select" required />
                    <datalist id="category-list">{categories.map(c=><option key={c} value={c} />)}</datalist>
                    <button type="button" onClick={()=>setCategories([...categories, prompt("New Category")?.toUpperCase()])} className="btn-plus">+</button>
                  </div>
                </div>
              </div>

              <div className="input-group-row">
                <div className="flex-1-5"><label className="label-text">Sub-Category *</label>
                  <div style={{display:'flex'}}>
                    <input list="sub-list" className="custom-input" value={formData.subCategory} onChange={e=>setFormData({...formData, subCategory: e.target.value.toUpperCase()})} placeholder="Search/Select" required />
                    <datalist id="sub-list">{subCategories.map(c=><option key={c} value={c} />)}</datalist>
                    <button type="button" onClick={()=>setSubCategories([...subCategories, prompt("New Sub-Category")?.toUpperCase()])} className="btn-plus">+</button>
                  </div>
                </div>
                <div className="flex-1-5"><label className="label-text">Warehouse *</label>
                  <div style={{display:'flex'}}>
                    <input list="wh-list" className="custom-input" value={formData.warehouse} onChange={e=>setFormData({...formData, warehouse: e.target.value.toUpperCase()})} placeholder="Search/Select" required />
                    <datalist id="wh-list">{warehouses.map(w=><option key={w} value={w} />)}</datalist>
                    <button type="button" onClick={()=>setWarehouses([...warehouses, prompt("New Warehouse")?.toUpperCase()])} className="btn-plus">+</button>
                  </div>
                </div>
              </div>

              <div className="input-group-row">
                <div className="flex-1"><label className="label-text">Opening Stock</label><input type="number" className="custom-input" value={formData.openingStock} onChange={e=>setFormData({...formData, openingStock: e.target.value})} /></div>
                <div className="flex-1"><label className="label-text">Pcs Per Box *</label><input type="number" className="custom-input" value={formData.pcsPerBox} onChange={e=>setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
                <div className="flex-1"><label className="label-text">Weight (KG)</label><input type="number" step="0.01" className="custom-input" value={formData.weightKg} onChange={e=>setFormData({...formData, weightKg: e.target.value})} /></div>
              </div>

              <div className="input-group-row">
                <div className="flex-1"><label className="label-text">Total PCS (Auto)</label><input className="readonly-input" value={formData.totalPcs} readOnly /></div>
                <div className="flex-1"><label className="label-text">Total Weight (KG)</label><input className="readonly-input" value={formData.totalWeight} readOnly /></div>
              </div>

              <div className="input-group-single"><label className="label-text">Volume (L x W x H)</label>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}><input placeholder="L" className="custom-input" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} /><input placeholder="W" className="custom-input" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} /><input placeholder="H" className="custom-input" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} /></div>
              </div>

              <div className="input-group-single"><label className="label-text">Purchase Price *</label><input type="number" className="custom-input" value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice: e.target.value})} required /></div>

              <div className="input-group-row">
                <div className="flex-1"><label className="label-text">Trade Price *</label><input type="number" className="custom-input" value={formData.tradePrice} onChange={e=>setFormData({...formData, tradePrice: e.target.value})} required /></div>
                <div className="flex-1"><label className="label-text">Retail Price *</label><input type="number" className="custom-input" value={formData.retailPrice} onChange={e=>setFormData({...formData, retailPrice: e.target.value})} required /></div>
              </div>

              <div className="input-group-row">
                <div className="flex-1"><label className="label-text">Min Stock *</label><input type="number" className="custom-input" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} required /></div>
                <div className="flex-1"><label className="label-text">Max Stock *</label><input type="number" className="custom-input" value={formData.maxStock} onChange={e=>setFormData({...formData, maxStock: e.target.value})} required /></div>
              </div>
            </form>
          </div>
        </div>

        <div className="preview-card">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button type="button" className="btn-top" onClick={downloadTemplate}>Template</button>
            <button type="button" className="btn-top" onClick={() => excelInputRef.current.click()}>Excel Import</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div className="flex-1"><label className="label-text">SR #</label><input className="readonly-input" style={{textAlign:'center'}} value={formData.srNo} readOnly /></div>
            <div className="flex-1"><label className="label-text">SKU</label><input className="readonly-input" style={{textAlign:'center'}} value={formData.sku} readOnly /></div>
          </div>
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" /> : <span style={{ color: '#444' }}>IMAGE</span>}
          </div>
          <h3 style={{ fontStyle: 'italic', margin: '15px 0' }}>{formData.name || "PRODUCT NAME"}</h3>
          <div className="preview-data-box">
            <label className="label-text" style={{color: '#f59e0b'}}>Barcode Data</label>
            <div style={{fontSize:'10px', color:'#888', wordBreak: 'break-all'}}>{formData.barcodeData}</div>
          </div>
          <div className="preview-data-box">
            <label className="label-text" style={{color: '#f59e0b'}}>QR Data</label>
            <div style={{fontSize:'10px', color:'#888', wordBreak: 'break-all'}}>{formData.qrCodeData}</div>
          </div>
          <button type="submit" className="btn-main" onClick={handleSubmit}>{statusMessage || (editData ? "UPDATE ITEM" : "SAVE ITEM")}</button>
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
