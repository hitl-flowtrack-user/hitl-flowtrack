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
    if (window.confirm("Are you sure you want to delete this item?")) {
      try { await deleteDoc(doc(db, "inventory_records", id)); } 
      catch (err) { alert("Error deleting: " + err.message); }
    }
  };

  // Logic to download labels on click
  const downloadLabel = (id, type) => {
    const svg = document.getElementById(`${type}-${id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // 5x Quality improvement logic
      const scaleFactor = 5;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `${type}-${id}-highres.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTP = items.reduce((acc, curr) => acc + (parseFloat(curr.tradePrice) * parseFloat(curr.totalPcs) || 0), 0);
  const totalWeight = items.reduce((acc, curr) => acc + (parseFloat(curr.totalWeight) || 0), 0);

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; outline: none; }
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1200px; }
    th { background: #1a1a1a; color: #f59e0b; text-align: left; padding: 15px; font-size: 12px; text-transform: uppercase; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; vertical-align: middle; }
    .item-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: #222; }
    .label-clickable { background: #fff; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; border: 2px solid transparent; }
    .label-clickable:hover { border-color: #f59e0b; transform: scale(1.05); }
    .action-btn { padding: 15px 25px; border-radius: 12px; border: none; cursor: pointer; font-weight: bold; font-size: 16px; transition: transform 0.2s; }
    .action-btn:active { transform: scale(0.9); }
    .edit-btn { background: #f59e0b; color: #000; margin-right: 10px; width: 100px; }
    .delete-btn { background: #ef4444; color: #fff; width: 100px; }
    .stat-card { background: #111; padding: 20px; border-radius: 20px; border: 1px solid #222; text-align: center; }
    .stat-val { display: block; font-size: 20px; font-weight: 900; color: #f59e0b; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b', margin: 0 }}>INVENTORY DASHBOARD</h2>
        <input type="text" className="search-bar" placeholder="Search product or SKU..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'15px', marginBottom:'25px'}}>
        <div className="stat-card"><span className="stat-val">{items.length}</span><span style={{fontSize:'12px'}}>TOTAL ITEMS</span></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((a,c)=>a+(parseFloat(c.openingStock)||0),0)} / {items.reduce((a,c)=>a+(parseFloat(c.totalPcs)||0),0)}</span><span style={{fontSize:'12px'}}>BOXES / PCS</span></div>
        <div className="stat-card"><span className="stat-val">{totalWeight.toFixed(2)} KG</span><span style={{fontSize:'12px'}}>TOTAL WEIGHT</span></div>
        <div className="stat-card"><span className="stat-val">{totalTP.toLocaleString()}</span><span style={{fontSize:'12px'}}>TOTAL VALUE (TP)</span></div>
      </div>

      <div className="table-responsive">
        {loading ? <div style={{padding:'40px', textAlign:'center', color: '#f59e0b'}}>Loading Inventory...</div> : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Details</th>
                <th>Scan Labels (Click to DL)</th>
                <th>Stock Stats</th>
                <th>Pricing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                // Reduced Barcode Data for better readability
                const compactBarcodeData = `SN:${item.srNo}|PCS:${item.pcsPerBox}|VOL:${item.length}x${item.width}x${item.height}|WT:${item.weightKg}|PUR:${item.purchasePrice}`;
                
                return (
                  <tr key={item.id}>
                    <td><img src={item.imageUrl || ''} className="item-img" alt="Product"/></td>
                    <td>
                      <div style={{fontWeight:'bold', color:'#f59e0b'}}>{item.name}</div>
                      <div style={{fontSize:'11px', color:'#888'}}>{item.sku}</div>
                      <div style={{fontSize:'11px', color:'#666'}}>{item.warehouse}</div>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'12px'}}>
                        <div className="label-clickable" title="Click to Download High-Res Barcode" onClick={() => downloadLabel(item.id, 'bc')}>
                          <Barcode 
                            id={`bc-${item.id}`} 
                            value={compactBarcodeData} 
                            width={1.2} 
                            height={45} 
                            fontSize={10} 
                            margin={0} 
                            background="transparent"
                          />
                        </div>
                        <div className="label-clickable" title="Click to Download High-Res QR" onClick={() => downloadLabel(item.id, 'qr')}>
                          <QRCodeSVG 
                            id={`qr-${item.id}`} 
                            value={item.qrCodeData || 'N/A'} 
                            size={60} 
                            level="H" // High error correction for better scan
                            includeMargin={false}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight:'bold'}}>{item.openingStock} Boxes</div>
                      <div style={{fontSize:'11px', color: '#f59e0b'}}>{item.totalPcs} Total Pcs</div>
                      <div style={{fontSize:'11px', color: '#888'}}>{item.totalWeight} KG Weight</div>
                    </td>
                    <td>
                      <div style={{fontSize:'12px', color: '#ccc'}}>TP: {item.tradePrice}</div>
                      <div style={{fontSize:'12px', color:'#f59e0b', fontWeight: 'bold'}}>RP: {item.retailPrice}</div>
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
