import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../firebase'; 
import { collection, addDoc, updateDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { useAuth } from "../../context/useAuth";

// --- HELPER COMPONENTS (Moved outside to fix "Cannot create components during render") ---

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
        <label className="text-[12px] text-zinc-400 font-medium uppercase tracking-tighter">{label} {required && <span className="text-red-500">*</span>}</label>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div onClick={() => setIsOpen(!isOpen)} className={`bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black cursor-pointer min-h-[45px] flex justify-between items-center shadow-inner transition-all border-2 ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'}`}>
            <span className={selected ? 'text-black font-bold uppercase' : 'text-zinc-400 italic'}>{selected || `Select ${label}`}</span>
            <span className={`text-[10px] text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
              <input autoFocus type="text" placeholder="Search..." className="w-full bg-white/5 p-3 text-xs border-b border-white/5 outline-none text-white uppercase" onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.map((opt, i) => (
                  <div key={i} className="flex justify-between items-center group hover:bg-amber-500/10 transition-colors">
                    <div className="p-3 text-sm text-zinc-300 cursor-pointer flex-1 uppercase font-bold" onClick={() => { onSelect(opt.toUpperCase()); setIsOpen(false); }}>{opt}</div>
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

const InputField = ({ label, value, field, onChange, readOnly, type="text", required, hasError, isUppercase }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[12px] text-zinc-400 font-medium px-1 uppercase tracking-tighter">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type={type} value={value} readOnly={readOnly}
      onChange={(e) => {
          const val = isUppercase ? e.target.value.toUpperCase() : e.target.value;
          onChange(field, val);
      }}
      className={`bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black outline-none shadow-inner transition-all border-2 ${isUppercase ? 'uppercase font-bold' : ''} ${readOnly ? 'opacity-70 italic border-transparent bg-zinc-100' : (hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent focus:border-amber-500')}`}
    />
  </div>
);

// --- MAIN COMPONENT ---

const AddItem = ({ editData, onComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [companies, setCompanies] = useState(() => JSON.parse(localStorage.getItem('elite_companies')) || ['ELITE CO', 'GENERIC']);
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('elite_categories')) || ['ELECTRONICS', 'GENERAL']);
  const [subClasses, setSubClasses] = useState(() => JSON.parse(localStorage.getItem('elite_subclasses')) || ['STANDARD']);

  // Helper to create fresh state
  const getInitialState = useCallback(() => ({
    srNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '', company: '', category: '', subClass: '', 
    specsEN: '', specsUR: '', sku: 'AUTO-GEN', barcodeData: '', 
    qrCodeData: '', minStock: '', maxStock: '',
    purchasePrice: '', retailPrice: '', weight: '', pcsPerBox: '',
    imageUrl: null, companyId: user?.companyId || ''
  }), [user?.companyId]);

  const [formData, setFormData] = useState(() => editData || getInitialState());

  // Effect to handle editing mode
  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  // Centralized Change Handler (prevents loops)
  const handleFormUpdate = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-logic for SKU and QR (Only if not in Edit Mode)
      if (!editData) {
        if (field === 'name' || field === 'weight' || field === 'retailPrice' || field === 'company') {
          const namePart = (updated.name || "").substring(0, 3).toUpperCase();
          const sku = `${namePart}-${updated.weight || 0}KG-${updated.srNo}`;
          updated.sku = sku;
          updated.barcodeData = sku;
          updated.qrCodeData = `NM:${(updated.name || "").toUpperCase()} | CO:${updated.company} | PRC:${updated.retailPrice}`;
        }
      }
      return updated;
    });

    if (errors[field]) setErrors(prev => { const n = {...prev}; delete n[field]; return n; });
  };

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
    if (window.confirm(`Delete "${val}" from master list?`)) {
      const updated = currentList.filter(item => item !== val);
      setter(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
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
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        setStatusMessage('IMPORTING...');
        const batch = writeBatch(db);

        data.forEach((item) => {
          const docRef = doc(collection(db, "elite_inventory"));
          const sr = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
          batch.set(docRef, {
            name: item.Name?.toUpperCase() || "NEW ITEM",
            company: item.Company?.toUpperCase() || "ELITE",
            category: item.Category?.toUpperCase() || "GENERAL",
            subClass: item.SubClass?.toUpperCase() || "STANDARD",
            weight: item.Weight || 0,
            pcsPerBox: item.PcsPerBox || 1,
            purchasePrice: item.PurchasePrice || 0,
            retailPrice: item.RetailPrice || 0,
            minStock: item.MinStock || 1,
            maxStock: item.MaxStock || 10,
            specsEN: item.SpecsEN || "",
            specsUR: item.SpecsUR || "",
            sku: `${item.Name?.substring(0,3).toUpperCase()}-${sr}`,
            srNo: sr,
            companyId: user?.companyId || '',
            createdAt: serverTimestamp()
          });
        });

        await batch.commit();
        setStatusMessage('SUCCESS!');
        setTimeout(() => { setStatusMessage(''); if (onComplete) onComplete(); }, 1500);
      } catch (err) { alert("Excel Import Failed!"); setStatusMessage(''); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mandatory = ['name', 'company', 'category', 'purchasePrice', 'retailPrice'];
    const newErrors = {};
    mandatory.forEach(f => { if (!formData[f]) newErrors[f] = true; });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return alert("PLEASE FILL MANDATORY FIELDS"); }

    try {
      setStatusMessage('SAVING...');
      if (editData) {
        await updateDoc(doc(db, "elite_inventory", editData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "elite_inventory"), { ...formData, createdAt: serverTimestamp() });
      }
      setStatusMessage('SAVED!');
      setTimeout(() => {
        setStatusMessage('');
        if (onComplete) onComplete();
      }, 1500);
    } catch (err) { alert("Connection Error!"); setStatusMessage(''); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-[#121212] rounded-[2.5rem] p-8 lg:p-10 shadow-2xl flex flex-col gap-6 w-full border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{editData ? "Update Item" : "New Entry"}</h2>
            <div className="flex gap-2">
                <button type="button" onClick={downloadExcelTemplate} className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[9px] font-bold border border-emerald-500/20 uppercase">Template</button>
                <button type="button" onClick={() => excelInputRef.current.click()} className="bg-[#2a2a2a] text-zinc-300 px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/5 uppercase">Import</button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Serial No" field="srNo" value={formData.srNo} readOnly onChange={handleFormUpdate} />
                <InputField label="SKU" field="sku" value={formData.sku} readOnly onChange={handleFormUpdate} />
            </div>
            <InputField label="Product Name" required field="name" hasError={errors.name} value={formData.name} onChange={handleFormUpdate} isUppercase={true} />
            
            <SearchableDropdown label="Company" required error={errors.company} options={companies} selected={formData.company} isSuperAdmin={true} onSelect={(v) => handleFormUpdate('company', v)} onAdd={() => addNewOption('Company', companies, setCompanies, 'elite_companies')} onDelete={(v) => deleteOption(v, companies, setCompanies, 'elite_companies')} />
            
            <div className="grid grid-cols-2 gap-4">
              <SearchableDropdown label="Category" required error={errors.category} options={categories} selected={formData.category} isSuperAdmin={true} onSelect={(v) => handleFormUpdate('category', v)} onAdd={() => addNewOption('Category', categories, setCategories, 'elite_categories')} onDelete={(v) => deleteOption(v, categories, setCategories, 'elite_categories')} />
              <SearchableDropdown label="SubClass" options={subClasses} selected={formData.subClass} isSuperAdmin={true} onSelect={(v) => handleFormUpdate('subClass', v)} onAdd={() => addNewOption('Sub-Class', subClasses, setSubClasses, 'elite_subclasses')} onDelete={(v) => deleteOption(v, subClasses, setSubClasses, 'elite_subclasses')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputField label="Weight (KG)" field="weight" type="number" value={formData.weight} onChange={handleFormUpdate} />
                <InputField label="Pcs Per Box" field="pcsPerBox" type="number" value={formData.pcsPerBox} onChange={handleFormUpdate} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Purchase Price" required field="purchasePrice" hasError={errors.purchasePrice} type="number" value={formData.purchasePrice} onChange={handleFormUpdate} />
                <InputField label="Retail Price" required field="retailPrice" hasError={errors.retailPrice} type="number" value={formData.retailPrice} onChange={handleFormUpdate} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-zinc-400 font-medium px-1 uppercase">Specs (Urdu)</label>
              <textarea dir="rtl" value={formData.specsUR} onChange={(e)=>handleFormUpdate('specsUR', e.target.value)} className="bg-[#FFFFFF] rounded-2xl p-3 text-sm text-black outline-none h-16 font-urdu shadow-inner" />
            </div>

            <button type="submit" className="mt-2 bg-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-amber-400 transition-all shadow-lg active:scale-95 italic">
              {statusMessage || (editData ? "Update Product" : "Save to Inventory")}
            </button>
            {onComplete && <button type="button" onClick={onComplete} className="text-zinc-500 text-[10px] font-bold uppercase underline">Go Back</button>}
          </form>
        </div>

        {/* PREVIEW CARD */}
        <div className="flex items-center justify-center lg:sticky lg:top-8 w-full">
          <div className="bg-[#121212] w-full max-w-[420px] rounded-[3.5rem] p-8 shadow-2xl relative border border-white/5">
            <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square bg-[#1a1a1a] rounded-[2.5rem] mb-8 flex items-center justify-center overflow-hidden border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
              {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="product" /> : <div className="text-center"><span className="text-zinc-800 font-black text-6xl italic uppercase block">IMAGE</span><span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Click to upload</span></div>}
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter truncate">{formData.name || "Product Name"}</h3>
              <p className="text-amber-500 font-black text-[11px] uppercase tracking-[0.2em]">{formData.sku || "AUTO-SKU"}</p>
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap'); .font-urdu { font-family: 'Noto Nastaliq Urdu', serif; }`}} />
    </div>
  );
};

export default AddItem;