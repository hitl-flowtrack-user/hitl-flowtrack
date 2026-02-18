import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Path fixed
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from 'qrcode.react';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewType, setViewType] = useState('grid'); // grid or list
  const [editingItem, setEditingItem] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: sans-serif; }
    .filter-section { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .filter-input { background: #fff; color: #000; border: none; padding: 10px; border-radius: 8px; font-size: 13px; outline: none; }
    .view-toggle { background: #f59e0b; color: #000; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; margin-bottom: 20px; }
    
    .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .item-card { background: #111; padding: 20px; border-radius: 25px; border: 1px solid #222; text-align: center; position: relative; }
    
    .list-view { width: 100%; border-collapse: collapse; background: #111; border-radius: 15px; overflow: hidden; }
    .list-view th { background: #f59e0b; color: #000; padding: 12px; text-align: left; }
    .list-view td { padding: 12px; border-bottom: 1px solid #222; font-size: 14px; }
    
    .btn-action { padding: 8px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-size: 12px; margin: 2px; }
    .btn-edit { background: #3b82f6; color: #fff; }
    .btn-qr { background: #fff; color: #000; }

    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #111; padding: 30px; border-radius: 30px; width: 90%; max-width: 500px; border: 1px solid #f59e0b; }
    
    @media (max-width: 600px) { .filter-section { grid-template-columns: 1fr 1fr; } }
  `;

  useEffect(() => {
    const q = query(collection(db, "inventory_records"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setFilteredItems(data);
    });
    return () => unsubscribe();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = items.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const companyMatch = filterCompany ? item.company === filterCompany : true;
      const catMatch = filterCategory ? item.category === filterCategory : true;
      const subMatch = filterSubCategory ? item.subCategory === filterSubCategory : true;
      const priceVal = parseFloat(item.retailPrice || 0);
      const priceMatch = (minPrice ? priceVal >= parseFloat(minPrice) : true) && 
                         (maxPrice ? priceVal <= parseFloat(maxPrice) : true);
      
      return nameMatch && companyMatch && catMatch && subMatch && priceMatch;
    });
    setFilteredItems(result);
  }, [searchTerm, filterCompany, filterCategory, filterSubCategory, minPrice, maxPrice, items]);

  const downloadQR = (id, itemName) => {
    const canvas = document.getElementById(id);
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${itemName}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleEditSave = async () => {
    try {
      const itemRef = doc(db, "inventory_records", editingItem.id);
      await updateDoc(itemRef, {
        ...editingItem,
        name: editingItem.name.toUpperCase(),
        company: editingItem.company.toUpperCase()
      });
      setEditingItem(null);
      alert("Item Updated!");
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#f59e0b', fontStyle: 'italic', fontWeight: '900' }}>STOCK EXPLORER</h2>
        <button className="view-toggle" onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
          SWITCH TO {viewType === 'grid' ? 'LIST' : 'GRID'}
        </button>
      </div>

      {/* FILTERS */}
      <div className="filter-section">
        <input className="filter-input" placeholder="Search Item..." onChange={e => setSearchTerm(e.target.value)} />
        <input className="filter-input" placeholder="Company..." onChange={e => setFilterCompany(e.target.value.toUpperCase())} />
        <input className="filter-input" placeholder="Category..." onChange={e => setFilterCategory(e.target.value.toUpperCase())} />
        <input className="filter-input" placeholder="Min Price" type="number" onChange={e => setMinPrice(e.target.value)} />
        <input className="filter-input" placeholder="Max Price" type="number" onChange={e => setMaxPrice(e.target.value)} />
      </div>

      {/* VIEW RENDER */}
      {viewType === 'grid' ? (
        <div className="grid-view">
          {filteredItems.map(item => (
            <div key={item.id} className="item-card">
              <div style={{ height: '150px', background: '#000', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden' }}>
                {item.imageUrl ? <img src={item.imageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="prod" /> : "NO IMAGE"}
              </div>
              <h4 style={{margin:'5px 0'}}>{item.name}</h4>
              <p style={{color:'#f59e0b', fontSize:'12px'}}>{item.company} | {item.retailPrice} PKR</p>
              <div style={{marginTop:'15px'}}>
                <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>EDIT</button>
                <button className="btn-action btn-qr" onClick={() => downloadQR(item.id, item.name)}>QR DOWNLOAD</button>
                <div style={{display:'none'}}><QRCodeCanvas id={item.id} value={item.qrCodeData} size={256} /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table className="list-view">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Company</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.company}</td>
                  <td>{item.category}</td>
                  <td>{item.retailPrice}</td>
                  <td>{item.openingStock}</td>
                  <td>
                    <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>EDIT</button>
                    <button className="btn-action btn-qr" onClick={() => downloadQR(item.id, item.name)}>QR</button>
                    <div style={{display:'none'}}><QRCodeCanvas id={item.id} value={item.qrCodeData} size={256} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal">
          <div className="modal-content">
            <h3 style={{color:'#f59e0b'}}>EDIT ITEM DETAILS</h3>
            <label className="label-text">Item Name</label>
            <input className="custom-input" style={{width:'100%', marginBottom:'10px'}} value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
            
            <label className="label-text">Retail Price</label>
            <input className="custom-input" style={{width:'100%', marginBottom:'10px'}} type="number" value={editingItem.retailPrice} onChange={e => setEditingItem({...editingItem, retailPrice: e.target.value})} />
            
            <label className="label-text">Opening Stock</label>
            <input className="custom-input" style={{width:'100%', marginBottom:'20px'}} type="number" value={editingItem.openingStock} onChange={e => setEditingItem({...editingItem, openingStock: e.target.value})} />

            <div style={{display:'flex', gap:'10px'}}>
              <button className="btn-main" style={{marginTop:0}} onClick={handleEditSave}>UPDATE</button>
              <button className="btn-main" style={{marginTop:0, background:'#444', color:'#fff'}} onClick={() => setEditingItem(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
