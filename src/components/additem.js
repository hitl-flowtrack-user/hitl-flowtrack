import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuperAdmin] = useState(true);

  // Master Lists for Dropdowns
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

  // --- STYLING (Premium Gold & Black) ---
  const styles = {
    container: { backgroundColor: '#000', minHeight: '100vh', padding: '30px 15px', fontFamily: 'sans-serif', color: '#fff' },
    card: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '30px' },
    formSection: { backgroundColor: '#111', padding: '35px', borderRadius: '40px', border: '1px solid #222' },
    previewSection: { backgroundColor: '#111', padding: '30px', borderRadius: '50px', border: '1px solid #222', textAlign: 'center', position: 'sticky', top: '20px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', color: '#9ca3af', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px 15px', borderRadius: '15px', border: 'none', backgroundColor: '#fff', color: '#000', fontSize: '14px', outline: 'none' },
    readOnlyInput: { width: '100%', padding: '12px 15px', borderRadius: '15px', border: 'none', backgroundColor: '#222', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
    actionBtn: { backgroundColor: '#f59e0b', color: '#000', width: '100%', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer', marginTop: '20px', textTransform: 'uppercase' },
    plusBtn: { backgroundColor: '#f59e0b', color: '#000', width: '40px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }
  };

  useEffect(() => {
    if (editData) setFormData(editData);
    else setFormData(initialFormState);
  }, [editData]);

  // Logic for Auto SKU, Barcode and QR Text
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
      setStatusMessage('SAVED TO CLOUD!');
      setTimeout(() => { setStatusMessage(''); setFormData(initialFormState); }, 2000);
    } catch (err) { alert("Error: " + err.message); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LEFT: FORM FIELDS */}
        <div style={styles.formSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b' }}>FLOWTRACK INVENTORY</h2>
            <div>
              <button onClick={() => {}} style={{ ...styles.plusBtn, width: 'auto', padding: '5px 15px' }}>Template</button>
              <button onClick={() => excelInputRef.current.click()} style={{ ...styles.plusBtn, width: 'auto', padding: '5px 15px', marginLeft: '10px' }}>Excel Import</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>1. Serial No (Read Only)</label><input style={styles.readOnlyInput} value={formData.srNo} readOnly /></div>
              <div style={styles.inputGroup}><label style={styles.label}>2. SKU (Read Only)</label><input style={styles.readOnlyInput} value={formData.sku} readOnly /></div>
            </div>

            <div style={styles.inputGroup}><label style={styles.label}>3. Item Name *</label><input style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>

            <div style={styles.grid3}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>4. Company *</label>
                <div style={{display:'flex'}}><select style={styles.input} value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} required><option value="">Select</option>{companies.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Company', companies, setCompanies)} style={styles.plusBtn}>+</button></div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>5. Category *</label>
                <div style={{display:'flex'}}><select style={styles.input} value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} required><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Category', categories, setCategories)} style={styles.plusBtn}>+</button></div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>6. Sub-Category *</label>
                <div style={{display:'flex'}}><select style={styles.input} value={formData.subCategory} onChange={e=>setFormData({...formData, subCategory: e.target.value})} required><option value="">Select</option>{subCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={()=>addOption('Sub-Category', subCategories, setSubCategories)} style={styles.plusBtn}>+</button></div>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>7. Pcs Per Box *</label><input type="number" style={styles.input} value={formData.pcsPerBox} onChange={e=>setFormData({...formData, pcsPerBox: e.target.value})} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>8. Qty</label><input type="number" style={styles.input} value={formData.qty} onChange={e=>setFormData({...formData, qty: e.target.value})} /></div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>9. Volume (Length x Width x Height)</label>
              <div style={styles.grid3}>
                <input placeholder="L" style={styles.input} value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                <input placeholder="W" style={styles.input} value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                <input placeholder="H" style={styles.input} value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}><label style={styles.label}>10. Weight (Grams per box)</label><input type="number" style={styles.input} value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} /></div>

            <div style={styles.grid3}>
              <div style={styles.inputGroup}><label style={styles.label}>11. Purchase *</label><input type="number" style={styles.input} value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice: e.target.value})} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>12. Trade *</label><input type="number" style={styles.input} value={formData.tradePrice} onChange={e=>setFormData({...formData, tradePrice: e.target.value})} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>13. Retail *</label><input type="number" style={styles.input} value={formData.retailPrice} onChange={e=>setFormData({...formData, retailPrice: e.target.value})} required /></div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>14. Min Stock *</label><input type="number" style={styles.input} value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>15. Max Stock *</label><input type="number" style={styles.input} value={formData.maxStock} onChange={e=>setFormData({...formData, maxStock: e.target.value})} required /></div>
            </div>

            <button type="submit" style={styles.actionBtn}>{statusMessage || "SAVE ITEM TO CLOUD"}</button>
          </form>
        </div>

        {/* RIGHT: CARD VIEW */}
        <div style={styles.previewSection}>
          <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid #333', marginBottom: '20px' }}>
            {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="16. Product" /> : <span style={{ color: '#333', fontSize: '30px', fontWeight: 'bold' }}>16. IMAGE</span>}
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: '#fff' }}>{formData.name || "17. PRODUCT NAME"}</h3>
          <p style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '20px' }}>{formData.company || "18. COMPANY"}</p>

          <div style={{ textAlign: 'left', background: '#000', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
            <label style={styles.label}>19. Barcode Text</label><div style={{fontSize:'12px', color:'#888'}}>{formData.barcodeData || '---'}</div>
            <label style={{...styles.label, marginTop:'10px'}}>20. QR Text</label><div style={{fontSize:'10px', color:'#888'}}>{formData.qrCodeData || '---'}</div>
          </div>

          <div style={styles.grid2}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '20px', color: '#000' }}>
               <div style={{ fontSize: '20px', fontWeight: 'bold' }}>[ QR ]</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold' }}>21. QR CODE</span>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '20px', color: '#000' }}>
               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>||||| || |</div>
               <span style={{ fontSize: '9px', fontWeight: 'bold' }}>22. BARCODE</span>
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
