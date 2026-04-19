import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import Footer from "../components/Footer";

const MainLayout: React.FC = () => {
  return (
    /* flex flex-col: Stack children vertically
       min-h-screen:  Make the container at least the height of the device screen
    */
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      
      {/* flex-grow: This tells the main content to take up all available space,
         pushing the footer to the very bottom.
      */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;