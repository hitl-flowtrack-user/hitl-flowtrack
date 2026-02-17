import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Lock, Sun, Moon, DollarSign, CreditCard, Package, ChevronRight } from 'lucide-react';

const DayClosing = () => {
  const [summary, setSummary] = useState({
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    totalItems: 0,
    stockValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayStats = async () => {
      setLoading(true);
      // Aaj ki date ka start aur end point
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "trade_history"),
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay))
      );

      const snapshot = await getDocs(q);
      let stats = { totalSales: 0, cashSales: 0, creditSales: 0, totalItems: 0, stockValue: 0 };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.totalSales += data.total || 0;
        if (data.payment === "Cash") stats.cashSales += data.total;
        else stats.creditSales += data.total;
        stats.totalItems += data.items?.length || 0;
      });

      setSummary(stats);
      setLoading(false);
    };

    fetchTodayStats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Moon className="text-amber-500" /> Daily <span className="text-amber-500">Pulse</span>
            </h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Day-End Financial Reconciliation</p>
          </div>
          <div className="bg-zinc-900 px-6 py-2 rounded-2xl border border-white/5 text-xs font-bold text-zinc-400">
            DATE: {new Date().toLocaleDateString()}
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center animate-pulse uppercase font-black text-zinc-700 italic">Calculating Trade Pulse...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            
            {/* Main Stats Pad */}
            <div className="bg-zinc-900/50 rounded-[3rem] p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <Sun size={120} />
              </div>
              
              <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Total Trade Volume</p>
              <h2 className="text-6xl font-black italic text-white tracking-tighter mb-8">
                Rs. {summary.totalSales.toLocaleString()}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <DollarSign size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Liquid Cash</span>
                  </div>
                  <p className="text-2xl font-black tracking-tight">Rs. {summary.cashSales.toLocaleString()}</p>
                </div>

                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-3 text-amber-500 mb-2">
                    <CreditCard size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Market Credit</span>
                  </div>
                  <p className="text-2xl font-black tracking-tight">Rs. {summary.creditSales.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Secondary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Assets Exchanged</p>
                  <p className="text-2xl font-black italic">{summary.totalItems} Items</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
              </div>

              <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">System Status</p>
                  <p className="text-2xl font-black italic text-emerald-500">READY</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                  <Lock size={24} />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-2xl hover:bg-amber-500 transition-all active:scale-95 mt-4">
              <Lock size={18} /> Finalize & Lock Today's Trade
            </button>
            
            <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
              Note: Once locked, today's transactions cannot be modified without Super-Admin Token.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayClosing;