import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import SalonManagement from "./SalonManagement";
import BookingManagement from "./BookingManagement";
import UserManagement from "./UserManagement";
import Analytics from "./Analytics";
import Settings from "./Settings";

const SuperAdminHome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("super_admin_access_token");
    if (!token) {
      navigate("/super-admin/login");
    }
  }, [navigate]);

  const renderContent = () => {
    const path = location.pathname;
    
    if (path === "/super-admin/dashboard/analytics") {
      return <Analytics />;
    } else if (path === "/super-admin/dashboard" || path === "/super-admin/dashboard/") {
      return <SalonManagement />;
    } else if (path.includes("/super-admin/dashboard/bookings")) {
      return <BookingManagement />;
    } else if (path.includes("/super-admin/dashboard/users")) {
      return <UserManagement />;
    } else if (path.includes("/super-admin/dashboard/settings")) {
      return <Settings />;
    }
    
    return <SalonManagement />;
  };

  return (
    <SuperAdminLayout>
      {renderContent()}
    </SuperAdminLayout>
  );
};

export default SuperAdminHome;
