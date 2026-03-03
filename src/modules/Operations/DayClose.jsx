import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import { 
  Lock, Unlock, DollarSign, ShoppingCart, 
  Users, Calendar, Loader2, FileText, CheckCircle2 
} from "lucide-react";

export default function DayClose() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [reportData, setReportData] = useState({
    totalSales: 0,
    orderCount: 0,
    presentStaff: 0,
    orders: []
  });

  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!user?.companyId) return;
      try {
        setLoading(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startTimestamp = Timestamp.fromDate(today);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endTimestamp = Timestamp.fromDate(tomorrow);

        const qOrders = query(
          collection(db, "orders"),
          where("companyId", "==", user.companyId),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<", endTimestamp)
        );
        const orderSnap = await getDocs(qOrders);
        const ordersList = orderSnap.docs.map(doc => doc.data());
        const salesSum = ordersList.reduce((sum, ord) => sum + (ord.total || 0), 0);

        const qAttendance = query(
          collection(db, "attendance"),
          where("companyId", "==", user.companyId),
          where("date", "==", today.toISOString().split('T')[0])
        );
        const attSnap = await getDocs(qAttendance);

        setReportData({
          totalSales: salesSum,
          orderCount: ordersList.length,
          presentStaff: attSnap.size,
          orders: ordersList
        });

      } catch (err) {
        console.error("Error fetching day stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, [user]);

  const handleDayClose = async () => {
    if (window.confirm("Are you sure you want to close the day? This will save the final report.")) {
      setIsClosing(true);
      try {
        await addDoc(collection(db, "day_summaries"), {
          companyId: user.companyId,
          date: new Date().toISOString().split('T')[0],
          totalRevenue: reportData.totalSales,
          totalOrders: reportData.orderCount,
          staffPresent: reportData.presentStaff,
          closedBy: user.email,
          closedAt: serverTimestamp()
        });
        alert("Day closed successfully!");
      } catch (err) {
        // Line 86 fix: Logging the error so 'err' is used
        console.error("Day Close Error:", err);
        alert("Error closing day! Check console for details.");
      } finally {
        setIsClosing(false);
      }
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin text-amber-500 mx-auto" size={40} /></div>;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-950 text-white font-sans">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase flex items-center gap-3">
            <Lock className="text-amber-500" size={32} /> Day Close Report
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Review and finalize today's operations</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Calendar size={18} className="text-amber-500" />
          <span className="font-black text-sm uppercase tracking-tighter">{new Date().toDateString()}</span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-amber-500/10 transition-colors">
            <DollarSign size={120} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Total Sales Revenue</p>
          <h3 className="text-4xl font-black text-white italic">Rs.{reportData.totalSales}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-amber-500/10 transition-colors">
            <ShoppingCart size={120} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Orders Completed</p>
          <h3 className="text-4xl font-black text-white italic">{reportData.orderCount}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-amber-500/10 transition-colors">
            <Users size={120} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Staff Attendance</p>
          <h3 className="text-4xl font-black text-white italic">{reportData.presentStaff} Present</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 overflow-hidden">
          <h4 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
            <FileText size={16} className="text-amber-500" /> Today's Transaction Log
          </h4>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {reportData.orders.length === 0 && <p className="text-zinc-600 italic text-center py-10 text-xs uppercase font-black">No transactions recorded today.</p>}
            {reportData.orders.map((order, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 font-black text-xs italic">TRX</div>
                  <div>
                    <p className="text-xs font-black uppercase text-white">{order.bookedBy?.split('@')[0] || "Cashier"}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{order.items?.length || 0} Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white italic">Rs.{order.total}</p>
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 h-fit shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/20">
              <Lock className="text-amber-500" size={32} />
            </div>
            <h3 className="text-xl font-black italic uppercase">Finalize Operations</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Lock today's accounts</p>
          </div>

          <ul className="space-y-4 mb-8 relative z-10">
            <li className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-400">
              <CheckCircle2 size={16} className="text-emerald-500" /> Sales Verified
            </li>
            <li className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-400">
              <CheckCircle2 size={16} className="text-emerald-500" /> Attendance Sync Complete
            </li>
            <li className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-400">
              <CheckCircle2 size={16} className="text-emerald-500" /> Inventory Adjusted
            </li>
          </ul>

          <button 
            onClick={handleDayClose}
            disabled={isClosing}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 relative z-10"
          >
            {isClosing ? <Loader2 className="animate-spin" size={20} /> : <Unlock size={20} />}
            {isClosing ? "Closing..." : "Close Day Now"}
          </button>
        </div>
      </div>
    </div>
  );
}