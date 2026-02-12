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

// API
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Card, CardContent } from "../../components/ui_components/card";

export default function SalonDetailPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const { apiRequest } = useApi();
  const navigate = useNavigate();

  const [salon, setSalon] = useState<any>(null);
  const [salonService, setSalonService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [salonStaff, setSalonStaff] = useState<any[]>([]);

  useEffect(() => {
    fetchSalonById();
  }, [salonId]);

  const fetchSalonById = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any>(`/salons/${salonId}`);
      if (res.data) {
        setSalon(res.data);
        await fetchSalonService()
        await fetchSalonStaff();
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
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      // setLoading(false);
    }
  }


  const fetchSalonStaff = async () => {
    try {
      const res = await apiRequest<any>(`/salons/${salonId}/staff`);
      if (res.data) setSalonStaff(res.data);
    } catch (error) {
      console.error("staff Fetch error:", error);
    } finally {
      // setLoading(false);
    }
  }

  const handleViewService = (service_id?: any) => {
    navigate(`/salon/${salonId}/service/${service_id}`);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const checkIsOpen = () => {
    if (!salon?.timing) return false;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if today is a weekly off
    if (salon.timing.weeklyOff?.includes(dayName)) return false;

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const open = parseInt(salon.timing.openingTime.replace(/:/g, ''));
    const close = parseInt(salon.timing.closingTime.replace(/:/g, ''));

    return currentTime >= open && currentTime <= close;
  };

  if (!loading && !salon) return <div className="p-20 text-center font-light">Salon not found.</div>;

  const isOpen = checkIsOpen();

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
            {(salon?.branding?.coverImages?.length ? salon.branding.coverImages : ["/placeholder.svg"]).map((img: string, i: number) => (
              <SwiperSlide key={i}>
                <img src={img.trim()} alt="Salon" className="w-full h-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>

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
                    <span>{salon?.ratings?.average || "5.0"}</span>
                  </div>
                  <span className="opacity-50">•</span>
                  <span>{salon?.ratings?.reviewsCount || "0"} Reviews</span>
                  <span className="opacity-50">•</span>
                  <span className="text-orange-300">{salon?.pricing?.priceRange}</span>
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

          <div className="lg:col-span-8 space-y-16">
            <div>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">The Studio</h2>
              <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
                {salon?.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {salon?.expertise?.map((exp: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full px-4 py-1 text-slate-500 border-slate-200">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>

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

              <TabsContent value="services" className="pt-10">
                {salonService && salonService.length > 0 ? (
                  <div className="grid gap-4"> {/* Moved the grid outside the map for better layout */}
                    {salonService.map((item: any, index: number) => (
                      <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{item.serviceName}</h4>
                                <div className="text-right">
                                  <div className="font-semibold text-accent-foreground">
                                    ₹{item.price}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Button size="sm" className="ml-4"
                              onClick={() => handleViewService(item?.service_id)}
                            >             Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-slate-100 rounded-xl">
                    <Scissors className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 font-light">
                      Digital Menu currently being updated.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stylists" className="pt-10">
                {salonStaff && salonStaff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {salonStaff.map((staff: any) => (
                      <div key={staff.staff_id} className="group relative bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                        <div className="flex items-start gap-6">
                          {/* Minimalist Avatar Placeholder */}
                          <div className="w-20 h-20 bg-slate-200 shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Scissors className="w-8 h-8 opacity-20" />
                            </div>
                          </div>

                          <div className="space-y-2 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-light tracking-tight text-slate-900">{staff.name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1E4D8C]">
                                  {`${staff.experienceYears} Years Experience`}
                                </p>
                              </div>
                              {staff.rating?.average && (
                                <div className="flex items-center gap-1 text-xs font-bold">
                                  <Star className="w-3 h-3 fill-slate-900" />
                                  <span>{staff.rating.average}</span>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 flex flex-wrap gap-1.5">
                              {staff.expertise && staff.expertise.map((skill: string, idx: number) => (
                                <span key={idx} className="text-[9px] border border-slate-200 px-2 py-0.5 text-slate-500 uppercase tracking-tighter">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                              <button className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-[#1E4D8C] hover:border-[#1E4D8C] transition-all">
                                View Portfolio
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-slate-100 rounded-xl">
                    <p className="text-sm text-slate-400 font-light italic">
                      Our master stylists are currently preparing for their next session.
                    </p>
                  </div>
                )}
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
                    {salon?.address?.street}, {salon?.address?.city},<br />
                    {salon?.address?.state} - {salon?.address?.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-4 h-4 text-slate-900" />
                  <p className="text-sm text-slate-600 font-light">{salon?.primaryPhone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-slate-900" />
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-600 font-light">
                      {formatTime(salon?.timing?.openingTime)} - {formatTime(salon?.timing?.closingTime)}
                    </p>
                    {isOpen ? (
                      <span className="text-[9px] font-bold text-green-600 border border-green-200 px-2 py-0.5 tracking-tighter">OPEN</span>
                    ) : (
                      <span className="text-[9px] font-bold text-red-600 border border-red-200 px-2 py-0.5 tracking-tighter">CLOSED</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-100 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Ownership</h4>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#1E4D8C]" />
                <span className="text-xs font-medium">Managed by {salon?.ownerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#1E4D8C]" />
                <span className="text-xs font-medium">{salon?.email}</span>
              </div>
            </div>

            <a href={`tel:${salon?.primaryPhone}`} className="block">
              <Button variant="outline" className="w-full h-14 rounded-none border-slate-900 text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
                Contact Concierge
              </Button>
            </a>
          </div>

        </section>
      </main>
    </div>
  );
}