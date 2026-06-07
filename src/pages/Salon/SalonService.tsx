import React, { useEffect, useState } from "react";
import {
  Star, Clock, Check, X,
  ArrowLeft, Loader2
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card";
import { BookingLoader } from "../../components/ui_components/BookingLoader";
import { BookingRequestSuccess } from "../../components/Loaders/BookingRequestSuccess";

// API & Interfaces
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";
import { useToast } from "../../components/Toast";
import { getDefaultServiceImage, getDefaultStaffImage } from "../../utils/defaultServiceImage";

const SalonService: React.FC = () => {
  const navigate = useNavigate();
  const { salonId, serviceId } = useParams();
  const { apiRequest, apiCustomerpiPost } = useApi();
  const { userapiPost } = usersalonApi();
  const { showToast } = useToast();

  const location = useLocation();
  const service = location.state?.serviceData;

  const [bookingrequestsend, setbookingrequestsend] = useState(false);
  const [bookingrequestsuccess, setbookingrequestsuccess] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState<boolean>(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const [salonservicedata, setsalonservicedata] = useState<any>(service);
  const [salonData, setSalonData] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Reviews State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    reviewText: "",
    targetType: "service"
  });

  const authState = localStorage.getItem("authState");
  const parsedUser = authState ? JSON.parse(authState) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // --- Logic for Next 10 Days ---
  const nextTenDays = [...Array(10)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // --- MAIN PAGE SELECTION STATE ---
  const [mainPageSelectedStaffId, setMainPageSelectedStaffId] = useState<string>("");
  const [mainPageSelectedDate, setMainPageSelectedDate] = useState<string>("");
  const [mainPageSelectedTime, setMainPageSelectedTime] = useState<string>("");
  const [mainPageSelectedSlotTime, setMainPageSelectedSlotTime] = useState<string>("");
  
  // --- GUIDED FLOW STATE ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const dateSectionRef = React.useRef<HTMLDivElement>(null);
  const timeSectionRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchService();
    fetchSalon();
    // Restore booking state if user was redirected from login
    const pendingState = sessionStorage.getItem('pendingBookingState');
    if (pendingState) {
      try {
        const state = JSON.parse(pendingState);
        if (state.salonId === salonId && state.serviceId === serviceId) {
          setMainPageSelectedStaffId(state.mainPageSelectedStaffId);
          setMainPageSelectedDate(state.mainPageSelectedDate);
          setMainPageSelectedTime(state.mainPageSelectedTime);
          setMainPageSelectedSlotTime(state.mainPageSelectedSlotTime);
          // Clear the saved state after restoring
          sessionStorage.removeItem('pendingBookingState');
        }
      } catch (error) {
        console.error('Error restoring booking state:', error);
      }
    }
  }, []);

  // Fetch available slots when date or staff changes
  useEffect(() => {
    if (mainPageSelectedDate) {
      fetchAvailableSlots(mainPageSelectedDate);
    }
  }, [mainPageSelectedDate, mainPageSelectedStaffId]);

  // Handle step progression
  useEffect(() => {
    if (mainPageSelectedStaffId && currentStep === 1) {
      setCurrentStep(2);
      setTimeout(() => {
        dateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [mainPageSelectedStaffId, currentStep]);

  useEffect(() => {
    if (mainPageSelectedDate && currentStep === 2) {
      setCurrentStep(3);
      setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [mainPageSelectedDate, currentStep]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      let url = `/salons/${salonId}/slots?date=${date}&service_id=${serviceId}`;
      // Pass staff_id if a staff is selected to filter slots for that specific artist
      if (mainPageSelectedStaffId) {
        url += `&staff_id=${mainPageSelectedStaffId}`;
      }
      const res = await apiRequest(url);
      if (res?.data?.slots) {
        setAvailableSlots(res.data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      setAvailableSlots([]);
    }
  };

  // Format time from "10:00" to "10:00 AM"
  const formatTimeTo12Hour = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return minute === 0 ? `${h} ${ampm}` : `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const fetchService = async () => {
    try {
      const res = await apiRequest(`/salons/${salonId}/services/${serviceId}`);
      if (res.data) setsalonservicedata(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchSalon = async () => {
    try {
      const res = await apiRequest(`/salons/${salonId}`);
      if (res.data) {
        console.log('Salon data:', res.data);
        setSalonData(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const handlePostReview = async () => {
    if (!reviewData.reviewText.trim()) return alert("Please write a review.");
    setIsReviewSubmitting(true);
    setReviewError(null);
    try {
      const payload = {
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        targetType: "SERVICE",
        targetId: serviceId
      };
      const res = await userapiPost<any>(`/reviews`, payload);

      if (res.status === 400 || res?.error) {
        setReviewError(res?.data?.detail || "An unexpected error occurred.");
        return;
      }

      if (res.data) {
        setReviewData({ ...reviewData, reviewText: "", rating: 5 });
        setIsReviewModalOpen(false);
      }
    } catch (error: any) {
      setReviewError(error.response?.data?.detail || "Review failed.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    // Save booking state before redirecting to login
    sessionStorage.setItem('pendingBookingState', JSON.stringify({
      salonId,
      serviceId,
      mainPageSelectedStaffId,
      mainPageSelectedDate,
      mainPageSelectedTime,
      mainPageSelectedSlotTime,
      returnUrl: location.pathname
    }));
    setShowLoginRequiredModal(false);
    navigate("/login");
  };

  const BookAppointment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!isloggedin) {
      setShowLoginRequiredModal(true);
      return;
    }

    if (!mainPageSelectedDate || !mainPageSelectedSlotTime || !mainPageSelectedStaffId) {
      alert("Please select a Stylist, Date and Time slot.");
      return;
    }

    try {
      setbookingrequestsend(true);
      const userid = parsedUser?.user?.user?.id || parsedUser?.user?.id;

      // Ensure all values are properly stringified for iOS compatibility
      const userIdString = String(userid || "");
      const salonIdString = String(salonId || "");
      const serviceIdString = String(salonservicedata?.service_id || serviceId || "");
      const staffIdString = String(mainPageSelectedStaffId || "");
      const dateString = String(mainPageSelectedDate || "");
      const timeString = String(mainPageSelectedSlotTime || "");
      const priceNumber = Number(salonservicedata?.price || 0) || 0;

      // Ensure no undefined/null values in request body
      const data = {
        userId: userIdString,
        salonId: salonIdString,
        service_id: serviceIdString,
        staffId: staffIdString,
        slot: {
          date: dateString,
          time: timeString
        },
        price: priceNumber,
      };

      console.log("Booking Data:", data); // Debug log for iOS troubleshooting

      const res = await apiCustomerpiPost(`/bookings/`, data);

      console.log("Booking Response:", res); // Debug log

      if (!res?.error) {
        setisEditModalOpen(false);
        setbookingrequestsuccess(true);
        setTimeout(() => {
          setbookingrequestsuccess(false);
          navigate("/bookings");
        }, 2000);
      } else {
        showToast({
          type: 'error',
          title: 'Booking Failed',
          message: res?.error || "Booking failed. Please try again."
        });
      }
    } catch (error) {
      console.error("Booking Error:", error);
      showToast({
        type: 'error',
        title: 'Booking Failed',
        message: "Booking failed. Please try again."
      });
    } finally {
      setbookingrequestsend(false);
    }
  };

  
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">

      {/* --- Minimal Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Service Curated</span>
          <div />
        </div>
      </nav>

      <div className="pt-16 lg:pt-0 min-h-screen">
        {/* --- Content Section --- */}
        <section className="px-6 py-8 lg:px-10 lg:py-32 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-6">

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img
                    src={salonservicedata?.imageUrl || getDefaultServiceImage(salonservicedata?.serviceName || '')}
                    alt="Service"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getDefaultServiceImage(salonservicedata?.serviceName || ''); }}
                  />
                </div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-balance leading-tight pt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {salonservicedata?.serviceName || "Luxury Experience"}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm bg-slate-50 border border-slate-100 rounded-full px-4 py-2 inline-flex">
                <span className="text-lg font-light text-slate-900 self-center" style={{ fontFamily: 'Playfair Display, serif' }}>₹{salonservicedata?.price}</span>
                <div className="h-4 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{salonservicedata?.durationMinutes} MINS</span>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">PREMIUM QUALITY</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- NEW: Staff Display on Main Page --- */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">1. Choose Your Professional</h3>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-2 px-2 relative after:absolute after:right-0 after:top-0 after:bottom-4 after:w-8 after:bg-gradient-to-l after:from-white after:to-transparent">
                {salonservicedata?.staff?.map((person: any, index: number) => {
                  const isSelected = mainPageSelectedStaffId === person.staff_id;
                  return (
                    <div
                      key={person.staff_id}
                      className={`relative flex flex-col items-center flex-shrink-0 w-24 p-2 rounded-2xl border transition-all duration-300 cursor-pointer group animate-in slide-in-from-bottom-4 fade-in duration-500
                        ${isSelected 
                          ? "border-amber-500/40 bg-amber-50/20 shadow-lg scale-105" 
                          : "border-transparent opacity-60 hover:border-slate-200 hover:opacity-100"}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setMainPageSelectedStaffId(person.staff_id)}
                    >
                      <div className={`w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ${isSelected ? 'border-2 border-amber-500' : ''}`}>
                        <img
                          src={person.image_url || getDefaultStaffImage(person.staff_id || person.name || '')}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 mt-2">{person.name}</span>
                      {isSelected && (
                        <span className="text-[8px] font-mono tracking-wider uppercase text-amber-600 mt-0.5">Selected</span>
                      )}
                      {!isSelected && (
                        <div className="flex items-center gap-1">
                          <Star size={8} className="fill-orange-400 text-orange-400" />
                          <span className="text-[9px] font-bold text-slate-600">{person.rating?.average || "5.0"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- Date Selection on Main Page --- */}
            <div ref={dateSectionRef} className={`space-y-4 transition-all duration-500 ${currentStep < 2 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">2. Choose Your Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-2 px-2">
                {nextTenDays.map((dateStr, index) => {
                  const date = new Date(dateStr);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNumber = date.getDate();
                  const isSelected = mainPageSelectedDate === dateStr;
                  return (
                    <button
                      key={index}
                      onClick={() => setMainPageSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-20 transition-all border rounded-xl
                        ${isSelected 
                          ? "bg-[#1a1a1a] border-[#1a1a1a] text-[#D4AF37] shadow-lg scale-105" 
                          : "bg-white/60 backdrop-blur-sm border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">{dayName}</span>
                      <span className="text-2xl font-light">{dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Time Selection on Main Page --- */}
            <div ref={timeSectionRef} className={`space-y-4 transition-all duration-500 ${currentStep < 3 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">3. Choose Your Time</h3>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-2 px-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot: any, index: number) => {
                    // New format: slot has staff array with availability
                    const staffList = slot?.staff || [];
                    const isAvailable = slot?.hasAvailableStaff || staffList.some((s: any) => s.available);
                    const formattedTime = formatTimeTo12Hour(slot.time);
                    const isSelected = mainPageSelectedTime === formattedTime;
                    return (
                      <button
                        key={index}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) {
                            setMainPageSelectedTime(formattedTime);
                            setMainPageSelectedSlotTime(slot.time);
                          }
                        }}
                        className={`px-4 py-2 lg:px-6 lg:py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 whitespace-nowrap
                          ${!isAvailable 
                            ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200" 
                            : isSelected 
                              ? "bg-slate-900 text-white shadow-lg scale-105" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent hover:border-slate-300"}`}
                      >
                        {formattedTime}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-8 text-slate-400 text-sm italic">
                    Select a date to see available time slots
                  </div>
                )}
              </div>
            </div>

            {/* --- Included Items (Conditional) --- */}
            {salonservicedata?.includedItems?.length > 0 && (
              <div className="bg-slate-50 p-8 rounded-none border-l-4 border-slate-900">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Included in Package</h3>
                <ul className="space-y-4">
                  {salonservicedata?.includedItems?.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <Check className="w-4 h-4 text-slate-900 mt-1 shrink-0" />
                      <span className="text-sm text-slate-600 font-light group-hover:text-black transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-8 pb-24">
              {/* --- Description (THE EXPERIENCE) - Moved to bottom --- */}
              <div className="space-y-2 pt-8 border-t border-slate-100">
                <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">The Experience</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                  A signature session tailored to your unique aesthetic.
                </p>
              </div>
            </div>

            
          </div>
        </section>
      </div>

      {/* --- BOOKING MODAL (Confirmation Only) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setisEditModalOpen(false)} />
          <BookingLoader isVisible={bookingrequestsend} salonName={salonservicedata?.salonName} />

          <Card className="relative w-full max-w-md bg-white backdrop-blur-xl rounded-t-[2rem] lg:rounded-[2rem] border-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardHeader className="p-8 pb-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <CardTitle className="text-3xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Confirm Booking
                </CardTitle>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                  Review your appointment
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">

              {/* LUXURY RECEIPT CARD */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                
                {/* Receipt Rows */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional</span>
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {salonservicedata?.staff?.find((s: any) => s.staff_id === mainPageSelectedStaffId)?.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</span>
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {new Date(mainPageSelectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</span>
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {mainPageSelectedTime}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Salon</span>
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {salonData?.name || salonData?.salonName || salonData?.salon_name || salonservicedata?.salonName || salonservicedata?.salon_name || salonservicedata?.name || 'Salon'}
                    </span>
                  </div>
                </div>

                {/* Dotted Separator */}
                <div className="border-t-2 border-dotted border-slate-300 my-4" />

                {/* Total Amount */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                  <span className="text-2xl font-light text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                    ₹{salonservicedata?.price}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                type="button"
                onClick={BookAppointment}
                className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                Confirm Appointment
              </Button>

              {/* Back Link */}
              <button
                type="button"
                onClick={() => setisEditModalOpen(false)}
                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-300 inline-block"
              >
                ← Go Back
              </button>

            </CardContent>
          </Card>
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Rate Service</h3>
              <button onClick={() => { setIsReviewModalOpen(false); setReviewError(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            {reviewError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black uppercase text-red-600 tracking-wider">
                {reviewError}
              </div>
            )}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  className={`cursor-pointer transition-all ${star <= reviewData.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-100"}`}
                  onClick={() => { setReviewData({ ...reviewData, rating: star }); setReviewError(null); }}
                />
              ))}
            </div>
            <textarea
              disabled={isReviewSubmitting}
              className="w-full p-5 bg-gray-50 border-none rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-50 min-h-[140px]"
              placeholder="How was your experience?"
              value={reviewData.reviewText}
              onChange={(e) => { setReviewData({ ...reviewData, reviewText: e.target.value }); if (reviewError) setReviewError(null); }}
            />
            <button
              disabled={isReviewSubmitting}
              onClick={handlePostReview}
              className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center"
            >
              {isReviewSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* --- LOGIN REQUIRED MODAL --- */}
      {showLoginRequiredModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Login Required</h3>
              <button onClick={() => setShowLoginRequiredModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              Please login to make your reservation. Your selections will be saved and restored after login.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLoginRedirect}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                Login to Continue
              </Button>
              <Button
                onClick={() => setShowLoginRequiredModal(false)}
                variant="outline"
                className="w-full py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <BookingRequestSuccess isVisible={bookingrequestsuccess} salonName={salonservicedata?.salonName || ""} />

      {/* --- DYNAMIC FOOTER: STEPPER TRANSFORMS TO CONFIRM BUTTON --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 p-4">
        <div className="max-w-md mx-auto space-y-2">

          {/* Clean Header */}
          <div className="text-center">
            <span className="font-mono text-[9px] tracking-[0.3em] text-slate-400 uppercase">Booking Sequence</span>
          </div>

          <div className="relative h-12 flex items-center justify-center">
            {/* Progress Stepper */}
            <div id="footer-stepper" className={`flex items-center justify-center gap-3 transition-all duration-300 ease-in-out ${mainPageSelectedStaffId && mainPageSelectedDate && mainPageSelectedSlotTime ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
              <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${mainPageSelectedStaffId ? 'text-slate-900' : 'text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${mainPageSelectedStaffId ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mainPageSelectedStaffId ? '✓' : '1'}
                </span>
                PROF
              </div>
              <span className="w-4 h-[1px] bg-slate-200"></span>
              <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${mainPageSelectedDate ? 'text-slate-900' : 'text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${mainPageSelectedDate ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mainPageSelectedDate ? '✓' : '2'}
                </span>
                DATE
              </div>
              <span className="w-4 h-[1px] bg-slate-200"></span>
              <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${mainPageSelectedSlotTime ? 'text-slate-900' : 'text-slate-400'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${mainPageSelectedSlotTime ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mainPageSelectedSlotTime ? '✓' : '3'}
                </span>
                TIME
              </div>
            </div>

            {/* Confirm Button */}
            <button
              id="footer-confirm-btn"
              onClick={() => setisEditModalOpen(true)}
              className={`absolute inset-0 w-full bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-mono tracking-[0.2em] uppercase rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${mainPageSelectedStaffId && mainPageSelectedDate && mainPageSelectedSlotTime ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-12 opacity-0 pointer-events-none'}`}
            >
              Confirm Booking
            </button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default SalonService;