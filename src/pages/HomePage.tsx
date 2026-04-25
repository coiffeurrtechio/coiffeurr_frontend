import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { MapPin, User, Search, Star, Navigation, Award, X, ChevronDown } from 'lucide-react';
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
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // Filter state
  const [sortBy, setSortBy] = useState<string>('relevant');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [filteredSalons, setFilteredSalons] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState<boolean>(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState<boolean>(false);
  const [isRatingSortDropdownOpen, setIsRatingSortDropdownOpen] = useState<boolean>(false);
  const [isPriceSortDropdownOpen, setIsPriceSortDropdownOpen] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

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
    const fromLogin = sessionStorage.getItem('fromLogin');
    if (fromLogin === 'true') {
      setShowOverlay(true);
      sessionStorage.removeItem('fromLogin');
    }

    // Start letter reveal animation after GrandEntranceOverlay completes (3.4s)
    const headerTimer = setTimeout(() => {
      setShowHeader(true);
    }, showOverlay ? 3400 : 0);

    // After letter reveal completes (8 letters * 0.1s + 0.5s = 1.3s), show UI
    // Total delay: 3.4s + 1.3s = 4.7s
    const uiTimer = setTimeout(() => {
      setShowUI(true);
    }, showOverlay ? 4700 : 0);

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
    const fromLogin = sessionStorage.getItem('fromLogin');
    if (fromLogin === 'true') {
      // Skip fetch if just logged in (image already fetched in LoginPage)
      return;
    }
    if (isloggedin && parsedUser?.user?.id) {
      const fetchUserImage = async () => {
        try {
          const res = await userapiRequest<any>(`/users/${parsedUser.user.id}/pii`);
          if (res.data?.image_url) {
            setUserImageUrl(res.data.image_url);
          }
        } catch (error) {
          console.error("Failed to fetch user image:", error);
        }
      };
      fetchUserImage();
    }
  }, [isloggedin, parsedUser?.user?.id]);

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

  // Apply filters and sorting
  useEffect(() => {
    if (!salons.length) {
      setFilteredSalons([]);
      return;
    }

    setIsFiltering(true);
    let result = [...salons];

    // Filter by distance
    if (distanceFilter !== 'all') {
      const maxDistance = distanceFilter === '2km' ? 2 : distanceFilter === '5km' ? 5 : distanceFilter === '10km' ? 10 : distanceFilter === '15km' ? 15 : 20;
      result = result.filter(salon => {
        const dist = parseFloat(salon.distance || '999');
        return dist <= maxDistance;
      });
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const minPrice = parseInt(priceRange);
      result = result.filter(salon => {
        const price = parseInt(salon.priceRange || '9999');
        return price >= minPrice;
      });
    }

    // Sort
    switch (sortBy) {
      case 'rating_high_low':
        result.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'rating_low_high':
        result.sort((a, b) => (a.rating?.average || 0) - (b.rating?.average || 0));
        break;
      case 'price_low_high':
        result.sort((a, b) => (parseInt(a.priceRange || '9999')) - (parseInt(b.priceRange || '9999')));
        break;
      case 'price_high_low':
        result.sort((a, b) => (parseInt(b.priceRange || '9999')) - (parseInt(a.priceRange || '9999')));
        break;
      case 'distance':
        result.sort((a, b) => (parseFloat(a.distance || '999')) - (parseFloat(b.distance || '999')));
        break;
      default:
        break;
    }

    setFilteredSalons(result);
    setIsFiltering(false);
  }, [salons, sortBy, distanceFilter, priceRange]);

  const clearFilters = () => {
    setDistanceFilter('all');
    setPriceRange('all');
    setSortBy('relevant');
  };

  const hasActiveFilters = distanceFilter !== 'all' || priceRange !== 'all' || sortBy !== 'relevant';

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
      {showOverlay && <GrandEntranceOverlay onComplete={() => {}} />}
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
                <button onClick={() => navigate("/login")} className="text-[10px] font-bold tracking-[0.2em] px-5 py-2.5 bg-white text-[#1E4D8C] rounded-full hover:bg-opacity-90 transition-all shadow-sm">{t('home.login')}</button>
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
                <p className={`text-xs sm:text-sm text-blue-200 ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>{t('home.tagline') || 'Where your signature style is authored.'}</p>
              </div>

              <div className={`flex justify-center ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s', width: '100%', margin: '0 auto' }}>
                <div
                  onClick={() => setIsSearchOverlayOpen(true)}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-white/20 cursor-pointer active:scale-[0.97] transition-all duration-100 w-full ${isScrolled ? 'sticky top-2 z-30 p-2 sm:p-3 backdrop-blur-xl' : ''}`}
                  style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base">{t('home.discoverTransformation') || 'Discover your next transformation'}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2.5 flex items-center border border-white/20 font-bold text-[10px] sm:text-xs text-white/70">{t('home.tapToSearch')}</div>
                    <button className="bg-white text-[#0f172a] px-3 sm:px-4 py-2 rounded-lg font-black shadow-md flex items-center justify-center">
                      <Search size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* --- TOP STYLISTS SECTION --- */}
          {isDataLoaded && staff.length > 0 && (
            <div className={`mt-20 sm:mt-24 mb-2 ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between px-1 mb-4">
                <div>
                  <h2 className="text-gray-900 text-lg sm:text-xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{t('home.topArtistsNearYou')}</h2>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mt-1">{t('home.precisionLuxury') || 'Precision in every snip. Luxury in every touch.'}</p>
                </div>
                {/* <button onClick={() => navigate('/all-experts')} className="text-[#1E4D8C] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><ChevronRight size={20} /></button> */}
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-snap-x scroll-snap-type-x-mandatory">
                {staff.map((member, index) => (
                  <div key={member.staff_id} onClick={() => navigate(`salon/${member.salon_id}/staff/${member.staff_id}`)} className="flex-shrink-0 w-28 sm:w-32 md:w-36 flex flex-col items-center group cursor-pointer artist-bounce scroll-snap-center active:scale-[0.97] transition-transform duration-100" style={{ animationDelay: `${index * 0.1}s` }}>
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
                          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap trending-pulse">{t('home.trending') || 'Trending'}</div>
                        )}
                        {/* Rating Badge - Top Left */}
                        <div className="absolute top-0 left-0 z-20 bg-white px-2 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-1">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-black text-gray-700">{member.rating?.average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center w-full flex flex-col" style={{ minHeight: '90px' }}>
                      <div style={{ minHeight: '50px' }}>
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm capitalize truncate leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">{member.specialty || t('home.stylist')}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 mt-1 sm:mt-2">
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-emerald-600 bg-emerald-50 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg"><Award size={10} className="w-2 h-2 sm:w-2.5 sm:h-2.5" /><span>{member.experience_years}{t('home.yExp')}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={`${staff.length > 0 ? 'mt-4' : 'mt-8 sm:mt-12'} mb-4`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800 text-lg sm:text-xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{t('home.recommendedForYou')}</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs font-bold text-[#D4AF37] hover:text-[#c9a037] transition-colors">
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
              <div className="flex gap-2 flex-wrap relative">
                {/* Sort By: Distance */}
                {sortBy === 'distance' ? (
                  <button
                    onClick={() => setSortBy('relevant')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-[#D4AF37] bg-[#D4AF37] text-white"
                  >
                    Nearest <X size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => setSortBy('distance')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  >
                    Nearest
                  </button>
                )}

                {/* Sort By: Rating */}
                {sortBy === 'rating_high_low' || sortBy === 'rating_low_high' ? (
                  <div className="relative">
                    <button
                      onClick={() => setSortBy('relevant')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-[#D4AF37] bg-[#D4AF37] text-white"
                    >
                      Rating: {sortBy === 'rating_high_low' ? 'High-Low' : 'Low-High'} <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsRatingSortDropdownOpen(!isRatingSortDropdownOpen);
                        setIsPriceSortDropdownOpen(false);
                        setIsDistanceDropdownOpen(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    >
                      Rating <ChevronDown size={12} />
                    </button>
                    {isRatingSortDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[140px] z-50">
                        <button
                          onClick={() => { setSortBy('rating_high_low'); setIsRatingSortDropdownOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          High-Low
                        </button>
                        <button
                          onClick={() => { setSortBy('rating_low_high'); setIsRatingSortDropdownOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          Low-High
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Sort Dropdown */}
                {sortBy === 'price_low_high' || sortBy === 'price_high_low' ? (
                  <div className="relative">
                    <button
                      onClick={() => setSortBy('relevant')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-[#D4AF37] bg-[#D4AF37] text-white"
                    >
                      Cost: {sortBy === 'price_high_low' ? 'High-Low' : 'Low-High'} <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsPriceSortDropdownOpen(!isPriceSortDropdownOpen);
                        setIsRatingSortDropdownOpen(false);
                        setIsDistanceDropdownOpen(false);
                        setIsPriceDropdownOpen(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    >
                      Cost <ChevronDown size={12} />
                    </button>
                    {isPriceSortDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[140px] z-50">
                        <button
                          onClick={() => { setSortBy('price_low_high'); setIsPriceSortDropdownOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          Low-High
                        </button>
                        <button
                          onClick={() => { setSortBy('price_high_low'); setIsPriceSortDropdownOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                        >
                          High-Low
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="relative">
                  {priceRange !== 'all' ? (
                    <button
                      onClick={() => setPriceRange('all')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-[#D4AF37] bg-[#D4AF37] text-white"
                    >
                      ₹{priceRange}+ <X size={12} />
                    </button>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsPriceDropdownOpen(!isPriceDropdownOpen);
                          setIsDistanceDropdownOpen(false);
                          setIsRatingSortDropdownOpen(false);
                          setIsPriceSortDropdownOpen(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      >
                        Price <ChevronDown size={12} />
                      </button>
                      {isPriceDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[140px] z-50">
                          <button
                            onClick={() => { setPriceRange('100'); setIsPriceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            ₹100+ (Budget)
                          </button>
                          <button
                            onClick={() => { setPriceRange('300'); setIsPriceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            ₹300+ (Standard)
                          </button>
                          <button
                            onClick={() => { setPriceRange('500'); setIsPriceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            ₹500+ (Mid-range)
                          </button>
                          <button
                            onClick={() => { setPriceRange('1000'); setIsPriceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            ₹1000+ (Premium)
                          </button>
                          <button
                            onClick={() => { setPriceRange('2000'); setIsPriceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            ₹2000+ (Luxury)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* Distance Filter with Custom Dropdown */}
                <div className="relative">
                  {distanceFilter !== 'all' ? (
                    <button
                      onClick={() => setDistanceFilter('all')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-[#D4AF37] bg-[#D4AF37] text-white"
                    >
                      {distanceFilter === '2km' ? 'Within 2km' : distanceFilter === '5km' ? 'Within 5km' : distanceFilter === '10km' ? 'Within 10km' : distanceFilter === '15km' ? 'Within 15km' : '20km+'} <X size={12} />
                    </button>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsDistanceDropdownOpen(!isDistanceDropdownOpen);
                          setIsPriceSortDropdownOpen(false);
                          setIsRatingSortDropdownOpen(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      >
                        Distance <ChevronDown size={12} />
                      </button>
                      {isDistanceDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[140px] z-50">
                          <button
                            onClick={() => { setDistanceFilter('2km'); setIsDistanceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            Within 2km
                          </button>
                          <button
                            onClick={() => { setDistanceFilter('5km'); setIsDistanceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            Within 5km
                          </button>
                          <button
                            onClick={() => { setDistanceFilter('10km'); setIsDistanceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            Within 10km
                          </button>
                          <button
                            onClick={() => { setDistanceFilter('15km'); setIsDistanceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            Within 15km
                          </button>
                          <button
                            onClick={() => { setDistanceFilter('20km+'); setIsDistanceDropdownOpen(false); }}
                            className="block w-full px-4 py-2 text-left text-[10px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            20km+
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-3">
                {sortBy !== 'relevant' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]">
                    {sortBy === 'rating_high_low' ? 'Rating: High-Low' : sortBy === 'rating_low_high' ? 'Rating: Low-High' : sortBy === 'price_high_low' ? 'Cost: High-Low' : sortBy === 'price_low_high' ? 'Cost: Low-High' : 'Nearest'}
                    <button onClick={() => setSortBy('relevant')} className="hover:text-[#c9a037] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
                {priceRange !== 'all' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]">
                    ₹{priceRange}+
                    <button onClick={() => setPriceRange('all')} className="hover:text-[#c9a037] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
                {distanceFilter !== 'all' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]">
                    {distanceFilter === '2km' ? 'Within 2km' : distanceFilter === '5km' ? 'Within 5km' : distanceFilter === '10km' ? 'Within 10km' : distanceFilter === '15km' ? 'Within 15km' : '20km+'}
                    <button onClick={() => setDistanceFilter('all')} className="hover:text-[#c9a037] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500">
                Showing {filteredSalons.length} salons near you
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4 min-h-[200px]">

              {/* LOGIC RE-STRUCTURED TO PREVENT FLICKER */}

              {/* 1. If data is still being fetched, show glassmorphism skeletons */}
              {!isDataLoaded || isFiltering ? (
                <div className="col-span-full grid grid-cols-1 gap-4 sm:gap-6 pb-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SalonCardSkeleton key={i} />
                  ))}
                </div>
              ) :

                /* 2. If loaded but no address (Location denied) */
                !address ? (
                  <div className="col-span-full w-full flex flex-col items-center justify-center py-16 px-6 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4"><MapPin className="w-8 h-8 text-[#1E4D8C]" /></div>
                    <h3 className="text-gray-900 font-black text-lg mb-2">{t('home.locationRequired')}</h3>
                    <button onClick={handleEnableLocation} className="bg-[#1E4D8C] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2"><Navigation className="w-4 h-4" /> {t('home.enableLocation')}</button>
                  </div>
                ) :

                  /* 3. If loaded, address exists, but array is empty (True empty state) */
                  filteredSalons.length === 0 ? (
                    <div className="col-span-full w-full text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-50 animate-in zoom-in duration-500">
                      <p className="text-gray-500 font-bold mb-4">No salons match your criteria</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="px-6 py-3 bg-[#D4AF37] text-white rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    /* 4. Success state with pagination */
                    <>
                      {filteredSalons.slice(0, displayLimit).map((salon, index) => {
                        const distance = salon.distance ? parseFloat(salon.distance) : 0;
                        const displayDistance = distance < 0.1 ? '< 0.1 km' : `${distance.toFixed(1)} km`;

                        return (
                        <Link to={`/salons/${salon.id}`} key={salon.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group flex hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="relative w-32 sm:w-36 h-32 sm:h-36 shrink-0">
                            <img src={salon.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&amp;w=400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={salon.salonName} />
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-base text-gray-900 truncate" style={{ fontFamily: 'Playfair Display, serif' }}>{salon.salonName}</h3>
                                <div className="flex items-center gap-1 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full shrink-0">
                                  <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                                  <span className="text-xs font-bold text-[#D4AF37]">{salon.rating?.average || "5.0"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                                {salon.distance && (
                                  <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" />{displayDistance}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {salon.salonType && <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{salon.salonType}</span>}
                                {salon.salonServices && salon.salonServices.length > 0 && (
                                  <>
                                    {(expandedServices[salon.id] ? salon.salonServices : salon.salonServices.slice(0, 2)).map((service: any, idx: number) => (
                                      <span key={idx} className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{service.name || service.serviceName}</span>
                                    ))}
                                    {salon.salonServices.length > 2 && (
                                      <button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setExpandedServices(prev => ({ ...prev, [salon.id]: !prev[salon.id] }));
                                        }}
                                        className="text-[10px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full cursor-pointer hover:bg-[#D4AF37]/20"
                                      >
                                        {expandedServices[salon.id] ? 'See less' : 'See all'}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#D4AF37]">Starting from ₹{salon.priceRange || '299'}</span>
                              <button className="py-1.5 px-4 font-bold text-xs rounded-lg transition-all hover:bg-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">{t('home.bookNow')}</button>
                            </div>
                          </div>
                        </Link>
                        );
                      })}

                      {/* See More Button */}
                      {displayLimit < filteredSalons.length && (
                        <div className="col-span-full flex justify-center mt-6">
                          {isLoadingMore ? (
                            <div className="flex items-center gap-2 px-8 py-3 bg-white/80 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold text-sm shadow-lg">
                              <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                              Loading more premium salons...
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setIsLoadingMore(true);
                                setTimeout(() => {
                                  setDisplayLimit(prev => prev + 10);
                                  setIsLoadingMore(false);
                                }, 800);
                              }}
                              className="px-8 py-3 bg-white/80 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold text-sm shadow-lg hover:bg-white/90 transition-all"
                            >
                              See More Salons
                            </button>
                          )}
                        </div>
                      )}
                    </>
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