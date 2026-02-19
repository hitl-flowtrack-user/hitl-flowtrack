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

  const downloadLabel = (id, type) => {
    const svg = document.getElementById(`${type}-${id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // 3x Smaller size logic - Controlling pixels for sharpness
      const targetWidth = type === 'bc' ? 350 : 350; 
      const scale = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scale;

      // Fill White Background & Add Border
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image with padding for border
      const padding = 15;
      ctx.drawImage(img, padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
      
      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `${type}-${id}-label.png`;
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
    .inventory-container { background-color: #000; min-height: 100vh; padding: 20px; color: #fff; }
    .table-responsive { background: #111; border-radius: 15px; overflow-x: auto; border: 1px solid #222; }
    table { width: 100%; border-collapse: collapse; min-width: 1000px; }
    th { color: #f59e0b; padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #222; }
    td { padding: 15px; border-bottom: 1px solid #222; vertical-align: middle; }
    
    .label-box { 
      background: #fff; padding: 5px; border-radius: 4px; border: 2px solid #fff;
      display: inline-flex; cursor: pointer; transition: 0.2s;
    }
    .label-box:hover { border-color: #f59e0b; transform: scale(1.05); }

    .action-btn { 
      padding: 15px 20px; border-radius: 10px; border: none; font-weight: 900; 
      cursor: pointer; text-transform: uppercase; font-size: 14px;
    }
    .edit-btn { background: #f59e0b; color: #000; margin-right: 10px; width: 100px; }
    .delete-btn { background: #ef4444; color: #fff; width: 100px; }
  `;

  return (
    <div className="inventory-container">
      <style>{styles}</style>
      <h2 style={{ color: '#f59e0b', fontStyle: 'italic', marginBottom: '20px' }}>INVENTORY VIEW</h2>
      
      <input 
        type="text" 
        placeholder="Search Inventory..." 
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: '#fff' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Labels (Click to DL)</th>
              <th>Stock & Weight</th>
              <th>Pricing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const bCodeData = `SN:${item.srNo}|PCS:${item.pcsPerBox}|VOL:${item.length}x${item.width}x${item.height}|WT:${item.weightKg}`;
              const qCodeData = `ITEM:${item.name}|WH:${item.warehouse}|PCS/B:${item.pcsPerBox}`;

              return (
                <tr key={item.id}>
                  <td><img src={item.imageUrl} alt="img" style={{ width: '50px', height: '50px', borderRadius: '5px' }} /></td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{item.sku}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="label-box" onClick={() => downloadLabel(item.id, 'bc')}>
                        <Barcode id={`bc-${item.id}`} value={bCodeData} width={0.4} height={20} fontSize={8} margin={0} />
                      </div>
                      <div className="label-box" onClick={() => downloadLabel(item.id, 'qr')}>
                        <QRCodeSVG id={`qr-${item.id}`} value={qCodeData} size={35} level="H" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{item.openingStock} Boxes / {item.totalPcs} Pcs</div>
                    <div style={{ fontSize: '11px', color: '#f59e0b' }}>{item.totalWeight} KG</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>PUR: {item.purchasePrice}</div>
                    <div style={{ fontSize: '12px', color: '#f59e0b' }}>RP: {item.retailPrice}</div>
                  </td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => { console.log("Editing:", item); onEdit(item); }}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Del</button>
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
