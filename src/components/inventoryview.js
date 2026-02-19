import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
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
    if (window.confirm("Are you sure you want to delete this item?")) {
      try { await deleteDoc(doc(db, "inventory_records", id)); } 
      catch (err) { alert("Error deleting: " + err.message); }
    }
  };

  // Improved Edit Handler
  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    } else {
      console.error("onEdit function is not provided as a prop.");
    }
  };

  const downloadQR = (id) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      const scaleFactor = 5; 
      canvas.width = 600; // Increased size for more data clarity
      canvas.height = 600;
      
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const padding = 50;
      ctx.drawImage(img, padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
      
      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-FullData-${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBoxes = items.reduce((a, c) => a + (parseFloat(c.openingStock) || 0), 0);
  const totalPcs = items.reduce((a, c) => a + (parseFloat(c.totalPcs) || 0), 0);
  const totalWeight = items.reduce((a, c) => a + (parseFloat(c.totalWeight) || 0), 0);
  const totalTPValue = items.reduce((a, c) => a + (parseFloat(c.tradePrice || 0) * (parseFloat(c.totalPcs) || 0)), 0);
  const totalPurchaseValue = items.reduce((a, c) => a + (parseFloat(c.purchasePrice || 0) * (parseFloat(c.totalPcs) || 0)), 0);

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; outline: none; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
    .stat-card { background: #111; padding: 20px; border-radius: 15px; border: 1px solid #222; text-align: center; border-top: 3px solid #f59e0b; }
    .stat-val { display: block; font-size: 22px; font-weight: 900; color: #f59e0b; margin-bottom: 5px; }
    .stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1100px; }
    th { background: #1a1a1a; color: #f59e0b; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; }
    
    .qr-box { background: #fff; padding: 5px; border-radius: 5px; display: inline-block; cursor: pointer; border: 2px solid #fff; }
    .qr-box:hover { border-color: #f59e0b; }

    .action-btn { padding: 15px 25px; border-radius: 12px; border: none; cursor: pointer; font-weight: 900; font-size: 16px; width: 110px; }
    .edit-btn { background: #f59e0b; color: #000; margin-right: 10px; }
    .delete-btn { background: #ef4444; color: #fff; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0 }}>INVENTORY DASHBOARD</h2>
        <input type="text" className="search-bar" placeholder="Search product..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="stat-grid">
        <div className="stat-card"><span className="stat-val">{items.length}</span><span className="stat-label">Total Items</span></div>
        <div className="stat-card"><span className="stat-val">{totalBoxes} / {totalPcs}</span><span className="stat-label">Boxes / Total Pcs</span></div>
        <div className="stat-card"><span className="stat-val">{totalWeight.toFixed(2)} KG</span><span className="stat-label">Total Weight</span></div>
        <div className="stat-card"><span className="stat-val">{totalTPValue.toLocaleString()}</span><span className="stat-label">Total TP Value</span></div>
        <div className="stat-card"><span className="stat-val">{totalPurchaseValue.toLocaleString()}</span><span className="stat-label">Total Purchase</span></div>
      </div>

      <div className="table-responsive">
        {loading ? <div style={{padding:'50px', textAlign:'center', color:'#f59e0b'}}>Loading Data...</div> : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Details</th>
                <th>QR Code (Click)</th>
                <th>Stock Details</th>
                <th>Pricing (PUR/TP/RP)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                // Extended Data for QR Code
                const qrValue = `SR#:${item.srNo}|ITEM:${item.name}|CO:${item.company || 'N/A'}|WH:${item.warehouse}|PCS:${item.pcsPerBox}|VOL:${item.length}x${item.width}x${item.height}|WT:${item.weightKg}KG|PUR:${item.purchasePrice}`;

                return (
                  <tr key={item.id}>
                    <td><img src={item.imageUrl} alt="img" style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}} /></td>
                    <td>
                      <div style={{fontWeight:'bold', color:'#f59e0b'}}>{item.name}</div>
                      <div style={{fontSize:'12px', color:'#888'}}>{item.sku}</div>
                      <div style={{fontSize:'11px', color:'#666'}}>{item.warehouse}</div>
                    </td>
                    <td>
                      <div className="qr-box" onClick={() => downloadQR(item.id)}>
                        <QRCodeSVG 
                          id={`qr-${item.id}`} 
                          value={qrValue} 
                          size={55} 
                          level="H" 
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight:'bold'}}>{item.openingStock} Boxes</div>
                      <div style={{fontSize:'12px', color:'#f59e0b'}}>{item.totalPcs} Pcs</div>
                      <div style={{fontSize:'11px', color:'#777'}}>{item.totalWeight} KG Total</div>
                    </td>
                    <td>
                      <div style={{fontSize:'13px'}}>P: {item.purchasePrice}</div>
                      <div style={{fontSize:'13px'}}>T: {item.tradePrice}</div>
                      <div style={{fontSize:'13px', color:'#f59e0b', fontWeight:'bold'}}>R: {item.retailPrice}</div>
                    </td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>EDIT</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>DEL</button>
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
