import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SalonDashboard";

const DashboardLayout: React.FC = ({children}) => {

  // const [currentPage, setCurrentPage] = useState("business")

  // const renderPage = () => {
  //   switch (currentPage) {
  //     case "profile":
  //       return <ProfilePage />
  //     case "business":
  //       return <BusinessPage />
  //     case "data":
  //       return <DataPage />
  //     case "sales":
  //       return <SalesPage />
  //     case "performance":
  //       return <PerformancePage />
  //     default:
  //       return <BusinessPage />
  //   }
  // }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* <Outlet /> */}
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;
