import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import { 
  TrendingUp, Users, Package, AlertTriangle, 
  Wallet, Landmark, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-zinc-900 border border-white/5 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white`}>
        <Icon size={24} className="group-hover:scale-110 transition-transform" />
      </div>
      {trend && (
        <span className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">{title}</p>
    <h3 className="text-2xl font-black mt-1 text-white italic tracking-tighter">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState({
    stockValue: "Rs. 1,250,000",
    receivables: "Rs. 450,000",
    payables: "Rs. 180,000",
    pettyCash: "Rs. 25,000"
  });

  const [recentSales, setRecentSales] = useState([
    { id: 1, customer: "Al-Makkah Tiles", amount: 45000, status: "Paid", time: "2 mins ago" },
    { id: 2, customer: "Zahid Ceramics", amount: 120000, status: "Credit", time: "15 mins ago" },
    { id: 3, customer: "City Traders", amount: 15000, status: "Paid", time: "1 hour ago" },
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              <span className="text-amber-500">HITL</span> FlowTrack
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Business Intelligence Dashboard</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold leading-none">System Status</p>
              <p className="text-xs font-bold text-emerald-500 uppercase">Attendance Marked - Live</p>
            </div>
          </div>
        </div>

        {/* 1. Overall Business Summary Cards  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Stock Value" value={summary.stockValue} icon={Package} color="bg-blue-500" trend={12} />
          <StatCard title="Market Receivables" value={summary.receivables} icon={Users} color="bg-amber-500" trend={-5} />
          <StatCard title="Company Payables" value={summary.payables} icon={Landmark} color="bg-purple-500" trend={2} />
          <StatCard title="Petty Cash" value={summary.pettyCash} icon={Wallet} color="bg-emerald-500" trend={15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Graphic Presentation Placeholder [cite: 9] */}
          <div className="lg:col-span-2 bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
                <BarChart3 className="text-amber-500" /> Sales & Profit Analytics
              </h3>
              <select className="bg-black text-xs font-bold p-2 rounded-xl border border-white/10 outline-none uppercase">
                <option>Weekly View</option>
                <option>Monthly View</option>
              </select>
            </div>
            {/* Simulation of a chart */}
            <div className="h-64 w-full flex items-end gap-3 px-4">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    style={{ height: `${h}%` }} 
                    className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl group-hover:from-amber-400 group-hover:to-white transition-all cursor-pointer relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Rs.{h}k
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Real-time Activity & Alerts  */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Critical Alerts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="bg-red-500 text-white p-2 rounded-xl">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase leading-none">Low Stock: Tile-A-12</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase">Only 5 Cartons left </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="bg-amber-500 text-black p-2 rounded-xl">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase leading-none">Credit Limit Alert</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase">Zahid Ceramics reached 80% [cite: 69]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2">
                <Activity className="text-blue-500" /> Recent Activity
              </h3>
              <div className="space-y-6">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-black uppercase italic">{sale.customer}</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold">{sale.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-500">Rs. {sale.amount.toLocaleString()}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${sale.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;