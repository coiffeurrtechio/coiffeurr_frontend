import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  Notebook,
  ChevronRight,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui_components/button";
import SponserFooter from "../../components/Sponser_Footer";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
}

function SuperAdminDashboard({ open, setOpen, collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard, path: "/super-admin/dashboard/analytics" },
    { id: "salons", label: "Salons", icon: Building2, path: "/super-admin/dashboard" },
    { id: "bookings", label: "Bookings", icon: Notebook, path: "/super-admin/dashboard/bookings" },
    { id: "users", label: "Users", icon: Users, path: "/super-admin/dashboard/users" },
    { id: "settings", label: "Settings", icon: Settings, path: "/super-admin/dashboard/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-[60]
          bg-[#111827] text-white
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-20" : "md:w-64"}
          w-64
          border-r border-white/10 shadow-2xl backdrop-blur-[20px]
        `}
      >
        <div className="h-full flex flex-col overflow-hidden bg-[#111827]">

          {/* LOGO SECTION */}
          <div
            className={`p-6 border-b border-white/10 flex cursor-pointer items-center flex-shrink-0 group ${collapsed ? "justify-center" : "gap-4"}`}
            onClick={() => navigate("/super-admin/dashboard")}
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
                <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            )}
          </div>

          {/* NAVIGATION SECTION */}
          <nav className="flex-1 p-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = item.path === "/super-admin/dashboard"
                ? location.pathname === "/super-admin/dashboard"
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

export default SuperAdminDashboard;
