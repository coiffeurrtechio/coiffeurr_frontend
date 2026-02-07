import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Clock, Phone, Star, Heart, Share2, 
  Mail, CheckCircle, Award, ChevronRight, Scissors 
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Badge } from "../../components/ui_components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui_components/tabs";
import { Loader } from "../../components/ui_components/Loader";
import NoServicesAvailable from "../../components/NoServicesAvailable";

// API & Interfaces
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import type { Salon } from "../../Interfaces/SaloInterface";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function SalonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { apiRequest } = useApi();
  const navigate = useNavigate();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchSalonById();
  }, [id]);

  const handleViewService = (serviceId?: number) => {
    if (serviceId == null) return;
    navigate(`/salon/${salon?.id}/service/${serviceId}`);
  };

  const fetchSalonById = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<Salon>(`/salon/${id}`);
      if (res.data) setSalon(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && !salon) return <div className="p-20 text-center font-light">Salon not found.</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      <Loader isVisible={loading} />

      {/* --- Elegant Floating Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Salon Details</span>
          <div className="flex gap-1">
            <button onClick={() => setIsFavorite(!isFavorite)} className={`p-2 rounded-full hover:bg-slate-50 transition-all ${isFavorite ? "text-red-500" : "text-slate-400"}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* --- Full-Width Visual Hero --- */}
        <section className="relative h-[60vh] md:h-[75vh] w-full bg-slate-100">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="h-full w-full"
          >
            {(salon?.images?.length ? salon.images : ["/placeholder.svg"]).map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt="Salon" className="w-full h-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-8 md:p-16 z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white space-y-3">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] tracking-widest px-3 py-1">
                  {salon?.salonType}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">{salon?.salonName}</h1>
                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>{salon?.rating || "4.9"}</span>
                  </div>
                  <span className="opacity-50">•</span>
                  <span>{salon?.reviews || "120"} Reviews</span>
                </div>
              </div>
              <Button className="bg-white text-black hover:bg-slate-100 rounded-none px-10 h-14 text-xs font-bold uppercase tracking-widest transition-all">
                Reserve Experience
              </Button>
            </div>
          </div>
        </section>

        {/* --- Content Body --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Detailed Information */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* About Section */}
            <div>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">The Studio</h2>
              <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
                {salon?.description || "A curation of style, wellness, and luxury. We specialize in transforming your personal aesthetic with precision and care."}
              </p>
            </div>

            {/* Menu / Tabs */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-100 h-auto p-0 gap-10">
                {["services", "stylists", "reviews"].map((tab) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab} 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 data-[state=active]:text-black"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="services" className="pt-10 space-y-0 divide-y divide-slate-100">
                {salon?.salonServices?.map((service, idx) => (
                  <div
                    onClick={() => handleViewService(service?.serviceID)}
                  key={idx} className="group flex items-center justify-between py-8 hover:px-4 transition-all duration-300 cursor-pointer">
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-slate-900 group-hover:text-[#1E4D8C] transition-colors">{service.serviceName}</h4>
                      <p className="text-sm text-slate-400 font-light">{service.description || "Tailored professional service."}</p>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <p className="text-lg font-light">₹{service.price}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-black transition-all" />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="stylists" className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {salon?.salonStaffDTOS?.map((staff, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="aspect-[4/5] bg-slate-50 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                      <img src={staff.staffimage || "/placeholder.svg"} className="w-full h-full object-cover" alt={staff.staffname} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold uppercase tracking-widest">{staff.staffname}</h5>
                      <p className="text-xs text-slate-400 mt-1">{staff.description || "Master Stylist"}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar: Essential Info */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-4">Concierge</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="w-4 h-4 text-slate-900 shrink-0" />
                  <p className="text-sm text-slate-600 font-light leading-relaxed">
                    {salon?.street}, {salon?.city}, {salon?.state} {salon?.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-4 h-4 text-slate-900" />
                  <p className="text-sm text-slate-600 font-light">{salon?.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-slate-900" />
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-600 font-light">09:00 AM - 08:00 PM</p>
                    <span className="text-[9px] font-bold text-green-600 border border-green-200 px-2 py-0.5 tracking-tighter">OPEN</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-100 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Our Standards</h4>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#1E4D8C]" />
                <span className="text-xs font-medium">Eco-Friendly Products</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#1E4D8C]" />
                <span className="text-xs font-medium">Sanitized Stations</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full h-14 rounded-none border-slate-900 text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
              Contact Concierge
            </Button>
          </div>

        </section>
      </main>
    </div>
  );
}