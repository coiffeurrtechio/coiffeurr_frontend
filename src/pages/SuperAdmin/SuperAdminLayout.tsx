import React, { useState, type ReactNode } from "react";
import { Menu, Shield } from "lucide-react";
import Sidebar from "./SuperAdminDashboard";
import { useNavigate } from "react-router-dom";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} collapsed={false} />

      {/* GHOST SPACER */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* RIGHT SIDE CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.05] bg-[#FAF9F6]/80 backdrop-blur-[15px] flex-shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100/50 rounded-md transition-all">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Super Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("super_admin_access_token");
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                navigate("/super-admin/login");
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
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
