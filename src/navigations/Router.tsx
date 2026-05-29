import { Route, Routes, useLocation } from "react-router-dom";
import routes, { type AppRoute } from "./AllRoutes";
import AuthRouter from "../utils/Auth/AuthRouter";
import React, { useEffect } from "react";
import { trackPageView } from "../utils/analytics";

const renderRoutes = (routeList: AppRoute[]) =>


  routeList.map((route) => {
    const { Element, key, path, isProtected, allowedRoles, children, props } = route;
    const element = <Element {...props} />;

    const wrappedElement = isProtected ? (
      <AuthRouter element={element} allowedRoles={allowedRoles} />
    ) : (
      element
    );

    return (
      <Route key={key} path={path} element={wrappedElement}>
        {children && renderRoutes(children)}
      </Route>
    );
  });

const Router: React.FC = () => {
  const location = useLocation();
  
  // Track page views automatically on route changes (only for user-facing pages)
  useEffect(() => {
    const excludedPaths = ['/dashboard', '/super-admin', '/salon-owner'];
    const shouldTrack = !excludedPaths.some(excluded => location.pathname.startsWith(excluded));
    
    if (shouldTrack) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Routes location={location} key={location.pathname}>
      {renderRoutes(routes)}
    </Routes>
  );
};

export default Router;
