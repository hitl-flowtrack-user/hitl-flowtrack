import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode'; 
import AddItem from './additem'; 

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewType, setViewType] = useState('grid'); 
  const [editingItem, setEditingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .filter-section { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .filter-input { background: #fff; color: #000; border: none; padding: 10px; border-radius: 8px; font-size: 13px; outline: none; }
    .view-toggle { background: #f59e0b; color: #000; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; }
    .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .item-card { background: #111; padding: 20px; border-radius: 25px; border: 1px solid #222; text-align: center; }
    .btn-action { min-width: 120px; padding: 10px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-size: 11px; text-transform: uppercase; }
    .btn-edit { background: #3b82f6; color: #fff; }
    .btn-qr { background: #fff; color: #000; }
    .btn-barcode { background: #10b981; color: #fff; }
    .btn-delete { background: #ef4444; color: #fff; }
    .button-group-pair { display: flex; gap: 8px; }
    .edit-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2000; overflow-y: auto; padding-top: 20px; }
    .close-edit { position: fixed; top: 20px; right: 20px; background: #ef4444; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; z-index: 2100; cursor: pointer; }
  `;

  useEffect(() => {
    const q = query(collection(db, "inventory_records"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = items.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const companyMatch = filterCompany ? item.company === filterCompany : true;
      const catMatch = filterCategory ? item.category === filterCategory : true;
      const priceVal = parseFloat(item.retailPrice || 0);
      const priceMatch = (minPrice ? priceVal >= parseFloat(minPrice) : true) && (maxPrice ? priceVal <= parseFloat(maxPrice) : true);
      return nameMatch && companyMatch && catMatch && priceMatch;
    });
    setFilteredItems(result);
  }, [searchTerm, filterCompany, filterCategory, minPrice, maxPrice, items]);

  const downloadAsset = (id, itemName, type) => {
    if (type === 'QR') {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      // Added white padding for QR label
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width + 40;
      tempCanvas.height = canvas.height + 40;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 20, 20);
      saveCanvas(tempCanvas, itemName, type);
    } else {
      const svg = document.getElementById(id);
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(xml);
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + svg64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Optimized for 2-inch width
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        saveCanvas(canvas, itemName, type);
      };
    }
  };

  const saveCanvas = (canvas, name, type) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${name}_${type}.png`;
    link.click();
  };

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#f59e0b', fontStyle: 'italic', fontWeight: '900' }}>FLOWTRACK EXPLORER</h2>
        <button className="view-toggle" onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
          {viewType === 'grid' ? 'LIST VIEW' : 'GRID VIEW'}
        </button>
      </div>

      <div className="grid-view">
        {filteredItems.map(item => (
          <div key={item.id} className="item-card">
            <div style={{ height: '180px', background: '#000', borderRadius: '15px', marginBottom: '10px', overflow:'hidden' }}>
              {item.imageUrl && <img src={item.imageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p" />}
            </div>
            <h4>{item.name}</h4>
            <div className="button-group-pair" style={{justifyContent:'center', marginTop:'10px'}}>
              <button className="btn-action btn-qr" onClick={() => downloadAsset(`qr-${item.id}`, item.name, 'QR')}>QR</button>
              <button className="btn-action btn-barcode" onClick={() => downloadAsset(`bar-${item.id}`, item.name, 'BARCODE')}>BARCODE</button>
            </div>
            <div className="button-group-pair" style={{justifyContent:'center', marginTop:'10px'}}>
              <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>EDIT</button>
              <button className="btn-action btn-delete" onClick={() => deleteDoc(doc(db, "inventory_records", item.id))}>DELETE</button>
            </div>
            <div style={{display:'none'}}>
              <QRCodeCanvas id={`qr-${item.id}`} value={item.qrCodeData} size={256} />
              {/* Barcode width optimized for 2 inches label */}
              <Barcode id={`bar-${item.id}`} value={item.barcodeData || "0"} width={1.2} height={40} fontSize={10} margin={10} />
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="edit-overlay">
          <button className="close-edit" onClick={() => setEditingItem(null)}>✖ CLOSE</button>
          <AddItem editData={editingItem} onComplete={() => setEditingItem(null)} />
        </div>
      )}
    </div>
  );
};

export default InventoryView;
