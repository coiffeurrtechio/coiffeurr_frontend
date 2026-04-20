import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, ChevronLeft, ChevronRight, LogOut, Power, AlertCircle } from "lucide-react";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard";
import NotificationCenter from "../components/NotificationCenter";
import { useDispatch } from "react-redux";
import { logoutUser } from "../API/APIs";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import Config from "../configs/config";
import { motion } from "framer-motion";

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);
  const [salonData, setSalonData] = useState<any>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { apiCustomerPut } = useApi();

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const authData = localStorage.getItem("authState");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
        if (!salonId) return;
        
        const response = await fetch(`${Config.API_Salon_owner}/salons/${salonId}`);
        if (response.ok) {
          const data = await response.json();
          setSalonData(data);
        }
      } catch (error) {
        console.error('Failed to fetch salon data:', error);
      }
    };
    fetchSalonData();
  }, []);

  const handleVisibilityToggle = () => {
    setShowVisibilityConfirm(true);
  };

  const confirmVisibilityToggle = async () => {
    if (!salonData || isTogglingVisibility) return;
    setIsTogglingVisibility(true);
    try {
      const salonId = salonData._id || salonData.id;
      const newBlockedStatus = !salonData.isBlocked;
      const res = await apiCustomerPut(`/salons/update/${salonId}`, { isBlocked: newBlockedStatus });
      if (res.data) {
        setSalonData(res.data);
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsTogglingVisibility(false);
      setShowVisibilityConfirm(false);
    }
  };

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
          </div>

          <div className="flex items-center gap-6">
            {salonData && (
              <button
                onClick={handleVisibilityToggle}
                disabled={isTogglingVisibility}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  salonData.isBlocked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={salonData.isBlocked ? 'Turn Salon Online' : 'Turn Salon Offline'}
              >
                <Power size={16} />
                <span className="hidden md:inline flex items-center gap-2">
                  {salonData.isBlocked ? 'Salon Offline' : 'Salon Online'}
                  {!salonData.isBlocked && (
                    <motion.div
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </span>
              </button>
            )}
            
            <div className="ml-4 flex items-center">
              <NotificationCenter />
            </div>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-md transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors" />
              <span className="hidden md:inline text-sm font-bold text-red-600" style={{ fontFamily: "'Playfair Display', serif" }}>Logout</span>
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

      {/* VISIBILITY CONFIRMATION MODAL */}
      {showVisibilityConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirm Status Change</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {salonData?.isBlocked ? 'turn salon online' : 'turn salon offline'}? This will {salonData?.isBlocked ? 'make your salon visible to customers' : 'hide your salon from customers'}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVisibilityConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVisibilityToggle}
                disabled={isTogglingVisibility}
                className="flex-1 px-4 py-3 bg-[#1E4D8C] text-white rounded-xl font-semibold hover:bg-[#163a6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTogglingVisibility ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;