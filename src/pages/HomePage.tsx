import React, { useEffect, useState } from 'react';
import { MapPin, Bell, User, Search, Star, Clock, Scissors, Plus, Navigation } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { Link, useNavigate } from 'react-router-dom';
import NoSalonsFound from './NoSalonsFound';

const HomePage: React.FC = () => {
  const [address, setAddress] = useState<string>("Locating you...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { apiRequest } = useApi();
  const [salons, setsalons] = useState<any[]>([]);
  const navigate = useNavigate();


  const user = localStorage.getItem("authState");

  const parsedUser = user ? JSON.parse(user) : null;

  const isloggedin = parsedUser?.isAuthenticated;

  console.log("isLoggedIn =", isloggedin);


  useEffect(() => {
    // 1. AUTH CHECK
    // const authData = localStorage.getItem("authState");
    // if (!authData) {
    //   navigate("/login");
    //   return;
    // }

    // 2. Initial check for existing stored address to avoid hardcoding
    const savedCity = localStorage.getItem("Address");

    // 3. MOBILE FAIL-SAFE: Use stored address or prompt user if GPS hangs
    const forceLoadTimer = setTimeout(() => {
      if (isLoading) {
        const cityToFetch = savedCity || "";
        // If no city is found, leave address as "" to show the 'Enable Location' button
        setAddress(cityToFetch ? `Nearby ${cityToFetch}` : "");
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


  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true); // Show loader while fetching

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reuse your reverse geocoding logic
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || "";

          setAddress(city || "Nearby");
          if (city) localStorage.setItem("Address", city);

          await FetchAllSalons(city);
        } catch (error) {
          console.error("Geocoding failed", error);
          setAddress("Nearby");
          await FetchAllSalons("");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        alert("Location access denied. Please enable it in browser settings.");
      }
    );
  };

  const handleLocationError = (timer: NodeJS.Timeout, savedCity: string | null) => {
    clearTimeout(timer);
    // Use whatever was in storage, otherwise stay blank/generic
    const cityToFetch = savedCity || "";
    setAddress(cityToFetch || "");
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

    <div className="min-h-screen font-sans pb-2 relative overflow-x-hidden">

      {/* 1. FIXED ICON BACKGROUND PATTERN */}
      {/* Keep opacity very low (0.02 - 0.04) so it doesn't distract from the salons */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/Background.jpeg')`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
          opacity: 0.04, // Increased slightly to verify it's working
          zIndex: -1,
        }}
      />

      {/* 2. CONTENT WRAPPER */}
      <div className="relative z-10">

        {/* Header Section */}
        <header className="bg-[#1E4D8C] text-white rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto p-6 sm:px-8 sm:pt-8 sm:pb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 max-w-[70%]">
                <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">{address || "Set location"}</span>
              </div>
              {isloggedin ? (
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
              )
                :
                (
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 bg-white text-[#1E4D8C] rounded-full hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    Login
                  </button>
                )
              }
            </div>

            {/* Search Bar */}
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
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="mt-20 sm:mt-24 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800 text-lg sm:text-xl font-black tracking-tight">Recommended for You</h2>
              <button className="text-[10px] sm:text-xs font-bold text-[#1E4D8C] uppercase tracking-widest hover:underline">
                See All
              </button>
            </div>

            {/* Vertical List Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4">
              {!address ? (
                /* Condition 1: Location Prompt */
                <div className="w-full flex flex-col items-center justify-center py-16 px-6  backdrop-blur-md rounded-[2rem] border-2 border-dashed border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-[#1E4D8C]" />
                  </div>
                  <h3 className="text-gray-900 font-black text-lg mb-2">Location Access Required</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs mb-8 font-medium">
                    We couldn't find your location. Enable it to see the best salons near you.
                  </p>
                  <button
                    onClick={handleEnableLocation}
                    className="bg-[#1E4D8C] hover:bg-[#153a6b] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Enable Location
                  </button>
                </div>
              ) : salons.length > 0 ? (
                /* Condition 2: Salon Cards */
                salons.map((salon) => (
                  <Link
                    to={`/salons/${salon.id}`}
                    key={salon.id}
                    className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="relative h-40 sm:h-full">
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

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-base sm:text-lg text-gray-800">
                            {salon.salonName}
                          </h3>
                          <span className="text-[10px] sm:text-xs font-black text-[#1E4D8C] bg-blue-50 px-2 py-1 rounded">
                            {salon.pricing?.priceRange}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 font-bold">
                          <MapPin size={12} className="text-[#1E4D8C]" /> {salon.address?.city || "Nearby"}
                        </p>
                      </div>
                      <button className="mt-4 sm:max-w-[140px] py-2 border-2 border-[#1E4D8C] text-[#1E4D8C] font-black text-xs rounded-xl hover:bg-[#1E4D8C] hover:text-white transition-all">
                        Book Now
                      </button>
                    </div>
                  </Link>
                ))
              ) : (
                /* Condition 3: No Results Found */
                <div className="w-full text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold text-sm">
                    {isLoading ? "Looking for the best spots..." : <NoSalonsFound />}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div >

      {/* Mobile FAB */}
      <div div className="md:hidden fixed bottom-6 right-6 z-30" >
        {/* Your Mobile FAB Component */}
      </div >
    </div >
  );
};

export default HomePage;