import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Boxes, PlusCircle, MapPin, Users, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const linkClass = "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group";
  const activeClass = "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20";

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 lg:static`}>
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-amber-500 italic">ELITE POS</h1>
        <button onClick={toggleSidebar} className="lg:hidden text-white"><X size={24} /></button>
      </div>

      <nav className="px-4 space-y-2">
        <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-zinc-400 hover:bg-white/5'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        <NavLink to="/sales" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-zinc-400 hover:bg-white/5'}`}>
          <ShoppingCart size={20} /> Sales
        </NavLink>

        <NavLink to="/inventory" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-zinc-400 hover:bg-white/5'}`}>
          <Boxes size={20} /> Inventory
        </NavLink>

        <NavLink to="/add-item" className={({ isActive }) => `${linkClass} ${isActive ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-white/5'}`}>
          <PlusCircle size={20} /> Add New Item
        </NavLink>

        <NavLink to="/attendance" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-zinc-400 hover:bg-white/5'}`}>
          <MapPin size={20} /> Attendance
        </NavLink>

        <NavLink to="/staff" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-zinc-400 hover:bg-white/5'}`}>
          <Users size={20} /> Staff
        </NavLink>
      </nav>
    </div>
  );
}