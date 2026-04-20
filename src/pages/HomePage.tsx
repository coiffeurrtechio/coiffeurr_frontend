import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { MapPin, User, Search, Star, Navigation, Award } from 'lucide-react';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { usersalonApi } from '../API/SalonsAPIs/UserSalonAPI';
import { Link, useNavigate } from 'react-router-dom';
import NoSalonsFound from './NoSalonsFound';
import Config from '../configs/config';
import Sponser_Footer from '../components/Sponser_Footer';
import GrandEntranceOverlay from '../components/GrandEntranceOverlay';
import { SalonCardSkeleton } from '../components/GlassmorphismSkeleton';
import BottomNavigation from '../components/BottomNavigation';
import SearchOverlay from '../components/SearchOverlay';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const { apiRequest } = useApi();
  const { userapiRequest } = usersalonApi();
  const [salons, setsalons] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const [loadingPhrase, setLoadingPhrase] = useState<string>('Preparing your experience...');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [showUI, setShowUI] = useState<boolean>(false);
  const [userImageUrl, setUserImageUrl] = useState<string>("");

  const loadingPhrases = [
    'Preparing your experience...',
    'Setting the stage...',
    'Curating your style...'
  ];

  // Handle scroll for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation sequence
  useEffect(() => {
    // Start letter reveal animation after GrandEntranceOverlay completes (2.2s)
    const headerTimer = setTimeout(() => {
      setShowHeader(true);
    }, 2200);
    
    // After letter reveal completes (8 letters * 0.1s + 0.5s = 1.3s), show UI
    // Total delay: 2.2s + 1.3s = 3.5s
    const uiTimer = setTimeout(() => {
      setShowUI(true);
    }, 3500);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(uiTimer);
    };
  }, []);

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Fetch user contact details to get image URL when logged in
  useEffect(() => {
    if (isloggedin && parsedUser?.user?.user?.id) {
      const fetchUserImage = async () => {
        try {
          const res = await userapiRequest<any>(`/users/${parsedUser.user.user.id}/pii`);
          if (res.data?.image_url) {
            setUserImageUrl(res.data.image_url);
          }
        } catch (error) {
          console.error("Failed to fetch user image:", error);
        }
      };
      fetchUserImage();
    }
  }, [isloggedin, parsedUser?.user?.user?.id]);

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);

  // Randomize loading phrases
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingPhrases.length);
        setLoadingPhrase(loadingPhrases[randomIndex]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    getLocationAndFetch();
  }, []);

  // Slideshow effect for staff images - random timing and random selection
  useEffect(() => {
    if (staff.length === 0) return;

    const intervals: number[] = [];

    staff.forEach(member => {
      const images = member.images || [];
      if (images.length > 1) {
        // Set up independent timer for each staff member with random interval (5-10 seconds)
        const randomInterval = Math.random() * 5000 + 5000; // 5-10 seconds

        const interval = setInterval(() => {
          setCurrentImageIndices(prev => {
            const newIndices = { ...prev };
            // Pick a random image index (different from current)
            const currentIndex = prev[member.staff_id] || 0;
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * images.length);
            } while (newIndex === currentIndex && images.length > 1);
            newIndices[member.staff_id] = newIndex;
            return newIndices;
          });
        }, randomInterval);

        intervals.push(interval as unknown as number);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [staff]);

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
            const displayAddress = suburb ? `${suburb}, ${city}` : city || t('home.nearby');

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
            setAddress(savedCity || t('home.nearby'));
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-[#D4AF37] rounded-full animate-spin mb-6 mx-auto" />
        <p className="text-sm text-white/80 font-medium tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>{loadingPhrase}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-2 sm:pb-2 relative overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <GrandEntranceOverlay onComplete={() => {}} />
      <div className={`fixed inset-0 opacity-[0.04] pointer-events-none transition-all duration-300 ${isSearchOverlayOpen ? 'blur-sm' : ''}`} style={{ backgroundImage: `url('/Background.jpeg')`, backgroundSize: '400px', zIndex: isSearchOverlayOpen ? 40 : -1 }} />

      <div className="relative z-10">
        <header className="text-white rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg relative z-20 pt-safe pb-safe" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
          <div className="max-w-7xl mx-auto p-6 sm:px-8 sm:pt-8 sm:pb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 max-w-[70%]">
                <div className="w-10 h-10 bg-white p-1 rounded-2xl transition-transform group-hover:scale-105">
                  <img src="/Coiffeurr_Logo.png" alt="salon" className="w-full h-full object-contain" />
                </div>
                <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">
                  {address || t('home.locating')}
                </span>
              </div>
              {isloggedin ? (
                <div 
                  onClick={() => navigate("/profile")}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors overflow-hidden"
                >
                  {userImageUrl ? (
                    <img 
                      src={userImageUrl} 
                      alt="User" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-6 h-6 sm:w-8 sm:h-8 p-1 text-white" />
                  )}
                </div>
              ) : (
                <button onClick={() => navigate("/login")} className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 bg-white text-[#1E4D8C] rounded-full hover:bg-opacity-90 transition-all shadow-sm">{t('home.login')}</button>
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              <div className={`mb-6 text-center transition-all duration-800 ${showHeader ? 'header-slide-up' : ''}`}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 overflow-hidden" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-1px' }}>
                  {'Coiffeur'.split('').map((letter, index) => (
                    <span 
                      key={index} 
                      className={`${showHeader ? 'letter-reveal' : 'opacity-0'} inline-block`}
                      style={{ animationDelay: showHeader ? `${index * 0.05}s` : '0s' }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
                <p className={`text-xs sm:text-sm text-blue-200 ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>Where your signature style is authored.</p>
              </div>

              <div className={`flex justify-center ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s', width: '90%', margin: '0 auto' }}>
                <div
                  onClick={() => setIsSearchOverlayOpen(true)}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-white/20 cursor-pointer active:scale-[0.97] transition-all duration-100 w-full ${isScrolled ? 'sticky top-2 z-30 p-2 sm:p-3 backdrop-blur-xl' : ''}`}
                  style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base">Discover your next transformation</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2.5 flex items-center border border-white/20 font-bold text-xs text-white/70">{t('home.tapToSearch')}</div>
                    <button className="bg-white text-[#0f172a] px-4 py-2 rounded-lg font-black shadow-md flex items-center justify-center">
                      <Search size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- TOP STYLISTS SECTION --- */}
        {isDataLoaded && staff.length > 0 && (
          <div className={`mt-20 sm:mt-24 mb-10 px-4 sm:px-8 max-w-7xl ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between px-1 mb-4">
              <div>
                <h2 className="text-gray-900 text-lg sm:text-xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{t('home.topArtistsNearYou')}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Precision in every snip. Luxury in every touch.</p>
              </div>
              {/* <button onClick={() => navigate('/all-experts')} className="text-[#1E4D8C] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><ChevronRight size={20} /></button> */}
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-snap-x scroll-snap-type-x-mandatory">
              {staff.map((member, index) => (
                <div key={member.staff_id} onClick={() => navigate(`salon/${member.salon_id}/staff/${member.staff_id}`)} className="flex-shrink-0 w-32 sm:w-36 flex flex-col items-center group cursor-pointer artist-bounce scroll-snap-center active:scale-[0.97] transition-transform duration-100" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative mb-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 artist-image-container" style={{ border: '2px solid #D4AF37' }}>
                      <img 
                        key={`${member.staff_id}-${currentImageIndices[member.staff_id] || 0}`}
                        src={member.images?.[currentImageIndices[member.staff_id] || 0] || "/placeholder-user.png"} 
                        alt={member.name} 
                        className="w-full h-full rounded-full object-cover shadow-inner"
                        style={{ 
                          animation: 'fadeIn 0.5s ease-in-out'
                        }}
                      />
                      {/* Social Proof Badge - Top Right */}
                      {index < 3 && (
                        <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap trending-pulse">Trending</div>
                      )}
                      {/* Rating Badge - Top Left */}
                      <div className="absolute top-0 left-0 z-20 bg-white px-2 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-black text-gray-700">{member.rating?.average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center w-full flex flex-col" style={{ minHeight: '100px' }}>
                    <div style={{ minHeight: '50px' }}>
                      <h4 className="font-black text-gray-900 text-sm capitalize truncate leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium truncate">{member.specialty || 'Stylist'}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 py-1 px-2 rounded-lg"><Award size={10} /><span>{member.experience_years}{t('home.yExp')}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className={`${staff.length > 0 ? 'mt-4' : 'mt-20 sm:mt-24'} mb-4`}>
            <h2 className="text-gray-800 text-lg sm:text-xl font-black tracking-tight mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>{t('home.recommendedForYou')}</h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4 min-h-[200px]">

              {/* LOGIC RE-STRUCTURED TO PREVENT FLICKER */}

              {/* 1. If data is still being fetched, show glassmorphism skeletons */}
              {!isDataLoaded ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4">
                  {[1, 2, 3].map((i) => (
                    <SalonCardSkeleton key={i} />
                  ))}
                </div>
              ) :

                /* 2. If loaded but no address (Location denied) */
                !address ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 px-6 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4"><MapPin className="w-8 h-8 text-[#1E4D8C]" /></div>
                    <h3 className="text-gray-900 font-black text-lg mb-2">{t('home.locationRequired')}</h3>
                    <button onClick={handleEnableLocation} className="bg-[#1E4D8C] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2"><Navigation className="w-4 h-4" /> {t('home.enableLocation')}</button>
                  </div>
                ) :

                  /* 3. If loaded, address exists, but array is empty (True empty state) */
                  salons.length === 0 ? (
                    <div className="w-full text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-50 animate-in zoom-in duration-500">
                      <NoSalonsFound />
                    </div>
                  ) : (
                    /* 4. Success state */
                    salons.map((salon, index) => {
                      const distance = salon.distance ? parseFloat(salon.distance) : 0;
                      const displayDistance = distance < 0.1 ? '< 0.1 km' : `${distance.toFixed(1)} km`;
                      
                      return (
                      <Link to={`/salons/${salon.id}`} key={salon.id} className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden group salon-slide-up active:scale-[0.97] transition-transform duration-100 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', animationDelay: `${index * 0.15}s` }}>
                        <div className="relative h-44 sm:h-full">
                          <img src={salon.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={salon.salonName} />
                          {/* Social Proof Badge for Salons */}
                          {index < 2 && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-[9px] font-black px-2.5 py-1 rounded-xl shadow-md">Most Booked</div>
                          )}
                          {salon.distance && (
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-200">
                              <MapPin className="w-3 h-3" /><span className="text-[9px] font-bold uppercase tracking-[0.05em]">{displayDistance}</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"><Star size={12} className="fill-orange-400 text-orange-400" /><span className="text-xs font-black">{salon.rating?.average || "5.0"}</span></div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-black text-base sm:text-lg text-gray-800 pr-2" style={{ fontFamily: 'Playfair Display, serif' }}>{salon.salonName}</h3>
                              {salon.priceRange && <span className="shrink-0 text-[11px] sm:text-xs font-bold text-[#D4AF37] bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-xl border border-[#D4AF37]/20 shadow-sm">₹{salon.priceRange}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-gray-400 flex items-center gap-1 font-bold"><MapPin size={12} className="text-[#0f172a]" /><span className="truncate">{salon.address?.city}</span></p>
                              <p className="text-[10px] text-gray-400 line-clamp-1">{salon.address?.street}</p>
                            </div>
                          </div>
                          <button className="mt-4 sm:max-w-[140px] py-2.5 font-black text-xs rounded-xl transition-all hover:scale-105 book-now-button luxury-transition bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0f172a] shadow-lg shadow-[#D4AF37]/20">{t('home.bookNow')}</button>
                        </div>
                      </Link>
                      );
                    })
                  )}
            </div>
          </div>
        </main>
        <BottomNavigation />
        <Sponser_Footer collapsed={false} />
        <div className="h-16 sm:hidden" />
      </div>
      <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} />
    </div>
  );
};

export default HomePage;