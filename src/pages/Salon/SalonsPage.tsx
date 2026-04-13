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
      if (name?.trim()) apiParams.append("query", name.trim());
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
              onClick={() => navigate(`/search?query=${encodeURIComponent(searchTerm)}&city=${tempFilters.city}&limit=${tempFilters.limit}`)}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <div className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-gray-900 shadow-xl flex items-center text-sm font-bold">
                {searchTerm || "Search salons..."}
              </div>
            </div>

            {/* <div
              className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl shadow-xl text-[#1E4D8C] cursor-pointer active:scale-95 transition-transform"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter size={20} />
            </div> */}
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
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {salons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {salons.map((salon) => (
              <div
                key={salon.id}
                onClick={() => navigate(`/salons/${salon.id}`)}
                className="group relative bg-white rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_-15px_rgba(30,77,140,0.12)] cursor-pointer flex flex-col border border-slate-100/50"
              >
                {/* --- TOP VISUAL HERO --- */}
                <div className="relative h-80 w-full overflow-hidden bg-slate-100">
                  {/* Main Salon Image (Logo used as hero with a sophisticated zoom effect) */}
                  <img
                    src={salon.logoUrl || "/placeholder.svg"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Premium Gradient: Bottom-up for text contrast, top-down for UI buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                  {/* Top Navigation Row */}
                  <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full">
                      <MapPin size={10} className="text-white" />
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">
                        {salon.address?.city}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); /* Add wishlist logic */ }}
                      className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white hover:text-red-500 active:scale-90"
                    >
                      <Heart size={20} className="transition-transform group-hover:scale-110" />
                    </button>
                  </div>

                  {/* Bottom Brand Identity */}
                  <div className="absolute bottom-8 left-8 right-8 z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white p-1 shadow-2xl rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500">
                        <img
                          src={salon.logoUrl || "/placeholder.svg"}
                          alt="logo"
                          className="w-full h-full object-cover rounded-[1.2rem]"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-black text-2xl tracking-tight leading-tight group-hover:text-blue-200 transition-colors">
                          {salon.salonName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-orange-400/90 backdrop-blur-md px-2 py-0.5 rounded-lg">
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span className="text-[10px] font-black text-white">
                              {salon.rating?.average || "5.0"}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-white/70 uppercase tracking-tighter">
                            {salon.rating?.reviewsCount || 0} Verified Reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- CONTENT & UTILITY AREA --- */}
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Primary Location</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1E4D8C] animate-pulse" />
                        <p className="text-xs font-bold text-slate-800 italic">
                          {salon.address?.street.split(',')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Booking Status</span>
                      <p className="text-xs font-black text-emerald-600 flex items-center justify-end gap-1">
                        Available <Check size={12} strokeWidth={3} />
                      </p>
                    </div>
                  </div>

                  {/* Interactive Button Group */}
                  <div className="flex items-center gap-4">
                    <Button
                      className="flex-1 bg-slate-900 hover:bg-[#1E4D8C] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] h-16 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] transition-all hover:translate-y-[-2px] active:scale-[0.97]"
                    >
                      Book Experience
                    </Button>
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1E4D8C] group-hover:text-white transition-all duration-500 group-hover:shadow-lg">
                      <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in-95">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center animate-pulse" />
              <Search className="absolute inset-0 m-auto w-12 h-12 text-[#1E4D8C]/20" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nothing found in {tempFilters.city}</h2>
            <p className="text-slate-400 max-w-xs mt-4 text-sm font-medium leading-relaxed">
              Try broadening your search or adjusting the filters to discover more specialists.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}