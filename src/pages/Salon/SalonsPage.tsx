import React, { useEffect, useState, useCallback, type JSX } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin, Clock, Star, ArrowRight, Filter, Search, Heart,
  ArrowLeft, X, Check,
  Navigation,
  AlignLeft
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
import { getDefaultSalonImage } from "../../utils/defaultServiceImage";

// Styles
import "swiper/css";
import "swiper/css/pagination";

export default function SalonsPage(): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiRequest } = useApi();

  // --- 1. ACTIVE STATE (What is currently rendered) ---
  const [salons, setSalons] = useState<any[]>([]);
  const [fetchSalonAPI, setFetchSalonAPI] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

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
      if (city?.trim()) apiParams.append("selected_city", city.trim());
      if (name?.trim()) apiParams.append("query", name.trim());
      if (limit) apiParams.append("limit", limit.toString());
      // Add user's current location for distance calculation
      if (userLat !== null) apiParams.append("user_lat", userLat.toString());
      if (userLon !== null) apiParams.append("user_lng", userLon.toString());

      const res = await apiRequest<any[]>(`/salons/super_search?${apiParams.toString()}`);
      if (res.data) setSalons(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setFetchSalonAPI(false);
    }
  }, [apiRequest, userLat, userLon]);

  // --- 4. INITIAL SYNC & URL WATCHER ---
  useEffect(() => {
    // Load user's current location from localStorage for distance calculation
    const savedLat = localStorage.getItem("userLat");
    const savedLon = localStorage.getItem("userLon");
    if (savedLat && savedLon) {
      setUserLat(parseFloat(savedLat));
      setUserLon(parseFloat(savedLon));
    }

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
      const res = await apiRequest<any[]>(`/salons/super_search?${searchString.toString()}`);
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
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate("/")} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              className="relative flex-1 group cursor-pointer"
              onClick={() => navigate(`/search?query=${encodeURIComponent(searchTerm)}&city=${tempFilters.city}&limit=${tempFilters.limit}`)}
            >
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <div className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 rounded-2xl bg-white text-gray-900 shadow-xl flex items-center text-xs sm:text-sm font-bold">
                {searchTerm || t('salons.searchSalons')}
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
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('salons.manualFilters')}</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-widest ml-1">{t('salons.city')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.city}
                    onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder={t('salons.enterCity')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-widest ml-1">{t('salons.salonName')}</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.name}
                    onChange={(e) => setTempFilters({ ...tempFilters, name: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder={t('salons.enterSalonName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-widest ml-1">{t('salons.limitResults')}</label>
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
                {t('salons.applySearch')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRECISE RESULTS GRID --- */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {salons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {salons.map((salon) => (
              <div
                key={salon.id}
                onClick={() => navigate(`/salons/${salon.id}`)}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] cursor-pointer border border-slate-100 flex flex-col"
              >
                {/* --- 1. VISUAL IDENTIFIER (TOP) --- */}
                <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-slate-50">
                  <img
                    src={salon.logoUrl || getDefaultSalonImage(salon.id || salon.salonName || '')}
                    alt={salon.salonName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  {/* Top Right: Status Badge */}
                  {/* <div className="absolute top-5 right-5">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-white text-[9px] font-black tracking-tighter">Live</span>
                    </div>
                  </div> */}

                  {/* Bottom Left: Quick Identity */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                    <h3 className="text-white font-black text-xl sm:text-2xl tracking-tighter leading-none truncate">
                      {salon.salonName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {salon.rating?.average && <div className="flex items-center gap-1 bg-[#1E4D8C] px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-white text-white" />
                        <span className="text-[10px] font-black text-white">{salon.rating?.average?.toFixed(1)}</span>
                      </div>}
                      {salon.rating?.reviewsCount && <span className="text-[10px] font-bold text-white/60 tracking-widest">{salon.rating?.reviewsCount || 0} {t('salons.reviews')}</span>}
                    </div>
                  </div>
                </div>

                {/* --- 2. DATA SPECIFICATION (CONTENT) --- */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">

                  {/* Technical Detail Rows */}
                  <div className="space-y-1">
                    {/* Location Row */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 tracking-widest">{t('salons.region')}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{salon.address?.city}</span>
                    </div>

                    {/* Street Detail (Precise truncated) */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <AlignLeft size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 tracking-widest">{t('salons.address')}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[160px] italic">{salon.address?.street}</span>
                    </div>

                    {/* Postal Spec */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Navigation size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 tracking-widest">{t('salons.postCode')}</span>
                      </div>
                      <code className="text-[11px] font-black text-[#1E4D8C] bg-blue-50 px-2 py-0.5 rounded-md tracking-widest">
                        {salon.address?.pincode}
                      </code>
                    </div>
                  </div>

                  {/* --- 3. CTA BLOCK (BOTTOM) --- */}
                  <div className="mt-4 sm:mt-8 flex items-center gap-2 sm:gap-3">
                    <Button
                      className="flex-[3] bg-slate-900 hover:bg-[#1E4D8C] text-white rounded-2xl font-black text-[9px] sm:text-[10px] tracking-[0.2em] h-12 sm:h-14 shadow-xl transition-all active:scale-[0.98]"
                    >
                      {t('salons.enterStudio')}
                    </Button>
                    <div className="flex-1 h-12 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#1E4D8C] group-hover:bg-blue-50 transition-all">
                      <ArrowRight size={20} className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="text-slate-200" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">{t('salons.nullResults')}</h2>
            <p className="text-slate-400 text-xs font-bold tracking-widest mt-2">{t('salons.checkFilters')}</p>
          </div>
        )}
      </section>
    </div>
  );
}