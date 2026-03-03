import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  PlusCircle
} from "lucide-react";

export default function Layout({ children }) {

  const linkClass =
    "flex items-center gap-3 p-3 rounded-xl font-medium transition hover:bg-indigo-100";

  const activeClass = "bg-indigo-600 text-white";

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl p-6 space-y-4">

        <h2 className="text-2xl font-bold text-indigo-600 mb-6">
          HITL FlowTrack
        </h2>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <Boxes size={20} />
          Inventory
        </NavLink>

        <NavLink
          to="/add-item"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <PlusCircle size={20} />
          Add Item
        </NavLink>

      </div>

      {/* Page Content */}
      <div className="flex-1 p-8">
        {children}
      </div>

    </div>
  );
}