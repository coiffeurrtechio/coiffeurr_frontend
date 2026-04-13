import React, { useEffect, useState } from "react";
import {
  Star, MapPin, Clock, Heart, Check, Calendar, Phone, X,
  ArrowLeft, Share2, ShieldCheck, Sparkles, ChevronRight, User as UserIcon, Loader2
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card";
import { Badge } from "../../components/ui_components/badge";
import { BookingLoader } from "../../components/ui_components/BookingLoader";
import { BookingRequestSuccess } from "../../components/Loaders/BookingRequestSuccess";

// API & Interfaces
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";
import type { salonSlots } from "../../Interfaces/SaloInterface";

const SalonService: React.FC = () => {
  const navigate = useNavigate();
  const { salonId, serviceId } = useParams();
  const { apiRequest, apiCustomerpiPost } = useApi();
  const { userapiPost } = usersalonApi();

  const location = useLocation();
  const service = location.state?.serviceData;

  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingrequestsend, setbookingrequestsend] = useState(false);
  const [bookingrequestsuccess, setbookingrequestsuccess] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [salonservicedata, setsalonservicedata] = useState<any>(service);
  const [salonserviceslotsdata, setsalonserviceslotsdata] = useState<salonSlots[]>([]);
  const [selectedslottime, setselectedslottime] = useState<string>("");

  // --- STAFF SELECTION STATE ---
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
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

  // --- Logic for Next 7 Days ---
  const nextSevenDays = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState<string>(nextSevenDays[0]);

  useEffect(() => {
    fetchService();
    // fetchReviews();
  }, []);

  useEffect(() => {
    if (isEditModalOpen && selectedDate) {
      fetchServiceSlots(selectedDate);
    }
  }, [selectedDate, isEditModalOpen]);

  // Auto-select staff if only one is available
  useEffect(() => {
    if (salonservicedata?.staff?.length === 1) {
      setSelectedStaffId(salonservicedata.staff[0].staff_id);
    }
  }, [salonservicedata]);

  const fetchService = async () => {
    try {
      const res = await apiRequest(`/salons/${salonId}/services/${serviceId}`);
      if (res.data) setsalonservicedata(res.data);
    } catch (error) { console.error(error); }
  };

  // const fetchReviews = async () => {
  //   try {
  //     const res = await apiRequest<any>(`/reviews/reviews/service/${serviceId}?page=1&limit=20`);
  //     if (res.data) setReviews(res.data);
  //   } catch (error) { console.error("Reviews fetch error:", error); }
  // };

  const fetchServiceSlots = async (dateParam: string) => {
    try {
      const res = await apiRequest<any>(`/salons/${salonId}/slots?date=${dateParam}&service_id=${serviceId}`);
      if (res.data && res.data.slots) {
        setsalonserviceslotsdata(res.data.slots);
      } else {
        setsalonserviceslotsdata([]);
      }
    } catch (error) {
      setsalonserviceslotsdata([]);
    }
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
      const res = await userapiPost<any>(`/reviews/reviews`, payload);

      if (res.status === 400 || res?.error) {
        setReviewError(res?.data?.detail || "An unexpected error occurred.");
        return;
      }

      if (res.data) {
        setReviewData({ ...reviewData, reviewText: "", rating: 5 });
        setIsReviewModalOpen(false);
        fetchReviews();
      }
    } catch (error: any) {
      setReviewError(error.response?.data?.detail || "Review failed.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const formatTo12Hour = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return minute === 0 ? `${h} ${ampm}` : `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const BookAppointment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!isloggedin) { navigate("/login"); return; }

    if (!selectedDate || !selectedslottime || !selectedStaffId) {
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
      const staffIdString = String(selectedStaffId || "");
      const dateString = String(selectedDate || "");
      const timeString = String(selectedslottime || "");
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

      const res = await apiCustomerpiPost(`/bookings`, data, {
        headers: {
          // "X-User-Id": userIdString,
          "Content-Type": "application/json",
        },
      });

      console.log("Booking Response:", res); // Debug log

      if (!res?.error) {
        setisEditModalOpen(false);
        setbookingrequestsuccess(true);
        setTimeout(() => setbookingrequestsuccess(false), 4000);
      } else {
        alert(res?.error || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setbookingrequestsend(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isloggedin) {
      navigate("/login");
      return;
    }

    const userId = parsedUser?.user?.user?.id || parsedUser?.user?.id;
    const newFavoriteStatus = !isFavorite;

    // Optimistic UI update
    setIsFavorite(newFavoriteStatus);

    try {
      // API Format: wishlist/{userId}/{salonId}
      const res = await userapiPost(`/wishlist/${userId}/${salonId}`, {
        // If your API requires a body, add it here; 
        // otherwise, the URL parameters handle the identification.
        serviceId: serviceId
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Show the notification
      setNotification({
        message: "Added to wishlist" ,
        type: 'success'
      });

      // Auto-hide after 3 seconds
      setTimeout(() => setNotification(null), 3000);

      console.log("Wishlist updated successfully");
    } catch (error) {
      console.error("Wishlist sync failed:", error);
      // Rollback UI state if the request fails
      setIsFavorite(!newFavoriteStatus);
      alert("Could not update wishlist. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">

      {/* --- Floating Notification --- */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span className="text-sm font-bold uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

      {/* --- Minimal Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Service Curated</span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist();
              }}
              className="p-2 hover:bg-slate-50 rounded-full transition-all group"
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-slate-300 group-hover:text-slate-600"
                  }`}
              />
            </button>          </div>
        </div>
      </nav>

      <div className="pt-16 lg:pt-0 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* --- Left Hero Section --- */}
        <section className="relative h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-slate-100">
          <img src={salonservicedata?.imageUrl} alt="Service Detail" className="w-full h-full object-cover" />
          <div className="absolute bottom-10 left-10 z-10 hidden lg:block">
            <Badge className="bg-white/20 backdrop-blur-lg border-none text-white text-[10px] tracking-[0.2em] px-4 py-2 uppercase font-black">
              Premium Quality Assured
            </Badge>
          </div>
        </section>

        {/* --- Right Content Section --- */}
        <section className="px-6 py-12 lg:px-20 lg:py-32 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-12">

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-light tracking-tight text-balance leading-tight">
                {salonservicedata?.serviceName || "Luxury Experience"}
              </h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  <div className="text-3xl font-light text-slate-900">₹{salonservicedata?.price}</div>
                  {/* <Star className="w-4 h-4 fill-slate-900 text-slate-900" /> */}
                  {/* <span>{salonservicedata?.rating?.average}</span> */}
                  {/* <span className="text-slate-400 font-light">({reviews.length} Reviews)</span> */}
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <Clock className="w-4 h-4" />
                  <span>{salonservicedata?.durationMinutes} Minutes</span>
                </div>
              </div>
              {/* <div className="text-3xl font-light text-slate-900">₹{salonservicedata?.price}</div> */}
            </div>

            <hr className="border-slate-100" />

            {/* --- Description --- */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">The Experience</h3>
              <p className="text-lg text-slate-600 font-light leading-relaxed">
                {salonservicedata?.description || "Experience top-tier grooming tailored to your style."}
              </p>
            </div>

            {/* --- NEW: Staff Display on Main Page --- */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Meet the Professionals</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                {salonservicedata?.staff?.map((person: any) => (
                  <div
                    key={person.staff_id}
                    className="flex flex-col items-center min-w-[100px] space-y-3 group cursor-default"
                    onClick={() => navigate(`/salon/${salonId}/staff/${person?.staff_id}`)}
                  >
                    <div className="relative">
                      <img
                        src={person.image_url || "/placeholder-user.png"}
                        alt={person.name}
                        className="w-20 h-20 rounded-full object-cover ring-1 ring-slate-100 group-hover:ring-slate-900 transition-all duration-300"
                      />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-50 flex items-center gap-1">
                        <Star size={8} className="fill-slate-900 text-slate-900" />
                        <span className="text-[9px] font-black">{person.rating?.average || "5.0"}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter truncate w-24">
                        {person.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Stylist</p>
                    </div>
                  </div>
                ))}
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

            <div className="pt-8">
              <Button onClick={() => setisEditModalOpen(true)} className="w-full h-16 bg-slate-900 text-white rounded-none hover:bg-slate-800 text-xs font-bold uppercase tracking-[0.3em]">
                Reserve Appointment
              </Button>
            </div>

          </div>
        </section>
      </div>

      {/* --- BOOKING MODAL (Staff + Date + Time) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setisEditModalOpen(false)} />
          <BookingLoader isVisible={bookingrequestsend} salonName={salonservicedata?.salonName} />

          <Card className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] lg:rounded-none border-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-light tracking-tight text-gray-900">Finalize Booking</CardTitle>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Professional Stylists & Slots</p>
              </div>
              <button onClick={() => setisEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </CardHeader>

            <CardContent className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">

              {/* 1. STAFF SELECTION */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D8C]">1. Select Professional</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {salonservicedata?.staff?.map((person: any) => (
                    <button
                      key={person.staff_id}
                      onClick={() => setSelectedStaffId(person.staff_id)}
                      className={`flex flex-col items-center min-w-[120px] p-4 transition-all border rounded-2xl
                        ${selectedStaffId === person.staff_id
                          ? "bg-blue-50 border-[#1E4D8C] ring-1 ring-[#1E4D8C] shadow-md"
                          : "bg-white border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="relative mb-3">
                        <img
                          src={person.image_url || "/placeholder-user.png"}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        {selectedStaffId === person.staff_id && (
                          <div className="absolute -top-1 -right-1 bg-[#1E4D8C] text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-black text-gray-800 truncate w-full text-center capitalize">{person.name}</span>
                      <div className="flex items-center gap-1 mt-1 opacity-70">
                        <Star size={8} className="fill-orange-400 text-orange-400" />
                        <span className="text-[9px] font-bold">{person.rating?.average || "5.0"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DATE PICKER */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D8C]">2. Pick a Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {nextSevenDays.map((dateStr, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedDate(dateStr); setselectedslottime(""); }}
                      className={`flex flex-col items-center justify-center min-w-[75px] h-20 transition-all border rounded-xl
                        ${selectedDate === dateStr ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"}`}
                    >
                      <span className="text-[9px] uppercase font-black tracking-tighter mb-1">
                        {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-light tracking-tighter">{new Date(dateStr).getDate()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. TIME SLOTS */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D8C]">3. Choose Time</h3>
                <div className="grid grid-cols-3 gap-3 pb-4">
                  {salonserviceslotsdata.length > 0 ? (
                    salonserviceslotsdata.map((slot: any, index) => {
                      const isAvailable = slot?.availableCapacity > 0;
                      const isSelected = selectedslottime === slot.time;
                      return (
                        <button
                          key={index}
                          disabled={!isAvailable}
                          onClick={() => setselectedslottime(slot.time)}
                          className={`py-4 text-[10px] font-black uppercase tracking-widest transition-all border rounded-xl
                            ${!isAvailable ? "opacity-20 cursor-not-allowed bg-slate-50 border-transparent" :
                              isSelected ? "bg-[#1E4D8C] border-[#1E4D8C] text-white shadow-md" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"}`}
                        >
                          {formatTo12Hour(slot.time)}
                        </button>
                      );
                    })
                  ) : <div className="col-span-full py-8 text-center text-slate-300 text-sm italic">No slots available for this date.</div>}
                </div>
              </div>

              <Button
                type="button"
                disabled={!selectedslottime || !selectedStaffId}
                onClick={BookAppointment}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl disabled:opacity-20 text-xs font-bold uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                Confirm Appointment
              </Button>
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

      <BookingRequestSuccess isVisible={bookingrequestsuccess} salonName={salonservicedata?.salonName || ""} />
    </main>
  );
};

export default SalonService;