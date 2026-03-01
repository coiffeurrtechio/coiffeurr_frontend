import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, TrendingUp, BarChart3, Settings, Scissors, Users, Notebook } from "lucide-react";
import { Button } from "../../../components/ui_components/button";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SalonDashboard({ open, setOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "profile", label: "Profile", icon: Settings, path: "/dashboard/" },
    { id: "staff", label: "Staff", icon: Users, path: "/dashboard/staff" },
    { id: "services", label: "Services", icon: LayoutDashboard, path: "/dashboard/services" },
    { id: "booking", label: "Bookings", icon: Notebook, path: "/dashboard/booking" },
    // { id: "business", label: "Business", icon: LayoutDashboard, path: "/dashboard/business" },
    // { id: "data", label: "Data", icon: Database, path: "/dashboard/data" },
    // { id: "sales", label: "Sales", icon: TrendingUp, path: "/dashboard/sales" },
    // { id: "performance", label: "Performance", icon: BarChart3, path: "/dashboard/performance" },
  ];

  return (
    <aside
      className={`
    fixed top-0 left-0 h-screen w-64 z-[60]
    bg-[#2D3748] text-white
    transform transition-transform duration-300 ease-in-out
    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    border-r border-white/5 shadow-xl
  `}
    >
      <div className="h-full flex flex-col overflow-hidden bg-[#2D3748]">
        {/* LOGO - Fixed at top */}
        <div className="p-6 border-b border-white/10 flex cursor-pointer items-center gap-3 flex-shrink-0" onClick={() => { navigate("/") }}>
          {/* <Scissors className="text-white rotate-45 w-6 h-6" /> */}
          <img src="/dummy_logo.png" alt="salon" className="w-12 h-12 bg-white rounded-full p-2 object-cover" />

          <h1 className="font-bold text-lg">Coiffeurr</h1>
        </div>

        {/* NAV - Non-scrollable, all items visible */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) setOpen(false);
                }}
                className={`w-full justify-start gap-3 py-6 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:bg-white/5'
                  }`}
                variant="ghost"
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default SalonDashboard;