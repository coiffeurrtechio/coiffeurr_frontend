import React from "react";
import { Outlet } from "react-router-dom";
import SalonDashboard from "../pages/Salon/SalonOwner/SalonDashboard"

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <SalonDashboard />
      <main className="flex-1 p-4 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout