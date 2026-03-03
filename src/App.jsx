import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";

// Sahi Paths (Aapke project structure ke mutabiq)
import Login from "./modules/Auth/Login";
import MainDashboard from "./modules/Dashboard/MainDashboard";
import StaffManager from "./modules/Staff/StaffManager";
import GeoAttendance from "./modules/Attendance/GeoAttendance";
import ProductManager from "./modules/Inventory/ProductManager";
import AddItem from "./modules/Inventory/AddItem"; 
import OrderBooking from "./modules/Sales/OrderBooking";
import DayClose from "./modules/Operations/DayClose";

import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white text-3xl font-black italic tracking-tighter">
        FLOW<span className="text-amber-500">TRACK</span>...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <GeoAttendance />
            </ProtectedRoute>
          }
        />

        {/* Path updated to /order-booking to match our new logic */}
        <Route
          path="/order-booking"
          element={
            <ProtectedRoute>
              <OrderBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
              <ProductManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-item"
          element={
            <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
              <AddItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
              <StaffManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/day-close"
          element={
            <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
              <DayClose />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}