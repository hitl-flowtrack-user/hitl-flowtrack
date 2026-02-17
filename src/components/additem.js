import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";

// --- HELPER COMPONENTS ---

const SearchableDropdown = ({ label, options, selected, onSelect, onAdd, onDelete, required, isSuperAdmin, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapperRef} style={{ marginBottom: '15px' }}>
      <div className="flex items-center justify-between px-1">
        <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
        {isSuperAdmin && <span style={{ fontSize: '10px', color: '#d97706', opacity: 0.5, textTransform: 'uppercase' }}>Super Admin Mode</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div onClick={() => setIsOpen(!isOpen)} style={{
            backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px', fontSize: '14px', color: '#000',
            cursor: 'pointer', minHeight: '45px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: error ? '2px solid #ef4444' : '2px solid transparent'
          }}>
            <span style={{ fontWeight: selected ? 'bold' : 'normal', textTransform: 'uppercase' }}>{selected || `Select ${label}`}</span>
            <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
          {isOpen && (
            <div style={{
              position: 'absolute', zIndex: 50, width: '100%', marginTop: '8px', backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              <input autoFocus type="text" placeholder="Search..." style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', color: '#fff', border: 'none', outline: 'none', textTransform: 'uppercase', fontSize: '12px' }} onChange={(e) => setSearchTerm(e.target.value)} />
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {filteredOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ padding: '10px', fontSize: '13px', color: '#d1d5db', cursor: 'pointer', flex: 1, textTransform: 'uppercase' }} onClick={() => { onSelect(opt.toUpperCase()); setIsOpen(false); }}>{opt}</div>
                    {isSuperAdmin && <button type="button" onClick={() => onDelete(opt)} style={{ padding: '10px', color: '#4b5563', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onAdd} style={{ backgroundColor: 'rgba(217,119,6,0.2)', color: '#f59e0b', height: '45px', width: '45px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, readOnly, type="text", required, errorKey, hasError, clearError, isUppercase }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
    <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', paddingLeft: '4px' }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
    <input 
      type={type} value={value} readOnly={readOnly}
      onChange={(e) => {
          if (hasError) clearError(errorKey);
          const val = isUppercase ? e.target.value.toUpperCase() : e.target.value;
          onChange({ target: { value: val } });
      }}
      style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px', fontSize: '14px', color: '#000',
        outline: 'none', border: hasError ? '2px solid #ef4444' : '2px solid transparent',
        textTransform: isUppercase ? 'uppercase' : 'none', opacity: readOnly ? 0.7 : 1
      }}
    />
  </div>
);

// --- MAIN COMPONENT ---

const AddItem = ({ editData, onComplete }) => {
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuperAdmin] = useState(true);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (editData) setFormData(editData);
    else setFormData(initialFormState);
  }, [editData]);

  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem('elite_companies')) || ['ELITE CO', 'GENERIC'];
    const savedCats = JSON.parse(localStorage.getItem('elite_categories')) || ['ELECTRONICS', 'GENERAL'];
    const savedSubs = JSON.parse(localStorage.getItem('elite_subclasses')) || ['STANDARD'];
    setCompanies(savedCompanies);
    setCategories(savedCats);
    setSubClasses(savedSubs);
  }, []);

  useEffect(() => {
    if (formData.name.length >= 1 && !editData) {
      const generatedSKU = `${formData.name.substring(0, 3).toUpperCase()}-${formData.weight || 0}KG-${formData.srNo}`;
      const qrFilter = `NM:${formData.name.toUpperCase()} | CO:${formData.company} | PRC:${formData.retailPrice}`;
      setFormData(prev => ({ ...prev, sku: generatedSKU, barcodeData: generatedSKU, qrCodeData: qrFilter }));
    }
  }, [formData.name, formData.weight, formData.retailPrice, formData.company, formData.category, formData.srNo, editData]);

  const addNewOption = (label, currentList, setter, storageKey) => {
    const newVal = prompt(`Enter new ${label}:`);
    if (newVal) {
      const upperVal = newVal.toUpperCase();
      if (!currentList.includes(upperVal)) {
        const updated = [...currentList, upperVal];
        setter(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    }
  };

  const deleteOption = (val, currentList, setter, storageKey) => {
    if (!isSuperAdmin) return;
    if (window.confirm(`Delete "${val}" from master list?`)) {
      const updated = currentList.filter(item => item !== val);
      setter(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const clearError = (key) => {
    setErrors(prev => { const newErrors = {...prev}; delete newErrors[key]; return newErrors; });
  };

  const downloadExcelTemplate = () => {
    const templateData = [{ Name: "ITEM NAME", Company: "ELITE", Category: "ELEC", SubClass: "STD", Weight: 1, PcsPerBox: 12, PurchasePrice: 100, RetailPrice: 150, MinStock: 5, MaxStock: 50, SpecsEN: "Specs", SpecsUR: "تفصیل" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Elite_Template");
    XLSX.writeFile(wb, "Elite_Import_Template.xlsx");
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
        setStatusMessage('SYNCING...');
        const batch = writeBatch(db);
        data.forEach(item => {
          if (item.Name) {
            const sr = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
            const ref = doc(collection(db, "inventory_records"));
            batch.set(ref, { ...item, srNo: sr, createdAt: serverTimestamp() });
          }
        });
        await batch.commit();
        setStatusMessage('DONE!');
        setTimeout(() => setStatusMessage(''), 2000);
      } catch (err) { alert("Import Failed"); }
    };
    reader.readAsBinaryString(file);
  };

  const generateAndDownload = (type) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (type === 'BARCODE') {
        canvas.width = 600; canvas.height = 300;
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, 600, 300);
        ctx.fillStyle = "black";
        let x = 80; for (let i = 0; i < 60; i++) { const w = (i % 3 === 0) ? 6 : 2; ctx.fillRect(x, 50, w, 160); x += w + 3; }
        ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.fillText(formData.sku, 300, 260);
    } else {
        canvas.width = 400; canvas.height = 400;
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "black"; ctx.fillRect(50, 50, 300, 300);
        ctx.fillStyle = "white"; ctx.fillRect(100, 100, 200, 200);
        ctx.fillStyle = "black"; ctx.fillRect(135, 135, 130, 130);
    }
    const link = document.createElement('a');
    link.download = `${type}-${formData.sku}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mandatory = ['name', 'company', 'category', 'purchasePrice', 'retailPrice'];
    const newErrors = {};
    mandatory.forEach(f => { if (!formData[f]) newErrors[f] = true; });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return alert("FILL ALL FIELDS"); }

    try {
      setStatusMessage('SAVING...');
      if (editData) {
        await updateDoc(doc(db, "inventory_records", editData.id), { ...formData, updatedAt: serverTimestamp() });
        setStatusMessage('UPDATED!');
      } else {
        await addDoc(collection(db, "inventory_records"), { ...formData, createdAt: serverTimestamp() });
        setStatusMessage('SAVED!');
      }
      setTimeout(() => {
        setStatusMessage('');
        setFormData(initialFormState);
        if (onComplete) onComplete();
      }, 1500);
    } catch (err) { alert("Cloud connection failed."); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        
        {/* LEFT FORM SECTION */}
        <div style={{ flex: '1 1 500px', backgroundColor: '#121212', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>{editData ? "Update Item" : "Add Item"}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={downloadExcelTemplate} style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}>TEMPLATE</button>
                <button type="button" onClick={() => excelInputRef.current.click()} style={{ backgroundColor: '#2a2a2a', color: '#d1d5db', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>IMPORT EXCEL</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <InputField label="Serial No" value={formData.srNo} readOnly />
                <InputField label="SKU" value={formData.sku} readOnly />
            </div>
            
            <InputField label="Item Name" required errorKey="name" hasError={errors.name} clearError={clearError} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} isUppercase={true} />
            
            <SearchableDropdown label="Company" required error={errors.company} options={companies} selected={formData.company} isSuperAdmin={isSuperAdmin} onSelect={(v) => { clearError('company'); setFormData({...formData, company: v}); }} onAdd={() => addNewOption('Company', companies, setCompanies, 'elite_companies')} onDelete={(v) => deleteOption(v, companies, setCompanies, 'elite_companies')} />
            
            <SearchableDropdown label="Category" required error={errors.category} options={categories} selected={formData.category} isSuperAdmin={isSuperAdmin} onSelect={(v) => { clearError('category'); setFormData({...formData, category: v}); }} onAdd={() => addNewOption('Category', categories, setCategories, 'elite_categories')} onDelete={(v) => deleteOption(v, categories, setCategories, 'elite_categories')} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <InputField label="Weight (KG)" type="number" value={formData.weight} onChange={(e)=>setFormData({...formData, weight: e.target.value})} />
                <InputField label="Pcs Per Box" required errorKey="pcsPerBox" hasError={errors.pcsPerBox} clearError={clearError} type="number" value={formData.pcsPerBox} onChange={(e)=>setFormData({...formData, pcsPerBox: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <InputField label="Purchase Price" required errorKey="purchasePrice" hasError={errors.purchasePrice} clearError={clearError} type="number" value={formData.purchasePrice} onChange={(e)=>setFormData({...formData, purchasePrice: e.target.value})} />
                <InputField label="Retail Price" required errorKey="retailPrice" hasError={errors.retailPrice} clearError={clearError} type="number" value={formData.retailPrice} onChange={(e)=>setFormData({...formData, retailPrice: e.target.value})} />
            </div>

            <InputField label="Specs (English)" value={formData.specsEN} onChange={(e)=>setFormData({...formData, specsEN: e.target.value})} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Specs (Urdu)</label>
              <textarea dir="rtl" value={formData.specsUR} onChange={(e)=>setFormData({...formData, specsUR: e.target.value})} style={{ backgroundColor: '#FFFFFF', borderRadius: '15px', padding: '12px', fontSize: '14px', color: '#000', border: 'none', height: '60px', outline: 'none' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', letterSpacing: '2px' }}>
              {statusMessage || (editData ? "CONFIRM UPDATE" : "SAVE ITEM")}
            </button>
          </form>
        </div>

        {/* RIGHT PREVIEW SECTION */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#121212', width: '100%', maxWidth: '380px', padding: '25px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '25px', right: '25px', backgroundColor: '#f59e0b', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>PCS: {formData.pcsPerBox || 0}</div>
            
            <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1a1a1a', borderRadius: '30px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
              {formData.imageUrl ? <img src={formData.imageUrl} style={{ width: '100%', h: '100%', objectFit: 'cover' }} alt="product" /> : <span style={{ color: '#262626', fontWeight: '900', fontSize: '40px', fontStyle: 'italic' }}>IMAGE</span>}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', color: '#fff', margin: '0' }}>{formData.name || "Product Name"}</h3>
              <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', margin: '5px 0' }}>{formData.company || "COMPANY ID"}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div onClick={()=>generateAndDownload('QRCODE')} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#000' }}></div></div>
                <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '900', marginTop: '10px' }}>QR PRINT</span>
              </div>
              <div onClick={()=>generateAndDownload('BARCODE')} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '18px', color: '#000', fontWeight: 'bold', letterSpacing: '1px' }}>||||| | ||</div>
                <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '900', marginTop: '10px' }}>BARCODE PRINT</span>
              </div>
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
        <input type="file" ref={excelInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleExcelImport} />
      </div>
    </div>
  );
};

export default AddItem;
