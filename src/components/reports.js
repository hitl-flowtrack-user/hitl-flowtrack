import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { FileText, Download, Calendar, Users, TrendingUp, PieChart as PieIcon } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState("Sales");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data based on Report Type
  const fetchReport = async (type) => {
    setLoading(true);
    setReportType(type);
    let collectionName = type === "Sales" ? "trade_history" : "flowtrack_inventory";
    const q = query(collection(collectionName), orderBy("timestamp", "desc"));
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setData(results);
    setLoading(false);
  };

  useEffect(() => { fetchReport("Sales"); }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              <span className="text-amber-500">Core</span> Insight Hub
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Advanced Business Analytics & Ledger System</p>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5">
            {["Sales", "Inventory", "Ledgers"].map((tab) => (
              <button 
                key={tab}
                onClick={() => fetchReport(tab)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${reportType === tab ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                {tab} Reports
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Export */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
            <Calendar className="text-amber-500" size={20} />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-black">Date Range</span>
              <span className="text-sm font-bold uppercase">Today: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
            <TrendingUp className="text-emerald-500" size={20} />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-black">Total Volume</span>
              <span className="text-sm font-bold uppercase">Rs. {data.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}</span>
            </div>
          </div>
          <button className="bg-white text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-amber-500 transition-all">
            <Download size={18} /> Export as High-Tech PDF
          </button>
        </div>

        {/* Dynamic Report Table */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  <th className="p-6">Reference / Date</th>
                  <th className="p-6">Entity / Customer</th>
                  <th className="p-6">Transaction Detail</th>
                  <th className="p-6">Payment Mode</th>
                  <th className="p-6 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center animate-pulse uppercase font-black text-zinc-700">Fetching Intelligence Data...</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="font-mono text-xs text-amber-500">#{item.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">
                        {item.timestamp?.toDate().toLocaleString() || 'Recent'}
                      </p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-zinc-500">
                          <Users size={14} />
                        </div>
                        <p className="font-black text-sm uppercase italic">{item.customer || "General Trade"}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">
                          {item.items ? `${item.items.length} Assets Exchanged` : "Inventory Audit"}
                        </span>
                        <div className="flex gap-1">
                          {item.items?.slice(0, 2).map((prod, i) => (
                            <span key={i} className="text-[8px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{prod.nameEN}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${item.payment === 'Cash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {item.payment || "Asset"}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-white text-lg">
                      Rs. {(item.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;