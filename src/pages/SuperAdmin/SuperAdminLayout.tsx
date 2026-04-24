import React, { useState, useEffect } from "react";
import { Menu, Shield } from "lucide-react";
import Sidebar from "./SuperAdminDashboard";
import { useNavigate, useLocation } from "react-router-dom";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("SuperAdminLayout: location changed to", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} collapsed={false} />

      {/* GHOST SPACER */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* RIGHT SIDE CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/10 bg-[#111827]/80 backdrop-blur-[15px] flex-shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-white/5 rounded-md transition-all">
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Super Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("super_admin_access_token");
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                navigate("/super-admin/login");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
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

export default SuperAdminLayout;
