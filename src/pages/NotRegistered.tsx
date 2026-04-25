import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserX, ArrowRight } from "lucide-react";

const NotRegistered = () => {
  return (
    <div className="min-h-screen classy-salon-bg flex items-center justify-center p-4 relative font-sans">
      <div className="classy-overlay" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto glass-card rounded-[2.5rem] p-8 sm:p-12 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <UserX className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Not Registered
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            It looks like you haven't signed up yet. Create an account to enjoy all our features and book your next appointment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/signup">
            <button className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white font-bold rounded-2xl hover:from-[#B8960C] hover:to-[#D4AF37] transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl">
              Go to Register
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          
          <Link to="/login" className="block mt-4 text-white/50 hover:text-white text-xs sm:text-sm transition-colors">
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotRegistered;
