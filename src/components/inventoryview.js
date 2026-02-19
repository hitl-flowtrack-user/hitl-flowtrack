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

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents triggering other clicks
    if (window.confirm("Are you sure you want to delete this item?")) {
      try { await deleteDoc(doc(db, "inventory_records", id)); } 
      catch (err) { alert("Error deleting: " + err.message); }
    }
  };

  const handleEditClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(item); // Calling the prop function passed from App.js
    } else {
      console.error("onEdit function is not passed to InventoryView");
    }
  };

  const downloadLabel = (e, id, type) => {
    e.stopPropagation();
    const svg = document.getElementById(`${type}-${id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // High Quality but Controlled Physical Size (5x scaling for clarity only)
      const qualityScale = 5; 
      canvas.width = img.width * qualityScale;
      canvas.height = img.height * qualityScale;
      
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(qualityScale, qualityScale);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `${type}-${id}.png`;
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

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; }
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1200px; }
    th { background: #1a1a1a; color: #f59e0b; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; }
    .item-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
    
    .label-clickable { 
      background: #fff; padding: 5px; border-radius: 4px; display: flex; 
      align-items: center; justify-content: center; cursor: pointer; 
      border: 3px solid #fff; /* White Border */
    }

    .action-btn { 
      padding: 15px 25px; border-radius: 12px; border: none; cursor: pointer; 
      font-weight: 900; font-size: 16px; text-transform: uppercase;
      display: inline-block; vertical-align: middle;
    }
    .edit-btn { background: #f59e0b; color: #000; margin-right: 15px; width: 120px; pointer-events: auto !important; }
    .delete-btn { background: #ef4444; color: #fff; width: 120px; }
    
    .stat-card { background: #111; padding: 15px; border-radius: 15px; border: 1px solid #222; text-align: center; }
    .stat-val { display: block; font-size: 18px; font-weight: 900; color: #f59e0b; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b' }}>INVENTORY VIEW</h2>
        <input type="text" className="search-bar" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'15px', marginBottom:'20px'}}>
        <div className="stat-card"><span className="stat-val">{items.length}</span><small>ITEMS</small></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((a,c)=>a+(parseFloat(c.totalPcs)||0),0)}</span><small>TOTAL PCS</small></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((a,c)=>a+(parseFloat(c.totalWeight)||0),0).toFixed(2)} KG</span><small>WEIGHT</small></div>
        <div className="stat-card"><span className="stat-val">{totalTP.toLocaleString()}</span><small>VALUE (TP)</small></div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product & SKU</th>
              <th>Labels (Click Pic)</th>
              <th>Stock Info</th>
              <th>Price Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              // Barcode: SR, PCS, Vol, Wt (No Purchase) - Size optimized for 2-inch
              const bCode = `SN:${item.srNo}|PCS:${item.pcsPerBox}|VOL:${item.length}x${item.width}x${item.height}|WT:${item.weightKg}`;
              // QR: Name, WH, PCS/B
              const qCode = `ITEM:${item.name}|WH:${item.warehouse}|PCS/B:${item.pcsPerBox}`;

              return (
                <tr key={item.id}>
                  <td><img src={item.imageUrl} className="item-img" alt="P"/></td>
                  <td>
                    <div style={{fontWeight:'bold', color:'#f59e0b'}}>{item.name}</div>
                    <div style={{fontSize:'11px'}}>{item.sku}</div>
                    <div style={{fontSize:'10px', color:'#666'}}>{item.warehouse}</div>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'8px'}}>
                      <div className="label-clickable" onClick={(e) => downloadLabel(e, item.id, 'bc')}>
                        <Barcode id={`bc-${item.id}`} value={bCode} width={0.7} height={30} fontSize={8} margin={0} />
                      </div>
                      <div className="label-clickable" onClick={(e) => downloadLabel(e, item.id, 'qr')}>
                        <QRCodeSVG id={`qr-${item.id}`} value={qCode} size={45} level="H" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight:'bold'}}>{item.openingStock} Boxes</div>
                    <div style={{fontSize:'12px'}}>{item.totalPcs} Pcs</div>
                    <div style={{fontSize:'11px', color:'#888'}}>{item.weightKg}kg/Box | {item.totalWeight}kg Total</div>
                  </td>
                  <td>
                    <div style={{fontSize:'12px'}}>PUR: {item.purchasePrice}</div>
                    <div style={{fontSize:'12px'}}>TP: {item.tradePrice}</div>
                    <div style={{fontSize:'12px', color:'#f59e0b'}}>RP: {item.retailPrice}</div>
                  </td>
                  <td style={{minWidth: '280px'}}>
                    <button 
                      type="button"
                      className="action-btn edit-btn" 
                      onClick={(e) => handleEditClick(e, item)}
                    >
                      EDIT
                    </button>
                    <button 
                      type="button"
                      className="action-btn delete-btn" 
                      onClick={(e) => handleDelete(e, item.id)}
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;
