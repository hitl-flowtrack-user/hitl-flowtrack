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
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      try { await deleteDoc(doc(db, "inventory_records", id)); } 
      catch (err) { alert("Error deleting: " + err.message); }
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
      // 3 Times smaller width logic for barcode (approx 350-400px for 2 inches)
      const targetWidth = type === 'bc' ? 400 : 400; 
      const scale = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scale;

      // Ensure High Quality Pixels
      ctx.imageSmoothingEnabled = false; 
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add padding for QR or Barcode to act as white border
      const p = 15; 
      ctx.drawImage(img, p, p, canvas.width - (p * 2), canvas.height - (p * 2));
      
      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `${type}-${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = `
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .search-bar { background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; color: #fff; width: 300px; outline: none; }
    .table-responsive { background: #111; border-radius: 20px; overflow-x: auto; border: 1px solid #222; position: relative; }
    table { width: 100%; border-collapse: collapse; min-width: 1100px; }
    th { background: #1a1a1a; color: #f59e0b; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; }
    td { padding: 15px; border-bottom: 1px solid #222; font-size: 14px; color: #eee; }
    .item-img { width: 55px; height: 55px; border-radius: 8px; object-fit: cover; border: 1px solid #333; }
    
    .label-clickable { 
      background: #fff; padding: 4px; border-radius: 4px; display: flex; 
      align-items: center; justify-content: center; cursor: pointer; 
      border: 2px solid #fff; transition: 0.2s;
    }
    .label-clickable:hover { transform: scale(1.05); border-color: #f59e0b; }

    .action-btn { 
      padding: 15px 20px; border-radius: 12px; border: none; cursor: pointer !important; 
      font-weight: 900; font-size: 15px; text-transform: uppercase;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .edit-btn { background: #f59e0b; color: #000; margin-right: 12px; width: 110px; }
    .delete-btn { background: #ef4444; color: #fff; width: 110px; }
    
    .stat-card { background: #111; padding: 15px; border-radius: 15px; border: 1px solid #222; text-align: center; }
    .stat-val { display: block; font-size: 18px; font-weight: 900; color: #f59e0b; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <div className="header-section">
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', color: '#f59e0b' }}>INVENTORY VIEW</h2>
        <input type="text" className="search-bar" placeholder="Search products..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'15px', marginBottom:'20px'}}>
        <div className="stat-card"><span className="stat-val">{items.length}</span><small>ITEMS</small></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((a,c)=>a+(parseFloat(c.totalPcs)||0),0)}</span><small>TOTAL PCS</small></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((a,c)=>a+(parseFloat(c.totalWeight)||0),0).toFixed(1)} KG</span><small>WEIGHT</small></div>
        <div className="stat-card"><span className="stat-val">{items.reduce((acc, curr) => acc + (parseFloat(curr.tradePrice) * parseFloat(curr.totalPcs) || 0), 0).toLocaleString()}</span><small>VALUE</small></div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Info</th>
              <th>Labels</th>
              <th>Stock</th>
              <th>Pricing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const bCode = `SN:${item.srNo}|PCS:${item.pcsPerBox}|VOL:${item.length}x${item.width}x${item.height}|WT:${item.weightKg}`;
              const qCode = `ITEM:${item.name}|WH:${item.warehouse}|PCS/B:${item.pcsPerBox}`;

              return (
                <tr key={item.id}>
                  <td><img src={item.imageUrl} className="item-img" alt="Product"/></td>
                  <td>
                    <div style={{fontWeight:'bold', color:'#f59e0b'}}>{item.name}</div>
                    <div style={{fontSize:'11px', color:'#999'}}>{item.sku}</div>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'6px'}}>
                      <div className="label-clickable" onClick={(e) => downloadLabel(e, item.id, 'bc')}>
                        <Barcode id={`bc-${item.id}`} value={bCode} width={0.6} height={25} fontSize={8} margin={0} />
                      </div>
                      <div className="label-clickable" onClick={(e) => downloadLabel(e, item.id, 'qr')}>
                        <QRCodeSVG id={`qr-${item.id}`} value={qCode} size={40} level="H" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight:'bold'}}>{item.openingStock} Boxes</div>
                    <div style={{fontSize:'11px', color:'#f59e0b'}}>{item.totalPcs} Pcs</div>
                  </td>
                  <td>
                    <div style={{fontSize:'12px'}}>PUR: {item.purchasePrice}</div>
                    <div style={{fontSize:'12px', color:'#f59e0b'}}>RP: {item.retailPrice}</div>
                  </td>
                  <td style={{position: 'relative'}}>
                    <button 
                      type="button"
                      className="action-btn edit-btn" 
                      style={{ position: 'relative', zIndex: 999, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Edit Clicked for:", item.name); // Debug log
                        onEdit(item);
                      }}
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
