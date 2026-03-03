import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  MapPin,
  ClipboardList, // Order Booking ke liye icon
  Boxes,
  Users,
  Lock,
  PlusCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // FIX: Line 25 - Cascading render error resolved with Timeout
  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => setSidebarOpen(false), 0);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const navItemClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/5 text-zinc-400 hover:text-white group";

  const activeClass =
    "bg-amber-500 text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-screen bg-slate-900 border-r border-white/5 p-6 flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div className="flex items-center justify-between mb-10 px-2">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            FLOW<span className="text-amber-500">TRACK</span>
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Management</p>
          
          <NavLink to="/dashboard" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>

          {/* Updated: Order Booking */}
          <NavLink to="/order-booking" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
            <ClipboardList size={20} /> Order Booking
          </NavLink>

          <NavLink to="/inventory" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
            <Boxes size={20} /> Inventory
          </NavLink>

          <NavLink to="/add-item" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : "border border-white/5 bg-white/[0.02]"}`}>
            <PlusCircle size={20} className="text-amber-500" /> Add New Item
          </NavLink>

          <div className="pt-4 mt-4 border-t border-white/5">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Staff & Ops</p>
            
            <NavLink to="/attendance" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
              <MapPin size={20} /> Attendance
            </NavLink>

            {user?.role === "Admin" && (
              <>
                <NavLink to="/staff" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
                  <Users size={20} /> Staff Details
                </NavLink>
                <NavLink to="/day-close" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : ""}`}>
                  <Lock size={20} /> Day Close
                </NavLink>
              </>
            )}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={logout} 
            className="w-full bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* MOBILE TOPBAR */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400">
            <Menu size={24} />
          </button>
          <span className="font-black text-white italic tracking-tighter">FLOW<span className="text-amber-500">TRACK</span></span>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}