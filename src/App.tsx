import { useEffect, useState } from "react";
import Router from "./navigations/Router";
import { useDispatch, useSelector } from 'react-redux';
import Config from "./configs/config";
import { login } from "./utils/Storage/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import ParticleSystem from "./components/ParticleSystem";
import './i18n/config';

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
          // Fetch user PII to get image URL
          try {
            const piiResponse = await fetch(`${Config.API_BASE_URL}/users/${result.user.id}/pii`, {
              headers: {
                'Authorization': `Bearer ${result.access_token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (piiResponse.ok) {
              const piiData = await piiResponse.json();
              // Update user state with image URL from PII
              dispatch(login({ user: { ...result.user, access_token: result.access_token, image_url: piiData.image_url } }));
            } else {
              dispatch(login({ user: result }));
            }
          } catch (piiError) {
            console.error('Failed to fetch PII:', piiError);
            // Continue even if PII fetch fails
            dispatch(login({ user: result }));
          }

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
      <ParticleSystem />
      <Router />
      
    </ToastProvider>
  );
};

const LoadingSpinner: React.FC = () => <div>Loading application...</div>; // Placeholder

export default App;