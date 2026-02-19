import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const InventoryView = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inventory_records"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory_records", id));
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; outline: none; }
    .search-bar:focus { border-color: #f59e0b; }
    
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1000px; }
    th { background: #1a1a1a; color: #f59e0b; text-align: left; padding: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; vertical-align: middle; }
    
    .item-img { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; background: #000; }
    .stock-badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .low-stock { background: #7f1d1d; color: #fecaca; }
    .normal-stock { background: #064e3b; color: #d1fae5; }
    
    .action-btn { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; margin-right: 5px; font-size: 12px; }
    .edit-btn { background: #f59e0b; color: #000; }
    .delete-btn { background: #ef4444; color: #fff; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
    .stat-card { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; text-align: center; }
    .stat-val { display: block; font-size: 24px; font-weight: 900; color: #f59e0b; }
    .stat-lbl { font-size: 12px; color: #9ca3af; text-transform: uppercase; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0 }}>INVENTORY DASHBOARD</h2>
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search by Name, SKU or Company..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-val">{items.length}</span>
          <span className="stat-lbl">Total Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">{items.reduce((acc, curr) => acc + (parseFloat(curr.totalPcs) || 0), 0)}</span>
          <span className="stat-lbl">Total Stock (Pcs)</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">{items.reduce((acc, curr) => acc + (parseFloat(curr.totalWeight) || 0), 0).toFixed(2)}</span>
          <span className="stat-lbl">Total Weight (KG)</span>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inventory...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item Details</th>
                <th>Company/Cat</th>
                <th>Stock Stats</th>
                <th>Prices</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = (parseFloat(item.totalPcs) || 0) <= (parseFloat(item.minStock) || 0);
                return (
                  <tr key={item.id}>
                    <td>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} className="item-img" alt="Product" />
                      ) : (
                        <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: '#222' }}>NO IMG</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.sku}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{item.company}</div>
                      <div style={{ fontSize: '11px', color: '#f59e0b' }}>{item.category} / {item.subCategory}</div>
                    </td>
                    <td>
                      <div className={`stock-badge ${isLow ? 'low-stock' : 'normal-stock'}`}>
                        {item.totalPcs} PCS
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '5px', color: '#9ca3af' }}>
                        WT: {item.totalWeight} KG | WH: {item.warehouse}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>TP: {item.tradePrice}</div>
                      <div style={{ fontSize: '12px', color: '#10b981' }}>RP: {item.retailPrice}</div>
                    </td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => onEdit(item)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Del</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryView;
