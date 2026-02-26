import React, { useState, useEffect } from 'react';
import { db, logActivity } from '../../firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { Box, Package, AlertTriangle, Warehouse, FileText } from 'lucide-react';

const ProductManager = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'StoneCraft', // Restricted word changed
    warehouse: 'Main Warehouse',
    stockLevel: '',
    minLevel: '10', // Is se kam stock par alert aayega
    price: ''
  });

  // 1. Stock Load Karna
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "products"),
        where("companyId", "==", currentUser.companyId)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      alert("Inventory load nahi ho saki: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.companyId) fetchInventory();
  }, [currentUser]);

  // 2. Naya Product ya Stock Entry
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        companyId: currentUser.companyId,
        stockLevel: Number(formData.stockLevel),
        minLevel: Number(formData.minLevel),
        price: Number(formData.price),
        lastUpdated: new Date().toISOString()
      };

      await addDoc(collection(db, "products"), productData);

      // Activity Log: Kis ne stock add kiya
      await logActivity(
        currentUser.uid,
        currentUser.companyId,
        "PRODUCT_ADDED",
        "Inventory",
        `Added item: ${formData.name} in ${formData.warehouse}`
      );

      alert("Item kamyabi se shamil ho gaya!");
      setFormData({ sku: '', name: '', category: 'StoneCraft', warehouse: 'Main Warehouse', stockLevel: '', minLevel: '10', price: '' });
      fetchInventory();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Box className="text-orange-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">HITL-FlowTrack Inventory</h1>
        </div>
        <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg">
          <FileText size={18} /> DocVault Reports
        </button>
      </div>

      {/* Form: Stock Entry */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package size={20} className="text-blue-500" /> New Stock Entry
        </h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            className="border p-2 rounded" 
            placeholder="SKU Number (e.g. SC-001)" 
            value={formData.sku}
            onChange={(e) => setFormData({...formData, sku: e.target.value})}
            required 
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Item Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <select 
            className="border p-2 rounded"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="StoneCraft">StoneCraft</option>
            <option value="Fixtures">Fixtures</option>
            <option value="Adhesives">Adhesives</option>
          </select>
          <select 
            className="border p-2 rounded"
            value={formData.warehouse}
            onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
          >
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="Sub-Store A">Sub-Store A</option>
            <option value="Transit">In Transit</option>
          </select>
          <input 
            className="border p-2 rounded" 
            placeholder="Quantity" 
            type="number"
            value={formData.stockLevel}
            onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
            required
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Min Alert Level" 
            type="number"
            value={formData.minLevel}
            onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Unit Price" 
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
          <button type="submit" className="bg-orange-600 text-white p-2 rounded font-bold hover:bg-orange-700">
            Add to Stock
          </button>
        </form>
      </div>

      {/* Inventory List & Alerts */}
      <div className="grid grid-cols-1 gap-4">
        {products.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center" 
               style={{ borderLeftColor: item.stockLevel <= item.minLevel ? '#ef4444' : '#10b981' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{item.sku}</span>
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                {item.stockLevel <= item.minLevel && (
                  <span className="text-red-500 flex items-center gap-1 text-xs font-bold animate-pulse">
                    <AlertTriangle size={14} /> LOW STOCK
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Warehouse size={14} /> {item.warehouse} | Category: {item.category}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-black text-gray-800">{item.stockLevel}</div>
              <div className="text-xs text-gray-400 font-bold uppercase">Units Left</div>
              <div className="text-sm font-semibold text-green-600">Rs. {item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;