import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Phone, Star, Heart, Share2,
  Mail, CheckCircle, X, Scissors, Loader2,
  Check,
  Navigation
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Badge } from "../../components/ui_components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui_components/tabs";
import { Loader } from "../../components/ui_components/Loader";
import { Card, CardContent } from "../../components/ui_components/card";

// API
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";

export default function SalonDetailPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const { apiRequest, apiCustomerpiPostReq } = useApi();

  const { userapiRequest, userapiPost } = usersalonApi()
  const navigate = useNavigate();

  const [salon, setSalon] = useState<any>(null);
  const [salonService, setSalonService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [salonStaff, setSalonStaff] = useState<any[]>([]);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const user = localStorage.getItem("authState");

  const parsedUser = user ? JSON.parse(user) : null;

  const isloggedin = parsedUser?.isAuthenticated;

  // const handleStaffClick = (staff: any) => {
  //   setSelectedStaff(staff);
  //   setIsStaffModalOpen(true);
  // };


  useEffect(() => {
    if (salonId) {
      fetchSalonById();
    }
  }, [salonId]);

  const fetchReviews = async () => {
    try {
      const res = await apiRequest<any>(`/reviews/reviews/SALON/${salonId}?page=1&limit=20`);
      if (res.data) setReviews(res.data);
    } catch (error) {
      console.error("Reviews fetch error:", error);
    }
  };

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

      const res = await userapiPost<any>(`/reviews/reviews`, payload, {});

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
    } catch (error) { console.error(error); }
  }

  const handleViewService = (service_id?: any) => {
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

  const handleWishList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!salonId) return;

    setIsFavorite(prev => !prev);
    const user = localStorage.getItem("authState");
    const parsedUser = user ? JSON.parse(user) : null;
    const userID = parsedUser?.user?.user?.id || parsedUser?.user?.id;

    try {
      const res = await apiCustomerpiPostReq(`/wishlist/${userID}/${salonId}`);


      if (res?.error) {
        throw new Error(res.error);
      }

      // Show the notification
      setNotification({
        message: "Added to wishlist",
        type: 'success'
      });

      // Auto-hide after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setIsFavorite(prev => !prev);
    }
  };

  if (!loading && !salon) return <div className="p-20 text-center font-light">Salon not found.</div>;

  const isOpen = checkIsOpen();



  const handleStaffClick = (staffId: string) => {
    navigate(`/salon/${salonId}/staff/${staffId}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      <Loader isVisible={loading || isReviewSubmitting} />

      {/* --- Floating Notification --- */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span className="text-sm font-bold uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

      {/* --- Floating Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Salon Details</span>
          <div className="flex gap-1">
            {isloggedin && (<button onClick={handleWishList} className={`p-2 rounded-full hover:bg-slate-50 transition-all ${isFavorite ? "text-red-500" : "text-slate-400"}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>)}
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* --- Hero Section --- */}
        <section className="relative h-[60vh] md:h-[75vh] w-full bg-slate-100">
          <Swiper modules={[Pagination, Autoplay, EffectFade]} effect="fade" pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salon?.branding?.coverImages?.length ? salon.branding.coverImages : ["/placeholder.svg"]).map((img: string, i: number) => (
              <SwiperSlide key={i}><img src={img.trim()} alt="Salon" className="w-full h-full object-cover" /></SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-8 md:p-16 z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white space-y-3">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] tracking-widest px-3 py-1">{salon?.salonType}</Badge>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">{salon?.salonName}</h1>
                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                  {/* <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-white text-white" /><span>{salon?.ratings?.average || "5.0"}</span></div> */}
                  <span className="opacity-50">•</span><span>{reviews?.length || "0"} Reviews</span>
                  <span className="opacity-50">•</span><span className="text-orange-300">{salon?.pricing?.priceRange}</span>
                </div>
              </div>
              {/* <Button className="bg-white text-black hover:bg-slate-100 rounded-none px-10 h-14 text-xs font-bold uppercase tracking-widest transition-all">Reserve Experience</Button> */}
            </div>
          </div>
        </section>

        {/* --- Content Body --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-16">
            <div>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">The Studio</h2>
              <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">{salon?.description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {salon?.expertise?.map((exp: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full px-4 py-1 text-slate-500 border-slate-200">{exp}</Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-100 h-auto p-0 gap-10">
                {["services", "stylists", "reviews"].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 data-[state=active]:text-black">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* SERVICES TAB */}
              <TabsContent value="services" className="pt-10">
                {salonService?.length > 0 ? (
                  <div className="grid gap-4">
                    {salonService.map((item: any, index: number) => (
                      <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.serviceName}</h4>
                              <div className="font-semibold text-accent-foreground">₹{item.price}</div>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button size="sm" className="ml-4 bg-slate-900" onClick={() => handleViewService(item?.service_id)}>Book Now</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : <div className="py-20 text-center"><Scissors className="w-8 h-8 text-slate-200 mx-auto mb-4" /><p className="text-sm text-slate-400">Digital Menu currently being updated.</p></div>}
              </TabsContent>

              {/* STYLISTS TAB */}
              <TabsContent value="stylists" className="pt-10">
                {salonStaff?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {salonStaff.map((staff: any) => (
                      <div
                        key={staff.staff_id}
                        onClick={() => handleStaffClick(staff.staff_id)}
                        className="group bg-slate-50 p-6 transition-all cursor-pointer hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 flex gap-6"
                      >
                        <div className="w-24 h-24 bg-slate-200 shrink-0 overflow-hidden">
                          {staff.images?.[0] ? (
                            <img
                              src={staff.images[0]}
                              alt={staff.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Scissors className="w-8 h-8 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-light">{staff.name}</h3>
                              <p className="text-[10px] font-bold text-[#1E4D8C] uppercase tracking-wider">{staff.role}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{staff.experienceYears} Years Exp</p>
                            </div>
                            {staff.rating?.average && (
                              <div className="flex items-center gap-1 text-xs font-bold">
                                <Star className="w-3 h-3 fill-slate-900" />
                                {staff.rating.average.toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.expertise?.slice(0, 2).map((exp: string, i: number) => (
                              <span key={i} className="text-[9px] bg-slate-200 px-2 py-0.5 rounded-full uppercase">{exp}</span>
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
              <TabsContent value="reviews" className="pt-10">
                <div className="space-y-12">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <div>
                      {/* <h3 className="text-4xl font-light">{salon?.ratings?.average || "5.0"}</h3> */}
                      {/* <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= Math.round(salon?.ratings?.average || 5) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                      </div> */}
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Based on {reviews.length} Reviews</p>
                    </div>
                    {isloggedin && (<Button variant="outline" className="rounded-none text-[10px] font-bold uppercase tracking-widest"
                      onClick={() => setIsReviewModalOpen(true)}>Write a Review</Button>)}
                  </div>

                  {reviews.length > 0 ? (
                    <div className="grid gap-10">
                      {reviews.map((rev, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{rev?.userName?.charAt(0).toUpperCase() || "U"}</div>
                              <div><h4 className="text-sm font-bold">{rev?.userName || "Customer"}</h4><p className="text-[10px] text-slate-400">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</p></div>
                            </div>
                            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= rev.rating ? "fill-slate-900 text-slate-900" : "text-slate-200"} />)}</div>
                          </div>
                          <p className="text-slate-600 font-light text-sm pl-13">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : <div className="py-20 text-center"><Star className="w-8 h-8 text-slate-200 mx-auto mb-4" /><p className="text-sm text-slate-400 italic">No reviews yet. Share your experience!</p></div>}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-10">
              <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                <h3 className="text-[11px] font-black text-[#1E4D8C] uppercase tracking-[0.3em] mb-10 border-b border-blue-100 pb-6">
                  Concierge
                </h3>
                <div className="space-y-8">
                  {/* Location & Directions */}
                  <div className="flex gap-5">
                    <MapPin className="w-5 h-5 shrink-0 text-[#1E4D8C]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Location</p>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed mb-3">
                        {salon?.address?.street},<br />
                        {salon?.address?.city}, {salon?.address?.state} - {salon?.address?.pincode}
                      </p>
                      {/* Added Directions Link */}
                      <a
                        href={salon?.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-[#1E4D8C] uppercase tracking-wider hover:underline"
                      >
                        <Navigation size={12} /> Get Directions
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-5">
                    <Clock className="w-5 h-5 shrink-0 text-[#1E4D8C]" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Hours</p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-800 font-medium">
                          {formatTime(salon?.timing?.openingTime)} — {formatTime(salon?.timing?.closingTime)}
                        </p>
                        {isOpen ?
                          <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black">OPEN</Badge> :
                          <Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-black">CLOSED</Badge>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-5">
                    <Phone className="w-5 h-5 shrink-0 text-[#1E4D8C]" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Direct Line</p>
                      <p className="text-sm text-slate-800 font-medium">{salon?.primaryPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Ownership Section */}
                <div className="mt-12 pt-10 border-t border-slate-200">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Managed By</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E4D8C] flex items-center justify-center text-white font-black text-xs">
                      {salon?.ownerName?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{salon?.ownerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium lowercase">{salon?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <a href={`tel:${salon?.primaryPhone}`} className="block">
                <Button className="w-full h-16 rounded-2xl bg-[#1E4D8C] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 hover:scale-[1.02] transition-all">
                  Contact Front Desk
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* --- Review Modal --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Rate {salon?.salonName}</h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message Alert */}
            {reviewError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="bg-red-500 rounded-full p-1 mt-0.5 shrink-0">
                  <X size={10} className="text-white" />
                </div>
                <p className="text-xs font-bold text-red-600 leading-tight">{reviewError}</p>
              </div>
            )}

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`cursor-pointer transition-all ${star <= reviewData.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-200"}`}
                  onClick={() => {
                    setReviewData({ ...reviewData, rating: star });
                    setReviewError(null); // Clear error when rating changes
                  }}
                />
              ))}
            </div>

            <textarea
              disabled={isReviewSubmitting}
              className={`w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[120px] transition-all ${reviewError ? 'border-red-200' : 'border-gray-100'}`}
              placeholder="Share your experience..."
              value={reviewData.reviewText}
              onChange={(e) => {
                setReviewData({ ...reviewData, reviewText: e.target.value });
                if (reviewError) setReviewError(null); // Clear error as they type
              }}
            />

            <button
              disabled={isReviewSubmitting}
              onClick={handlePostReview}
              className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
            >
              {isReviewSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting Review...</span>
                </>
              ) : (
                "Submit Review"
              )}
            </button>
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
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Scissors className="w-12 h-12 opacity-20" />
                </div>
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