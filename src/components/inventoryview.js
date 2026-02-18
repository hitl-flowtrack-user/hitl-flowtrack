import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from 'qrcode.react';
import AddItem from './additem'; // Import AddItem for editing

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewType, setViewType] = useState('grid'); 
  const [editingItem, setEditingItem] = useState(null);

  // Filters State
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
    
    .list-view { width: 100%; border-collapse: collapse; background: #111; border-radius: 15px; overflow: hidden; }
    .list-view th { background: #f59e0b; color: #000; padding: 12px; text-align: left; }
    .list-view td { padding: 12px; border-bottom: 1px solid #222; font-size: 14px; }
    
    .btn-action { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-size: 11px; margin: 2px; text-transform: uppercase; }
    .btn-edit { background: #3b82f6; color: #fff; }
    .btn-qr { background: #fff; color: #000; }
    .btn-barcode { background: #10b981; color: #fff; }
    .btn-delete { background: #ef4444; color: #fff; }

    .edit-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2000; overflow-y: auto; padding-top: 20px; }
    .close-edit { position: fixed; top: 20px; right: 20px; background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; z-index: 2100; cursor: pointer; }
  `;

  useEffect(() => {
    const q = query(collection(db, "inventory_records"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = items.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const companyMatch = filterCompany ? item.company === filterCompany : true;
      const catMatch = filterCategory ? item.category === filterCategory : true;
      const priceVal = parseFloat(item.retailPrice || 0);
      const priceMatch = (minPrice ? priceVal >= parseFloat(minPrice) : true) && 
                         (maxPrice ? priceVal <= parseFloat(maxPrice) : true);
      return nameMatch && companyMatch && catMatch && priceMatch;
    });
    setFilteredItems(result);
  }, [searchTerm, filterCompany, filterCategory, minPrice, maxPrice, items]);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "inventory_records", id));
      alert("Item Deleted Successfully");
    }
  };

  const downloadAsset = (id, itemName, type) => {
    const canvas = document.getElementById(id);
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${itemName}_${type}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#f59e0b', fontStyle: 'italic', fontWeight: '900', fontSize: '24px' }}>INVENTORY HUB</h2>
        <button className="view-toggle" onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
          {viewType === 'grid' ? 'LIST VIEW' : 'GRID VIEW'}
        </button>
      </div>

      <div className="filter-section">
        <input className="filter-input" placeholder="Search Item..." onChange={e => setSearchTerm(e.target.value)} />
        <input className="filter-input" placeholder="Company..." onChange={e => setFilterCompany(e.target.value.toUpperCase())} />
        <input className="filter-input" placeholder="Category..." onChange={e => setFilterCategory(e.target.value.toUpperCase())} />
        <input className="filter-input" placeholder="Min Price" type="number" onChange={e => setMinPrice(e.target.value)} />
        <input className="filter-input" placeholder="Max Price" type="number" onChange={e => setMaxPrice(e.target.value)} />
      </div>

      {viewType === 'grid' ? (
        <div className="grid-view">
          {filteredItems.map(item => (
            <div key={item.id} className="item-card">
              <div style={{ height: '180px', background: '#000', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #222' }}>
                {item.imageUrl ? <img src={item.imageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p" /> : <div style={{paddingTop:'70px', color:'#333'}}>NO IMAGE</div>}
              </div>
              <h4 style={{margin:'5px 0', fontSize: '18px'}}>{item.name}</h4>
              <p style={{color:'#f59e0b', fontWeight: 'bold'}}>{item.retailPrice} PKR</p>
              
              <div style={{marginTop:'15px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>EDIT</button>
                <button className="btn-action btn-qr" onClick={() => downloadAsset(`qr-${item.id}`, item.name, 'QR')}>QR</button>
                <button className="btn-action btn-barcode" onClick={() => downloadAsset(`bar-${item.id}`, item.name, 'BARCODE')}>BAR</button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(item.id)}>DEL</button>
                
                {/* Hidden canvases for generation */}
                <div style={{display:'none'}}>
                  <QRCodeCanvas id={`qr-${item.id}`} value={item.qrCodeData} size={256} />
                  <QRCodeCanvas id={`bar-${item.id}`} value={item.barcodeData} size={256} />
                </div>
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
                  <td>
                    <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>EDIT</button>
                    <button className="btn-action btn-qr" onClick={() => downloadAsset(`qr-${item.id}`, item.name, 'QR')}>QR</button>
                    <button className="btn-action btn-barcode" onClick={() => downloadAsset(`bar-${item.id}`, item.name, 'BAR')}>BAR</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(item.id)}>DEL</button>
                    <div style={{display:'none'}}>
                      <QRCodeCanvas id={`qr-${item.id}`} value={item.qrCodeData} size={256} />
                      <QRCodeCanvas id={`bar-${item.id}`} value={item.barcodeData} size={256} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT OVERLAY - Opens AddItem Component */}
      {editingItem && (
        <div className="edit-overlay">
          <button className="close-edit" onClick={() => setEditingItem(null)}>CLOSE & CANCEL</button>
          <AddItem 
            editData={editingItem} 
            onComplete={() => {
              setEditingItem(null);
              alert("Update Successful!");
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default InventoryView;
