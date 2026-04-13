import React, { useEffect, useState } from 'react';
import { MapPin, User, Search, Star, Navigation, ChevronRight, Award } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { Link, useNavigate } from 'react-router-dom';
import NoSalonsFound from './NoSalonsFound';
import Config from '../configs/config';

const HomePage: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const { apiRequest } = useApi();
  const [salons, setsalons] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const navigate = useNavigate();

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  useEffect(() => {
    getLocationAndFetch();
  }, []);

  const getLocationAndFetch = () => {
    const savedCity = localStorage.getItem("Address");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const body = {
            "lat": latitude,
            "lon": longitude,
            "language": "en"
          }
          try {
            const response = await fetch(`${Config.API_Customers}/geolocation/geolocation/location-details`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Include "Authorization": `Bearer ${token}` here if required
              },
              body: JSON.stringify(body)
            });

            const data = await response.json();

            const city = data.address.city || data.address.town || data.address.village || "";
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            const displayAddress = suburb ? `${suburb}, ${city}` : city || "Nearby";

            setAddress(displayAddress);
            if (city) localStorage.setItem("Address", city);

            // Wait for both APIs to return data before flagging "Loaded"
            await Promise.all([
              FetchAllSalons(latitude, longitude, city),
              FetchTopStaff(latitude, longitude)
            ]);

            // CRITICAL: Set loaded only AFTER promise settles
            setIsDataLoaded(true);
          } catch (error) {
            console.error("Geocoding error:", error);
            setAddress(savedCity || "Nearby");
            await FetchAllSalons(latitude, longitude, savedCity || "");
            setIsDataLoaded(true);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Location error:", error);
          setAddress(savedCity || "");
          setIsLoading(false);
          setIsDataLoaded(true);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setAddress(savedCity || "");
      setIsLoading(false);
      setIsDataLoaded(true);
    }
  };

  const handleEnableLocation = () => {
    setIsLoading(true);
    setIsDataLoaded(false);
    getLocationAndFetch();
  };

  const FetchAllSalons = async (lat: number, lon: number, city: string) => {
    try {
      const res = await apiRequest<any[]>(
        `/salons/search?city=${city}&user_latitude=${lat}&user_longitude=${lon}&limit=10`
      );
      setsalons(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setsalons([]);
    }
  };

  const FetchTopStaff = async (lat: number, lon: number) => {
    try {
      const res = await apiRequest<any[]>(`/salons/staff/search?user_latitude=${lat}&user_longitude=${lon}&max_distance_km=30&limit=20`);
      setStaff(res.data || []);
    } catch (err) {
      console.error("Staff fetch failed", err);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen font-sans pb-2 relative overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url('/Background.jpeg')`, backgroundSize: '400px', zIndex: -1 }} />

      <div className="relative z-10">
        <header className="bg-[#1E4D8C] text-white rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto p-6 sm:px-8 sm:pt-8 sm:pb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 max-w-[70%]">
                <div className="w-10 h-10 bg-white p-1 rounded-2xl transition-transform group-hover:scale-105">
                  <img src="/Coiffeurr_Logo.png" alt="salon" className="w-full h-full object-contain" />
                </div>
                <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">
                  {address || "Locating..."}
                </span>
              </div>
              {isloggedin ? (
                <User className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors" onClick={() => navigate("/profile")} />
              ) : (
                <button onClick={() => navigate("/login")} className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 bg-white text-[#1E4D8C] rounded-full hover:bg-opacity-90 transition-all shadow-sm">Login</button>
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              <div onClick={() => navigate("/search")} className="bg-white rounded-2xl p-4 shadow-xl -mb-12 sm:-mb-16 border border-gray-100 cursor-pointer active:scale-[0.98] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-5 h-5 text-[#1E4D8C]" />
                  <span className="text-gray-900 font-bold text-sm sm:text-base">Find a Salon Near You</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 flex items-center border border-gray-100 font-bold text-xs text-gray-400">Tap to search</div>
                  <button className="bg-[#1E4D8C] text-white px-5 sm:px-8 py-2 rounded-lg font-black text-xs sm:text-sm shadow-md">Search</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- TOP STYLISTS SECTION --- */}
        {isDataLoaded && staff.length > 0 && (
          <div className="mt-20 sm:mt-24 mb-10 px-4 sm:px-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex items-center justify-between px-1 mb-4">
              <div>
                <h2 className="text-gray-900 text-lg sm:text-xl font-black tracking-tight">Top Artists Near You</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Expert grooming at your doorstep</p>
              </div>
              {/* <button onClick={() => navigate('/all-experts')} className="text-[#1E4D8C] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><ChevronRight size={20} /></button> */}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {staff.map((member) => (
                <div key={member.staff_id} onClick={() => navigate(`salon/${member.salon_id}/staff/${member.staff_id}`)} className="flex-shrink-0 w-32 sm:w-36 flex flex-col items-center group cursor-pointer">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 border-2 border-dashed border-gray-200 group-hover:border-[#1E4D8C] transition-colors duration-500">
                      <img src={member.image_url || "/placeholder-user.png"} alt={member.name} className="w-full h-full rounded-full object-cover shadow-inner" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-black text-gray-700">{member.rating?.average?.toFixed(1)}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-[#1E4D8C] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">{member.distance}</div>
                  </div>
                  <div className="text-center w-full">
                    <h4 className="font-black text-gray-900 text-sm capitalize truncate leading-tight">{member.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5 truncate">{member.expertise[0]}</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 py-1 px-2 rounded-lg w-fit mx-auto"><Award size={10} /><span>{member.experience_years}Y EXP</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className={`${staff.length > 0 ? 'mt-4' : 'mt-20 sm:mt-24'} mb-4`}>
            <h2 className="text-gray-800 text-lg sm:text-xl font-black tracking-tight mb-6">Recommended for You</h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4 min-h-[200px]">

              {/* LOGIC RE-STRUCTURED TO PREVENT FLICKER */}

              {/* 1. If data is still being fetched, show nothing or a specific internal loader (not the full page one) */}
              {!isDataLoaded ? (
                <div className="w-full py-20 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-[#1E4D8C] rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Finding best salons...</p>
                </div>
              ) :

                /* 2. If loaded but no address (Location denied) */
                !address ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 px-6 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4"><MapPin className="w-8 h-8 text-[#1E4D8C]" /></div>
                    <h3 className="text-gray-900 font-black text-lg mb-2">Location Required</h3>
                    <button onClick={handleEnableLocation} className="bg-[#1E4D8C] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2"><Navigation className="w-4 h-4" /> Enable Location</button>
                  </div>
                ) :

                  /* 3. If loaded, address exists, but array is empty (True empty state) */
                  salons.length === 0 ? (
                    <div className="w-full text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-50 animate-in zoom-in duration-500">
                      <NoSalonsFound />
                    </div>
                  ) : (
                    /* 4. Success state */
                    salons.map((salon) => (
                      <Link to={`/salons/${salon.id}`} key={salon.id} className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group animate-in fade-in">
                        <div className="relative h-44 sm:h-full">
                          <img src={salon.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={salon.salonName} />
                          {salon.distance && (
                            <div className="absolute bottom-3 left-3 bg-[#1E4D8C] text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border border-white/20">
                              <Navigation className="w-3 h-3 fill-current rotate-45" /><span className="text-[10px] font-black tracking-tighter">{salon.distance}</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm"><Star size={12} className="fill-orange-400 text-orange-400" /><span className="text-xs font-black">{salon.rating?.average || "5.0"}</span></div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-black text-base sm:text-lg text-gray-800 pr-2">{salon.salonName}</h3>
                              {salon.priceRange && <span className="shrink-0 text-[10px] sm:text-xs font-black text-[#1E4D8C] bg-blue-50 px-2 py-1 rounded">₹ {salon.priceRange}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-gray-400 flex items-center gap-1 font-bold"><MapPin size={12} className="text-[#1E4D8C]" /><span className="truncate">{salon.address?.city}</span></p>
                              <p className="text-[10px] text-gray-400 line-clamp-1">{salon.address?.street}</p>
                            </div>
                          </div>
                          <button className="mt-4 sm:max-w-[140px] py-2 border-2 border-[#1E4D8C] text-[#1E4D8C] font-black text-xs rounded-xl hover:bg-[#1E4D8C] hover:text-white transition-all">Book Now</button>
                        </div>
                      </Link>
                    ))
                  )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;