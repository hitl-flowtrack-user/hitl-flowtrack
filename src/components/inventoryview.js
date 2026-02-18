// inventoryview.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [editingItem, setEditingItem] = useState(null);
  
  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
    company: ''
  });

  useEffect(() => {
    const q = query(collection(db, "inventory"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData = [];
      querySnapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() });
      });
      setItems(itemsData);
      setFilteredItems(itemsData);
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = items.filter(item => {
      const matchCategory = filters.category ? item.category === filters.category : true;
      const matchSubCategory = filters.subCategory ? item.subCategory === filters.subCategory : true;
      const matchCompany = filters.company ? item.company?.toLowerCase().includes(filters.company.toLowerCase()) : true;
      const price = parseFloat(item.retailPrice || 0);
      const matchMinPrice = filters.minPrice ? price >= parseFloat(filters.minPrice) : true;
      const matchMaxPrice = filters.maxPrice ? price <= parseFloat(filters.maxPrice) : true;
      
      return matchCategory && matchSubCategory && matchCompany && matchMinPrice && matchMaxPrice;
    });
    setFilteredItems(result);
  }, [filters, items]);

  const handleDownloadQR = (id) => {
    const canvas = document.getElementById(`qr-${id}`);
    const url = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `QR-${id}.png`;
    link.href = url;
    link.click();
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const saveEdit = async () => {
    if (editingItem) {
      const itemRef = doc(db, "inventory", editingItem.id);
      await updateDoc(itemRef, editingItem);
      setEditingItem(null);
      alert("Item updated successfully!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
      
      {/* Filters Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-gray-100 p-4 rounded">
        <input type="text" placeholder="Company" className="p-2 border" onChange={(e) => setFilters({...filters, company: e.target.value})} />
        <select className="p-2 border" onChange={(e) => setFilters({...filters, category: e.target.value})}>
          <option value="">All Categories</option>
          <option value="Grocery">Grocery</option>
          {/* Add more categories dynamically */}
        </select>
        <input type="number" placeholder="Min Price" className="p-2 border" onChange={(e) => setFilters({...filters, minPrice: e.target.value})} />
        <input type="number" placeholder="Max Price" className="p-2 border" onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} />
        <button onClick={() => setViewType(viewType === 'list' ? 'grid' : 'list')} className="bg-blue-500 text-white p-2 rounded">
          Switch to {viewType === 'list' ? 'Grid' : 'List'} View
        </button>
      </div>

      {/* View Logic */}
      {viewType === 'list' ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Item Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="border p-2">{item.itemName}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">{item.retailPrice}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDownloadQR(item.id)} className="bg-green-500 text-white px-2 py-1 rounded">QR</button>
                  <QRCodeCanvas id={`qr-${item.id}`} value={item.id} size={50} style={{display: 'none'}} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="border p-4 rounded shadow">
              <h3 className="font-bold">{item.itemName}</h3>
              <p>Category: {item.category}</p>
              <p>Price: {item.retailPrice}</p>
              <div className="mt-2 space-x-2">
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDownloadQR(item.id)} className="bg-green-500 text-white px-2 py-1 rounded">QR</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit Item</h3>
            <input className="w-full border p-2 mb-2" value={editingItem.itemName} onChange={(e) => setEditingItem({...editingItem, itemName: e.target.value})} placeholder="Item Name" />
            <input className="w-full border p-2 mb-2" value={editingItem.retailPrice} onChange={(e) => setEditingItem({...editingItem, retailPrice: e.target.value})} placeholder="Price" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white p-2 rounded">Cancel</button>
              <button onClick={saveEdit} className="bg-blue-600 text-white p-2 rounded">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
