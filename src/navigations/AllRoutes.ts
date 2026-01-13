import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Profile from "../pages/Profile";
import SalonRegistrationForm from "../pages/Salon/SalonRegistrationForm";
import SalonsPage from "../pages/Salon/SalonsPage";
import SingleSalonPage from "../pages/Salon/SingleSalonPage";
import SignUpPage from "../pages/SignUpPage";
import MainLayout from "../Layouts/MainLayout";
import DashboardLayout from "../Layouts/DashboardLayout";
import type { ComponentType } from "react";
import DashBoardProfile from "../pages/Salon/SalonOwner/DashBoardPages.tsx/DashBoardProfile";
import SalonService from "../pages/Salon/SalonService";
import DashBoardBusiness from "../pages/Salon/SalonOwner/DashBoardPages.tsx/DashBoardBusiness";
import WorkInProgress from "../components/WorkInProgress";
import BookingPage from "../pages/BookingPage";

export interface AppRoute {
  key: number;
  path: string;
  Element: ComponentType<any>;
  layout?: ComponentType<any>;
  props?: Record<string, any>;
  isProtected: boolean;
  allowedRoles?: string[];
  children?: AppRoute[];
}

const routes: AppRoute[] = [
  // ✅ Public (with header/footer)
  {
    key: 1,
    path: "/",
    Element: MainLayout,
    isProtected: false,
    children: [
      { key: 11, path: "/", Element: HomePage, isProtected: false },
      { key: 12, path: "/profile", Element: Profile, isProtected: false },
      { key: 14, path: "/salons", Element: SalonsPage, isProtected: false },
      { key: 14, path: "/Bookings", Element: BookingPage, isProtected: false },
      { key: 15, path: "/salons/:id", Element: SingleSalonPage, isProtected: true },
      { key: 16, path: "/salonRegistration", Element: SalonRegistrationForm, isProtected: true },
      { key: 17, path: "/salon/:id/service/:serviceID", Element: SalonService, isProtected: true },
    ],
  },
  {
    key: 2,
    path: "/login",
    Element: LoginPage,
    isProtected: false,
  },
  {
    key: 3,
    path: "/signup",
    Element: SignUpPage,
    isProtected: false,
  },

  // ✅ Dashboard (without header/footer)
  {
    key: 4,
    path: "/dashboard",
    Element: DashboardLayout,
    isProtected: true,
    allowedRoles: ["salon_owner", "admin"],
    children: [
      { key: 21, path: "", Element: DashBoardBusiness, isProtected: true },
      { key: 22, path: "business", Element: DashBoardBusiness, isProtected: true },
      { key: 22, path: "SalonProfile", Element: DashBoardProfile, isProtected: true },
      { key: 23, path: "sales", Element: WorkInProgress, isProtected: true },
      { key: 24, path: "performance", Element: WorkInProgress, isProtected: true },
      { key: 25, path: "data", Element: WorkInProgress, isProtected: true },
    ],
  },
];

export default routes;
