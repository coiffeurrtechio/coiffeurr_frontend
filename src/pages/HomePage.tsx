import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Bell, User, Search, Star, ChevronRight, Home, Scissors, Gift, UserCircle, Loader2, Clock, ArrowLeft, X } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import type { Salon } from '../Interfaces/SaloInterface';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Badge } from '../components/ui_components/badge';
import { Link, useNavigate } from 'react-router-dom';

interface SalonCard {
  id: string;
  name: string;
  rating: number;
  distance: string;
  nextAvailable: string;
  image: string;
}

const HomePage: React.FC = () => {

  const [address, setAddress] = useState<string>("Locating you...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { apiRequest } = useApi();
  const [salons, setsalons] = useState<any>([]);
  const [fetchSalonAPI, setfetchSalonAPI] = useState<boolean>(true);
  const navigate = useNavigate();


  const nearbySalons: SalonCard[] = [
    {
      id: '1',
      name: 'GlowUp Salon',
      rating: 4.5,
      distance: '1.2 km',
      nextAvailable: '120 min',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      name: 'Elegance Spa',
      rating: 4.8,
      distance: '2.0 km',
      nextAvailable: '30 min',
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=80'
    }
  ];

  useEffect(() => {
    // 1. Check Authentication
    const authData = localStorage.getItem("authState");
    const parsedAuth = authData ? JSON.parse(authData) : null;
    
    // Check if user object exists (Adjust path based on your exact login response structure)
    const user = parsedAuth?.user?.user;

    if (!user) {
      navigate("/login");
      return; // Exit early if not logged in
    }

    // 2. Get User Coordinates & Address
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            const city = data.address.city || data.address.town || data.address.village || "Unknown";
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            
            localStorage.setItem("Address", city);
            setAddress(`${suburb}${suburb ? ', ' : ''}${city}`);
            
            // Fetch salons after address is set
            FetchAllSalons(city);
            
            setTimeout(() => setIsLoading(false), 1200);
          } catch (error) {
            setAddress("Address Fetch Failed");
            setIsLoading(false);
          }
        },
        () => {
          setAddress("Permission Denied");
          setIsLoading(false);
          // Fetch default salons even if location is denied
          FetchAllSalons("Mumbai"); 
        }
      );
    } else {
        FetchAllSalons("Mumbai");
    }
  }, []);

  // Update Fetch function to accept city directly to avoid race conditions with localStorage
  const FetchAllSalons = async (cityName?: string) => {
    try {
      const city = cityName || localStorage.getItem("Address") || "Mumbai";
      const res = await apiRequest<any[]>(`/salons/search?city=${city}&limit=10`);
      if (res.data) setsalons(res.data);
    } catch (err) {
      console.error("Unexpected error fetching salons:", err);
    } finally {
      setfetchSalonAPI(false);
    }
  };


  if (isLoading) {
    return (
      <Loader />
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto font-sans pb-24">




      {/* Blue Header Section */}
      <div className="bg-[#1E4D8C] p-6 text-white rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-200" />
            <span className="font-medium">{address}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-[#1E4D8C]"></span>
            </div>
            <User className="w-6 h-6 p-1 bg-white/20 rounded-full" onClick={() => navigate("/profile")} />
          </div>
        </div>

        {/* Search Bar Card */}
        {/* Search Bar Card */}
        <div
          onClick={() => navigate("/search")} // Redirect to search page
          className="bg-white rounded-2xl p-4 shadow-xl -mb-12 border border-gray-100 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#1E4D8C]" />
            <span className="text-gray-900 font-bold">Find a Salon Near You</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between border border-gray-100">
              <span className="text-xs text-gray-500">Location • Today • 12 PM</span>
            </div>
            <button className="bg-[#1E4D8C] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Your Bookings Section */}
      <div className="px-4 mt-16 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Your Bookings</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/dummy_logo.png" alt="salon" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h3 className="font-bold text-gray-900">StyleHub Salon</h3>
                <p className="text-xs text-gray-500">Haircut & Beard</p>
              </div>
            </div>
            <button className="text-gray-300">•••</button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</span>
              Today, 6:30 PM
            </div>
            <span className="bg-[#4CAF50] text-white px-3 py-1 rounded-md text-[11px] font-bold">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Nearby Salons Horizontal Scroll */}
      <div className="px-4 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Nearby Salons</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {salons.map((salon: any, index: number) => (
            <Link to={`/salons/${salon.id}`}
              key={salon.id || index} className="min-w-[240px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Top Section: Image Swiper */}
              <div className="relative h-32 w-full">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 4000 }}
                  className="h-full w-full"
                >
                  {(salon?.branding?.coverImages?.length > 0
                    ? salon.branding.coverImages
                    : ["/placeholder.svg"]
                  ).map((img: string, i: number) => (
                    <SwiperSlide key={i}>
                      <img src={img} alt={salon.salonName} className="w-full h-full object-cover" />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-[#1E4D8C]/90 text-white border-none px-2 py-0.5 font-black text-[9px] uppercase tracking-wider rounded-lg">
                    {salon.salonType || "Unisex"}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-[5]" />
                <div className="absolute bottom-2 left-3 z-[6] text-white">
                  <p className="font-bold text-xs truncate w-[200px]">{salon.salonName}</p>
                </div>
              </div>

              {/* Bottom Section: Logo + Info */}
              <div className="p-3">
                <div className="flex items-center gap-3">
                  {/* 1. Logo on the Left */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                      {salon?.branding?.logoUrl ? (
                        <img
                          src={salon.branding.logoUrl}
                          alt="logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Scissors size={18} className="text-gray-300" />
                      )}
                    </div>
                  </div>

                  {/* 2. Content on the Right */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                        <span className="text-[11px] font-black text-gray-700">
                          {salon.ratings?.average || "5.0"}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-[#1E4D8C]">
                        {salon.pricing?.priceRange || "₹₹"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                      <MapPin size={10} className="shrink-0" />
                      <span className="text-[9px] font-bold truncate tracking-tight uppercase">
                        {salon.address?.city || "Nearby"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Offers Section */}
      {/* <div className="px-4 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Offers Near You</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-800">20% OFF at StyleHub - Only Today!</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div> */}


    </div>
  );
};

export default HomePage;