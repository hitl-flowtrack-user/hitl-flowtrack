import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

const InventoryView = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inventory_records"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item permanently?")) {
      try { await deleteDoc(doc(db, "inventory_records", id)); } 
      catch (err) { alert(err.message); }
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totals Calculation
  const totalStockPcs = items.reduce((acc, curr) => acc + (parseFloat(curr.totalPcs) || 0), 0);
  const totalStockBoxes = items.reduce((acc, curr) => acc + (parseFloat(curr.openingStock) || 0), 0);
  const totalWeight = items.reduce((acc, curr) => acc + (parseFloat(curr.totalWeight) || 0), 0);
  const totalTPValue = items.reduce((acc, curr) => acc + ((parseFloat(curr.tradePrice) || 0) * (parseFloat(curr.totalPcs) || 0)), 0);
  const totalRPValue = items.reduce((acc, curr) => acc + ((parseFloat(curr.retailPrice) || 0) * (parseFloat(curr.totalPcs) || 0)), 0);

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; outline: none; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
    .stat-card { background: #111; padding: 15px; border-radius: 20px; border: 1px solid #222; text-align: center; }
    .stat-val { display: block; font-size: 18px; font-weight: 900; color: #f59e0b; }
    .stat-lbl { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1100px; }
    th { background: #1a1a1a; color: #f59e0b; padding: 15px; font-size: 11px; text-transform: uppercase; text-align: left; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 13px; }
    .label-box { background: #fff; padding: 5px; border-radius: 10px; display: inline-block; }
    .action-btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; margin-right: 5px; }
    .edit-btn { background: #f59e0b; color: #000; }
    .delete-btn { background: #ef4444; color: #fff; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b' }}>INVENTORY DASHBOARD</h2>
        <input type="text" className="search-bar" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-val">{items.length}</span><span className="stat-lbl">Total Items</span></div>
        <div className="stat-card"><span className="stat-val">{totalStockBoxes} Box / {totalStockPcs} Pcs</span><span className="stat-lbl">Total Stock</span></div>
        <div className="stat-card"><span className="stat-val">{totalWeight.toFixed(2)} KG</span><span className="stat-lbl">Total Weight</span></div>
        <div className="stat-card"><span className="stat-val">{totalTPValue.toLocaleString()}</span><span className="stat-lbl">Total TP Value</span></div>
        <div className="stat-card"><span className="stat-val">{totalRPValue.toLocaleString()}</span><span className="stat-lbl">Total RP Value</span></div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Info</th>
              <th>Labels (Barcode/QR)</th>
              <th>Stock Status</th>
              <th>Prices</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td><img src={item.imageUrl || ''} style={{width:'50px', borderRadius:'8px'}} alt="P"/></td>
                <td>
                  <div style={{fontWeight:'bold', color:'#f59e0b'}}>{item.name}</div>
                  <div style={{fontSize:'10px'}}>{item.sku} | {item.warehouse}</div>
                </td>
                <td>
                  <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <div className="label-box">
                      <Barcode value={item.barcodeData || 'N/A'} width={1} height={30} fontSize={8} margin={0}/>
                    </div>
                    <div className="label-box" style={{padding:'8px'}}>
                      <QRCodeSVG value={item.qrCodeData || 'N/A'} size={40} />
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{fontWeight:'bold'}}>{item.openingStock} Box ({item.totalPcs} Pcs)</div>
                  <div style={{fontSize:'10px', color:'#9ca3af'}}>{item.weightKg}kg/pc | {item.totalWeight}kg Total</div>
                </td>
                <td>
                  <div>TP: {item.tradePrice}</div>
                  <div style={{color:'#10b981'}}>RP: {item.retailPrice}</div>
                </td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => onEdit(item)}>Edit</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;
