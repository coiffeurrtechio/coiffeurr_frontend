import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Phone, Star, Heart,
  Mail, CheckCircle, X, Scissors, Loader2,
  Check,
  Navigation,
  Instagram,
  Facebook,
  ChevronRight
} from "lucide-react";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Badge } from "../../components/ui_components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui_components/tabs";
import { Loader } from "../../components/ui_components/Loader";

// API
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { getDefaultStaffImage, getDefaultServiceImage, getDefaultSalonImage } from "../../utils/defaultServiceImage";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function SalonDetailPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const { apiRequest } = useApi();
  const { userapiRequest } = usersalonApi();

  const { userapiPost } = usersalonApi()
  const navigate = useNavigate();

  const [salon, setSalon] = useState<any>(null);
  const [salonService, setSalonService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [salonStaff, setSalonStaff] = useState<any[]>([]);
  const [showContactButton, setShowContactButton] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsSortBy, setReviewsSortBy] = useState('latest');
  const reviewsPerPage = 10;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    reviewText: "",
    targetType: "SALON"
  });
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; showLoginLink?: boolean } | null>(null);

  const user = localStorage.getItem("authState");

  const parsedUser = user ? JSON.parse(user) : null;

  const isloggedin = parsedUser?.isAuthenticated;

  // const handleStaffClick = (staff: any) => {
  //   setSelectedStaff(staff);
  //   setIsStaffModalOpen(true);
  // };


  useEffect(() => {
    console.log("salonId  =",salonId);
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    if (salonId) {
      fetchSalonById();
      checkWishlistStatus();
    }
  }, [salonId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      
      // Show button when user has scrolled more than 40% of the page
      const hasScrolledPastThreshold = scrollTop > scrollHeight * 0.4;
      
      if (hasScrolledPastThreshold) {
        setShowContactButton(true);
      } else {
        setShowContactButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkWishlistStatus = async () => {
    const user = localStorage.getItem("authState");
    const parsedUser = user ? JSON.parse(user) : null;
    const userID = parsedUser?.user?.user?.id || parsedUser?.user?.id;

    // if (!userID || !salonId) return;

    try {
      const res = await userapiRequest(`/wishlist/${userID}`);
      if (res.data) {
        const isInWishlist = res.data.some((item: any) => item.id === salonId || item.salonId === salonId);
        setIsFavorite(isInWishlist);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsFavorite(false);
    }
  };

  const fetchReviews = async (page: number = 1) => {
    try {
      setReviewsLoading(true);
      const res = await apiRequest<any>(`/reviews/SALON/${salonId}?page=${page}&limit=${reviewsPerPage}`);
      if (res.data) {
        setReviews(res.data);
        // Calculate total pages based on the response
        const totalReviews = res.data.length || 0; // Adjust based on actual API response
        setReviewsTotalPages(Math.ceil(totalReviews / reviewsPerPage));
      }
    } catch (error) {
      console.error("Reviews fetch error:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchPaginatedReviews = async (page: number = 1, sortBy: string = reviewsSortBy) => {
    try {
      setReviewsLoading(true);
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
        `/reviews/SALON/${salonId}?page=${page}&limit=${reviewsPerPage}${sortParam}`
      );
      if (res.data) {
        setAllReviews(res.data);
        // Calculate total pages based on review summary
        const summary = await apiRequest<any>(`/reviews/SALON/${salonId}/summary`);
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

  const handleViewAllReviews = () => {
    setIsReviewsModalOpen(true);
  };

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

  useEffect(() => {
    if (isReviewsModalOpen) {
      fetchPaginatedReviews(1);
      setReviewsCurrentPage(1);
    }
  }, [isReviewsModalOpen]);

  const handlePostReview = async () => {
    if (!reviewData.reviewText.trim()) return alert("Please write a review.");

    setIsReviewSubmitting(true);
    setReviewError(null); // Clear previous errors

    try {
      const payload = {
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        targetType: "SALON",
        targetId: salonId
      };

      const res = await userapiPost<any>(`/reviews`, payload, {});

      if (res.status === 400) {
        const errorMessage = res?.data?.detail || "Something went wrong. Please try again.";
        setReviewError(errorMessage);
        return;
      }

      if (res.data) {
        setReviewData({ ...reviewData, reviewText: "", rating: 5 });
        setIsReviewModalOpen(false);
        fetchReviews();
      }
    } catch (error: any) {
      // Capture the "detail" message from your API response
      const errorMessage = error.response?.data?.detail || "Something went wrong. Please try again.";
      setReviewError(errorMessage);
      console.error("Review failed:", error);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const fetchSalonById = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any>(`/salons/${salonId}`);
      if (res.data) {
        setSalon(res.data);
        await Promise.all([fetchSalonService(), fetchSalonStaff(), fetchReviews()]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonService = async () => {
    try {
      const res = await apiRequest<any>(`/salons/${salonId}/services`);
      if (res.data) setSalonService(res.data);
    } catch (error) { console.error(error); }
  }

  const fetchSalonStaff = async () => {
    try {
      const res = await apiRequest<any>(`/salons/${salonId}/staff`);
      if (res.data) setSalonStaff(res.data);
    } catch (error) {
      console.error('Error fetching salon staff:', error);
      setSalonStaff([]);
    }
  }

  const handleViewService = (service_id?: any) => {
    window.scrollTo(0, 0);
    navigate(`/salon/${salonId}/service/${service_id}`);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const checkIsOpen = () => {
    if (!salon?.timing) return false;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (salon.timing.weeklyOff?.includes(dayName)) return false;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const open = parseInt(salon.timing.openingTime.replace(/:/g, ''));
    const close = parseInt(salon.timing.closingTime.replace(/:/g, ''));
    return currentTime >= open && currentTime <= close;
  };

  const getPriceRange = () => {
    if (salonService && Array.isArray(salonService) && salonService.length > 0) {
      const prices = salonService.map((service: any) => service.price).filter((price: any) => price != null && !isNaN(price));
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
      }
    }
    return salon?.pricing?.priceRange || '₹299';
  };

  const handleWishList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!salonId) return;

    const user = localStorage.getItem("authState");
    const parsedUser = user ? JSON.parse(user) : null;
    const userID = parsedUser?.user?.user?.id || parsedUser?.user?.id || parsedUser?.id;

    if (!userID || !isloggedin) {
      setNotification({ message: "Please login to add to wishlist", type: "error", showLoginLink: true });
      return;
    }

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
      const res = await userapiPost<any>(`/wishlist/${userID}/${salonId}`);

      if (res?.error) {
        throw new Error(res.error);
      }
    } catch (error) {
      setIsFavorite(prev => !prev);
    }
  };

  if (!loading && !salon) return <div className="p-20 text-center font-light">Salon not found.</div>;

  const isOpen = checkIsOpen();

  // Helper function to format social media URLs
  const formatInstagramUrl = (value: string) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    // Remove @ if present and add Instagram URL
    const username = value.replace('@', '');
    return `https://instagram.com/${username}`;
  };

  const formatFacebookUrl = (value: string) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    // Add Facebook URL
    return `https://facebook.com/${value}`;
  };



  const handleStaffClick = (staffId: string) => {
    navigate(`/salon/${salonId}/staff/${staffId}`);
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="h-auto bg-transparent text-slate-900 font-sans selection:bg-slate-100" onClick={handleDismissNotification}>
      <Loader isVisible={loading || isReviewSubmitting} />

      {/* --- Floating Notification --- */}
      {notification && (
        <div onClick={(e) => e.stopPropagation()} className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {notification.type === 'success' && <Check size={20} className="text-black" />}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-center text-black whitespace-nowrap">{notification.message}</span>
            {notification.showLoginLink && (
              <button onClick={(e) => { e.stopPropagation(); navigate("/login"); }} className="text-xs font-bold bg-black text-white px-6 py-2 rounded-full hover:bg-white hover:text-black border-2 border-black transition-all">
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- Floating Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-slate-400">The Experience</span>
          <div className="flex gap-1">
            <button onClick={handleWishList} className={`p-2 rounded-full hover:bg-slate-50 transition-all ${isFavorite ? "text-red-500" : "text-slate-400"}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* --- Hero Section --- */}
        <section className="relative h-[40vh] sm:h-[50vh] md:h-[65vh] w-full bg-slate-100">
          <Swiper modules={[Pagination, Autoplay, EffectFade]} effect="fade" pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salon?.branding?.coverImages?.length ? salon.branding.coverImages : [getDefaultSalonImage(salon?.id || salon?.salonName || '')]).map((img: string, i: number) => (
              <SwiperSlide key={i}><img src={img.trim()} alt="Salon" className="w-full h-full object-cover" /></SwiperSlide>
            ))}
          </Swiper>

          {/* Glassmorphism Title Card - Overlapping bottom of hero */}
          <div className="absolute -bottom-16 sm:-bottom-20 left-0 right-0 z-20 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-white/75 backdrop-blur-xl border border-white/30 rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-xl text-center">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">{salon?.salonName}</h1>
              <p className="font-serif text-sm sm:text-base text-slate-600 italic mb-3">Strong Hair Strong You</p>
              <div className="inline-block bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-3">
                {salon?.salonType} Salon
              </div>
              <div className="flex justify-center items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <span>⭐ {reviews?.length || "0"} Reviews</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold">{getPriceRange()}</span>
              </div>
              <div className="mt-3 flex flex-wrap justify-center items-center gap-1">
                <p className="text-xs font-normal text-slate-400">tags :</p>
                <p className="text-xs text-slate-600">
                  {salon?.expertise?.map((exp: string, i: number) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      #{exp}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Content Body - Single Centered Column --- */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16 bg-[#F9FAFB] mt-16 sm:mt-20 rounded-t-[2.5rem]">
          <div className="flex flex-col gap-4">
            <div>
              <div className="h-[1px] bg-gray-100 w-full mb-4"></div>
              <h2 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">The Studio</h2>
              {salon?.description?.includes('"') ? (
                <blockquote className="p-8 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 border border-amber-200/50 rounded-2xl italic font-serif text-slate-700 text-center text-lg leading-relaxed relative">
                  <div className="absolute top-4 left-4 text-amber-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01697C7.9124 16 7.01697 16.8954 7.01697 18L7.01697 21H14.017ZM12.017 14C13.1216 14 14.017 13.1046 14.017 12C14.017 10.8954 13.1216 10 12.017 10C10.9124 10 10.017 10.8954 10.017 12C14.017 13.1046 10.9124 14 12.017 14Z"/></svg>
                  </div>
                  <span className="relative z-10">{salon?.description?.match(/"([^"]*)"/)?.[1] || salon?.description}</span>
                </blockquote>
              ) : (
                <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light leading-relaxed text-center">{salon?.description?.replace(/Strong Hair Strong You/gi, '').trim()}</p>
              )}
            </div>

            <Tabs defaultValue="services" className="w-full mt-4">
              <TabsList className="bg-white/70 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-full p-2 flex items-center w-full gap-2">
                {["Services", "Stylists", "Reviews"].map((tab) => (
                  <TabsTrigger key={tab} value={tab === "Stylists" ? "stylists" : tab === "Reviews" ? "reviews" : "services"} className="flex-1 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:rounded-full data-[state=active]:font-bold text-slate-500 hover:text-slate-800 px-4 py-3 rounded-full transition-colors font-sans text-sm font-semibold tracking-wide whitespace-nowrap">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* SERVICES TAB */}
              <TabsContent value="services" className="pt-3">
                {salonService?.length > 0 ? (
                  <>
                  <div className="space-y-6">
                    {salonService.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 w-full">
                        {/* Left: Service Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={item.imageUrl || getDefaultServiceImage(item.serviceName || '')}
                            alt={item.serviceName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Middle: Title and Price stacked vertically */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-medium text-slate-900 break-words">{item.serviceName.replace('Triming', 'Trimming').replace(/\+/g, ' + ')}</h4>
                          <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mb-1">{item.description}</p>
                          <div className="font-semibold text-slate-900 text-sm sm:text-base">
                            <span className="text-xs text-slate-500 font-normal">₹</span>{item.price}
                          </div>
                        </div>
                        
                        {/* Right: Compact pill-shaped button */}
                        <Button
                          size="sm"
                          className="group relative rounded-full bg-indigo-50/50 text-indigo-950 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md hover:bg-indigo-100/60 active:bg-indigo-200/70 px-4 sm:px-5 font-mono text-[10px] uppercase tracking-wider font-medium shrink-0 overflow-hidden border border-indigo-100"
                          onClick={() => handleViewService(item?.service_id)}
                        >
                          <span className="relative z-10">Book</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/[0.15] to-transparent pointer-events-none" style={{
                            animation: 'shimmer 3s ease-in-out infinite',
                            willChange: 'transform'
                          }} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <style>{`
                    @keyframes shimmer {
                      0% { transform: translate3d(-100%, 0, 0); }
                      100% { transform: translate3d(100%, 0, 0); }
                    }
                  `}</style>
                  </>
                ) : <div className="py-20 text-center"><Scissors className="w-8 h-8 text-slate-200 mx-auto mb-4" /><p className="text-sm text-slate-400">Digital Menu currently being updated.</p></div>}
              </TabsContent>

              {/* STYLISTS TAB */}
              <TabsContent value="stylists" className="pt-6 sm:pt-10">
                {salonStaff?.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {salonStaff.map((staff: any) => (
                      <div
                        key={staff.staff_id}
                        onClick={() => handleStaffClick(staff.staff_id)}
                        className="group relative bg-white p-4 sm:p-5 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl border border-slate-100 rounded-2xl flex gap-4 sm:gap-5 min-h-[100px] sm:min-h-[120px]">
                        {/* Artist Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 shrink-0 overflow-hidden rounded-xl">
                          <img
                            src={staff.images?.[0] || getDefaultStaffImage(staff.staff_id || staff.name || '')}
                            alt={staff.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>

                        {/* Text Content - Right Aligned */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-lg sm:text-xl font-serif font-medium text-slate-900 w-full">{staff.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] sm:text-[10px] font-bold text-[#1E4D8C] uppercase tracking-wider">{staff.role}</p>
                            {staff.rating?.average && (
                              <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span className="text-slate-600">{staff.rating.average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 font-normal uppercase">{staff.experienceYears} Years Exp</p>

                          {/* Specialty Tags - Pill Shaped with Border */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                            {staff.expertise?.slice(0, 3).map((exp: string, i: number) => (
                              <span key={i} className="text-[8px] sm:text-[9px] border border-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase text-slate-600">{exp}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-sm text-slate-400 italic">Our master stylists are preparing...</div>
                )}
              </TabsContent>

              {/* REVIEWS TAB */}
              <TabsContent value="reviews" className="pt-4">
                <div className="space-y-4">
                  {/* Review Summary - Centered */}
                  <div className="text-center border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-serif font-semibold text-slate-900 mb-0.5">Reviews</h3>
                    <p className="text-[9px] font-normal text-slate-500 mb-2">Genuine experiences, authored by our community</p>
                    
                    {/* Calculate stats from reviews */}
                    {(() => {
                      const averageRatingNum = reviews.length > 0 ? reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) / reviews.length : 0;
                      
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= Math.round(averageRatingNum) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-200"} />)}
                          </div>
                          <p className="text-[9px] font-bold uppercase text-slate-400">Based on {reviews.length} Reviews</p>
                        </div>
                      );
                    })()}
                  </div>

                  {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reviews.slice(0, 3).map((rev, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {/* User Image or Gradient Avatar */}
                              {rev?.userImage ? (
                                <img
                                  src={rev.userImage}
                                  alt={rev?.userName || "Customer"}
                                  className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {rev?.userName?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-serif font-semibold text-slate-900 truncate">{rev?.userName || "Customer"}</h4>
                                <p className="text-[8px] text-slate-400 font-normal">
                                  {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-0.5 shrink-0">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={9} className={s <= rev.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-200"} />)}</div>
                          </div>
                          <p className="text-slate-700 font-serif leading-snug text-xs line-clamp-3">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : <div className="py-8 text-center"><Star className="w-5 h-5 text-slate-200 mx-auto mb-2" /><p className="text-xs text-slate-400 italic">No reviews yet. Share your experience!</p></div>}
                  
                  {/* View All Reviews Button */}
                  {reviews.length > 0 && (
                    <div className="text-center">
                      <button
                        onClick={handleViewAllReviews}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20"
                      >
                        View All Reviews
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                  
                  {/* Write Review Button */}
                  {isloggedin && (
                    <div className="text-center mt-3">
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-wider hover:bg-[#C9A227] transition-all duration-300 hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        + Write a Review
                      </button>
                    </div>
                  )}
                  
                  {/* Signature Tagline */}
                  <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-serif text-slate-400 italic">Every transformation is a story. Thank you for sharing yours.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Concierge Section - Below Services */}
            <div className="mt-10 bg-slate-50 rounded-3xl p-3 md:p-4 border border-slate-100">
              <h3 className="text-[11px] font-black text-[#1E4D8C] uppercase tracking-[0.3em] mb-2 text-center">Concierge</h3>
              
              {/* Mobile Vertical List */}
              <div className="space-y-2 md:hidden">
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#1E4D8C] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Location</p>
                    <p className="text-sm text-slate-800 font-medium leading-snug mb-1">
                      {salon?.address?.street && <>{salon?.address?.street}, </>}
                      {salon?.address?.city && <>{salon?.address?.city}, </>}
                      {salon?.address?.state && <>{salon?.address?.state}</>}
                      {salon?.address?.pincode && <>, {salon?.address?.pincode}</>}
                    </p>
                    <a
                      href={salon?.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                    >
                      <Navigation size={10} /> Get Directions
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#1E4D8C] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Hours</p>
                    <p className="text-sm text-slate-800 font-medium mb-1">
                      {formatTime(salon?.timing?.openingTime)} — {formatTime(salon?.timing?.closingTime)}
                    </p>
                    {isOpen ?
                      <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black">OPEN</Badge> :
                      <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-black">CLOSED</Badge>
                    }
                  </div>
                </div>

                {/* Social Media */}
                {(salon?.socialMedia?.instagram || salon?.socialMedia?.facebook || salon?.socialMedia?.other) && (
                  <div className="flex flex-wrap gap-2 pl-6.5">
                    {salon?.socialMedia?.instagram && (
                      <a
                        href={formatInstagramUrl(salon.socialMedia.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                      >
                        <Instagram size={12} /> Instagram
                      </a>
                    )}
                    {salon?.socialMedia?.facebook && (
                      <a
                        href={formatFacebookUrl(salon.socialMedia.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                      >
                        <Facebook size={12} /> Facebook
                      </a>
                    )}
                    {salon?.socialMedia?.other && (
                      <a
                        href={salon.socialMedia.other.startsWith('http') ? salon.socialMedia.other : `https://${salon.socialMedia.other}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Other
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop 2-Column Grid */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex flex-col items-center text-center gap-1">
                  <MapPin className="w-4 h-4 text-[#1E4D8C]" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Location</p>
                    <p className="text-sm text-slate-800 font-medium leading-snug">
                      {salon?.address?.street && <>{salon?.address?.street}, </>}
                      {salon?.address?.city && <>{salon?.address?.city}, </>}
                      {salon?.address?.state && <>{salon?.address?.state}</>}
                      {salon?.address?.pincode && <>, {salon?.address?.pincode}</>}
                    </p>
                    <a
                      href={salon?.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                    >
                      <Navigation size={10} /> Get Directions
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center text-center gap-1">
                  <Clock className="w-4 h-4 text-[#1E4D8C]" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Hours</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {formatTime(salon?.timing?.openingTime)} — {formatTime(salon?.timing?.closingTime)}
                    </p>
                    {isOpen ?
                      <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black mt-1">OPEN</Badge> :
                      <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-black mt-1">CLOSED</Badge>
                    }
                  </div>
                </div>
              </div>

              {/* Social Media - Desktop */}
              {(salon?.socialMedia?.instagram || salon?.socialMedia?.facebook || salon?.socialMedia?.other) && (
                <div className="hidden md:flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-200">
                  {salon?.socialMedia?.instagram && (
                    <a
                      href={formatInstagramUrl(salon.socialMedia.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                    >
                      <Instagram size={12} /> Instagram
                    </a>
                  )}
                  {salon?.socialMedia?.facebook && (
                    <a
                      href={formatFacebookUrl(salon.socialMedia.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                    >
                      <Facebook size={12} /> Facebook
                    </a>
                  )}
                  {salon?.socialMedia?.other && (
                    <a
                      href={salon.socialMedia.other.startsWith('http') ? salon.socialMedia.other : `https://${salon.socialMedia.other}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Other
                    </a>
                  )}
                </div>
              )}

              {/* Ownership Section - Minimal Text Line */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-center gap-2 text-center">
                  <div className="w-6 h-6 rounded-full bg-[#1E4D8C] flex items-center justify-center text-white font-black text-[10px]">
                    {salon?.ownerName?.charAt(0)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Managed by {salon?.ownerName}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Contact Button - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 p-4">
          <div className="flex justify-center">
            <a href="tel:+917045464907" className="block">
              <Button className={`max-w-xs h-12 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl flex items-center justify-center gap-2 px-6 transition-all duration-500 ease-[0.34,1.56,0.64,1] ${showContactButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <Phone size={16} className="text-[#D4AF37]" />
                Call Support
              </Button>
            </a>
          </div>
        </div>

        </main>

      {/* --- Review Modal --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[10px]">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-8 space-y-6 relative">
            {/* Close Button - Top Right */}
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setReviewError(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>

            {/* Title - Serif Font */}
            <h3 className="text-2xl font-serif font-semibold text-slate-900 text-center mt-2">How was your transformation?</h3>

            {/* Error Message Alert */}
            {reviewError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="bg-red-500 rounded-full p-1 mt-0.5 shrink-0">
                  <X size={10} className="text-white" />
                </div>
                <p className="text-xs font-bold text-red-600 leading-tight">{reviewError}</p>
              </div>
            )}

            {/* Champagne Gold Star Rating */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  className={`cursor-pointer transition-all duration-300 ${
                    star <= reviewData.rating 
                      ? "fill-[#D4AF37] text-[#D4AF37] scale-110 drop-shadow-lg" 
                      : "text-gray-200 hover:scale-125"
                  }`}
                  onClick={() => {
                    setReviewData({ ...reviewData, rating: star });
                    setReviewError(null);
                  }}
                />
              ))}
            </div>

            {/* Textarea - Inter Font */}
            <textarea
              disabled={isReviewSubmitting}
              className={`w-full p-[15px] bg-gray-50 border rounded-2xl text-sm font-sans outline-none focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[120px] transition-all ${
                reviewError ? 'border-red-200' : 'border-gray-200'
              }`}
              placeholder="Describe the magic of your visit..."
              value={reviewData.reviewText}
              onChange={(e) => {
                setReviewData({ ...reviewData, reviewText: e.target.value });
                if (reviewError) setReviewError(null);
              }}
            />

            {/* Pill Button with Gold Hover */}
            <button
              disabled={isReviewSubmitting}
              onClick={handlePostReview}
              className="w-full py-4 bg-slate-900 text-white rounded-full font-semibold text-sm tracking-[0.1em] shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all hover:bg-[#D4AF37] hover:shadow-xl"
            >
              {isReviewSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                "Share with the Community"
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- Reviews Modal (View All) --- */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white/80">
              <div>
                <h3 className="text-lg font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>All Reviews</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Page {reviewsCurrentPage} of {reviewsTotalPages}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={reviewsSortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
                <button
                  onClick={() => setIsReviewsModalOpen(false)}
                  className="p-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh] relative custom-scrollbar">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {allReviews.length > 0 ? (
                      allReviews.map((review: any, idx: number) => (
                        <div key={review.id || idx} className="bg-white/95 rounded-xl p-3 border border-white/10 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#D4AF37]">
                                  {review.userName?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{review.userName || 'Anonymous'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-500">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 leading-snug">{review.text || review.reviewText || 'No review text'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 italic" style={{ fontFamily: "'Playfair Display', serif" }}>No reviews yet.</p>
                      </div>
                    )}
                  </div>
                  {reviewsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-200/50">
                      <button
                        onClick={() => handleReviewsPageChange(reviewsCurrentPage - 1)}
                        disabled={reviewsCurrentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={18} className="text-gray-600 rotate-180" />
                      </button>
                      <span className="text-xs font-semibold text-gray-700">
                        Page {reviewsCurrentPage} of {reviewsTotalPages}
                      </span>
                      <button
                        onClick={() => handleReviewsPageChange(reviewsCurrentPage + 1)}
                        disabled={reviewsCurrentPage === reviewsTotalPages}
                        className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={18} className="text-gray-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}



      {/* --- Staff Detail Modal (with Sliding Images) --- */}
      {isStaffModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

            {/* Left/Top: Image Sliding Carousel */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative group">
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full md:hidden"
              >
                <X size={20} />
              </button>

              {selectedStaff.images?.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  className="h-full w-full"
                >
                  {selectedStaff.images.map((img: string, i: number) => (
                    <SwiperSlide key={i}>
                      <img
                        src={img.trim()}
                        alt={`${selectedStaff.name} - image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src={getDefaultStaffImage(selectedStaff.staff_id || selectedStaff.name || '')}
                  alt={selectedStaff.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Right: Details (Rest of the modal remains the same) */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto space-y-6">
              <div className="hidden md:flex justify-end">
                <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div>
                <Badge className="bg-[#1E4D8C] text-white mb-2">{selectedStaff.role}</Badge>
                <h2 className="text-3xl font-light">{selectedStaff.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="text-sm font-bold">{selectedStaff.rating?.average}</span>
                  <span className="text-slate-400 text-xs">({selectedStaff.rating?.reviewsCount} reviews)</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="w-4 h-4" /> <span>{selectedStaff.experienceYears} Years of Professional Experience</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4" /> <span>{selectedStaff.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4" /> <span>{selectedStaff.email}</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expertise & Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.expertise?.map((item: string, i: number) => (
                    <Badge key={i} variant="secondary" className="rounded-none bg-slate-100 text-slate-700 uppercase text-[9px]">{item}</Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic">Speaks: {selectedStaff.languages?.join(", ")}</p>
              </div>

              {selectedStaff.metadata?.certifications?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Certifications</h4>
                  <ul className="space-y-1">
                    {selectedStaff.metadata.certifications.map((cert: string, i: number) => (
                      <li key={i} className="text-xs flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" /> {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* --- Social Media Section --- */}
              {selectedStaff.instagramHandle && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Media</h4>
                  <a href={`https://instagram.com/${selectedStaff.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#E1306C]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.251 1.691-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    <span className="text-sm font-medium">{selectedStaff.instagramHandle}</span>
                  </a>
                </div>
              )}

              <Button className="w-full bg-black text-white h-12 rounded-none uppercase text-[10px] tracking-widest font-bold">
                Book with {selectedStaff.name.split(' ')[0]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}