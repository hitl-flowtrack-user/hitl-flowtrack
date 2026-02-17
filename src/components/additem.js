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
    <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
      <div className="flex items-center justify-between px-1">
        <label className="text-[12px] text-zinc-400 font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
        {isSuperAdmin && <span className="text-[10px] text-amber-600/50 uppercase tracking-tighter">Admin Mode</span>}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div onClick={() => setIsOpen(!isOpen)} className={`bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black cursor-pointer min-h-[45px] flex justify-between items-center shadow-inner transition-all border-2 ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'}`}>
            <span className={selected ? 'text-black font-bold uppercase' : 'text-zinc-400'}>{selected || `Select ${label}`}</span>
            <span className={`text-[10px] text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
              <input autoFocus type="text" placeholder="Search..." className="w-full bg-white/5 p-3 text-xs border-b border-white/5 outline-none text-white uppercase" onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.map((opt, i) => (
                  <div key={i} className="flex justify-between items-center group hover:bg-amber-500/10 transition-colors">
                    <div className="p-3 text-sm text-zinc-300 cursor-pointer flex-1 uppercase" onClick={() => { onSelect(opt.toUpperCase()); setIsOpen(false); }}>{opt}</div>
                    {isSuperAdmin && <button type="button" onClick={() => onDelete(opt)} className="p-3 text-zinc-600 hover:text-red-500 font-bold">×</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onAdd} className="bg-amber-600/20 text-amber-500 h-[45px] w-[45px] rounded-2xl font-bold hover:bg-amber-500 hover:text-black transition-all">+</button>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, readOnly, type="text", required, errorKey, hasError, clearError, isUppercase }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[12px] text-zinc-400 font-medium px-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type={type} value={value} readOnly={readOnly}
      onChange={(e) => {
          if (hasError) clearError(errorKey);
          const val = isUppercase ? e.target.value.toUpperCase() : e.target.value;
          onChange({ target: { value: val } });
      }}
      className={`bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black outline-none shadow-inner transition-all border-2 ${isUppercase ? 'uppercase' : ''} ${readOnly ? 'opacity-70 italic border-transparent' : (hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent focus:border-amber-500')}`}
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

  const [companies, setCompanies] = useState(['FLOWTRACK CO', 'GENERIC']);
  const [categories, setCategories] = useState(['HARDWARE', 'GENERAL']);
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
    const savedCompanies = JSON.parse(localStorage.getItem('ft_companies')) || ['FLOWTRACK CO', 'GENERIC'];
    const savedCats = JSON.parse(localStorage.getItem('ft_categories')) || ['HARDWARE', 'GENERAL'];
    const savedSubs = JSON.parse(localStorage.getItem('ft_subclasses')) || ['STANDARD'];
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
    const templateData = [{ Name: "ITEM NAME", Company: "BRAND", Category: "TYPE", SubClass: "STD", Weight: 1, PcsPerBox: 12, PurchasePrice: 100, RetailPrice: 150, MinStock: 5, MaxStock: 50, SpecsEN: "Specs", SpecsUR: "تفصیل" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "FlowTrack_Template");
    XLSX.writeFile(wb, "FlowTrack_Import_Template.xlsx");
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
            const ref = doc(collection(db, "inventory"));
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
        await updateDoc(doc(db, "inventory", editData.id), { ...formData, updatedAt: serverTimestamp() });
        setStatusMessage('UPDATED!');
      } else {
        await addDoc(collection(db, "inventory"), { ...formData, createdAt: serverTimestamp() });
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
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-[#121212] rounded-[2.5rem] p-8 lg:p-10 shadow-2xl flex flex-col gap-6 w-full border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-black text-white italic uppercase">{editData ? "Update Item" : "Add Item"}</h2>
            <div className="flex gap-2">
                <button type="button" onClick={downloadExcelTemplate} className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[9px] font-bold border border-emerald-500/20 uppercase tracking-tighter">Template</button>
                <button type="button" onClick={() => excelInputRef.current.click()} className="bg-[#2a2a2a] text-zinc-300 px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/5 uppercase">Import</button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Serial No" value={formData.srNo} readOnly />
                <InputField label="SKU" value={formData.sku} readOnly />
            </div>
            <InputField label="Name" required errorKey="name" hasError={errors.name} clearError={clearError} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} isUppercase={true} />
            <SearchableDropdown label="Company" required error={errors.company} options={companies} selected={formData.company} isSuperAdmin={isSuperAdmin} onSelect={(v) => { clearError('company'); setFormData({...formData, company: v}); }} onAdd={() => addNewOption('Company', companies, setCompanies, 'ft_companies')} onDelete={(v) => deleteOption(v, companies, setCompanies, 'ft_companies')} />
            <SearchableDropdown label="Category" required error={errors.category} options={categories} selected={formData.category} isSuperAdmin={isSuperAdmin} onSelect={(v) => { clearError('category'); setFormData({...formData, category: v}); }} onAdd={() => addNewOption('Category', categories, setCategories, 'ft_categories')} onDelete={(v) => deleteOption(v, categories, setCategories, 'ft_categories')} />
            <SearchableDropdown label="SubClass" required error={errors.subClass} options={subClasses} selected={formData.subClass} isSuperAdmin={isSuperAdmin} onSelect={(v) => { clearError('subClass'); setFormData({...formData, subClass: v}); }} onAdd={() => addNewOption('Sub-Class', subClasses, setSubClasses, 'ft_subclasses')} onDelete={(v) => deleteOption(v, subClasses, setSubClasses, 'ft_subclasses')} />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Weight (KG)" type="number" value={formData.weight} onChange={(e)=>setFormData({...formData, weight: e.target.value})} />
                <InputField label="Pcs Per Box" required errorKey="pcsPerBox" hasError={errors.pcsPerBox} clearError={clearError} type="number" value={formData.pcsPerBox} onChange={(e)=>setFormData({...formData, pcsPerBox: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Purchase Price" required errorKey="purchasePrice" hasError={errors.purchasePrice} clearError={clearError} type="number" value={formData.purchasePrice} onChange={(e)=>setFormData({...formData, purchasePrice: e.target.value})} />
                <InputField label="Retail Price" required errorKey="retailPrice" hasError={errors.retailPrice} clearError={clearError} type="number" value={formData.retailPrice} onChange={(e)=>setFormData({...formData, retailPrice: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Min Stock" required errorKey="minStock" hasError={errors.minStock} clearError={clearError} type="number" value={formData.minStock} onChange={(e)=>setFormData({...formData, minStock: e.target.value})} />
                <InputField label="Max Stock" required errorKey="maxStock" hasError={errors.maxStock} clearError={clearError} type="number" value={formData.maxStock} onChange={(e)=>setFormData({...formData, maxStock: e.target.value})} />
            </div>
            <InputField label="Specs (English)" value={formData.specsEN} onChange={(e)=>setFormData({...formData, specsEN: e.target.value})} />
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-zinc-400 font-medium px-1">Specs (Urdu)</label>
              <textarea dir="rtl" value={formData.specsUR} onChange={(e)=>setFormData({...formData, specsUR: e.target.value})} className="bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black outline-none h-16 font-urdu shadow-inner" />
            </div>
            <button type="submit" className="mt-2 bg-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-amber-400 transition-all shadow-lg active:scale-95 italic">
              {statusMessage || (editData ? "Confirm Update" : "Save Item")}
            </button>
            {editData && <button type="button" onClick={onComplete} className="text-zinc-500 text-[10px] font-bold uppercase underline">Cancel and Go Back</button>}
          </form>
        </div>
        <div className="flex items-center justify-center lg:sticky lg:top-8 w-full">
          <div className="bg-[#121212] w-full max-w-[420px] rounded-[3.5rem] p-8 shadow-2xl relative border border-white/5">
            <div className="absolute top-8 right-8 bg-amber-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase z-10">PCS: {formData.pcsPerBox || 0}</div>
            <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square bg-[#1a1a1a] rounded-[2.5rem] mb-8 flex items-center justify-center overflow-hidden border border-white/5 cursor-pointer">
              {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="product" /> : <span className="text-zinc-800 font-black text-6xl italic uppercase">IMAGE</span>}
            </div>
            <div className="space-y-1 mb-8 text-center lg:text-left">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter truncate">{formData.name || "Item Name"}</h3>
              <p className="text-amber-500 font-black text-[11px] uppercase tracking-[0.2em]">{formData.company || "Brand ID"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={()=>generateAndDownload('QRCODE')} className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer h-36 shadow-lg">
                <div className="w-14 h-14 border-2 border-black p-1 flex items-center justify-center"><div className="w-7 h-7 bg-black"></div></div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">QR Print</span>
              </div>
              <div onClick={()=>generateAndDownload('BARCODE')} className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer h-36 shadow-lg">
                <div className="flex gap-[1px] items-center italic text-black font-black text-xl">||||| | ||</div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Barcode Print</span>
              </div>
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap'); .font-urdu { font-family: 'Noto Nastaliq Urdu', serif; }`}} />
    </div>
  );
};

export default AddItem;
