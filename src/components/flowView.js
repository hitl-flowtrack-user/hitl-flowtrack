import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Search, Edit3, Trash2, Box, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';

const FlowView = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("All");

  // 1. Live Data Fetching
  useEffect(() => {
    const q = query(collection(db, "flowtrack_inventory"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. Quick Price Update Logic
  const handlePriceUpdate = async (id, newPrice) => {
    const assetRef = doc(db, "flowtrack_inventory", id);
    await updateDoc(assetRef, { retailPrice: parseFloat(newPrice) });
  };

  // 3. Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this asset?")) {
      await deleteDoc(doc(db, "flowtrack_inventory", id));
    }
  };

  const filteredAssets = assets.filter(item => 
    (item.nameEN.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterWarehouse === "All" || item.warehouse === filterWarehouse)
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              <span className="text-amber-500">Live</span> Flow-View
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Real-time Asset Tracking & Management</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search Asset or ID..." 
                className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 text-sm font-bold uppercase"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-zinc-900 border border-white/5 p-4 rounded-2xl outline-none text-xs font-bold uppercase text-amber-500"
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="MAIN GODOWN">Main Godown</option>
              <option value="SHOP STORE">Shop Store</option>
            </select>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  <th className="p-6">Asset Details</th>
                  <th className="p-6">Identity (SKU)</th>
                  <th className="p-6">Location</th>
                  <th className="p-6">Stock Status</th>
                  <th className="p-6">Unit Price</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
                          {asset.imageUrl ? <img src={asset.imageUrl} alt="img" className="w-full h-full object-cover" /> : <Box className="text-zinc-600" />}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase italic">{asset.nameEN}</p>
                          <p className="font-urdu text-zinc-500 text-sm mt-0.5">{asset.nameUR}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-amber-500 font-bold">{asset.sku}</td>
                    <td className="p-6 text-xs font-bold text-zinc-400">
                       <span className="flex items-center gap-1"><ChevronRight size={12}/> {asset.warehouse}</span>
                       <p className="text-[10px] text-zinc-600 ml-4 mt-1">Batch: {asset.batchCode || 'N/A'}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1">
                          <span className={`text-xs font-black ${asset.stockCount <= asset.minStock ? 'text-red-500' : 'text-emerald-500'}`}>
                            {asset.stockCount || 0} PCS
                          </span>
                          <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                             <div 
                               className={`h-full ${asset.stockCount <= asset.minStock ? 'bg-red-500' : 'bg-emerald-500'}`} 
                               style={{ width: `${Math.min((asset.stockCount / asset.maxStock) * 100, 100)}%` }}
                             />
                          </div>
                       </div>
                    </td>
                    <td className="p-6 font-black text-white">
                      <div className="flex items-center gap-2">
                        Rs. <input 
                          type="number" 
                          className="bg-transparent w-20 outline-none border-b border-transparent focus:border-amber-500" 
                          defaultValue={asset.retailPrice}
                          onBlur={(e) => handlePriceUpdate(asset.id, e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <button className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(asset.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAssets.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-zinc-600 font-black uppercase italic tracking-widest text-xl">No Assets Found In Live Stream</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowView;