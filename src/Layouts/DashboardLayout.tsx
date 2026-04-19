import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // Import Outlet
import { Menu, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard";
import NotificationCenter from "../components/NotificationCenter";
import { useDispatch } from "react-redux";
import { logoutUser } from "../API/APIs";

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("authState");
    localStorage.removeItem("token");
    dispatch(logoutUser() as any);
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F7FE] overflow-hidden">
      {/* 1. STATIONARY SIDEBAR */}
      <SalonDashboard open={open} setOpen={setOpen} collapsed={sidebarCollapsed} />

      {/* 2. GHOST SPACER (Desktop only) */}
      <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`} />

      {/* 3. RIGHT SIDE CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-white flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-md">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h1 className="font-bold text-gray-800 hidden md:block text-xl tracking-tight">Dashboard</h1>
            {/* <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Live</span>
            </div> */}
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 hover:bg-red-50 rounded-md transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* 🔑 This is where your nested routes (Business, Sales, etc.) will render */}
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                {/* Your page content goes here */}
            <Outlet />
              </main>

            </div>
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

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <LogOut size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;