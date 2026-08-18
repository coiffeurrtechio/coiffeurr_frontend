import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  Notebook,
  ChevronRight,
  BarChart3,
  UserCheck,
  Globe,
  LogOut,
  X,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui_components/button";
import SponserFooter from "../../../components/Sponser_Footer";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  onLogout?: () => void;
  isPoweringDown?: boolean;
  onLogoutClick?: () => void;
}

function SalonDashboard({ open, setOpen, collapsed, onLogout, isPoweringDown = false, onLogoutClick }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "analytics", label: t('navigation.analytics'), icon: BarChart3, path: "/dashboard/" },
    { id: "booking", label: t('navigation.bookings'), icon: Notebook, path: "/dashboard/booking" },
    { id: "playground", label: t('navigation.playground'), icon: Zap, path: "/dashboard/playground" },
    { id: "attendance", label: t('navigation.attendance'), icon: UserCheck, path: "/dashboard/attendance" },
    { id: "staff", label: t('navigation.staff'), icon: Users, path: "/dashboard/staff" },
    { id: "services", label: t('navigation.services'), icon: LayoutDashboard, path: "/dashboard/services" },
    { id: "profile", label: t('navigation.mySalon'), icon: Settings, path: "/dashboard/profile" },
    { id: "settings", label: t('navigation.settings'), icon: Globe, path: "/dashboard/settings" },
  ];

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen z-[60] pointer-events-auto
          bg-[#0A0A0A] text-white
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
          ${collapsed ? "xl:w-20" : "xl:w-64"}
          w-64
          border-r border-white/10 shadow-2xl
        `}
        style={{
          background: 'rgba(10, 10, 10, 0.95)'
        }}
      >
        <div className="h-full flex flex-col overflow-hidden bg-[#0A0A0A] relative">

          {/* MOBILE/TABLET CLOSE BUTTON - Changed from xl:hidden to absolute target sync */}
          <button
            onClick={() => setOpen(false)}
            className="xl:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-[70]"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* LOGO SECTION - Changed md sizes to xl sizes */}
          <div
            className={`p-6 border-b border-white/10 flex cursor-pointer items-center flex-shrink-0 group relative z-10 ${collapsed ? "justify-center" : "gap-4"}`}
            onClick={() => navigate("/dashboard")}
          >
            <div className={`bg-white rounded-xl p-1.5 transition-transform group-hover:scale-105 ${collapsed ? "w-10 h-10" : "w-16 h-16"}`}>
              <img src="/Coiffeurr_Logo.png" alt="salon" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <motion.h1 
                  className="font-black text-xl tracking-tight"
                  style={{
                    background: 'linear-gradient(90deg, #D4AF37 0%, #F5E6A3 25%, #D4AF37 50%, #C9A227 75%, #D4AF37 100%)',
                    backgroundSize: '200% auto',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    willChange: 'transform, background-position'
                  }}
                  animate={{
                    fontWeight: [500, 700, 500],
                    backgroundPosition: ['0% center', '100% center', '0% center']
                  }}
                  transition={{
                    fontWeight: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' }
                  }}
                  whileHover={{
                    backgroundPosition: ['0% center', '100% center', '0% center'],
                    letterSpacing: '1px'
                  }}
                  whileHoverTransition={{
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                >
                  Coiffeurr
                </motion.h1>
              </div>
            )}
          </div>

          {/* NAVIGATION SECTION */}
          <nav className="flex-1 p-4 space-y-2 mt-4 relative z-10 overflow-y-auto overflow-x-hidden min-h-0">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = item.path === "/dashboard/"
                ? location.pathname === "/dashboard/"
                : location.pathname.startsWith(item.path);

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1280) setOpen(false);
                  }}
                  className={`
                    w-full justify-center group py-3 rounded-xl transition-all duration-200 relative z-10 opacity-100
                    ${collapsed ? "px-2" : "justify-between px-4"}
                    ${isActive
                      ? 'bg-white/10 text-white shadow-lg hover:bg-white/15'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                  title={collapsed ? item.label : ""}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full shadow-lg shadow-yellow-500/50" />
                  )}
                  <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                    <Icon size={18} className={isActive ? "text-yellow-400" : "text-gray-500 group-hover:text-gray-300"} />
                    {!collapsed && <span className={`font-bold text-sm tracking-tight ${isActive ? "text-yellow-400" : ""}`}>{item.label}</span>}
                  </div>
                  {!collapsed && isActive && <ChevronRight size={14} className="text-yellow-400" />}
                </Button>
              );
            })}

            {/* VISUAL SEPARATOR */}
            <div className="mt-auto border-t border-white/10" />

            {/* Logout Button - Changed margin rules from md to xl layout matching */}
            <motion.button
              onClick={() => {
                if (onLogoutClick) {
                  onLogoutClick();
                }
              }}
              className={`
                w-full group py-3 relative flex items-center gap-3 px-4 mt-4 mb-4
                ${collapsed ? "px-2 justify-center" : ""}
                ${isPoweringDown ? 'grayscale opacity-50 pointer-events-none' : ''}
              `}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease'
              }}
              whileHover={{
                background: 'rgba(239, 68, 68, 0.08)',
                boxShadow: '0 0 25px rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              title={collapsed ? t('dashboard.exit') : ""}
            >
              <motion.div
                className={`flex items-center ${collapsed ? "" : "gap-3"}`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                {!collapsed && (
                  <span
                    className="font-semibold text-sm tracking-wide"
                    style={{
                      fontFamily: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace"
                    }}
                  >
                    {t('dashboard.exit')}
                  </span>
                )}
              </motion.div>
            </motion.button>

          </nav>

          <SponserFooter collapsed={collapsed} />

        </div>
      </aside>
    </>
  );
}

export default SalonDashboard;