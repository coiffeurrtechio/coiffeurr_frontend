import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  Notebook,
  ChevronRight,
  BarChart3,
  UserCheck,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui_components/button";
import SponserFooter from "../../../components/Sponser_Footer";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
}

function SalonDashboard({ open, setOpen, collapsed }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "analytics", label: t('navigation.analytics'), icon: BarChart3, path: "/dashboard/" },
    { id: "booking", label: t('navigation.bookings'), icon: Notebook, path: "/dashboard/booking" },
    { id: "attendance", label: t('navigation.attendance'), icon: UserCheck, path: "/dashboard/attendance" },
    { id: "staff", label: t('navigation.staff'), icon: Users, path: "/dashboard/staff" },
    { id: "services", label: t('navigation.services'), icon: LayoutDashboard, path: "/dashboard/services" },
    { id: "profile", label: "Command Center", icon: Settings, path: "/dashboard/profile" },
    { id: "settings", label: t('navigation.settings'), icon: Globe, path: "/dashboard/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay - Closes sidebar when clicking outside on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-[60]
          bg-[#0A0A0A] text-white
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-20" : "md:w-64"}
          w-64
          border-r border-white/10 shadow-2xl backdrop-blur-[20px]
        `}
      >
        <div className="h-full flex flex-col overflow-hidden bg-[#0A0A0A]">

          {/* LOGO SECTION */}
          <div
            className={`p-6 border-b border-white/10 flex cursor-pointer items-center flex-shrink-0 group ${collapsed ? "justify-center" : "gap-4"}`}
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
                <p className="text-xs text-gray-400">Salon Management</p>
              </div>
            )}
          </div>

          {/* NAVIGATION SECTION */}
          <nav className="flex-1 p-4 space-y-2 mt-4">
            {!collapsed && <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">{t('navigation.mainMenu')}</p>}
            {menuItems.map((item) => {
              const Icon = item.icon;

              // Improved Active Logic: Matches the base path even if on a sub-route
              const isActive = item.path === "/dashboard/"
                ? location.pathname === "/dashboard/"
                : location.pathname.startsWith(item.path);

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) setOpen(false);
                  }}
                  className={`
                    w-full justify-center group py-6 rounded-xl transition-all duration-200 relative
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

          </nav>

          <SponserFooter collapsed={collapsed} />
        </div>
      </aside>

    </>
  );
}

export default SalonDashboard;