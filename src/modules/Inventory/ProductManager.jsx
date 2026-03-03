import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Box, Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AddItem from './AddItem';

export default function ProductManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState('list');
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "elite_inventory"), orderBy("createdAt", "desc"));
    
    // onSnapshot automatically updates the list when data changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.companyId]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "elite_inventory", id));
      } catch (err) { alert("Delete Failed!"); }
    }
  };

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'add') {
    return <AddItem editData={editData} onComplete={() => { setView('list'); setEditData(null); }} />;
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-amber-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest">Loading Vault...</span>
    </div>
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 tracking-tighter">
                <Box className="text-amber-500" /> Inventory
            </h2>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{products.length} Products Registered</p>
        </div>
        <button onClick={() => setView('add')} className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-amber-400">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
        <input 
          type="text" placeholder="Search by name or SKU..."
          className="w-full bg-[#121212] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase focus:border-amber-500/50 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-[#121212] border border-white/5 rounded-[2rem] p-4 group hover:border-amber-500/30 transition-all">
            <div className="h-28 bg-black rounded-2xl mb-3 overflow-hidden border border-white/5 flex items-center justify-center">
                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-zinc-800 font-black italic text-xs">NO IMG</span>}
            </div>
            <h3 className="text-[10px] font-black uppercase italic truncate mb-1">{p.name}</h3>
            <p className="text-amber-500 font-bold text-[8px] tracking-widest uppercase mb-3">{p.sku}</p>
            <div className="flex gap-2">
                <button onClick={() => { setEditData(p); setView('add'); }} className="flex-1 bg-white/5 p-2 rounded-lg hover:bg-amber-500 hover:text-black transition-all">
                    <Pencil size={12} className="mx-auto" />
                </button>
                <button onClick={() => handleDelete(p.id, p.name)} className="flex-1 bg-white/5 p-2 rounded-lg hover:bg-red-500 text-red-500 hover:text-white transition-all">
                    <Trash2 size={12} className="mx-auto" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}