import { useEffect, useState } from "react";
import Router from "./navigations/Router";
import { useDispatch, useSelector } from 'react-redux';
import Config from "./configs/config";
import { login } from "./utils/Storage/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";

const App = () => {
  const THIRTY_MINUTES = 30 * 60 * 1000;
  const dispatch = useDispatch<any>(); // Use 'any' or proper Dispatch type from Redux Toolkit
  const { isLoading } = useSelector((state: any) => state.auth);
  const [num, setnum] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const lastVisit = localStorage.getItem('lastVisit');
    const lastVisitTime = lastVisit ? parseInt(lastVisit, 10) : 0;
    const currentTime = Date.now();
    const timeDifference = currentTime - lastVisitTime;
    const isRecentVisit = timeDifference < THIRTY_MINUTES;
    if (!isRecentVisit) {
      // 1. If timestamp exists, start the API check (this sets isLoading to true in the 'pending' state)
      if (num === 0) {
        handleUserAuth()
      }
    }
    else {
    }
  }, []);

  const handleUserAuth = async () => {
    try {
      setnum((prev) => prev + 1);
      const userData = localStorage.getItem("user");
      if (!userData) return null;

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.accessToken
    const refreshToken = parsed?.refreshToken

      const response = await fetch(`${Config.API_BASE_URL}/authenticating`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': accessToken ? `Bearer ${accessToken}` : "",
          "X-Refresh-Token": refreshToken, // 👈 send refresh token in header
        }, credentials: 'include'
      })
      if (response.status === 200) {
        console.log("response ", response);
        const result = await response.json();
        console.log("result =", result);

        if (result?.Error) {
          if (result?.redirect) {
            navigate(result?.redirect);
          }
        }
        else {
          dispatch(
            login({
              user: result             // user details (id, email, etc.)
            })
          );

        }

      }
    } catch (error) {

    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
};

const LoadingSpinner: React.FC = () => <div>Loading application...</div>; // Placeholder

export default App;