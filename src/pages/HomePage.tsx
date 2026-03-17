import React, { useEffect, useState } from 'react';
import { MapPin, Bell, User, Search, Star, Clock, Scissors, Plus } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [address, setAddress] = useState<string>("Locating you...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { apiRequest } = useApi();
  const [salons, setsalons] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. AUTH CHECK
    const authData = localStorage.getItem("authState");
    if (!authData) {
      navigate("/login");
      return;
    }

    // 2. Initial check for existing stored address to avoid hardcoding
    const savedCity = localStorage.getItem("Address");

    // 3. MOBILE FAIL-SAFE: Use stored address or prompt user if GPS hangs
    const forceLoadTimer = setTimeout(() => {
      if (isLoading) {
        const cityToFetch = savedCity || ""; // No hardcoded Navi Mumbai
        setAddress(cityToFetch ? `Nearby ${cityToFetch}` : "Location not found");
        FetchAllSalons(cityToFetch);
        setIsLoading(false);
      }
    }, 6000);

    // 4. GEOLOCATION LOGIC
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            // Fallback to empty string if API fails to find a name
            const city = data.address.city || data.address.town || data.address.village || "";
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            
            const displayAddress = suburb ? `${suburb}, ${city}` : city || "Nearby";
            setAddress(displayAddress);
            
            if (city) {
              localStorage.setItem("Address", city);
            }
            
            clearTimeout(forceLoadTimer);
            FetchAllSalons(city);
            setTimeout(() => setIsLoading(false), 800);
          } catch (error) {
            handleLocationError(forceLoadTimer, savedCity);
          }
        },
        () => handleLocationError(forceLoadTimer, savedCity),
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      handleLocationError(forceLoadTimer, savedCity);
    }

    return () => clearTimeout(forceLoadTimer);
  }, []);

  const handleLocationError = (timer: NodeJS.Timeout, savedCity: string | null) => {
    clearTimeout(timer);
    // Use whatever was in storage, otherwise stay blank/generic
    const cityToFetch = savedCity || ""; 
    setAddress(cityToFetch || "Location access denied");
    FetchAllSalons(cityToFetch);
    setIsLoading(false);
  };

  const FetchAllSalons = async (city: string) => {
    try {
      // If city is empty, the API should handle returning general results
      const res = await apiRequest<any[]>(`/salons/search?city=${city}&limit=10`);
      if (res.data) setsalons(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  if (isLoading) return <Loader />;

  return (
   

<div className="min-h-screen bg-gray-50 font-sans pb-24 relative overflow-x-hidden">
  
  {/* Header Section */}
  <div className="bg-[#1E4D8C] text-white rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg">
    <div className="max-w-7xl mx-auto p-6 sm:px-8 sm:pt-8 sm:pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 max-w-[70%]">
          <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
          <span className="font-medium text-xs sm:text-sm truncate">{address}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-[#1E4D8C]"></span>
          </div>
          <User 
            className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors" 
            onClick={() => navigate("/profile")} 
          />
        </div>
      </div>

      {/* Search Bar - Centers on Desktop */}
      <div className="max-w-2xl mx-auto">
        <div
          onClick={() => navigate("/search")}
          className="bg-white rounded-2xl p-4 shadow-xl -mb-12 sm:-mb-16 border border-gray-100 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#1E4D8C]" />
            <span className="text-gray-900 font-bold text-sm sm:text-base">Find a Salon Near You</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 flex items-center border border-gray-100">
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-tight">Tap to search for services</span>
            </div>
            <button className="bg-[#1E4D8C] hover:bg-[#153a6b] text-white px-5 sm:px-8 py-2 rounded-lg font-black text-xs sm:text-sm shadow-md transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Main Content Area */}
  <main className="max-w-7xl mx-auto px-4 sm:px-8">
    
    {/* Recommendations Section */}
    <div className="mt-20 sm:mt-24 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-800 text-lg sm:text-xl font-black tracking-tight">Recommended for You</h2>
        <button className="text-[10px] sm:text-xs font-bold text-[#1E4D8C] uppercase tracking-widest hover:underline">
          See All
        </button>
      </div>

      {/* Responsive Layout: 
          - Mobile: Horizontal scroll (overflow-x-auto)
          - Tablet/Desktop: 2 to 4 column grid
      */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        {salons.length > 0 ? (
          salons.map((salon) => (
            <Link 
              to={`/salons/${salon.id}`} 
              key={salon.id} 
              className="min-w-[280px] md:min-w-0 snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-40 sm:h-48">
                <img 
                  src={salon.branding?.coverImages?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={salon.salonName}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star size={12} className="fill-orange-400 text-orange-400" />
                  <span className="text-xs font-black">{salon.ratings?.average || "5.0"}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate pr-2">
                    {salon.salonName}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-black text-[#1E4D8C] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded">
                    {salon.pricing?.priceRange}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <MapPin size={12} /> {salon.address?.city || "Nearby"}
                </p>
                
                {/* Desktop-only Quick Book Button */}
                <button className="hidden md:block w-full mt-4 py-2 border-2 border-[#1E4D8C] text-[#1E4D8C] font-black text-xs rounded-xl hover:bg-[#1E4D8C] hover:text-white transition-all">
                  Book Now
                </button>
              </div>
            </Link>
          ))
        ) : (
          <div className="w-full col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold text-sm">
              {isLoading ? "Looking for the best spots..." : "No salons found in your area."}
            </p>
          </div>
        )}
      </div>
    </div>
  </main>

  {/* Optional: Floating Action Button for Mobile or Bottom Nav Placeholder */}
  <div className="md:hidden fixed bottom-6 right-6">
     {/* Your Mobile FAB here */}
  </div>
</div>
  );
};

export default HomePage;