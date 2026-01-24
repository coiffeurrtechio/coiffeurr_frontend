import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard";

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* TOP BAR (Mobile Only) */}
      <header className="md:hidden h-14 flex items-center px-4 border-b bg-white sticky top-0 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-semibold">Dashboard</h1>
      </header>

      <div className="md:flex">
        {/* SIDEBAR */}
        <SalonDashboard open={open} setOpen={setOpen} />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* OVERLAY (Mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
