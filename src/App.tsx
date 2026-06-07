import Router from "./navigations/Router";
import { useSelector } from 'react-redux';
import { ToastProvider } from "./components/Toast";
import ParticleSystem from "./components/ParticleSystem";
import CoiffyChatbot from "./components/CoiffyChatbot";
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';
import './i18n/config';

const App = () => {
  const { isLoading, user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  // Check if current path is landing page
  const isLandingPage = location.pathname === '/';
  
  // Check if user is salon owner
  const isSalonOwner = user?.role === 'OWNER';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only show chatbot on landing page for customers
  const shouldShowChatbot = false;

  return (
    <ToastProvider>
      <ParticleSystem />
      <Router />
      {shouldShowChatbot && <CoiffyChatbot />}
    </ToastProvider>
  );
};

const LoadingSpinner: React.FC = () => (
  <>
    {/* Mobile View - Full-screen glassmorphism */}
    <div className="md:hidden fixed inset-0 z-[10000] flex items-center justify-center bg-black/10 backdrop-blur-md">
      <motion.div
        className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Rotating Gradient Ring Loader */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, #D4AF37)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-2 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-12 h-12 object-contain" />
            </motion.div>
          </div>
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-white font-semibold tracking-widest text-sm uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Loading application
        </motion.p>

        {/* Subtle Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-white/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>

    {/* Desktop View - Compact, subtle loader */}
    <div className="hidden md:flex fixed inset-0 z-[10000] items-center justify-center bg-black/5 backdrop-blur-sm">
      <motion.div
        className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl px-8 py-6 flex items-center gap-4 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Compact Rotating Ring */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, #D4AF37)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-1.5 bg-white/90 rounded-full flex items-center justify-center">
            <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-5 h-5 object-contain" />
          </div>
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-gray-800 font-medium tracking-wide text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Loading application
        </motion.p>
      </motion.div>
    </div>
  </>
);

export default App;