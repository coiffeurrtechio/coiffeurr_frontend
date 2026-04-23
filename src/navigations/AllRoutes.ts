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
import Home from "../pages/LoginPage";
// import SalonOwnerHomePage from "../pages/Salon/SalonOwner/SalonOwnerHomePage/SalonOwnerHomePage";
import StaffManagement from "../pages/Salon/SalonOwner/SalonStaffPage.tsx/StaffManagement";
import BookingsPage from "../pages/Salon/SalonOwner/BookingsPage/BookingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import SalonRegistration from "../pages/Salon/SalonRegistration";
import SearchPage from "../pages/SearchPage";
import ServiceManagement from "../pages/Salon/SalonOwner/SalonServicePage/ServiceManagement";
import DashboardProfile from "../pages/Salon/SalonOwner/SalonOwnerHomePage/DashboardProfile";
import UserWishlist from "../pages/UserWishlist";
import StaffDetailPage from "../pages/Salon/StaffDetailPage";
import AnalyticsPage from "../pages/Salon/SalonOwner/DashBoardPages.tsx/AnalyticsPage";
import AttendancePage from "../pages/Salon/SalonOwner/DashBoardPages.tsx/AttendancePage";
import SettingsPage from "../pages/Salon/SalonOwner/DashBoardPages.tsx/SettingsPage";
import ForgotPassword from "../pages/ForgotPassword";
import UniversalVerification from "../pages/UniversalVerification";
import SalonReviewsPage from "../pages/Salon/SalonReviewsPage";
import SuperAdminLogin from "../pages/SuperAdmin/SuperAdminLogin";
import SuperAdminHome from "../pages/SuperAdmin/SuperAdminHome";
import SuperAdminLayout from "../pages/SuperAdmin/SuperAdminLayout";
import SalonManagement from "../pages/SuperAdmin/SalonManagement";
import BookingManagement from "../pages/SuperAdmin/BookingManagement";
import UserManagement from "../pages/SuperAdmin/UserManagement";


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
      { key: 15, path: "/salons/:salonId", Element: SingleSalonPage, isProtected: true },
      // { key: 16, path: "/salonRegistration", Element: SalonRegistrationForm, isProtected: true },
      { key: 17, path: "/salon/:salonId/service/:serviceId", Element: SalonService, isProtected: true },
      // { key: 18, path: "/salonowner", Element: SalonOwnerHomePage, isProtected: true },
      { key: 19, path: "/search", Element: SearchPage, isProtected: true },
      { key: 20, path: "/wishlist", Element: UserWishlist, isProtected: true },
      { key: 21, path: "/salon/:salonId/staff/:staffId", Element: StaffDetailPage, isProtected: true },
      { key: 22, path: "/verify", Element: UniversalVerification, isProtected: true },
      { key: 23, path: "/salon/:salonId/reviews", Element: SalonReviewsPage, isProtected: false },

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
  {
    key: 4,
    path: "/salonregister",
    Element: SalonRegistration,
    isProtected: false,
  },
  {
    key: 4,
    path: "/forgetpassword",
    Element: ForgotPassword,
    isProtected: false,
  },

  // ✅ Super Admin Routes (separate from main app)
  {
    key: 6,
    path: "/super-admin/login",
    Element: SuperAdminLogin,
    isProtected: false,
  },
  {
    key: 7,
    path: "/super-admin",
    Element: SuperAdminLayout,
    isProtected: false,
    children: [
      { key: 71, path: "dashboard", Element: SuperAdminHome, isProtected: false },
      { key: 72, path: "dashboard/bookings", Element: BookingManagement, isProtected: false },
      { key: 73, path: "dashboard/users", Element: UserManagement, isProtected: false },
    ],
  },

  // ✅ Dashboard (without header/footer)
  {
    key: 5,
    path: "/dashboard",
    Element: DashboardLayout,
    isProtected: true,
    allowedRoles: ["OWNER"],
    children: [
      // { key: 21, path: "", Element: DashBoardBusiness, isProtected: true },
      // { key: 22, path: "business", Element: DashBoardBusiness, isProtected: true },
      // { key: 22, path: "SalonProfile", Element: DashBoardProfile, isProtected: true },
      // { key: 23, path: "sales", Element: WorkInProgress, isProtected: true },
      // { key: 24, path: "performance", Element: WorkInProgress, isProtected: true },
      // { key: 25, path: "data", Element: WorkInProgress, isProtected: true },
      { key: 26, path: "staff", Element: StaffManagement, isProtected: true },
      { key: 27, path: "services", Element: ServiceManagement, isProtected: true },
      { key: 28, path: "", Element: AnalyticsPage, isProtected: true },
      { key: 29, path: "booking", Element: BookingsPage, isProtected: true },
      { key: 30, path: "profile", Element: DashboardProfile, isProtected: true },
      { key: 31, path: "attendance", Element: AttendancePage, isProtected: true },
      { key: 32, path: "settings", Element: SettingsPage, isProtected: true },

      // { key: 26, path: "salonowner", Element: SalonOwnerHomePage, isProtected: true },
    ],
  },
  {
    key: 4,
    path: '*', // 👈 This wildcard catches every undefined URL
    Element: NotFoundPage,
    isProtected: false, // Usually 404 is public
  },

];

export default routes;
