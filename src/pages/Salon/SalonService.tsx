import React, { useEffect, useState } from "react";
import {
  Star, MapPin, Clock, Heart, Check, Calendar, Phone, X,
  ArrowLeft, Share2, ShieldCheck, Sparkles, ChevronRight
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card";
import { Badge } from "../../components/ui_components/badge";
import { BookingLoader } from "../../components/ui_components/BookingLoader";
import { BookingRequestSuccess } from "../../components/Loaders/BookingRequestSuccess";

// API & Interfaces
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import type { salonSlots } from "../../Interfaces/SaloInterface";

// Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SalonService: React.FC = () => {
  const navigate = useNavigate();
  const { salonId, serviceId } = useParams();
  const { apiRequest, apiCustomerpiPost } = useApi();

  const location = useLocation();
  const service = location.state?.serviceData;

  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingrequestsend, setbookingrequestsend] = useState(false);
  const [bookingrequestsuccess, setbookingrequestsuccess] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState<boolean>(false);

  const [salonservicedata, setsalonservicedata] = useState<any>(service);
  const [salonserviceslotsdata, setsalonserviceslotsdata] = useState<salonSlots[]>([]);
  const [selectedslottime, setselectedslottime] = useState<string>("");

  // --- Logic for Next 7 Days ---
  const nextSevenDays = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0]; // Format: "2026-02-12"
  });

  const [selectedDate, setSelectedDate] = useState<string>(nextSevenDays[0]);

  // Fetch slots whenever the selectedDate changes while modal is open
  useEffect(() => {
    fetchService();
  }, []); // Empty dependency array means this runs once on mount

  // 2. Fetch Slots - ONLY when Modal is open and Date changes
  useEffect(() => {
    if (isEditModalOpen && selectedDate) {
      fetchServiceSlots(selectedDate);
    }
  }, [selectedDate, isEditModalOpen]);

  const fetchService = async () => {
    try {
      const res = await apiRequest(`/salons/${salonId}/services/${serviceId}`);
      if (res.data) setsalonservicedata(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchServiceSlots = async (dateParam: string) => {
    try {
      // implementation changed to pass date correctly in params
      const res = await apiRequest<any[]>(`/salons/${salonId}/slots?date=${dateParam}&service_id=${serviceId}`);
      if (res.data && res.data.slots) {
        setsalonserviceslotsdata(res.data.slots);
      } else {
        setsalonserviceslotsdata([]);
      }
    } catch (error) {
      console.error(error);
      setsalonserviceslotsdata([]);
    }
  };

  const formatTo12Hour = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return minute === 0 ? `${h} ${ampm}` : `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const BookAppointment = async (e: any) => {
  e.preventDefault();
  if (!selectedDate || !selectedslottime) return;

  try {
    setbookingrequestsend(true);

    // 1. Get User ID from localStorage
    const authData = localStorage.getItem("authState");
    const parsedAuth = authData ? JSON.parse(authData) : null;
    const userid = parsedAuth?.user?.user?.id || parsedAuth?.user?.id;

    if (!userid) {
      console.error("User not authenticated");
      return;
    }

    // 2. Construct the Payload based on Swagger requirements
    const data = {
      userId: userid,
      salonId: salonId,
      service_id: salonservicedata?.serviceCode || serviceId, 
      slot: {
        date: selectedDate, // "2026-02-12"
        time: selectedslottime, // "14:00"
      },
      price: Number(salonservicedata?.price),
    };

    // 3. API Call with Header
    // IMPORTANT: Check if your apiCustomerpiPost accepts a 3rd argument for options/headers
    const res = await apiCustomerpiPost(`/bookings`, data, {
      headers: {
        "X-User-Id": userid,
        "Content-Type": "application/json"
      }
    });

    if (!res.error) {
      setisEditModalOpen(false);
      setbookingrequestsuccess(true);
      setTimeout(() => setbookingrequestsuccess(false), 4000);
    }
  } catch (error) {
    console.error("Booking Error:", error);
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
          <div className="flex gap-2">
            <Heart onClick={() => setIsFavorite(!isFavorite)} className={`w-5 h-5 cursor-pointer ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-300"}`} />
            <Share2 className="w-5 h-5 text-slate-300 cursor-pointer" />
          </div>
        </div>
      </nav>

      <div className="pt-16 lg:pt-0 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* --- Left: Visual Experience (Hero Gallery) --- */}
        <section className="relative h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-slate-100">
          {/* <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="h-full w-full"
          >
            {(salonservicedata?.saloninfoDTO?.images?.length > 0
              ? salonservicedata.saloninfoDTO.images
              : ["/placeholder.svg"]
            ).map((img: string, i: number) => (
              <SwiperSlide key={i}> */}
          <img src={salonservicedata?.imageUrl} alt="Service Detail" className="w-full h-full object-cover" />
          {/* </SwiperSlide>
            ))}
          </Swiper> */}

          <div className="absolute bottom-10 left-10 z-10 hidden lg:block">
            <Badge className="bg-white/20 backdrop-blur-lg border-none text-white text-[10px] tracking-widest px-4 py-2 uppercase">
              Premium Quality Assured
            </Badge>
          </div>
        </section>

        {/* --- Right: Service Details & Booking --- */}
        <section className="px-6 py-12 lg:px-20 lg:py-32 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-12">

            {/* Header Info */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-light tracking-tight text-balance leading-tight">
                {salonservicedata?.serviceName || "Luxury Experience"}
              </h1>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span>4.9</span>
                  <span className="text-slate-400 font-light">(127 Reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{salonservicedata?.durationMinutes} Minutes</span>
                </div>
              </div>

              <div className="text-3xl font-light text-slate-900">
                ₹{salonservicedata?.price || "000"}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">The Experience</h3>
              <div className="space-y-4">
                {/* {salonservicedata?.descriptions?.map((desc: any, i: number) => ( */}
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  {salonservicedata?.description}
                </p>
                {/* ))} */}
              </div>
            </div>

            {/* Inclusions Card */}
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

            {/* Sticky Action Button */}
            <div className="pt-8">
              <Button
                onClick={() => setisEditModalOpen(true)}
                className="w-full h-16 bg-slate-900 text-white rounded-none hover:bg-slate-800 text-xs font-bold uppercase tracking-[0.3em] transition-all"
              >
                Reserve Appointment
              </Button>
              <div className="flex items-center justify-center gap-4 mt-6 text-slate-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-medium">Secure Checkout & Expert Staff</span>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* --- Slot Selection Modal (The Classy Overlay) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setisEditModalOpen(false)} />

          <BookingLoader isVisible={bookingrequestsend} salonName={salonservicedata?.saloninfoDTO?.heading} />

          <Card className="relative w-full max-w-2xl bg-white rounded-t-3xl lg:rounded-none border-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-light tracking-tight">Select your time</CardTitle>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Available Slots</p>
              </div>
              <button onClick={() => setisEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Date Selector - Implementation changed to nextSevenDays */}
              <div className="space-y-4">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {nextSevenDays.map((dateStr, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedDate(dateStr); setselectedslottime(""); }}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-20 transition-all border
                        ${selectedDate === dateStr ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"}`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-tighter mb-1">
                        {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-light tracking-tighter">
                        {new Date(dateStr).getDate()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[30vh] overflow-y-auto pr-2">
                {salonserviceslotsdata.length > 0 ? (
                  salonserviceslotsdata.map((slot: any, index) => {
                    const isAvailable = slot?.availableCapacity > 0;

                    return (
                      <button
                        key={index}
                        disabled={!isAvailable}
                        onClick={() => setselectedslottime(slot.time)}
                        className={`py-4 text-xs font-bold uppercase tracking-widest transition-all border
            ${!isAvailable
                            ? "bg-slate-50 text-slate-200 cursor-not-allowed border-transparent"
                            : selectedslottime === slot.time
                              ? "bg-[#1E4D8C] border-[#1E4D8C] text-white shadow-lg"
                              : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                          }`}
                      >
                        {formatTo12Hour(slot.time)}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-10 text-center text-slate-300 text-sm font-light italic">
                    No slots available for this date.
                  </div>
                )}
              </div>

              <Button
                disabled={!selectedslottime}
                onClick={BookAppointment}
                className="w-full h-16 bg-slate-900 text-white rounded-none disabled:opacity-20 text-xs font-bold uppercase tracking-[0.2em]"
              >
                Confirm & Pay ₹{salonservicedata?.price}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <BookingRequestSuccess
        isVisible={bookingrequestsuccess}
        salonName={salonservicedata?.saloninfoDTO?.heading || ""}
      />
    </main>
  );
};

export default SalonService;