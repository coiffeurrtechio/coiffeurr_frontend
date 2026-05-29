import Router from "./navigations/Router";
import { useSelector } from 'react-redux';
import { ToastProvider } from "./components/Toast";
import ParticleSystem from "./components/ParticleSystem";
import AnalyticsTracker from "./components/AnalyticsTracker";
import './i18n/config';

const App = () => {
  const { isLoading } = useSelector((state: any) => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ToastProvider>
      <ParticleSystem />
      <AnalyticsTracker />
      <Router />
      
    </ToastProvider>
  );
};

const LoadingSpinner: React.FC = () => <div>Loading application...</div>;

export default App;