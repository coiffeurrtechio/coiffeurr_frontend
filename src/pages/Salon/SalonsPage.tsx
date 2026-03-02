import React, { useEffect, useState, useCallback, type JSX } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin, Clock, Star, ArrowRight, Filter, Search, Heart,
  ArrowLeft, X, Check
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Card, CardContent } from "../../components/ui_components/card";
import { Badge } from "../../components/ui_components/badge";
import { Loader } from "../../components/ui_components/Loader";

// API & Types
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";

// Styles
import "swiper/css";
import "swiper/css/pagination";

export default function SalonsPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiRequest } = useApi();

  // --- 1. ACTIVE STATE (What is currently rendered) ---
  const [salons, setSalons] = useState<any[]>([]);
  const [fetchSalonAPI, setFetchSalonAPI] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 2. MODAL DRAFT STATE (New Variables for the Modal) ---
  const [tempFilters, setTempFilters] = useState({
    name: "",
    city: localStorage.getItem("Address") || "Mumbai",
    limit: 10
  });

  // --- 3. DYNAMIC SEARCH EXECUTION ---
  const executeSearch = useCallback(async (name: string, city: string, limit: number) => {
    setFetchSalonAPI(true);
    try {
      const apiParams = new URLSearchParams();
      // Only add to API call if value exists
      if (city?.trim()) apiParams.append("city", city.trim());
      if (name?.trim()) apiParams.append("name", name.trim());
      if (limit) apiParams.append("limit", limit.toString());

      const res = await apiRequest<any[]>(`/salons/search?${apiParams.toString()}`);
      if (res.data) setSalons(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setFetchSalonAPI(false);
    }
  }, [apiRequest]);

  // --- 4. INITIAL SYNC & URL WATCHER ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    const c = params.get("city") || localStorage.getItem("Address") || "Mumbai";
    const l = Number(params.get("limit")) || 10;

    // Sync UI states with URL
    setSearchTerm(q);
    setTempFilters({ name: q, city: c, limit: l });

    // Initial Trigger
    executeSearch(q, c, l);
  }, []);

  // --- 5. MANUAL APPLY HANDLER ---
  const handleApplyFilters = async () => {
    const urlParams = new URLSearchParams();
    try { 
    // build clean parameters: Omit if empty to keep URL short
    if (tempFilters.name.trim()) urlParams.append("query", tempFilters.name.trim());
    if (tempFilters.city.trim()) urlParams.append("city", tempFilters.city.trim());
    if (tempFilters.limit) urlParams.append("limit", tempFilters.limit.toString());

    const searchString = urlParams.toString();

    setIsFilterModalOpen(false);

    // This navigation triggers the useEffect above
    const res = await apiRequest<any[]>(`/salons/search?${searchString.toString()}`);
    if (res.data) setSalons(res.data);
  } catch (err) {
    console.error("Search failed:", err);
  } finally {
    setFetchSalonAPI(false);
  };
}

  const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours); date.setMinutes(minutes);
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Loader isVisible={fetchSalonAPI} />

      {/* --- HEADER --- */}
      <section className="sticky top-0 z-40 bg-[#1E4D8C] text-white shadow-lg rounded-b-[2rem]">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div
              className="relative flex-1 group cursor-pointer"
              onClick={() => navigate(`/search?query=${encodeURIComponent(searchTerm)}`)}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <div className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-gray-900 shadow-xl flex items-center text-sm font-bold">
                {searchTerm || "Search salons..."}
              </div>
            </div>

            <div
              className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl shadow-xl text-[#1E4D8C] cursor-pointer active:scale-95 transition-transform"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER MODAL (Uses tempFilters variable) --- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Manual Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.city}
                    onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="Enter city..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Salon Name</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.name}
                    onChange={(e) => setTempFilters({ ...tempFilters, name: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="Enter salon name..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Limit Results</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTempFilters({ ...tempFilters, limit: num })}
                      className={`h-12 rounded-2xl font-bold text-sm transition-all ${tempFilters.limit === num ? 'bg-[#1E4D8C] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                    >
                      {num} {tempFilters.limit === num && <Check size={14} className="inline ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleApplyFilters}
                className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-bold text-base mt-4 shadow-xl shadow-blue-900/20"
              >
                Apply & Search
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESULTS GRID --- */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {salons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {salons.map((salon) => (
              <Card key={salon.id} className="border-none bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 4000 }} className="h-full w-full">
                    {(salon?.branding?.coverImages?.length > 0 ? salon?.branding?.coverImages : ["/placeholder.svg"]).map((img: any, index: number) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={salon.salonName} className="w-full h-full object-cover" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-[#1E4D8C]/90 backdrop-blur-md text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                      {salon.salonType || "Unisex"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={salon.branding?.logoUrl || "/placeholder.svg"} alt="logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg leading-tight">{salon.salonName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        <span className="text-xs font-black text-gray-700">{salon.ratings?.average || "5.0"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl font-bold">
                    <div className="flex items-start gap-3 text-xs text-gray-600">
                      <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="line-clamp-1">{salon?.address?.street}, {salon.address?.city}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#1E4D8C]">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{formatTime(salon.timing?.openingTime)} - {formatTime(salon.timing?.closingTime)}</span>
                    </div>
                  </div>

                  <Link to={`/salons/${salon.id}`}>
                    <Button className="w-full bg-[#1E4D8C] text-white rounded-2xl font-bold h-12 shadow-lg hover:bg-[#153a6b]">
                      Book Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-black text-gray-900">No results found</p>
            <p className="text-gray-500 text-sm mt-2">Adjust your filters in the modal and click Apply.</p>
          </div>
        )}
      </section>
    </div>
  );
}