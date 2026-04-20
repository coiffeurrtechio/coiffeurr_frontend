import React, { useState, type ReactNode } from "react";
import { Menu, Bell, Search, User, Zap, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sidebar from "./SalonDashboard";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden">
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
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.05] bg-[#FAF9F6]/80 backdrop-blur-[15px] flex-shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100/50 rounded-md transition-all">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            {/* Premium Salon Online Toggle */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-50" />
              </div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>{t('common.live')}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-gray-400 border-r border-gray-200/50 pr-6">
              <Search size={18} className="cursor-pointer hover:text-gray-600 transition-all hover:scale-105" />
              <Zap size={18} className="cursor-pointer hover:text-gray-600 transition-all hover:scale-105" />
              <div className="relative cursor-pointer hover:text-gray-600 transition-all hover:scale-105">
                <Bell size={18} strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-white shadow-sm"></span>
              </div>
            </div>

            {/* Ghost Button Logout Style */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1a1a1a] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{t('common.admin')}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase mt-1 tracking-wide">{t('common.manager')}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-transparent hover:border-gray-200 hover:bg-white/60 transition-all duration-300 cursor-pointer hover:scale-105 group">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 transition-all group-hover:bg-white">
                  <User size={16} className="text-gray-600" strokeWidth={1.5} />
                </div>
                <span className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <LogOut size={14} strokeWidth={1.5} />
                  Logout
                </span>
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