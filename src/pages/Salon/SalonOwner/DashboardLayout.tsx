import React, { useState, type ReactNode } from "react";
import { Menu, Search, User, Zap } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [isSalonOnline, setIsSalonOnline] = useState(true);
  const [isPoweringDown, setIsPoweringDown] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
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
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.05] bg-[#FAF9F6]/80 backdrop-blur-[15px] flex-shrink-0 z-30 sticky top-0 transition-all duration-800 ${isPoweringDown ? 'grayscale opacity-50' : ''}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100/50 rounded-md transition-all">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* TACTILE STATUS CAPSULE - Salon Online Toggle */}
            <motion.button
              onClick={() => setIsSalonOnline(!isSalonOnline)}
              className={`relative px-4 py-2 rounded-full transition-all duration-500 ${
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

          {/* GLASS CONTAINER - Header Action Bar */}
          <div className="flex items-center gap-0">
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

              {/* Hairline Divider */}
              <div className="w-px h-6 mx-2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />

              {/* Custom Gold Bell with Notification */}
              <motion.button
                className="relative p-2 rounded-xl transition-all"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, -5, 5, 0],
                  transition: { duration: 0.4 }
                }}
                style={{ color: '#D4AF37' }}
              >
                {/* Custom Minimalist Bell SVG in Polished Gold */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C10.3431 2 9 3.34315 9 5V6C6.23858 6 4 8.23858 4 11V15L2 17V18H22V17L20 15V11C20 8.23858 17.7614 6 15 6V5C15 3.34315 13.6569 2 12 2Z" />
                  <path d="M10 21C10 21.5523 10.4477 22 11 22H13C13.5523 22 14 21.5523 14 21" />
                </svg>
                
                {/* Glowing Amber Dot */}
                <AnimatePresence>
                  {hasNotification && (
                    <motion.span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                      style={{ 
                        background: 'radial-gradient(circle, #FFB347, #FF8C00)',
                        boxShadow: '0 0 8px rgba(255, 179, 71, 0.8), 0 0 16px rgba(255, 140, 0, 0.4)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1]
                      }}
                      exit={{ scale: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Hairline Divider */}
              <div className="w-px h-6 mx-2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />

              {/* User Profile Section */}
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold" style={{ color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>{t('common.admin')}</p>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: '#999' }}>{t('common.manager')}</p>
                </div>
                
                {/* Secure Exit - Ghost Button with Power Symbol */}
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300"
                  style={{
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{
                    borderColor: 'rgba(220, 38, 38, 0.6)',
                    background: 'rgba(220, 38, 38, 0.1)',
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Custom Power Symbol SVG */}
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: '#DC2626' }}
                  >
                    <path d="M12 2V12" />
                    <path d="M18.4 6.6C19.2 7.4 19.8 8.4 20.2 9.5C20.6 10.6 20.8 11.8 20.8 13C20.8 14.2 20.6 15.4 20.2 16.5C19.8 17.6 19.2 18.6 18.4 19.4C17.6 20.2 16.6 20.8 15.5 21.2C14.4 21.6 13.2 21.8 12 21.8C10.8 21.8 9.6 21.6 8.5 21.2C7.4 20.8 6.4 20.2 5.6 19.4C4.8 18.6 4.2 17.6 3.8 16.5C3.4 15.4 3.2 14.2 3.2 13C3.2 11.8 3.4 10.6 3.8 9.5C4.2 8.4 4.8 7.4 5.6 6.6" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block" style={{ color: '#DC2626' }}>
                    {t('dashboard.exit')}
                  </span>
                </motion.button>
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