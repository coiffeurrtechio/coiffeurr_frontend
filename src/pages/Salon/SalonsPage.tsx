import React, { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Clock, Phone, Star, Users, ArrowRight,
  Filter, Search, Scissors, Heart, Navigation
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [fetchSalonAPI, setfetchSalonAPI] = useState(true);
  const { apiRequest } = useApi();

  const FetchAllSalons = async () => {
    try {
      const res = await apiRequest<Salon[]>("/salon");
      if (res.data) setSalons(res.data);
    } catch (err) {
      console.error("Unexpected error fetching salons:", err);
    } finally {
      setfetchSalonAPI(false);
    }
  };

  useEffect(() => {
    FetchAllSalons();
  }, []);

  const salonTypes = ["all", "Unisex", "Women Only", "Men Only"];

  const filteredSalons = salons.filter((salon) => {
    const matchesSearch =
      salon.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.street.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || salon.salonType === selectedType;
    return matchesSearch && matchesType;
  });

  const formatTime = (timeString: string): string => {
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

              {/* 1. SEARCH INPUT (The Hero of the section) */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-[#1E4D8C] transition-colors" />
                <input
                  type="text"
                  placeholder="Search for 'Haircut' or 'Spa'..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-gray-900 shadow-xl border-none focus:ring-4 focus:ring-orange-400/30 transition-all outline-none text-sm md:text-base"
                />
              </div>

              {/* 2. COMPACT FILTER BUTTON (Modern App Style) */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                >
                  {salonTypes.map((type) => (
                    <option key={type} value={type} className="text-gray-900">
                      {type === "all" ? "All Types" : type}
                    </option>
                  ))}
                </select>
                <div className="h-12 w-12 md:w-auto md:px-5 flex items-center justify-center gap-2 bg-white rounded-2xl shadow-xl text-[#1E4D8C] transition-transform active:scale-95">
                  <Filter size={20} className="md:w-4 md:h-4" />
                  <span className="hidden md:block text-sm font-bold uppercase tracking-tight">
                    {selectedType === "all" ? "Filter" : selectedType}
                  </span>
                </div>
              </div>

            </div>

            {/* 3. QUICK TAGS (Optional: Enhances the "App" feel) */}
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {["Haircut", "Facial", "Massage", "Manicure"].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase whitespace-nowrap hover:bg-white/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SALONS GRID --- */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSalons.map((salon) => (
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
                    {(salon?.images?.length > 0 ? salon.images : ["/placeholder.svg"]).map((img, index) => (
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
                  {/* Title & Rating */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={salon.logoUrl || "/placeholder.svg"} alt="logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg leading-tight">{salon.salonName}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                          <span className="text-xs font-black text-gray-700">{salon.rating}</span>
                          <span className="text-[10px] text-gray-400 font-bold ml-1">({salon.reviews} REVIEWS)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Strip */}
                  <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-start gap-3 text-xs">
                      <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-gray-600 font-medium line-clamp-1">
                        {salon.street}, {salon.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Clock className="h-4 w-4 text-[#1E4D8C] shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">
                          {formatTime(salon.openingTime)} - {formatTime(salon.closingTime)}
                        </span>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">• Open Now</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${salon.id}${i}`} alt="user" />
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                        +8
                      </div>
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
          {filteredSalons.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-xl font-black text-gray-900">No salons found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term.</p>
              <Button
                variant="outline"
                className="mt-6 border-[#1E4D8C] text-[#1E4D8C] font-bold"
                onClick={() => { setSearchTerm(""); setSelectedType("all") }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}