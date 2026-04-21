import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Clock,
  Edit3, UserCircle, Star, ShieldCheck, X, Check,
  Trash2, Plus, Globe, Camera, Image as ImageIcon,
  CalendarDays, AlignLeft, Navigation, MapPinned, LocateFixed, Loader2,
  Power, AlertTriangle, Scissors, Sparkles, Zap, ChevronRight
} from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { motion, AnimatePresence } from 'motion/react';

// Styles
import "swiper/css";
import "swiper/css/pagination";
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper function to format time without seconds
const formatTime = (time: string) => {
  if (!time) return '--:--';
  // Remove seconds if present (e.g., "08:00:00" -> "08:00")
  return time.includes(':') ? time.split(':').slice(0, 2).join(':') : time;
};

// Advanced Animated Scissors Component with Motion
const AnimatedScissors: React.FC = () => (
  <motion.div
    initial={{ rotate: 0 }}
    animate={{ rotate: [0, -20, 0, 20, 0] }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    whileHover={{ scale: 1.1, rotate: 30 }}
  >
    <motion.div
      animate={{ x: [0, 5, 0] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Scissors size={48} className="text-[#1E4D8C] drop-shadow-lg" />
    </motion.div>
  </motion.div>
);

// Advanced Floating Particles Component with Motion
const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.2, 0.8, 0.2],
          scale: [0.8, 1.2, 0.8],
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          ease: [0.25, 0.1, 0.25, 1],
          delay: i * 0.3,
        }}
        style={{
          left: `${5 + i * 12}%`,
          top: `${10 + (i % 4) * 20}%`,
        }}
      >
        <Sparkles size={16} className="text-[#1E4D8C]/30" />
      </motion.div>
    ))}
  </div>
);

