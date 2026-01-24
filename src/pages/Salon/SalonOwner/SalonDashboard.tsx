import {
  LayoutDashboard,
  Database,
  TrendingUp,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui_components/button";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "profile", label: "Profile", icon: Settings, path: "/dashboard/SalonProfile" },
    { id: "business", label: "Business", icon: LayoutDashboard, path: "/dashboard/business" },
    { id: "data", label: "Data", icon: Database, path: "/dashboard/data" },
    { id: "sales", label: "Sales", icon: TrendingUp, path: "/dashboard/sales" },
    { id: "performance", label: "Performance", icon: BarChart3, path: "/dashboard/performance" },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setOpen(false); // close sidebar on mobile
  };

  return (
    <aside
      className={`
        fixed md:relative top-0 left-0 h-screen w-64
        bg-sidebar text-sidebar-foreground
        border-r border-sidebar-border
        z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* MOBILE CLOSE */}
      <div className="md:hidden flex justify-end p-4">
        <button onClick={() => setOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* LOGO */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <Link to="/">
              <h1 className="font-bold text-lg">Coiffeurr</h1>
            </Link>
            <p className="text-xs text-sidebar-foreground/70">Dashboard</p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/60 text-center">
          © 2025 Salon Pro
        </p>
      </div>
    </aside>
  );
}
