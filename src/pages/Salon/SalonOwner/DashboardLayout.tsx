import React, { useState, type ReactNode } from "react";
import { Menu, Bell, Search, User, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sidebar from "./SalonDashboard";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full bg-[#F4F7FE] overflow-hidden">
      {/* 1. THE SIDEBAR (Fixed position) */}
      <Sidebar open={open} setOpen={setOpen} collapsed={false} />

      {/* 2. THE GHOST SPACER 
          This physically occupies the space on desktop so the content 
          starts AFTER the fixed sidebar. 
      */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* 3. THE RIGHT SIDE CONTENT WRAPPER 
          Crucial: Everything (Header + Main) must be inside this div 
          for the spacer to push it correctly.
      */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b glass-card flex-shrink-0 z-30 elevation-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-md elevation-1 hover:elevation-2 transition-all">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100 elevation-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{t('common.live')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center gap-4 text-gray-400 border-r pr-6">
              <Search size={18} className="cursor-pointer hover:text-gray-600 transition-colors" />
              <Zap size={18} className="cursor-pointer hover:text-gray-600 transition-colors" />
              <div className="relative cursor-pointer hover:text-gray-600 transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{t('common.admin')}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{t('common.manager')}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 elevation-1 hover:elevation-2 transition-all cursor-pointer">
                <User size={18} className="text-orange-600" />
              </div>
            </div>
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
          className="fixed inset-0 glass-overlay z-[55] md:hidden animate-md3-fade-in"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;