import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, Check, AlertTriangle, Power, X, ArrowLeft, Loader2, Globe, Instagram, Facebook, MapPin, Share2, Clock, Calendar, Award, TrendingUp, Users, Mail, Phone, Edit3, UserCircle, ShieldCheck, Trash2, Plus, Camera, Image as ImageIcon, CalendarDays, AlignLeft, Navigation, MapPinned, LocateFixed, Scissors, Sparkles, Zap } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsSortBy, setReviewsSortBy] = useState('latest');
  const reviewsPerPage = 10;

  const toggleReviewExpansion = (reviewIndex: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewIndex)) {
      newExpanded.delete(reviewIndex);
    } else {
      newExpanded.add(reviewIndex);
    }
    setExpandedReviews(newExpanded);
  };

  const fetchPaginatedReviews = async (page: number = 1, sortBy: string = reviewsSortBy) => {
    try {
      setReviewsLoading(true);
      const salonId = salonData._id || salonData.id;
      let sortParam = '';
      if (sortBy === 'latest') {
        sortParam = '&sort=-createdAt';
      } else if (sortBy === 'oldest') {
        sortParam = '&sort=createdAt';
      } else if (sortBy === 'highest') {
        sortParam = '&sort=-rating';
      } else if (sortBy === 'lowest') {
        sortParam = '&sort=rating';
      }
      
      const res = await apiRequest<any>(
        `/reviews/reviews/SALON/${salonId}?page=${page}&limit=${reviewsPerPage}${sortParam}`
      );
      if (res.data) {
        setAllReviews(res.data);
        // Calculate total pages based on review summary
        const summary = await apiRequest<any>(`/reviews/reviews/SALON/${salonId}/summary`);
        if (summary.data) {
          const totalReviews = summary.data.totalReviews || 0;
          setReviewsTotalPages(Math.ceil(totalReviews / reviewsPerPage));
        }
      }
    } catch (err) {
      console.error('Error fetching paginated reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (isReviewsModalOpen) {
      fetchPaginatedReviews(1);
      setReviewsCurrentPage(1);
    }
  }, [isReviewsModalOpen]);

  const handleReviewsPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= reviewsTotalPages) {
      setReviewsCurrentPage(newPage);
      fetchPaginatedReviews(newPage, reviewsSortBy);
    }
  };

  const handleSortChange = (newSort: string) => {
    setReviewsSortBy(newSort);
    setReviewsCurrentPage(1);
    fetchPaginatedReviews(1, newSort);
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
      const salonId = salonData._id || salonData.id;
      if (!salonId) {
        throw new Error("No salon ID found");
      }
      const res = await apiCustomerPut<any>(`/salons/update/${salonId}`, updatedValues);
      if (res.data) {
        setSalonData(res.data);
        setIsEditModalOpen(false);
        setShowSuccessPopup(true);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Auto-hide success popup after 3 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

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

        {/* CINEMATIC HERO SECTION - Premium Float Layout with Parallax */}
        <motion.div
          className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <FloatingParticles />
          <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salonData.branding?.coverImages?.length > 0 ? salonData.branding.coverImages : ['/api/placeholder/1200/400']).map((img: string, i: number) => (
              <SwiperSlide key={`slide-${i}`}>
                <div className="relative w-full h-full">
                  <img 
                    src={img} 
                    className="w-full h-full object-cover transform scale-110 transition-transform duration-700 ease-out group-hover:scale-100" 
                    alt="cover" 
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Gold FAB Edit Button */}
          <motion.button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#C9A227] rounded-full shadow-lg flex items-center justify-center transition-all"
            title="Edit Salon Profile"
            style={{ boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)' }}
            whileHover={{ scale: 1.1, boxShadow: '0 6px 25px rgba(212, 175, 55, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 size={20} className="text-white" />
          </motion.button>
        </motion.div>

        {/* FLOATING GLASS BRAND CARD - Unified Logo & Name */}
        <motion.div
          className="relative -mt-12 px-6 mb-3"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Glassmorphism Card with Thin Gold Border */}
          <div
            className="rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            style={{ 
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 30px rgba(212, 175, 55, 0.1)'
            }}
          >
            <div className="flex items-center gap-5 relative z-10">
              {/* Logo - Increased size */}
              <div className="relative">
                <motion.div
                  className="w-28 h-28 rounded-xl bg-white shadow-lg overflow-hidden flex-shrink-0"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  <img src={salonData.branding?.logoUrl || '/api/placeholder/150/150'} className="w-full h-full object-cover" alt="logo" />
                </motion.div>
                {/* Live Pulse - Top-right corner of logo with LED glow */}
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <motion.div
                      className={`w-4 h-4 rounded-full ${isSalonOpen ? 'bg-emerald-400' : 'bg-red-500'}`}
                      animate={{
                        boxShadow: isSalonOpen 
                          ? ['0 0 15px rgba(52, 211, 153, 1), 0 0 25px rgba(52, 211, 153, 0.6)', '0 0 15px rgba(52, 211, 153, 1)']
                          : ['0 0 15px rgba(239, 68, 68, 1), 0 0 25px rgba(239, 68, 68, 0.6)', '0 0 15px rgba(239, 68, 68, 1)']
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ boxShadow: isSalonOpen ? '0 0 15px rgba(52, 211, 153, 1), 0 0 30px rgba(52, 211, 153, 0.5)' : '0 0 15px rgba(239, 68, 68, 1), 0 0 30px rgba(239, 68, 68, 0.5)' }}
                    />
                    <motion.div
                      className={`absolute inset-0 rounded-full ${isSalonOpen ? 'bg-emerald-400' : 'bg-red-500'}`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Salon Name and Info */}
              <div className="flex-1">
                <motion.div
                  className="flex items-center justify-between mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>{salonData.salonName || 'Your Salon Name'}</h1>
                    {salonData.isVerified && <ShieldCheck className="text-[#D4AF37] fill-[#D4AF37]/10" size={28} />}
                  </div>
                  {salonData.description && (
                    <p className="text-sm md:text-base font-medium text-gray-600 mt-2 italic leading-relaxed" style={{ fontFamily: "'Georgia', serif", maxWidth: '600px' }}>
                      {salonData.description}
                    </p>
                  )}
                  <motion.button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 transition-all"
                    title="Edit Salon Profile"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 size={18} className="text-[#D4AF37]" />
                  </motion.button>
                </motion.div>
                
                {/* Ghost Pill Tags - Reduced gap */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {salonData.salonType && (
                    <span className="px-3 py-1 text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider rounded-full border border-[#D4AF37]/40 bg-transparent">{salonData.salonType}</span>
                  )}
                  <span className="px-3 py-1 text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider rounded-full border border-[#D4AF37]/40 bg-transparent">₹{salonData.pricing?.priceRange || '299–1,200'}</span>
                  {salonData.establishedYear && (
                    <span className="px-3 py-1 text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider rounded-full border border-gray-300 bg-transparent">Est. {salonData.establishedYear}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BENTO GRID LAYOUT - Compact Side-by-Side with reduced margin */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Identity Card - Quick Stats */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 relative overflow-hidden shadow-lg"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0 4px 20px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.12) 0 4px 20px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Identity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center">
                  <UserCircle size={14} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Owner</p>
                  <p className="text-xs font-semibold text-gray-800">{salonData.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E4D8C]/20 to-[#1E4D8C]/5 flex items-center justify-center">
                  <Mail size={14} className="text-[#1E4D8C]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">{salonData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 flex items-center justify-center">
                  <Phone size={14} className="text-[#10b981]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-xs font-semibold text-gray-800">{salonData.primaryPhone}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Precision Operational Clock - Time Labels Only */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 relative overflow-hidden shadow-lg"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0 4px 20px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.12) 0 4px 20px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Operational Hours</h3>
            
            {/* Time Labels - JetBrains Mono style */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Opens</p>
                <span className="text-sm font-bold text-gray-800 tracking-wider" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
                  {formatTime(salonData.timing?.openingTime) || '--:--'}
                </span>
              </div>
              <div className="text-center flex-1">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Closes</p>
                <span className="text-sm font-bold text-gray-800 tracking-wider" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
                  {formatTime(salonData.timing?.closingTime) || '--:--'}
                </span>
              </div>
            </div>

            {/* Holiday Section */}
            {salonData.timing?.weeklyOff?.length > 0 && (
              <div className="pt-3">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Holidays:</p>
                <p className="text-sm font-bold text-gray-800 tracking-wider" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
                  {salonData.timing.weeklyOff.join(', ')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Expertise Card - Interactive Glowing Chips */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 relative overflow-hidden shadow-lg"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0 4px 20px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.12) 0 4px 20px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {salonData.expertise?.map((ex: string, idx: number) => (
                <motion.span
                  key={`${ex}-${idx}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold cursor-default text-gray-700 bg-gray-100/80 border border-gray-200/50"
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderColor: "rgba(212, 175, 55, 0.3)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {ex}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Social Media Card */}
          <motion.div
            className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 relative overflow-hidden shadow-lg"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0 4px 20px" }}
            whileHover={{ scale: 1.01, boxShadow: "rgba(0,0,0,0.12) 0 4px 20px" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Social Media</h3>
            <div className="space-y-3">
              {salonData.socialMedia?.instagram && salonData.socialMedia.instagram.trim() !== '' && (
                <motion.a
                  href={salonData.socialMedia.instagram.startsWith('http') ? salonData.socialMedia.instagram : `https://instagram.com/${salonData.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/50 hover:border-purple-400/50 transition-all group"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Instagram</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{salonData.socialMedia.instagram}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </motion.a>
              )}
              {salonData.socialMedia?.facebook && salonData.socialMedia.facebook.trim() !== '' && (
                <motion.a
                  href={salonData.socialMedia.facebook.startsWith('http') ? salonData.socialMedia.facebook : `https://facebook.com/${salonData.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50/50 to-blue-100/50 border border-blue-200/50 hover:border-blue-400/50 transition-all group"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                    <Facebook size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Facebook</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{salonData.socialMedia.facebook}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </motion.a>
              )}
              {salonData.socialMedia?.other && salonData.socialMedia.other.trim() !== '' && (
                <motion.a
                  href={salonData.socialMedia.other}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-gray-50/50 to-gray-100/50 border border-gray-200/50 hover:border-gray-400/50 transition-all group"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center">
                    <Globe size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Other Link</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{salonData.socialMedia.other}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                </motion.a>
              )}
              {(!salonData.socialMedia?.instagram || salonData.socialMedia.instagram.trim() === '') &&
               (!salonData.socialMedia?.facebook || salonData.socialMedia.facebook.trim() === '') &&
               (!salonData.socialMedia?.other || salonData.socialMedia.other.trim() === '') && (
                <p className="text-xs text-gray-400 italic text-center py-4">No social media links added</p>
              )}
            </div>
          </motion.div>


          {/* PERFORMANCE CARD - Original Layout */}
          <motion.div
            className="lg:col-span-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-[#1a1a1a] shadow-lg relative overflow-hidden"
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
              </div>
              
              {/* Vertical Separator */}
              <div className="hidden md:block border-l border-gray-200" />
              
              {/* Right Side: User Reviews */}
              <div className="md:w-2/3 flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>User Reviews</h4>
                  {reviews && reviews.length > 0 && (
                    <button
                      onClick={() => setIsReviewsModalOpen(true)}
                      className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1 transition-all"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Show All Reviews <ChevronRight size={12} className="text-[#D4AF37]" />
                    </button>
                  )}
                </div>
                
                {/* Scrollable Reviews Container */}
                <div className="relative h-64 overflow-hidden">
                  {/* Top Fade Effect */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  
                  {/* Scrollable Content */}
                  <div className="h-full overflow-y-auto scrollbar-hide px-2">
                    {reviews && reviews.length > 0 ? (
                      reviews.slice(0, 10).map((review: any, idx: number) => {
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
                </div>
              </div>
            </div>
          </motion.div>

          {/* LOCATION CARD - Full Width */}
          <motion.div
            className="lg:col-span-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 relative overflow-hidden shadow-lg"
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

            {/* Share Location Button */}
            <motion.button
              onClick={() => {
                const lat = salonData.location?.coordinates?.lat || salonData.address?.lat;
                const lng = salonData.location?.coordinates?.lng || salonData.address?.lng;
                if (lat && lng) {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                } else {
                  // Fallback to address-based search
                  const address = `${salonData.address?.street}, ${salonData.address?.city}, ${salonData.address?.state} ${salonData.address?.pincode}`;
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(26, 26, 26, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <MapPinned size={16} />
              Share Location
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

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-[200] animate-in fade-in duration-300">
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-6 border border-white/40 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#D4AF37' }}
              >
                <Check size={24} className="text-white" />
              </motion.div>
              <div>
                <p className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Profile Updated</p>
                <p className="text-xs font-semibold text-gray-500">Changes saved successfully</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reviews Modal */}
      <AnimatePresence>
        {isReviewsModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm">
            <motion.div
              className="bg-white/90 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white/80">
                <div>
                  <h3 className="text-xl font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>All Reviews</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Page {reviewsCurrentPage} of {reviewsTotalPages}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={reviewsSortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-xs font-semibold text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                  <motion.button
                    onClick={() => setIsReviewsModalOpen(false)}
                    className="p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {allReviews.length > 0 ? (
                        allReviews.map((review: any, idx: number) => (
                          <div key={review.id || idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-[#D4AF37]">
                                  {review.userName?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{review.userName || 'Anonymous'}</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 flex-shrink-0">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{review.text || review.reviewText || 'No review text'}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No reviews found</p>
                        </div>
                      )}
                    </div>
                    {reviewsTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200/50">
                        <motion.button
                          onClick={() => handleReviewsPageChange(reviewsCurrentPage - 1)}
                          disabled={reviewsCurrentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeft size={20} className="text-gray-600" />
                        </motion.button>
                        <span className="text-sm font-semibold text-gray-700">
                          Page {reviewsCurrentPage} of {reviewsTotalPages}
                        </span>
                        <motion.button
                          onClick={() => handleReviewsPageChange(reviewsCurrentPage + 1)}
                          disabled={reviewsCurrentPage === reviewsTotalPages}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronRight size={20} className="text-gray-600" />
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    branding: initialData?.branding || { logoUrl: "", coverImages: [] },
    socialMedia: initialData?.socialMedia || { instagram: "", facebook: "", other: "" }
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
      <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
        <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white/80">
          <div>
            <h2 className="text-xl font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Edit Salon Profile</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Refine your brand story and ops</p>
          </div>
          <motion.button onClick={onClose} className="p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all" whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.95 }}>
            <X size={20} />
          </motion.button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* COLUMN 1 */}
            <div className="space-y-8">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100/50 pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Business Story & Branding</h4>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex justify-between">
                    <span>Description</span>
                    <span className={formData.description.length > 200 ? 'text-orange-500' : ''}>{formData.description.length}/300</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 300) })}
                    rows={4}
                    className="w-full p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm font-bold text-[#1a1a1a] focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all outline-none resize-none"
                    placeholder="Tell clients about your salon..."
                  />
                </div>

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100/50 pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Logo Management</h4>
                  <div className="flex items-center gap-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
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
                          <motion.button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempLogo.file, 'logo')}
                            className="flex-1 h-10 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/30"
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isUploading ? 'Uploading...' : <><Check size={14} /> Confirm</>}
                          </motion.button>
                          <motion.button onClick={() => setTempLogo(null)} className="px-4 h-10 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Cancel
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cover Gallery</label>

                  <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200/50 mb-4">
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
                          <motion.button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempGalleryFile.file, 'gallery')}
                            className="flex-1 h-10 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#D4AF37]/30"
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isUploading ? 'Uploading...' : 'Upload to Gallery'}
                          </motion.button>
                          <motion.button onClick={() => setTempGalleryFile(null)} className="px-4 h-10 bg-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {formData.branding.coverImages?.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200/50 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                        <motion.button
                          onClick={() => handleNestedChange('branding.coverImages', formData.branding.coverImages.filter((_: any, i: number) => i !== idx))}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              {/* LOCATION SECTION ENHANCED */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
                   <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>Location & Coordinates</h4>
                   <motion.button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[9px] font-black uppercase hover:bg-[#D4AF37]/20 transition-all border border-[#D4AF37]/30 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                   >
                     {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                     {isLocating ? 'Detecting...' : 'Auto-Detect GPS'}
                   </motion.button>
                </div>
                
                <EditInput label="Street Address" value={formData.address.street} onChange={(val: any) => handleNestedChange('address.street', val)} />
                <div className="grid grid-cols-3 gap-3">
                  <EditInput label="City" value={formData.address.city} onChange={(val: any) => handleNestedChange('address.city', val)} />
                  <EditInput label="State" value={formData.address.state} onChange={(val: any) => handleNestedChange('address.state', val)} />
                  <EditInput label="Zip" value={formData.address.pincode} onChange={(val: any) => handleNestedChange('address.pincode', val)} />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 mt-2">
                    <EditInput label="Latitude" type="number" value={formData.location.latitude} onChange={(val: any) => handleNestedChange('location.latitude', parseFloat(val))} />
                    <EditInput label="Longitude" type="number" value={formData.location.longitude} onChange={(val: any) => handleNestedChange('location.longitude', parseFloat(val))} />
                </div>
              </section>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100/50 pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Business Hours & Weekly Off</h4>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Opens" type="time" value={formData.timing.openingTime} onChange={(val: any) => handleNestedChange('timing.openingTime', val)} />
                  <EditInput label="Closes" type="time" value={formData.timing.closingTime} onChange={(val: any) => handleNestedChange('timing.closingTime', val)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Break Start" type="time" value={formData.timing.lunchBreak?.start} onChange={(val: any) => handleNestedChange('timing.lunchBreak.start', val)} />
                  <EditInput label="Break End" type="time" value={formData.timing.lunchBreak?.end} onChange={(val: any) => handleNestedChange('timing.lunchBreak.end', val)} />
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Weekly Off Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <motion.button
                        key={day}
                        type="button"
                        onClick={() => toggleWeeklyOff(day)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${formData.timing.weeklyOff.includes(day) ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30" : "bg-white text-gray-400 border-gray-200/50 hover:border-[#D4AF37]/50"}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {day}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100/50 pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Details & Expertise</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Salon Type</label>
                    <select
                      value={formData.salonType || ''}
                      onChange={(e) => setFormData({ ...formData, salonType: e.target.value })}
                      className="w-full h-12 px-5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm font-bold text-[#1a1a1a] focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all outline-none"
                    >
                      <option value="">Select Type</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Kids">Kids</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Social Media Links</label>
                  <div className="space-y-3">
                    <EditInput label="Instagram Handle" value={formData.socialMedia?.instagram || ''} onChange={(val: any) => handleNestedChange('socialMedia.instagram', val)} placeholder="@your_salon_name" />
                    <EditInput label="Facebook Handle" value={formData.socialMedia?.facebook || ''} onChange={(val: any) => handleNestedChange('socialMedia.facebook', val)} placeholder="your_salon_page" />
                    <EditInput label="Other Links" value={formData.socialMedia?.other || ''} onChange={(val: any) => handleNestedChange('socialMedia.other', val)} placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Specialized Expertise</label>
                  <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                    <input 
                        value={newExpertise} 
                        onChange={(e) => setNewExpertise(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTag()} 
                        placeholder="Add a specialized service..." 
                        className="flex-1 h-11 px-4 bg-transparent border-none text-sm font-bold outline-none text-[#1a1a1a]" 
                    />
                    <motion.button 
                        onClick={addTag} 
                        className="bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={16} /> Add Skill
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise?.map((item: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm text-[#D4AF37] rounded-xl text-[10px] font-black border border-[#D4AF37]/30 shadow-sm uppercase tracking-tighter">
                        {item}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setFormData({ ...formData, expertise: formData.expertise.filter((_: any, i: number) => i !== idx) })} />
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100/50 flex flex-col md:flex-row gap-4">
            <motion.button 
              onClick={onClose} 
              className="flex-1 h-14 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all font-sans uppercase text-xs tracking-widest"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              Discard Changes
            </motion.button>
            <motion.button
              onClick={() => onUpdate(formData)}
              className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 flex items-center justify-center gap-2 font-sans uppercase text-xs tracking-widest"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Check size={18} /> Update Salon Profile
            </motion.button>
          </div>
        </div>
      </motion.div>
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

const EditInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      step="any"
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 px-5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm font-bold text-[#1a1a1a] focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all outline-none placeholder:text-gray-400/60"
    />
  </div>
);

const EditFileInput = ({ label, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
      {label}
    </label>

    <input
      type="file"
      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      className="w-full h-12 px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm font-bold text-[#1a1a1a] focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#D4AF37]/10 file:text-[#D4AF37]"
    />
  </div>
);

export default DashboardProfile;