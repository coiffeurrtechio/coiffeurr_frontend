import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  Notebook,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "../../../components/ui_components/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../API/APIs";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SalonDashboard({ open, setOpen }: SidebarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "profile", label: "Profile", icon: Settings, path: "/dashboard/" },
    { id: "staff", label: "Staff", icon: Users, path: "/dashboard/staff" },
    { id: "services", label: "Services", icon: LayoutDashboard, path: "/dashboard/services" },
    { id: "booking", label: "Bookings", icon: Notebook, path: "/dashboard/booking" },
  ];

  const handleLogout = () => {
    // Senior Note: Always clear auth state and storage on logout
    localStorage.removeItem("authState");
    localStorage.removeItem("token");
    dispatch(logoutUser());
    navigate("/login");
  };

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
          fixed top-0 left-0 h-screen w-64 z-[60]
          bg-[#1A202C] text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          border-r border-white/5 shadow-2xl
        `}
      >
        <div className="h-full flex flex-col overflow-hidden bg-[#1A202C]">

          {/* LOGO SECTION */}
          <div
            className="p-6 border-b border-white/10 flex cursor-pointer items-center gap-4 flex-shrink-0 group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-white rounded-xl p-1.5 transition-transform group-hover:scale-105">
              <img src="/dummy_logo.png" alt="salon" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-xl tracking-tight">Coiffeurr</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>

          {/* NAVIGATION SECTION */}
          <nav className="flex-1 p-4 space-y-2 mt-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
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
                    w-full justify-between group py-6 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-gray-500" />}
                </Button>
              );
            })}
          </nav>

          {/* FOOTER / LOGOUT SECTION */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 py-6 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-bold text-sm tracking-tight">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SalonDashboard;