import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { Menu } from "lucide-react";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard";

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F4F7FE] overflow-hidden">
      {/* 1. STATIONARY SIDEBAR */}
      <SalonDashboard open={open} setOpen={setOpen} />

      {/* 2. GHOST SPACER (Desktop only) */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* 3. RIGHT SIDE CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-white flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-md">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800 hidden md:block text-xl tracking-tight">Dashboard</h1>
            {/* <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Live</span>
            </div> */}
          </div>

          <div className="flex items-center gap-4">
             {/* ... (Search, Zap, Bell, Profile elements) */}
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* 🔑 This is where your nested routes (Business, Sales, etc.) will render */}
            <Outlet /> 
          </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;