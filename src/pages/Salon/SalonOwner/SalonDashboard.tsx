import { LayoutDashboard, Database, TrendingUp, BarChart3, Settings } from "lucide-react";
import { Button } from "../../../components/ui_components/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "profile", label: "Profile", Page: "SalonProfile", icon: Settings },
    { id: "business", label: "Business", Page: "business", icon: LayoutDashboard },
    { id: "data", label: "Data", Page: "data", icon: Database },
    { id: "sales", label: "Sales", Page: "sales", icon: TrendingUp },
    { id: "performance", label: "Performance", Page: "performance", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Salon Pro</h1>
            <p className="text-xs text-sidebar-foreground/70">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.Page);
          return (
            <Button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.Page}`)}
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

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/60 text-center">© 2025 Salon Pro</p>
      </div>
    </aside>
  );
}
