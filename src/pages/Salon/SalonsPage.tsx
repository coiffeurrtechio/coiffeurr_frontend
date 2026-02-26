import React, { useEffect, useState, type JSX } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useLocation
import {
  MapPin, Clock, Phone, Star, Users, ArrowRight,
  Filter, Search, Scissors, Heart, Navigation,
  ArrowLeft,
  X,
  Check
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
import type { Salon } from "../../Interfaces/SaloInterface";

// Styles
import "swiper/css";
import "swiper/css/pagination";

export default function SalonsPage(): JSX.Element {
  const location = useLocation(); // Hook to get URL params
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [salons, setSalons] = useState<any[]>([]);
  const [fetchSalonAPI, setfetchSalonAPI] = useState(true);
  const { apiRequest } = useApi();
  const navigate = useNavigate();


  const [limit, setLimit] = useState<number>(10);
  const [city, setCity] = useState<string>(localStorage.getItem("Address") || "Mumbai");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Extract 'query' from URL e.g. /salons?query=Mumbai
  const queryParams = new URLSearchParams(location.search);
  const urlSearchQuery = queryParams.get("query");

  const FetchSalonsData = async () => {
    setfetchSalonAPI(true);
    try {
      let endpoint = "/salons";

      // If there is a URL param, use the search endpoint
      if (searchTerm) {
        endpoint = `/search-salons?query=${encodeURIComponent(searchTerm)}`;
        // setSearchTerm(urlSearchQuery); // Sync the search input with URL param
      }

      // const res = await apiRequest<Salon[]>();
      // const city = localStorage.getItem("Address");
      const res = await apiRequest<any[]>(`/salons/search?city=${city}&name=${searchTerm}&limit=${limit}`);
      if (res.data) setSalons(res.data);
    } catch (err) {
      console.error("Error fetching salons:", err);
    } finally {
      setfetchSalonAPI(false);
    }
  };

  // Re-run whenever the URL search query changes
  useEffect(() => {
    FetchSalonsData();
  }, []);

  const salonTypes = ["all", "Unisex", "Women Only", "Men Only"];

  // const filteredSalons = salons.filter((salon) => {
  //   // Local filtering for live search bar interaction
  //   const matchesSearch =
  //     salon.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (salon.street && salon.street.toLowerCase().includes(searchTerm.toLowerCase()));

  //   const matchesType = selectedType === "all" || salon.salonType === selectedType;
  //   return matchesSearch && matchesType;
  // });

  const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "numeric", hour12: true,
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Loader isVisible={fetchSalonAPI} />

      {/* --- THEMED SEARCH HEADER --- */}
      <section className="sticky top-0 z-40 bg-[#1E4D8C] text-white shadow-lg rounded-b-[2rem] md:rounded-none">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div
                className="relative flex-1 group cursor-pointer"
                onClick={() => navigate(`/search?query=${encodeURIComponent(searchTerm)}`)}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-[#1E4D8C] transition-colors" />
                <input
                  type="text"
                  readOnly // Prevents keyboard on this page, acts as a button
                  placeholder="Search for 'Haircut' or 'Spa'..."
                  value={searchTerm}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-gray-900 shadow-xl border-none cursor-pointer transition-all outline-none text-sm md:text-base"
                />
              </div>

              {/* Filter Select UI */}
              <div className="relative">
                {/* <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                >
                  {salonTypes.map((type) => (
                    <option key={type} value={type} className="text-gray-900">
                      {type === "all" ? "All Types" : type}
                    </option>
                  ))}
                </select> */}
                <div className="h-12 w-12 md:w-auto md:px-5 flex items-center justify-center gap-2 bg-white rounded-2xl shadow-xl text-[#1E4D8C] transition-transform active:scale-95">
                  <Filter size={20} className="md:w-4 md:h-4" onClick={() => setIsFilterModalOpen(true)}/>
                  <span className="hidden md:block text-sm font-bold uppercase tracking-tight">
                    {selectedType === "all" ? "Filter" : selectedType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Search Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Manual City Entry */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Location / City</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="Enter city name..."
                    />
                </div>
              </div>

              {/* Manual Name Entry */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Salon Name</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="Search specific salon..."
                    />
                </div>
              </div>

              {/* Result Limit Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Results Limit</label>
                <div className="grid grid-cols-3 gap-3">
                    {[10, 20, 50].map((num) => (
                        <button
                            key={num}
                            onClick={() => setLimit(num)}
                            className={`h-12 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${limit === num ? 'bg-[#1E4D8C] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {num} {limit === num && <Check size={14} />}
                        </button>
                    ))}
                </div>
              </div>

              <Button 
                onClick={() => {
                  FetchSalonsData();
                  setIsFilterModalOpen(false)}}
                className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-bold text-base mt-4 shadow-xl shadow-blue-900/20"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- SALONS GRID --- */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {salons.map((salon) => (
              <Card
                key={salon.id}
                className="border border-gray-100 bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                {/* Image Gallery */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000 }}
                    className="h-full w-full"
                  >
                    {(salon?.branding?.coverImages?.length > 0 ? salon?.branding?.coverImages : ["/placeholder.svg"]).map((img: any, index: number) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={salon.salonName} className="w-full h-full object-cover" />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Badge className="bg-[#1E4D8C] text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-tighter shadow-lg">
                      {salon.salonType}
                    </Badge>
                  </div>

                  <button className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-md">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={salon.branding?.logoUrl || "/placeholder.svg"} alt="logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg leading-tight">{salon.salonName}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                          <span className="text-xs font-black text-gray-700">{salon.ratings?.average || "5.0"}</span>
                          <span className="text-[10px] text-gray-400 font-bold ml-1">({salon.ratings?.reviewsCount || 0} REVIEWS)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Strip */}
                  <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-start gap-3 text-xs">
                      <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-gray-600 font-medium line-clamp-1">
                        {salon?.address?.street}, {salon.address?.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Clock className="h-4 w-4 text-[#1E4D8C] shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">
                          {formatTime(salon.timing?.openingTime)} - {formatTime(salon.timing?.closingTime)}
                        </span>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">• Open Now</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${salon.id}${i}`} alt="user" />
                        </div>
                      ))}
                    </div>

                    <Link to={`/salons/${salon.id}`}>
                      <Button size="sm" className="bg-[#1E4D8C] hover:bg-[#153a6b] text-white rounded-xl px-5 font-bold text-xs h-10 group shadow-lg shadow-blue-900/10">
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!fetchSalonAPI && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-xl font-black text-gray-900">No salons found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}