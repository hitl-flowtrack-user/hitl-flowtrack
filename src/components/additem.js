import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [companies, setCompanies] = useState(['ELITE CO', 'GENERIC']);
  const [categories, setCategories] = useState(['ELECTRONICS', 'GENERAL']);
  const [subClasses, setSubClasses] = useState(['STANDARD']);

  const initialFormState = {
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '', company: '', category: '', subClass: '', 
    specsEN: '', specsUR: '', sku: 'AUTO-GEN', barcodeData: '', 
    qrCodeData: '', minStock: '', maxStock: '',
    purchasePrice: '', retailPrice: '', weight: 0, pcsPerBox: '',
    imageUrl: null 
  };

  const [formData, setFormData] = useState(initialFormState);

  // Styling Objects for Premium Gold/Black Look
  const styles = {
    container: { backgroundColor: '#000', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif', color: '#fff' },
    card: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' },
    formSection: { backgroundColor: '#111', padding: '40px', borderRadius: '40px', border: '1px solid #222' },
    previewSection: { backgroundColor: '#111', padding: '30px', borderRadius: '50px', border: '1px solid #222', textAlign: 'center', position: 'sticky', top: '20px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' },
    input: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#fff', color: '#000', fontSize: '14px', outline: 'none' },
    readOnlyInput: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#333', color: '#888', fontSize: '14px', fontStyle: 'italic' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
    button: { width: '100%', padding: '20px', backgroundColor: '#f59e0b', color: '#000', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' },
    secondaryBtn: { backgroundColor: '#222', color: '#fff', padding: '8px 15px', borderRadius: '10px', fontSize: '10px', border: '1px solid #333', cursor: 'pointer', marginLeft: '10px' },
    plusBtn: { backgroundColor: '#f59e0b33', color: '#f59e0b', width: '45px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }
  };

  useEffect(() => {
    if (editData) setFormData(editData);
    else setFormData(initialFormState);
  }, [editData]);

  useEffect(() => {
    if (formData.name.length >= 1 && !editData) {
      const generatedSKU = `${formData.name.substring(0, 3).toUpperCase()}-${formData.weight || 0}KG-${formData.srNo}`;
      const qrFilter = `NM:${formData.name.toUpperCase()} | CO:${formData.company} | PRC:${formData.retailPrice}`;
      setFormData(prev => ({ ...prev, sku: generatedSKU, barcodeData: generatedSKU, qrCodeData: qrFilter }));
    }
  }, [formData.name, formData.weight, formData.retailPrice, formData.company, formData.srNo, editData]);

  const downloadExcelTemplate = () => {
    const templateData = [{ Name: "ITEM NAME", Company: "ELITE CO", Category: "ELECTRONICS", SubClass: "STANDARD", Weight: 1, PcsPerBox: 12, PurchasePrice: 100, RetailPrice: 150, MinStock: 5, MaxStock: 50, SpecsEN: "Specs", SpecsUR: "تفصیل" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Elite_Template.xlsx");
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
        setStatusMessage('IMPORTING...');
        const batch = writeBatch(db);
        data.forEach(item => {
          if (item.Name) {
            const ref = doc(collection(db, "inventory_records"));
            batch.set(ref, { ...item, srNo: `SR-${Math.floor(1000+Math.random()*9000)}`, itemName: item.Name.toUpperCase(), createdAt: serverTimestamp() });
          }
        });
        await batch.commit();
        setStatusMessage('DONE!');
        setTimeout(() => setStatusMessage(''), 2000);
      } catch (err) { alert("Import Failed"); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.company) return alert("Please fill mandatory fields");
    try {
      setStatusMessage('SAVING...');
      if (editData) {
        await updateDoc(doc(db, "inventory_records", editData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "inventory_records"), { ...formData, itemName: formData.name.toUpperCase(), createdAt: serverTimestamp() });
      }
      setStatusMessage('SUCCESS!');
      setTimeout(() => { setStatusMessage(''); setFormData(initialFormState); if (onComplete) onComplete(); }, 1500);
    } catch (err) { alert("Error saving to cloud"); setStatusMessage(''); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Left Side: Form */}
        <div style={styles.formSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontStyle: 'italic', fontWeight: '900', fontSize: '28px' }}>{editData ? "UPDATE ITEM" : "ADD ITEM"}</h2>
            <div>
              <button type="button" onClick={downloadExcelTemplate} style={styles.secondaryBtn}>TEMPLATE</button>
              <button type="button" onClick={() => excelInputRef.current.click()} style={styles.secondaryBtn}>EXCEL IMPORT</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Serial No</label><input style={styles.readOnlyInput} value={formData.srNo} readOnly /></div>
              <div style={styles.inputGroup}><label style={styles.label}>SKU</label><input style={styles.readOnlyInput} value={formData.sku} readOnly /></div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Barcode Value</label><input style={styles.readOnlyInput} value={formData.barcodeData} readOnly /></div>
              <div style={styles.inputGroup}><label style={styles.label}>QR Value</label><input style={styles.readOnlyInput} value={formData.qrCodeData} readOnly /></div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Item Name *</label>
              <input style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
            </div>

            <div style={styles.grid3}>
               <div style={styles.inputGroup}><label style={styles.label}>Company *</label>
                 <select style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}><option value="">Select</option>{companies.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div style={styles.inputGroup}><label style={styles.label}>Category *</label>
                 <select style={styles.input} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option value="">Select</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div style={styles.inputGroup}><label style={styles.label}>SubClass</label>
                 <select style={styles.input} value={formData.subClass} onChange={e => setFormData({...formData, subClass: e.target.value})}><option value="">Select</option>{subClasses.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Purchase Price</label><input type="number" style={styles.input} value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Retail Price</label><input type="number" style={styles.input} value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} /></div>
            </div>

            <div style={styles.grid2}>
                <div style={styles.inputGroup}><label style={styles.label}>Min Stock</label><input type="number" style={styles.input} value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Max Stock</label><input type="number" style={styles.input} value={formData.maxStock} onChange={e => setFormData({...formData, maxStock: e.target.value})} /></div>
            </div>

            <div style={styles.inputGroup}><label style={styles.label}>Specs (Urdu)</label>
              <textarea dir="rtl" style={{...styles.input, height: '80px', fontFamily: 'inherit'}} value={formData.specsUR} onChange={e => setFormData({...formData, specsUR: e.target.value})} />
            </div>

            <button type="submit" style={styles.button}>{statusMessage || "SAVE ITEM TO CLOUD"}</button>
          </form>
        </div>

        {/* Right Side: Preview Card */}
        <div style={styles.previewSection}>
          <div style={{ backgroundColor: '#f59e0b', color: '#000', display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
            PCS PER BOX: {formData.pcsPerBox || 0}
          </div>
          
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" /> : <span style={{ color: '#333', fontSize: '40px', fontWeight: 'bold', fontStyle: 'italic' }}>IMAGE</span>}
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', marginBottom: '5px' }}>{formData.name || "PRODUCT NAME"}</h3>
          <p style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px', marginBottom: '30px' }}>{formData.company || "COMPANY ID"}</p>

          <div style={styles.grid2}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '20px', color: '#000' }}>
               <div style={{ fontSize: '20px', fontWeight: 'bold' }}>[ QR ]</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>QR PRINT</span>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '20px', color: '#000' }}>
               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>||||| || |</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>BARCODE PRINT</span>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} hidden onChange={e => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({...formData, imageUrl: reader.result}); reader.readAsDataURL(file); }
      }} />
      <input type="file" ref={excelInputRef} hidden accept=".xlsx, .xls" onChange={handleExcelImport} />
    </div>
  );
};

export default AddItem;
