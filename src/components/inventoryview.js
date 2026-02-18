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

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .filter-section { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .filter-input { background: #fff; color: #000; border: none; padding: 12px; border-radius: 10px; font-size: 13px; outline: none; }
    .view-toggle { background: #f59e0b; color: #000; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; }
    .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .item-card { background: #111; padding: 20px; border-radius: 25px; border: 1px solid #222; text-align: center; }
    
    .list-view-table { width: 100%; border-collapse: collapse; background: #111; border-radius: 15px; overflow: hidden; margin-top: 10px; }
    .list-view-table th { background: #f59e0b; color: #000; padding: 15px; text-align: left; font-size: 12px; }
    .list-view-table td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; }
    
    .btn-action { padding: 10px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-size: 10px; text-transform: uppercase; flex: 1; }
    .btn-edit { background: #3b82f6; color: #fff; }
    .btn-qr { background: #fff; color: #000; }
    .btn-barcode { background: #10b981; color: #fff; }
    .btn-delete { background: #ef4444; color: #fff; }
    
    .barcode-container { background: #fff; padding: 5px; border-radius: 5px; display: inline-block; margin-top: 10px; }
    .edit-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2000; overflow-y: auto; padding-top: 20px; }
  `;

  useEffect(() => {
    const q = query(collection(db, "inventory_records"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = items.filter(item => {
      const nameMatch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const coMatch = filterCompany ? (item.company || '') === filterCompany : true;
      const catMatch = filterCategory ? (item.category || '') === filterCategory : true;
      const priceVal = parseFloat(item.retailPrice || 0);
      const priceMatch = (minPrice ? priceVal >= parseFloat(minPrice) : true) && (maxPrice ? priceVal <= parseFloat(maxPrice) : true);
      return nameMatch && coMatch && catMatch && priceMatch;
    });
    setFilteredItems(result);
  }, [searchTerm, filterCompany, filterCategory, minPrice, maxPrice, items]);

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#f59e0b', fontStyle: 'italic', fontWeight: '900' }}>FLOWTRACK EXPLORER</h2>
        <button className="view-toggle" onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
          {viewType === 'grid' ? 'SWITCH TO LIST' : 'SWITCH TO GRID'}
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
              <div style={{ height: '150px', background: '#000', borderRadius: '15px', overflow: 'hidden', border: '1px solid #222' }}>
                {item.imageUrl && <img src={item.imageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p" />}
              </div>
              <h4 style={{margin:'10px 0'}}>{item.name}</h4>
              
              <div className="barcode-container">
                <Barcode value={item.barcodeData || "0"} width={1.0} height={35} fontSize={8} margin={0} />
              </div>

              <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
                <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>Edit</button>
                <button className="btn-action btn-delete" onClick={() => deleteDoc(doc(db, "inventory_records", item.id))}>Del</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table className="list-view-table">
            <thead>
              <tr>
                <th>NAME</th><th>COMPANY</th><th>PRICE</th><th>STOCK</th><th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td><td>{item.company}</td><td>{item.retailPrice}</td><td>{item.openingStock}</td>
                  <td style={{display:'flex', gap:'5px'}}>
                    <button className="btn-action btn-edit" onClick={() => setEditingItem(item)}>Edit</button>
                    <button className="btn-action btn-delete" onClick={() => deleteDoc(doc(db, "inventory_records", item.id))}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingItem && (
        <div className="edit-overlay">
          <button style={{position:'fixed', top:'20px', right:'20px', zIndex:3000, background:'#ef4444', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'10px'}} onClick={() => setEditingItem(null)}>CLOSE</button>
          <AddItem editData={editingItem} onComplete={() => setEditingItem(null)} />
        </div>
      )}
    </div>
  );
};

export default InventoryView;