// Advanced Animated Zap Component with Motion
const AnimatedZap: React.FC = () => (
  <motion.div
    animate={{
      scale: [1, 1.3, 1],
      opacity: [1, 0.6, 1],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Zap size={24} className="text-yellow-500" />
  </motion.div>
);

// Classic Barber Pole Animation Component
const BarberPole: React.FC = () => (
  <motion.div
    className="relative w-8 h-32 rounded-full overflow-hidden bg-white shadow-lg border-4 border-gray-300"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="absolute inset-0"
      animate={{ y: [0, -64, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="w-full h-16 bg-red-600" />
      <div className="w-full h-16 bg-white" />
      <div className="w-full h-16 bg-blue-600" />
      <div className="w-full h-16 bg-white" />
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
  </motion.div>
);

// Animated Hair Strand Component
const AnimatedHairStrand: React.FC = () => (
  <motion.div
    className="absolute"
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scaleY: [0, 1, 0],
      rotate: [0, 15, -15, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <motion.div
      className="w-1 h-12 bg-gradient-to-b from-[#1E4D8C] to-transparent rounded-full"
      animate={{
        scaleX: [1, 1.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

// Animated Rating Stars Component
const AnimatedRatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <motion.div
      className="flex items-center gap-1"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.8 + i * 0.1,
            type: "spring",
            stiffness: 150,
            damping: 20
          }}
          whileHover={{ scale: 1.2, rotate: 15 }}
        >
          <Star
            size={20}
            className={
              i < fullStars
                ? "text-[#D4AF37] fill-[#D4AF37]"
                : i === fullStars && hasHalfStar
                ? "text-[#D4AF37] fill-[#D4AF37]"
                : "text-gray-300"
            }
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated Icon Component for Info Rows
const AnimatedIcon: React.FC<{ icon: any }> = ({ icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.2, rotate: 10 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <Icon size={16} className="text-[#1E4D8C]" />
  </motion.div>
);

// Pulse Card Component for Daily Pulse Widget
const PulseCard: React.FC<{ label: string; value: string; change: string; isPositive?: boolean }> = ({ label, value, change, isPositive }) => (
  <motion.div
    className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm"
    style={{ boxShadow: "rgba(0,0,0,0.03) 0 1px 3px" }}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 200, damping: 25 }}
  >
    <p className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-black text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>{change}</span>
      {isPositive && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
    </div>
  </motion.div>
);

// Animated Gradient Background Component
const AnimatedGradientBackground: React.FC = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    animate={{
      background: [
        "radial-gradient(circle at 20% 50%, rgba(30, 77, 140, 0.05) 0%, transparent 50%)",
        "radial-gradient(circle at 80% 50%, rgba(30, 77, 140, 0.05) 0%, transparent 50%)",
        "radial-gradient(circle at 20% 50%, rgba(30, 77, 140, 0.05) 0%, transparent 50%)",
      ],
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  />
);

const DashboardProfile: React.FC = () => {
  const { apiRequest, apiCustomerPut } = useApi();
  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<any>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const hasAttemptedFetch = useRef(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const toggleReviewExpansion = (reviewIndex: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewIndex)) {
      newExpanded.delete(reviewIndex);
    } else {
      newExpanded.add(reviewIndex);
    }
    setExpandedReviews(newExpanded);
  };

  // Check if salon is currently open
  const isSalonOpen = (() => {
    if (!salonData || !salonData.timing) return false;
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const [openHours, openMinutes] = salonData.timing.openingTime.split(':').map(Number);
    const [closeHours, closeMinutes] = salonData.timing.closingTime.split(':').map(Number);
    
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const openTimeInMinutes = openHours * 60 + openMinutes;
    const closeTimeInMinutes = closeHours * 60 + closeMinutes;
    
    // Check if current time is within operating hours
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  })();

  // Calculate timeline positions (07:00 to 21:00 = 14 hours = 840 minutes)
  const calculateTimelinePosition = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startOfDay = 7 * 60; // 07:00
    const endOfDay = 21 * 60; // 21:00
    const dayDuration = endOfDay - startOfDay;
    const position = ((totalMinutes - startOfDay) / dayDuration) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const currentTimePosition = calculateTimelinePosition(
    `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`
  );
  
  const lunchStartPosition = salonData ? calculateTimelinePosition(formatTime(salonData.timing?.lunchBreak?.start || '12:30')) : 0;
  const lunchEndPosition = salonData ? calculateTimelinePosition(formatTime(salonData.timing?.lunchBreak?.end || '13:00')) : 0;
  const lunchWidth = lunchEndPosition - lunchStartPosition;

  // Calculate status badge
  const getStatusBadge = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    const openTime = 8 * 60; // 08:00
    const lunchStart = 12 * 60 + 30; // 12:30
    const lunchEnd = 13 * 60; // 13:00
    const closeTime = 21 * 60; // 21:00
    
    if (currentTimeInMinutes < openTime) {
      const minutesUntilOpen = openTime - currentTimeInMinutes;
      return `Opening in ${minutesUntilOpen} min${minutesUntilOpen > 1 ? 's' : ''}`;
    } else if (currentTimeInMinutes >= lunchStart && currentTimeInMinutes <= lunchEnd) {
      return 'On Lunch Break';
    } else if (currentTimeInMinutes > closeTime) {
      return 'Closed for the Day';
    } else {
      return 'Currently Open';
    }
  };


  const fetchProfile = useCallback(async () => {
    // Prevent infinite retry loops
    if (hasAttemptedFetch.current) return;
    hasAttemptedFetch.current = true;
    
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

      if (!salonId) return;
      const res = await apiRequest<any>(`/salons/${salonId}`);
      if (res.data) {
        // Handle both direct data and nested salonData structure
        const data = res.data.salonData || res.data;
        setSalonData(data);
        
        // Use reviewSummary from the API response if available
        const reviewSummary = res.data.reviewSummary || data.reviewSummary;
        if (reviewSummary?.recentReviews) {
          setReviews(reviewSummary.recentReviews);
          if (reviewSummary.ratingDistribution) {
            setRatingDistribution(reviewSummary.ratingDistribution);
          }
        } else {
          // If no reviewSummary in salon API, fetch reviews separately
          try {
            const reviewsRes = await apiRequest<any>(`/reviews/salons/${salonId}/reviews`);
            if (reviewsRes.data) {
              const reviewSummary = reviewsRes.data.reviewSummary;
              if (reviewSummary?.recentReviews) {
                setReviews(reviewSummary.recentReviews);
              } else {
                setReviews([]);
              }
              if (reviewSummary?.ratingDistribution) {
                setRatingDistribution(reviewSummary.ratingDistribution);
              }
            }
          } catch (reviewsErr) {
            console.error("Failed to fetch reviews:", reviewsErr);
            setReviews([]);
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const handleUpdateSalon = async (updatedValues: any) => {
    try {
      const res = await apiCustomerPut<any>(`/salons/update/${salonData.id}`, updatedValues);
      if (res.data) {
        setSalonData(res.data);
        setIsEditModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleBlockToggle = async () => {
    setIsBlocking(true);
    try {
      const salonId = salonData._id || salonData.id;
      if (!salonId) {
        throw new Error("No salon ID found");
      }
      
      const newBlockedStatus = !salonData.isBlocked;
      const res = await apiCustomerPut<any>(`/salons/update/${salonId}`, { isBlocked: newBlockedStatus });
      if (res.data) {
        setSalonData(res.data);
        setIsBlockModalOpen(false);
      }
    } catch (err) {
      console.error("Block toggle failed:", err);
      alert("Failed to update salon status. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Dynamic progress bar calculation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);

      // Parse opening and closing times (assuming format like "09:00" or "09:00 AM")
      const openTimeStr = salonData?.timing?.openingTime || "09:00";
      const closeTimeStr = salonData?.timing?.closingTime || "21:00";

      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period?.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (period?.toUpperCase() === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const openMinutes = parseTime(openTimeStr);
      const closeMinutes = parseTime(closeTimeStr);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Calculate progress percentage
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        const totalMinutes = closeMinutes - openMinutes;
        const elapsedMinutes = currentMinutes - openMinutes;
        const calculatedProgress = Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100));
        setProgress(calculatedProgress);
      } else if (currentMinutes < openMinutes) {
        setProgress(0);
      } else {
        setProgress(100);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [salonData]);

  if (loading) return <DashboardLoader isVisible={true} />;
  if (!salonData) return <div className="p-10 text-center font-bold text-gray-400">Profile Not Found</div>;

  return (
    <motion.div
      className="min-h-screen bg-[#F5F5F0] pb-20 px-4 md:px-8 font-sans relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <AnimatedGradientBackground />
      <div className="max-w-7xl mx-auto space-y-6 pt-6 relative z-10">

        {/* HERO SECTION */}
        <motion.div
          className="relative h-48 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <FloatingParticles />
          <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salonData.branding?.coverImages?.length > 0 ? salonData.branding.coverImages : ['/api/placeholder/1200/400']).map((img: string, i: number) => (
              <SwiperSlide key={`slide-${i}`}><img src={img} className="w-full h-full object-cover" alt="cover" /></SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* PROFILE HEADER */}
        <motion.div
          className="flex flex-col gap-6 px-4 -mt-16 md:-mt-20 relative z-20 pt-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Salon Info */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-white overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <img src={salonData.branding?.logoUrl || '/api/placeholder/150/150'} className="w-full h-full object-cover rounded-[2rem]" alt="logo" />
            </motion.div>
            <div className="flex-1 flex flex-col items-center md:items-start">
              <motion.div
                className="flex items-center justify-center md:justify-start gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{salonData.salonName}</h1>
                {salonData.isVerified && <ShieldCheck className="text-blue-600 fill-blue-50" size={24} />}
                <motion.button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 bg-gray-100 rounded-full transition-colors"
                  title="Edit Salon Profile"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit3 size={16} className="text-gray-600" />
                </motion.button>
              </motion.div>
              <p className="text-xs font-bold text-[#4b5563] uppercase tracking-[0.1em] mt-2">UNISEX • <span className="text-[#1a1a1a] font-black">₹299–1,200</span></p>
            </div>
          </div>
        </motion.div>

        {/* MAIN DASHBOARD CONTENT */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Column 1: Quick Stats */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden shadow-lg flex flex-col flex-1"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.02, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Stats</h3>
            <div className="space-y-0">
              <InfoRow icon={UserCircle} label="Owner" value={salonData.ownerName} />
              <InfoRow icon={Mail} label="Email" value={salonData.email} />
              <InfoRow icon={Phone} label="Primary Phone" value={salonData.primaryPhone} />
            </div>
          </motion.div>

          {/* Column 2: Operational Hours with SVG Timeline */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 relative overflow-hidden shadow-lg flex flex-col flex-1"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.02, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {salonData.timing?.weeklyOff?.length > 0 && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-md uppercase tracking-wider backdrop-blur-sm bg-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Off: {salonData.timing.weeklyOff.join(', ')}
                </span>
              </div>
            )}
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Operational Hours</h3>
            
            {/* SVG Timeline */}
            <div className="relative">
              <svg width="100%" height="60" viewBox="0 0 200 60" className="overflow-visible">
                {/* Timeline Track */}
                <defs>
                  <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                    <stop offset={`${currentTimePosition}%`} stopColor="#D4AF37" stopOpacity="0.8" />
                    <stop offset={`${currentTimePosition}%`} stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Main Timeline Bar */}
                <rect x="10" y="28" width="180" height="4" rx="2" fill="url(#timelineGradient)" />
                
                {/* Opening Time Marker */}
                <circle cx="10" cy="30" r="4" fill="#D4AF37" filter="url(#glow)" />
                <text x="10" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#666" fontFamily="sans-serif">
                  {formatTime(salonData.timing?.openingTime) || '--:--'}
                </text>
                
                {/* Closing Time Marker */}
                <circle cx="190" cy="30" r="4" fill="#10b981" filter="url(#glow)" />
                <text x="190" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#666" fontFamily="sans-serif">
                  {formatTime(salonData.timing?.closingTime) || '--:--'}
                </text>
                
                {/* Current Time Indicator with Pulse */}
                <g>
                  <circle 
                    cx={10 + (currentTimePosition / 100) * 180} 
                    cy="30" 
                    r="6" 
                    fill="#1a1a1a" 
                    filter="url(#glow)"
                  >
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle 
                    cx={10 + (currentTimePosition / 100) * 180} 
                    cy="30" 
                    r="10" 
                    fill="none" 
                    stroke="#1a1a1a" 
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
                
                {/* Current Time Label */}
                <text 
                  x={10 + (currentTimePosition / 100) * 180} 
                  y="50" 
                  textAnchor="middle" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="#1a1a1a" 
                  fontFamily="sans-serif"
                >
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </text>
              </svg>
              
              {/* Current Status */}
              <div className="mt-2 flex items-center justify-center">
                {isSalonOpen ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">Open Now</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-red-50 rounded-full border border-red-200">
                    <span className="text-xs font-bold text-red-700">Closed Now</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Column 3: Expertise */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden shadow-lg flex flex-col flex-1"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.02, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {salonData.expertise?.map((ex: string, idx: number) => (
                <motion.span
                  key={`${ex}-${idx}`}
                  className="px-4 py-2 rounded-lg text-[10px] font-black border uppercase tracking-tighter cursor-default bg-white/50 text-[#1a1a1a] border-white/30"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.1)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {ex}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* OPERATIONS & PROGRESS CARD - Full Width */}
          <motion.div
            className="lg:col-span-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg relative overflow-hidden"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Clock size={16} />
                </motion.div>
                Day Timeline
              </h3>
              
              {/* Status Text - Bold Serif Next to Header */}
              <p className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                {getStatusBadge()}
              </p>
            </div>

            {/* Day Timeline Graph */}
            <div className="mb-4">
              {/* Timeline Track - 8px Height */}
              <div 
                className="relative h-2 bg-gray-100 rounded-full overflow-hidden backdrop-blur-sm cursor-crosshair"
                style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  const totalMinutes = 14 * 60; // 07:00 to 21:00 = 14 hours
                  const minutesFromStart = (percentage / 100) * totalMinutes;
                  const hours = Math.floor(minutesFromStart / 60) + 7;
                  const minutes = Math.floor(minutesFromStart % 60);
                  const displayTime = new Date();
                  displayTime.setHours(hours, minutes);
                  setHoverTime(displayTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
                  setHoverPosition(percentage);
                }}
                onMouseLeave={() => {
                  setHoverTime(null);
                }}
              >
                {/* Past Time Fill - Soft Metallic Gradient */}
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D4AF37] to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(0, currentTimePosition)}%` }}
                />
                
                {/* Lunch Zone - Semi-transparent Amber Block */}
                <div 
                  className="absolute top-0 h-full bg-amber-400/40 hover:bg-amber-400/60 transition-colors group relative"
                  style={{ 
                    left: `${lunchStartPosition}%`, 
                    width: `${lunchWidth}%` 
                  }}
                >
                  {/* Lunch Zone Hover Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
                    Lunch: 12:30 PM - 01:00 PM
                  </div>
                </div>
                
                {/* Live Needle - Thin Vertical Line with Pulse */}
                <div 
                  className="absolute top-0 h-full w-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
                  style={{ left: `${Math.max(0, Math.min(100, currentTimePosition))}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rounded-full animate-ping opacity-75" />
                </div>
                
                {/* Needle Tooltip - Bold Current Time */}
                <div 
                  className="absolute -top-8 transition-all duration-300 ease-in-out"
                  style={{ left: `${Math.max(0, Math.min(100, currentTimePosition))}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="px-3 py-1 bg-gray-900 text-white text-xs font-black rounded-full whitespace-nowrap shadow-lg">
                    {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>

                {/* Hover Time Tooltip - Follows Cursor */}
                {hoverTime && (
                  <div 
                    className="absolute -top-7 transition-all duration-75 ease-out pointer-events-none"
                    style={{ left: `${hoverPosition}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded-full whitespace-nowrap shadow-lg">
                      {hoverTime}
                    </div>
                  </div>
                )}
              </div>

              {/* LUNCH Label - Below yellow segment */}
              <div className="relative mt-2">
                <div 
                  className="absolute text-[10px] font-bold text-amber-600 uppercase tracking-wider"
                  style={{ 
                    left: `${lunchStartPosition + lunchWidth / 2}%`, 
                    transform: 'translateX(-50%)',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  LUNCH
                </div>
              </div>

              {/* Time Labels - Bold but Small */}
              <div className="flex justify-between items-center mt-6">
                <span className="text-xs font-bold text-gray-400 tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>07:00 AM</span>
                <span className="text-xs font-bold text-gray-400 tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>09:00 PM</span>
              </div>
            </div>
          </motion.div>

          {/* PERFORMANCE CARD - Full Width */}
          <motion.div
            className="lg:col-span-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-[#1a1a1a] shadow-lg relative overflow-hidden"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[10px] font-black text-gray-500 uppercase mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Performance</p>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side: Glowing Circular Gauge */}
              <div className="md:w-1/3 flex-shrink-0 flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    {/* Progress Circle with Gradient */}
                    <defs>
                      <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="glowEffect">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#ratingGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - (salonData.ratings?.average || 0) / 5)}
                      filter="url(#glowEffect)"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  {/* Rating in Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.p
                      className="text-4xl font-black"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.7 }}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {salonData.ratings?.average || 0}
                    </motion.p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < Math.round(salonData.ratings?.average || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Based on {salonData.ratings?.reviewsCount || 0} Reviews</p>
                
                {/* Minimalist Bar Chart */}
                <div className="space-y-3 mt-4">
                  {ratingDistribution ? (
                    <>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percentage = Math.round(((ratingDistribution[star.toString()] || 0) / (salonData.ratings?.reviewsCount || 1)) * 100);
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-gray-400 w-6 text-right">{star}★</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.8 + (5 - star) * 0.1 }}
                                className="h-full rounded-full"
                                style={{ 
                                  background: `linear-gradient(90deg, ${star >= 4 ? '#D4AF37' : '#9ca3af'} 0%, ${star >= 4 ? '#10b981' : '#6b7280'} 100%)`,
                                  boxShadow: star >= 4 ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 w-10">{percentage}%</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">No rating data available</p>
                  )}
                </div>
              </div>
              
              {/* Vertical Separator */}
              <div className="hidden md:block border-l border-gray-200" />
              
              {/* Right Side: User Reviews */}
              <div className="md:w-2/3 flex-shrink-0">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>User Reviews</h4>
                
                {/* Scrollable Reviews Container */}
                <div className="relative h-64 overflow-hidden">
                  {/* Top Fade Effect */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  
                  {/* Scrollable Content */}
                  <div className="h-full overflow-y-auto scrollbar-hide px-2">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review: any, idx: number) => {
                        const isExpanded = expandedReviews.has(idx);
                        const reviewText = review.reviewText || 'No review text provided';
                        const shouldTruncate = reviewText.length > 150;
                        const displayText = shouldTruncate && !isExpanded 
                          ? reviewText.substring(0, 150) + '...' 
                          : reviewText;
                        
                        return (
                          <div key={review.id || idx} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {review.userName || 'Anonymous'}
                              </p>
                              <Check size={12} className="text-[#D4AF37]" />
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 italic leading-relaxed break-words" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {displayText}
                            </p>
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleReviewExpansion(idx)}
                                className="text-xs font-bold text-[#D4AF37] mt-2 hover:underline cursor-pointer flex items-center gap-1 transition-all"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                {isExpanded ? 'See less' : 'See more'}
                                {!isExpanded && <ChevronRight size={12} className="text-[#D4AF37]" />}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-gray-400 italic text-center leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Customer feedback will appear here once submitted.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom Fade Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* LOCATION CARD - Full Width */}
          <motion.div
            className="lg:col-span-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 relative overflow-hidden shadow-lg"
            style={{ boxShadow: "rgba(0,0,0,0.1) 0 8px 32px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 font-sans" style={{ fontFamily: "'Playfair Display', serif" }}>Location</h3>
            <p className="text-sm font-bold text-[#1a1a1a] leading-relaxed font-sans mb-6">
              {salonData.address?.street},<br />
              {salonData.address?.city}, {salonData.address?.state}<br />
              {salonData.address?.pincode}
            </p>

            {/* View Location Button */}
            <motion.button
              onClick={() => setIsMapModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(26, 26, 26, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <MapPinned size={16} />
              View Location
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          onClose={() => setIsEditModalOpen(false)}
          initialData={salonData}
          onUpdate={handleUpdateSalon}
        />
      )}

      {isMapModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsMapModalOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl h-[600px] bg-[#1a1a1a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
            
            {/* Embedded Map */}
            <div className="w-full h-full">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(salonData.address?.street + ', ' + salonData.address?.city + ', ' + salonData.address?.state)}`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsBlockModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl relative ${salonData.isBlocked ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <AlertTriangle size={24} className={salonData.isBlocked ? 'text-red-600' : 'text-emerald-600'} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {salonData.isBlocked ? 'Turn Visibility On' : 'Turn Visibility Off'}
                  </h3>
                  <p className="text-xs font-bold text-[#4b5563] uppercase tracking-widest mt-1">
                    {salonData.isBlocked ? 'Make your salon visible to users' : 'Hide your salon from users'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                <p className="text-sm font-bold text-[#1a1a1a] leading-relaxed">
                  {salonData.isBlocked
                    ? 'Turning visibility on will make your salon visible to all users on the platform. Users will be able to search, view, and book appointments at your salon.'
                    : 'Turning visibility off will make your salon invisible to users. Users will not be able to search, view, or book appointments at your salon until you turn visibility on again.'
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl bg-gray-100 text-[#4b5563] font-bold hover:bg-gray-200 transition-all font-sans uppercase text-xs tracking-widest border border-gray-200"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleBlockToggle}
                  disabled={isBlocking}
                  className={`flex-1 h-14 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 font-sans uppercase text-xs tracking-widest transition-all border ${
                    salonData.isBlocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20 border-emerald-500'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20 border-red-500'
                  } ${isBlocking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={{ scale: 1.02, boxShadow: salonData.isBlocked ? "0 0 30px rgba(16, 185, 129, 0.4)" : "0 0 30px rgba(239, 68, 68, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isBlocking ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Power size={18} />
                      {salonData.isBlocked ? 'Turn On' : 'Turn Off'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- MODAL COMPONENT ---
const EditProfileModal = ({ onClose, initialData, onUpdate }: any) => {
  const [formData, setFormData] = useState(() => ({
    ...initialData,
    description: initialData?.description || "",
    expertise: initialData?.expertise || [],
    pricing: initialData?.pricing || { priceRange: "" },
    address: initialData?.address || { street: "", city: "", state: "", pincode: "", country: "India" },
    location: initialData?.location || { latitude: 0, longitude: 0 },
    timing: initialData?.timing || { openingTime: "", closingTime: "", lunchBreak: { start: "", end: "" }, weeklyOff: [] },
    branding: initialData?.branding || { logoUrl: "", coverImages: [] }
  }));

  const [newExpertise, setNewExpertise] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const { apiSalonPost } = useSalonApi();


  // Add these new states
  const [tempLogo, setTempLogo] = useState<{ file: File; preview: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // For the Gallery, we'll track which index or if it's a "new" upload
  const [tempGalleryFile, setTempGalleryFile] = useState<{ file: File; preview: string } | null>(null);


  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const toggleWeeklyOff = (day: string) => {
    const currentOffs = formData.timing.weeklyOff || [];
    const updatedOffs = currentOffs.includes(day)
      ? currentOffs.filter((d: string) => d !== day)
      : [...currentOffs, day];
    handleNestedChange('timing.weeklyOff', updatedOffs);
  };

  const addTag = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise)) {
      setFormData({ ...formData, expertise: [...formData.expertise, newExpertise.trim()] });
      setNewExpertise("");
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleNestedChange('location.latitude', position.coords.latitude);
        handleNestedChange('location.longitude', position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve location. Please enter manually.");
      }
    );
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Start reading the file as a Data URL
      reader.readAsDataURL(file);

      // On success: the result contains the full base64 string (including data:image/png;base64,...)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to string"));
        }
      };

      // On error: reject the promise
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFile = async (file: File, path: string) => {
    if (!file) return;

    // 1. Strict Size Validation (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    if (file.size > MAX_SIZE) {
      alert("File is too large! Please upload an image smaller than 2MB.");
      // We return here so no state is updated and no conversion happens
      return;
    }

    // 2. Optional: Type Validation (Security Best Practice)
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }

    try {
      // Only proceeds if validations above passed
      const base64 = await fileToBase64(file);

      // Update the state with the new image
      handleNestedChange(path, base64);

      console.log("File processed and state updated successfully.");
    } catch (err) {
      console.error("File processing failed:", err);
    }
  };

  const handleCloudUpload = async (file: File, type: 'logo' | 'gallery') => {
    setIsUploading(true);
    try {
      const user = localStorage.getItem("authState");
      const parsedUser = user ? JSON.parse(user) : null;
      // Fallback to match your fetchProfile logic
      const salonId = parsedUser?.user?.user?.salonId || parsedUser?.user?.salonId;

      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("salon_id", salonId);

      const res = await apiSalonPost<any>("/upload/salon-images", uploadData);

      // Accessing the URL from: res.data.data.urls[0] based on your JSON structure
      const uploadedUrl = res.data?.data?.urls?.[0];

      if (uploadedUrl) {
        if (type === "logo") {
          handleNestedChange("branding.logoUrl", uploadedUrl);
          setTempLogo(null);
        } else {
          const currentImages = formData.branding.coverImages || [];
          handleNestedChange("branding.coverImages", [...currentImages, uploadedUrl]);
          setTempGalleryFile(null);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please check file size or connection.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">

          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Edit Salon Profile</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your brand story and ops</p>
            </div>
            <motion.button 
              onClick={onClose} 
              className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* COLUMN 1 */}
            <div className="space-y-8">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Business Story & Branding</h4>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex justify-between">
                    <span>Description</span>
                    <span className={formData.description.length > 200 ? 'text-orange-500' : ''}>{formData.description.length}/300</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 300) })}
                    rows={4}
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                    placeholder="Tell clients about your salon..."
                  />
                </div>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Logo Management</h4>
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-inner overflow-hidden flex-shrink-0 border-2 border-white">
                      <img
                        src={tempLogo ? tempLogo.preview : (formData.branding.logoUrl || '/api/placeholder/100/100')}
                        alt="Logo Preview"
                        className={`w-full h-full object-cover ${tempLogo ? 'opacity-50' : ''}`}
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      {!tempLogo ? (
                        <EditFileInput
                          label="Select New Logo"
                          onChange={async (file: File) => {
                            if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");
                            const preview = await fileToBase64(file);
                            setTempLogo({ file, preview });
                          }}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempLogo.file, 'logo')}
                            className="flex-1 h-10 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                          >
                            {isUploading ? 'Uploading...' : <><Check size={14} /> Confirm</>}
                          </button>
                          <button onClick={() => setTempLogo(null)} className="px-4 h-10 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cover Gallery</label>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-4">
                    {!tempGalleryFile ? (
                      <EditFileInput
                        label="Add New Gallery Image"
                        onChange={async (file: File) => {
                          if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");
                          const preview = await fileToBase64(file);
                          setTempGalleryFile({ file, preview });
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        <img src={tempGalleryFile.preview} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 flex gap-2">
                          <button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempGalleryFile.file, 'gallery')}
                            className="flex-1 h-10 bg-[#1E4D8C] text-white rounded-xl text-[10px] font-black uppercase"
                          >
                            {isUploading ? 'Uploading...' : 'Upload to Gallery'}
                          </button>
                          <button onClick={() => setTempGalleryFile(null)} className="px-4 h-10 bg-slate-200 rounded-xl text-[10px] font-black uppercase">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {formData.branding.coverImages?.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                        <button
                          onClick={() => handleNestedChange('branding.coverImages', formData.branding.coverImages.filter((_: any, i: number) => i !== idx))}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              {/* LOCATION SECTION ENHANCED */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                   <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest">Location & Coordinates</h4>
                   <button 
                    type="button" 
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1E4D8C] rounded-lg text-[9px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                   >
                     {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                     {isLocating ? 'Detecting...' : 'Auto-Detect GPS'}
                   </button>
                </div>
                
                <EditInput label="Street Address" value={formData.address.street} onChange={(val: any) => handleNestedChange('address.street', val)} />
                <div className="grid grid-cols-3 gap-3">
                  <EditInput label="City" value={formData.address.city} onChange={(val: any) => handleNestedChange('address.city', val)} />
                  <EditInput label="State" value={formData.address.state} onChange={(val: any) => handleNestedChange('address.state', val)} />
                  <EditInput label="Zip" value={formData.address.pincode} onChange={(val: any) => handleNestedChange('address.pincode', val)} />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mt-2">
                    <EditInput label="Latitude" type="number" value={formData.location.latitude} onChange={(val: any) => handleNestedChange('location.latitude', parseFloat(val))} />
                    <EditInput label="Longitude" type="number" value={formData.location.longitude} onChange={(val: any) => handleNestedChange('location.longitude', parseFloat(val))} />
                </div>
              </section>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Business Hours & Weekly Off</h4>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Opens" type="time" value={formData.timing.openingTime} onChange={(val: any) => handleNestedChange('timing.openingTime', val)} />
                  <EditInput label="Closes" type="time" value={formData.timing.closingTime} onChange={(val: any) => handleNestedChange('timing.closingTime', val)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Break Start" type="time" value={formData.timing.lunchBreak?.start} onChange={(val: any) => handleNestedChange('timing.lunchBreak.start', val)} />
                  <EditInput label="Break End" type="time" value={formData.timing.lunchBreak?.end} onChange={(val: any) => handleNestedChange('timing.lunchBreak.end', val)} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Weekly Off Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeeklyOff(day)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${formData.timing.weeklyOff.includes(day) ? "bg-[#1E4D8C] text-white border-[#1E4D8C] shadow-lg shadow-blue-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Details & Expertise</h4>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Salon Type" value={formData.salonType} onChange={(val: any) => setFormData({ ...formData, salonType: val })} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Specialized Expertise</label>
                  <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                        value={newExpertise} 
                        onChange={(e) => setNewExpertise(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTag()} 
                        placeholder="Add a specialized service..." 
                        className="flex-1 h-11 px-4 bg-transparent border-none text-sm font-bold outline-none" 
                    />
                    <button 
                        onClick={addTag} 
                        className="bg-slate-900 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <Plus size={16} /> Add Skill
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise?.map((item: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#1E4D8C] rounded-xl text-[10px] font-black border border-blue-100 shadow-sm uppercase tracking-tighter">
                        {item}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setFormData({ ...formData, expertise: formData.expertise.filter((_: any, i: number) => i !== idx) })} />
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
            <motion.button 
              onClick={onClose} 
              className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-400 font-bold hover:bg-slate-100 transition-all font-sans uppercase text-xs tracking-widest"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              Discard Changes
            </motion.button>
            <motion.button
              onClick={() => onUpdate(formData)}
              className="flex-[2] h-14 rounded-2xl bg-[#1E4D8C] text-white font-bold shadow-xl shadow-blue-900/20 hover:bg-[#163a6b] flex items-center justify-center gap-2 font-sans uppercase text-xs tracking-widest"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(30, 77, 140, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Check size={18} /> Update Salon Profile
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... (rest of the code remains the same)
// Helpers
const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#4b5563] flex-shrink-0"><Icon size={18} /></div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-[#1a1a1a] truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

const TimeBox = ({ label, value }: any) => (
  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
    <p className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest mb-2">{label}</p>
    <p className="text-sm font-bold text-[#1a1a1a]">{formatTime(value) || '--:--'}</p>
  </div>
);

const EditInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      step="any"
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
    />
  </div>
);

const EditFileInput = ({ label, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
      {label}
    </label>

    <input
      type="file"
      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      className="w-full h-12 px-3 py-2 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-100 file:text-blue-700"
    />
  </div>
);

export default DashboardProfile;