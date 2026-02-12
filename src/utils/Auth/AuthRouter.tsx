// utils/Auth/AuthRouter.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

interface AuthRouterProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const AuthRouter: React.FC<AuthRouterProps> = ({ element, allowedRoles }) => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const userRole = useSelector((state: any) => state.auth.user?.user?.role || "guest");

  console.log("userRole = ",userRole);
  console.log("allowedRoles = ",allowedRoles);
  console.log("allowedRoles && !allowedRoles.includes(userRole) = ",allowedRoles && !allowedRoles.includes(userRole));
  
  // 🔒 If not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 If role not allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{element}</>;
};

export default AuthRouter;
