import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Loader2,
  ArrowUpRight
} from "lucide-react";

const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 min-w-[140px] flex-1">
    <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-500`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter leading-none mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-lg font-bold text-white leading-none">{value}</h3>
        <ArrowUpRight size={10} className="text-emerald-500" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sales: 0, products: 0, staff: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.companyId) return;
      try {
        const pSnap = await getDocs(query(collection(db, "products"), where("companyId", "==", user.companyId)));
        const sSnap = await getDocs(query(collection(db, "users"), where("companyId", "==", user.companyId)));
        
        setStats({
          products: pSnap.size,
          staff: sSnap.size,
          sales: "124", // Dummy data for now
          revenue: "45k" // Dummy data for now
        });
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-amber-500" size={30} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="px-2">
        <h2 className="text-2xl font-black italic uppercase text-white">
          Welcome, <span className="text-amber-500">{user?.displayName || "Admin"}</span>
        </h2>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Business Overview</p>
      </div>

      {/* COMPACT SUMMARY CARDS - One Line on Desktop, Wrapped on Mobile */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 px-2">
        <SummaryCard title="Total Sales" value={stats.sales} icon={TrendingUp} color="blue" />
        <SummaryCard title="Inventory" value={stats.products} icon={Package} color="amber" />
        <SummaryCard title="Revenue" value={`Rs.${stats.revenue}`} icon={DollarSign} color="emerald" />
        <SummaryCard title="Staff" value={stats.staff} icon={Users} color="purple" />
      </div>

      {/* Main Grid for Charts/Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 h-64 flex items-center justify-center border-dashed">
          <p className="text-zinc-600 font-bold uppercase text-xs">Sales Analytics Chart (Coming Soon)</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 h-64 flex items-center justify-center border-dashed">
          <p className="text-zinc-600 font-bold uppercase text-xs">Recent Activities (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;