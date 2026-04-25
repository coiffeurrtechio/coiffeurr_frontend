import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard";
import NotificationCenter from "../components/NotificationCenter";
import WelcomeLoader from "../components/WelcomeLoader/WelcomeLoader";
import { useDispatch } from "react-redux";
import { logoutUser } from "../API/APIs";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import Config from "../configs/config";
import { useTranslation } from 'react-i18next';

const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);
  const [salonData, setSalonData] = useState<any>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [showWelcomeLoader, setShowWelcomeLoader] = useState(false);
  const [isPoweringDown, setIsPoweringDown] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { apiCustomerPut } = useApi();
  const location = useLocation();

  useEffect(() => {
    // Check if user is coming from login page
    const fromLogin = sessionStorage.getItem('fromLogin');
    console.log('DashboardLayout fromLogin check:', fromLogin);
    if (fromLogin === 'true') {
      setShowWelcomeLoader(true);
      // Remove flag after a delay to allow other effects to use it
      setTimeout(() => {
        sessionStorage.removeItem('fromLogin');
        console.log('fromLogin flag removed');
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const authData = localStorage.getItem("authState");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
        if (!salonId || salonId === 'undefined') {
          // OWNER without salon - don't redirect, just return gracefully
          console.log('OWNER without salonId, skipping salon data fetch');
          return;
        }
        
        const response = await fetch(`${Config.API_Salon_owner}/salons/${salonId}`);
        if (response.ok) {
          const data = await response.json();
          setSalonData(data);
        }
      } catch (error) {
        console.error('Failed to fetch salon data:', error);
      }
    };
    // Only fetch if not coming from login (to avoid race condition)
    const fromLogin = sessionStorage.getItem('fromLogin');
    console.log('DashboardLayout fetchSalonData, fromLogin:', fromLogin);
    if (!fromLogin) {
      fetchSalonData();
    }
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
    setIsPoweringDown(true);
    setTimeout(() => {
      localStorage.removeItem("authState");
      localStorage.removeItem("token");
      dispatch(logoutUser() as any);
      navigate("/login");
    }, 800);
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeLoader(false);
  };

  return (
    <>
      {/* Welcome Loader - Shows after login before Analytics page */}
      {showWelcomeLoader && <WelcomeLoader onComplete={handleWelcomeComplete} />}

      <div className="flex h-screen w-full bg-[#F4F7FE] overflow-hidden">
        {/* 1. STATIONARY SIDEBAR */}
        <SalonDashboard open={open} setOpen={setOpen} collapsed={sidebarCollapsed} />

      {/* 2. GHOST SPACER (Desktop only) */}
      <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`} />

      {/* 3. RIGHT SIDE CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* TOP HEADER */}
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/[0.05] bg-[#FAF9F6]/80 backdrop-blur-[15px] flex-shrink-0 z-30 transition-all duration-800 ${isPoweringDown ? 'grayscale opacity-50' : ''}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100/50 rounded-md transition-all">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 hover:bg-gray-100/50 rounded-md transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              )}
            </button>

            {/* TACTILE STATUS CAPSULE - Salon Online Toggle */}
            {salonData && (
              <div className="flex flex-col gap-1">
                <motion.button
                  onClick={handleVisibilityToggle}
                  disabled={isTogglingVisibility}
                  className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                    salonData.isBlocked 
                      ? 'bg-gray-200/80' 
                      : 'bg-emerald-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={!salonData.isBlocked ? 'Click to turn OFF salon listing (hide from customers)' : 'Click to turn ON salon listing (show to customers)'}
                  style={{
                    boxShadow: !salonData.isBlocked 
                      ? '0 0 20px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {/* Toggle Knob */}
                  <motion.div
                    className={`absolute top-1 w-6 h-6 rounded-full shadow-lg ${
                      salonData.isBlocked ? 'left-1 bg-white' : 'left-9 bg-white'
                    }`}
                    animate={{
                      left: salonData.isBlocked ? 4 : 36
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Icon inside knob */}
                    {!salonData.isBlocked ? (
                      <motion.div
                        className="w-full h-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <svg 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-full h-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <svg 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#9CA3AF" 
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Glow effect when active */}
                  {!salonData.isBlocked && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-400/30"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>
                <p 
                  className={`text-[9px] font-medium text-center transition-colors ${
                    !salonData.isBlocked ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                  style={{ maxWidth: '180px' }}
                >
                  {!salonData.isBlocked ? t('common.systemLive') : t('common.offline')}
                </p>
              </div>
            )}
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
              {/* Custom Gold Bell with Notification - Using existing NotificationCenter */}
              <div className="relative">
                <NotificationCenter />
              </div>

              {/* Hairline Divider */}
              <div className="w-px h-6 mx-4" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />

              {/* Secure Exit - Ghost Button with Power Symbol */}
              <motion.button
                onClick={() => setShowLogoutConfirm(true)}
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
                title="Logout"
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
                  {t('common.exit')}
                </span>
              </motion.button>
            </div>
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
                onClick={handleLogout}
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

      {/* VISIBILITY CONFIRMATION MODAL - Tech-Luxury Design */}
      {showVisibilityConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
          >
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className={`p-4 rounded-full ${
                salonData?.isBlocked 
                  ? 'bg-emerald-100' 
                  : 'bg-orange-100'
              }`} style={{ boxShadow: "0 0 20px rgba(212, 175, 55, 0.2)" }}>
                {/* Power/Status Icon */}
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: salonData?.isBlocked ? '#10B981' : '#F59E0B' }}
                >
                  <path d="M12 2V12" />
                  <path d="M18.4 6.6C19.2 7.4 19.8 8.4 20.2 9.5C20.6 10.6 20.8 11.8 20.8 13C20.8 14.2 20.6 15.4 20.2 16.5C19.8 17.6 19.2 18.6 18.4 19.4C17.6 20.2 16.6 20.8 15.5 21.2C14.4 21.6 13.2 21.8 12 21.8C10.8 21.8 9.6 21.6 8.5 21.2C7.4 20.8 6.4 20.2 5.6 19.4C4.8 18.6 4.2 17.6 3.8 16.5C3.4 15.4 3.2 14.2 3.2 13C3.2 11.8 3.4 10.6 3.8 9.5C4.2 8.4 4.8 7.4 5.6 6.6" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {salonData?.isBlocked ? t('common.activateSalonListing') : t('common.deactivateSalonListing')}
              </h3>
            </div>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              {salonData?.isBlocked 
                ? t('common.activateConfirm')
                : t('common.deactivateConfirm')}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmVisibilityToggle}
                disabled={isTogglingVisibility}
                className={`w-full px-6 py-4 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-1.02 active:scale-0.98 disabled:opacity-50 disabled:cursor-not-allowed ${
                  salonData?.isBlocked 
                    ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                    : 'bg-orange-600 hover:bg-orange-700 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]'
                }`}
              >
                {isTogglingVisibility ? t('common.processing') : (salonData?.isBlocked ? t('common.activateListing') : t('common.deactivateListing'))}
              </button>
              <button
                onClick={() => setShowVisibilityConfirm(false)}
                className="w-full px-6 py-3 text-gray-500 font-semibold text-sm hover:text-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
    </>
  );
};

export default DashboardLayout;