import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Bell, User, Search, Star, Home, Scissors, Gift, Loader2, Clock, ArrowLeft, X } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Badge } from '../components/ui_components/badge';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [address, setAddress] = useState<string>("Locating you...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { apiRequest } = useApi();
  const [salons, setsalons] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. AUTH CHECK - Immediate redirect if no session
    const authData = localStorage.getItem("authState");
    if (!authData) {
      navigate("/login");
      return;
    }

    // 2. MOBILE FAIL-SAFE: If GPS takes > 5 seconds, load default
    const forceLoadTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Geolocation timed out. Loading default city.");
        setAddress("Navi Mumbai (Default)");
        FetchAllSalons("Navi Mumbai");
        setIsLoading(false);
      }
    }, 5000);

    // 3. GEOLOCATION LOGIC
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            const city = data.address.city || data.address.town || data.address.village || "Navi Mumbai";
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            
            setAddress(`${suburb}${suburb ? ', ' : ''}${city}`);
            localStorage.setItem("Address", city);
            
            // Clear timer and fetch data
            clearTimeout(forceLoadTimer);
            FetchAllSalons(city);
            setTimeout(() => setIsLoading(false), 800);
          } catch (error) {
            handleLocationError(forceLoadTimer);
          }
        },
        () => handleLocationError(forceLoadTimer),
        { timeout: 10000, enableHighAccuracy: false } // Options for better mobile support
      );
    } else {
      handleLocationError(forceLoadTimer);
    }

    return () => clearTimeout(forceLoadTimer);
  }, []);

  const handleLocationError = (timer: NodeJS.Timeout) => {
    clearTimeout(timer);
    const fallbackCity = "Navi Mumbai";
    setAddress(fallbackCity);
    FetchAllSalons(fallbackCity);
    setIsLoading(false);
  };

  const FetchAllSalons = async (city: string) => {
    try {
      const res = await apiRequest<any[]>(`/salons/search?city=${city}&limit=10`);
      if (res.data) setsalons(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto font-sans pb-24 relative">
      {/* Blue Header Section */}
      <div className="bg-[#1E4D8C] p-6 text-white rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 max-w-[70%]">
            <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="font-medium text-xs truncate">{address}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-0.5 bg-red-500 w-2 h-2 rounded-full border-2 border-[#1E4D8C]"></span>
            </div>
            <User className="w-8 h-8 p-1.5 bg-white/20 rounded-full cursor-pointer" onClick={() => navigate("/profile")} />
          </div>
        </div>

        {/* Search Bar Redirect */}
        <div
          onClick={() => navigate("/search")}
          className="bg-white rounded-2xl p-4 shadow-xl -mb-12 border border-gray-100 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#1E4D8C]" />
            <span className="text-gray-900 font-bold text-sm">Find a Salon Near You</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center border border-gray-100">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Mumbai • Today • 12 PM</span>
            </div>
            <button className="bg-[#1E4D8C] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Your Bookings Section */}
      <div className="px-4 mt-16 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-800 font-bold">Your Bookings</h2>
          <span className="text-[10px] font-bold text-[#1E4D8C] uppercase">View All</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">S</div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">StyleHub Salon</h3>
                <p className="text-[10px] text-gray-400 uppercase">Haircut • 45m</p>
              </div>
            </div>
            <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[9px] font-bold uppercase border border-green-100">Confirmed</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <Clock size={14} className="text-gray-400" /> Today, 6:30 PM
          </div>
        </div>
      </div>

      {/* Nearby Salons */}
      <div className="px-4 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Recommended for You</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
          {salons.length > 0 ? (
            salons.map((salon) => (
              <Link to={`/salons/${salon.id}`} key={salon.id} className="min-w-[260px] snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative h-32">
                  <img 
                    src={salon.branding?.coverImages?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400"} 
                    className="w-full h-full object-cover" 
                    alt={salon.salonName}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Star size={10} className="fill-orange-400 text-orange-400" />
                    <span className="text-[10px] font-black">{salon.ratings?.average || "5.0"}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-800 truncate pr-2">{salon.salonName}</h3>
                    <span className="text-[10px] font-bold text-[#1E4D8C]">{salon.pricing?.priceRange || "₹₹"}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                    <MapPin size={10} /> {salon.address?.city || "Nearby"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-400 text-xs">No salons found in your area.</div>
          )}
        </div>
      </div>

      {/* Navigation Padding */}
      <div className="h-4" />
    </div>
  );
};

export default HomePage;