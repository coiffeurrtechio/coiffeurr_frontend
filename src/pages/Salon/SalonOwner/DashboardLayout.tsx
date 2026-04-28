import React, { useState, type ReactNode } from "react";
import { Menu, Search, User, Zap, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./SalonDashboard";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../API/APIs";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(window.innerWidth > 1024);
  const [collapsed, setCollapsed] = useState(false);
  const [isSalonOnline, setIsSalonOnline] = useState(true);
  const [isPoweringDown, setIsPoweringDown] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsPoweringDown(true);
    setTimeout(() => {
      dispatch(logoutUser());
      navigate("/login");
    }, 800);
  };

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] md:bg-[#FAF9F6] overflow-hidden">
      {/* 1. THE SIDEBAR (Fixed position) */}
      <Sidebar open={open} setOpen={setOpen} collapsed={collapsed} onLogout={handleLogout} isPoweringDown={isPoweringDown} onLogoutClick={() => {
        console.log('onLogoutClick called, setting showLogoutConfirm to true');
        setShowLogoutConfirm(true);
      }} />

      {/* 2. THE GHOST SPACER
          This physically occupies the space on desktop so the content
          starts AFTER the fixed sidebar.
      */}
      <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />

      {/* 3. THE RIGHT SIDE CONTENT WRAPPER 
          Crucial: Everything (Header + Main) must be inside this div 
          for the spacer to push it correctly.
      */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.05] bg-[#FAF9F6]/80 backdrop-blur-md flex-shrink-0 z-40 sticky top-0 transition-all duration-800 ${isPoweringDown ? 'grayscale opacity-50' : ''}`}>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center p-3 rounded-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
              }}
              whileHover={{
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </motion.button>

            {/* SIDEBAR COLLAPSE TOGGLE - Desktop Only */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center justify-center p-3 rounded-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
              }}
              whileHover={{
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                )}
              </motion.div>
            </motion.button>

            {/* TACTILE STATUS CAPSULE - Salon Online Toggle - Desktop Only */}
            <motion.button
              onClick={() => setIsSalonOnline(!isSalonOnline)}
              className={`hidden md:flex relative px-4 py-2 rounded-full transition-all duration-500 ${
                isSalonOnline
                  ? 'bg-emerald-950/10 border-2 border-emerald-500/60'
                  : 'bg-charcoal/80 border border-silver/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSalonOnline && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <div className="flex items-center gap-2 relative z-10">
                {isSalonOnline ? (
                  <motion.div
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                )}
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    isSalonOnline ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace" }}
                >
                  {isSalonOnline ? t('dashboard.systemLive') : t('dashboard.offline')}
                </span>
              </div>
            </motion.button>
          </div>

          {/* RIGHT - Notification, Profile & System Online on Mobile */}
          <div className="flex items-center gap-1 md:gap-3 min-w-0">
            {/* System Online - Mobile Only */}
            <motion.button
              onClick={() => setIsSalonOnline(!isSalonOnline)}
              className={`md:hidden relative px-1.5 py-0.5 rounded-full transition-all duration-500 flex-shrink-0 ${
                isSalonOnline
                  ? 'bg-emerald-950/10 border-2 border-emerald-500/60'
                  : 'bg-charcoal/80 border border-silver/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSalonOnline && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <div className="flex items-center gap-1 relative z-10">
                {isSalonOnline ? (
                  <motion.div
                    className="w-0.5 h-0.5 bg-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ) : (
                  <div className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                )}
                <span
                  className={`text-[7px] font-black uppercase tracking-[0.1em] ${
                    isSalonOnline ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace" }}
                >
                  {isSalonOnline ? 'LIVE' : 'OFF'}
                </span>
              </div>
            </motion.button>

            {/* Notification Bell - Mobile Only */}
            <motion.button
              className="md:hidden flex items-center justify-center p-2 rounded-xl transition-all flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)'
              }}
              whileHover={{
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-3.5 h-3.5 text-gray-600" />
            </motion.button>

            {/* User Profile Thumbnail - Mobile Only */}
            <motion.button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full transition-all flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 100%)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-3.5 h-3.5 text-white" />
            </motion.button>

            <div className="hidden lg:flex items-center gap-0 px-4 py-2 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Search Icon */}
              <motion.button
                className="p-2 rounded-xl transition-all"
                whileHover={{ scale: 1.1, color: '#D4AF37' }}
                style={{ color: '#999' }}
              >
                <Search size={18} strokeWidth={1.5} />
              </motion.button>

              {/* Hairline Divider */}
              <div className="w-px h-6 mx-2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />

              {/* Zap Icon */}
              <motion.button
                className="p-2 rounded-xl transition-all"
                whileHover={{ scale: 1.1, color: '#D4AF37' }}
                style={{ color: '#999' }}
              >
                <Zap size={18} strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto pt-20 p-4 md:pt-8 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(20px)' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
              style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            >
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full" style={{ boxShadow: "0 0 20px rgba(212, 175, 55, 0.2)" }}>
                  {/* Custom Power Symbol SVG */}
                  <svg 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: '#D4AF37' }}
                  >
                    <path d="M12 2V12" />
                    <path d="M18.4 6.6C19.2 7.4 19.8 8.4 20.2 9.5C20.6 10.6 20.8 11.8 20.8 13C20.8 14.2 20.6 15.4 20.2 16.5C19.8 17.6 19.2 18.6 18.4 19.4C17.6 20.2 16.6 20.8 15.5 21.2C14.4 21.6 13.2 21.8 12 21.8C10.8 21.8 9.6 21.6 8.5 21.2C7.4 20.8 6.4 20.2 5.6 19.4C4.8 18.6 4.2 17.6 3.8 16.5C3.4 15.4 3.2 14.2 3.2 13C3.2 11.8 3.4 10.6 3.8 9.5C4.2 8.4 4.8 7.4 5.6 6.6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('common.systemShutdown')}
                </h3>
              </div>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                {t('common.endSessionConfirm')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="w-full px-6 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-1.02 hover:shadow-[0_0_30px_rgba(26,26,26,0.4)] active:scale-0.98"
                >
                  {t('common.powerDown')}
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full px-6 py-3 text-gray-500 font-semibold text-sm hover:text-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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