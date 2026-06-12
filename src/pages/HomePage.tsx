import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { MapPin, User, Search, Star, Navigation, Award, X, ChevronDown, ChevronRight } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
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
import PromoPopup from '../components/PromoPopup';
import { getDefaultStaffImage, getDefaultSalonImage } from '../utils/defaultServiceImage';
import LocationSelector from '../components/LocationSelector';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState<boolean>(false);
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
  const [showCityConfirmation, setShowCityConfirmation] = useState<boolean>(false);
  const [pendingCityChange, setPendingCityChange] = useState<{city: string, lat: number, lon: number, distance: number} | null>(null);
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

  const getLocationAndFetch = async (retryCount = 0) => {
    const savedCity = localStorage.getItem("Address");
    const savedSelectedCity = localStorage.getItem("selectedCity"); // User's manually selected city
    const savedLat = localStorage.getItem("userLat");
    const savedLon = localStorage.getItem("userLon");

    const fetchWithCoords = async (latitude: number, longitude: number) => {
      // If user has manually selected a city, use that instead of geolocated city
      if (savedSelectedCity) {
        setAddress(savedSelectedCity);
        setSelectedCity(savedSelectedCity);
        setUserLat(latitude);
        setUserLon(longitude);
        if (savedSelectedCity) localStorage.setItem("Address", savedSelectedCity);
        localStorage.setItem("userLat", String(latitude));
        localStorage.setItem("userLon", String(longitude));

        try {
          await Promise.all([
            FetchAllSalons(latitude, longitude, savedSelectedCity),
            FetchTopStaff(latitude, longitude, savedSelectedCity)
          ]);
          console.log("✓ Both APIs called successfully with saved selected city");
        } catch (apiError) {
          console.error("API call error:", apiError);
        }
        setIsDataLoaded(true);
        setIsLoading(false);
        return;
      }

      const body = {
        "lat": latitude,
        "lon": longitude,
        "language": "en"
      };
      try {
        const response = await fetch(`${Config.API_Customers}/geolocation/geolocation/location-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body)
        });

        const data = await response.json();

        const city = data.address.city || data.address.town || data.address.village || "";
        const suburb = data.address.suburb || data.address.neighbourhood || "";
        const displayAddress = suburb ? `${suburb}, ${city}` : city || t('home.nearby');

        setAddress(displayAddress);
        setSelectedCity(city);
        setUserLat(latitude);
        setUserLon(longitude);
        if (city) localStorage.setItem("Address", city);
        localStorage.setItem("userLat", String(latitude));
        localStorage.setItem("userLon", String(longitude));

        try {
          await Promise.all([
            FetchAllSalons(latitude, longitude, city),
            FetchTopStaff(latitude, longitude, city)
          ]);
          console.log("✓ Both APIs called successfully");
        } catch (apiError) {
          console.error("API call error:", apiError);
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Geocoding error:", error);
        setAddress(savedCity || t('home.nearby'));
        setSelectedCity(savedCity || "");
        setUserLat(latitude);
        setUserLon(longitude);
        try {
          await FetchAllSalons(latitude, longitude, savedCity || "");
        } catch (apiError) {
          console.error("Fallback API call error:", apiError);
        }
        setIsDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Clear location denied flag on successful location fetch
          localStorage.removeItem("locationDenied");
          fetchWithCoords(latitude, longitude);
        },
        (error) => {
          console.error(`Location error (attempt ${retryCount + 1}):`, error);

          // Check if permission was denied
          if (error.code === error.PERMISSION_DENIED) {
            console.log("Location permission denied");
            // Check if we've already denied location before
            const locationDeniedPreviously = localStorage.getItem("locationDenied");
            
            // If no saved coordinates, handle location denial
            if (!savedLat || !savedLon) {
              if (locationDeniedPreviously && !savedSelectedCity) {
                // Already denied before and no selected city - use fallback automatically
                console.log("Location denied previously, using fallback automatically");
                const defaultLat = 19.0760; // Mumbai
                const defaultLon = 72.8777;
                const defaultCity = "Mumbai";
                setAddress(defaultCity);
                setSelectedCity("");
                setUserLat(defaultLat);
                setUserLon(defaultLon);
                FetchAllSalons(defaultLat, defaultLon, "").catch(err => console.error("Fallback API call error:", err));
                FetchTopStaff(defaultLat, defaultLon, "").catch(err => console.error("Fallback API call error:", err));
                setIsDataLoaded(true);
                setIsLoading(false);
                return;
              } else {
                // First time denying - show location denied screen
                localStorage.setItem("locationDenied", "true");
                setLocationDenied(true);
                setIsLoading(false);
                return;
              }
            }
          }

          // Retry once with high accuracy disabled and longer timeout
          if (retryCount < 1) {
            console.log("Retrying geolocation...");
            getLocationAndFetch(retryCount + 1);
            return;
          }

          // After retry fails, use saved coordinates if available
          if (savedLat && savedLon) {
            console.log("Using saved coordinates as fallback");
            setAddress(savedCity || t('home.nearby'));
            setSelectedCity(savedCity || "");
            setUserLat(parseFloat(savedLat));
            setUserLon(parseFloat(savedLon));
            fetchWithCoords(parseFloat(savedLat), parseFloat(savedLon));
          } else {
            setLocationDenied(true);
            setIsLoading(false);
          }
        },
        { timeout: retryCount === 0 ? 8000 : 15000, enableHighAccuracy: retryCount === 0, maximumAge: 300000 }
      );
    } else {
      // No geolocation API — use saved coordinates or default location
      if (savedLat && savedLon) {
        setAddress(savedCity || t('home.nearby'));
        setSelectedCity(savedCity || "");
        setUserLat(parseFloat(savedLat));
        setUserLon(parseFloat(savedLon));
        fetchWithCoords(parseFloat(savedLat), parseFloat(savedLon));
      } else {
        // No saved location - use default coordinates (Mumbai) to ensure APIs are called
        const defaultLat = 19.0760; // Mumbai
        const defaultLon = 72.8777;
        const defaultCity = "Mumbai";
        setAddress(defaultCity);
        setSelectedCity(""); // No selected city, will use nearby discovery
        setUserLat(defaultLat);
        setUserLon(defaultLon);
        console.log("Using default location (Mumbai) as fallback");
        // Call APIs without city filter (nearby discovery mode)
        try {
          await Promise.all([
            FetchAllSalons(defaultLat, defaultLon, ""),
            FetchTopStaff(defaultLat, defaultLon, "")
          ]);
          setIsDataLoaded(true);
        } catch (apiError) {
          console.error("Fallback API call error:", apiError);
          setIsDataLoaded(true); // Still mark as loaded to prevent infinite loading
        }
        setIsLoading(false);
      }
    }
  };

  const handleLocationSelect = async (city: string, lat: number, lon: number) => {
    // Calculate distance from user's current location
    let distance = 0;
    if (userLat !== null && userLon !== null) {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (lat - userLat) * Math.PI / 180;
      const dLon = (lon - userLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
    }

    // If distance > 50km, show confirmation dialog
    if (distance > 50) {
      setPendingCityChange({ city, lat, lon, distance });
      setShowCityConfirmation(true);
      return;
    }

    // Proceed with city change
    confirmCityChange(city, lat, lon);
  };

  const confirmCityChange = async (city: string, lat: number, lon: number) => {
    setSelectedCity(city);
    setAddress(city);
    localStorage.setItem("Address", city);
    localStorage.setItem("selectedCity", city); // Persist user's selected city
    localStorage.removeItem("locationDenied"); // Clear location denied flag
    setLocationDenied(false);
    setIsLoading(true);
    setIsDataLoaded(false);
    setShowCityConfirmation(false);
    setPendingCityChange(null);

    // Use user's current location for distance calculation if available
    const currentLat = userLat !== null ? userLat : lat;
    const currentLon = userLon !== null ? userLon : lon;

    try {
      await Promise.all([
        FetchAllSalons(currentLat, currentLon, city),
        FetchTopStaff(currentLat, currentLon, city)
      ]);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching data for selected location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableLocation = () => {
    console.log("handleEnableLocation called");
    setLocationDenied(false);
    setIsLoading(true);
    setIsDataLoaded(false);
    
    // Clear any cached location data to force a fresh request
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLon");
    localStorage.removeItem("selectedCity"); // Clear manually selected city since user wants to use current location
    
    // Make a fresh location request with mobile-friendly settings
    if (navigator.geolocation) {
      console.log("Requesting browser geolocation...");
      // Use longer timeout for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const timeout = isMobile ? 30000 : 15000;
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location granted successfully:", { latitude, longitude });
          
          // Call the geolocation API to get address details
          const body = {
            "lat": latitude,
            "lon": longitude,
            "language": "en"
          };
          
          const apiUrl = `${Config.API_Customers}/geolocation/geolocation/location-details`;
          console.log("Calling geolocation API:", apiUrl, "with body:", body);
          
          try {
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body)
            });

            console.log("Geolocation API response status:", response.status);
            
            if (!response.ok) {
              throw new Error(`API call failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Geolocation API response data:", data);

            const city = data.address.city || data.address.town || data.address.village || "";
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            const displayAddress = suburb ? `${suburb}, ${city}` : city || 'Nearby';

            console.log("Setting address:", displayAddress);
            setAddress(displayAddress);
            if (city) localStorage.setItem("Address", city);
            localStorage.setItem("userLat", String(latitude));
            localStorage.setItem("userLon", String(longitude));

            // Fetch salons and staff
            console.log("Fetching salons and staff...");
            try {
              await Promise.all([
                FetchAllSalons(latitude, longitude, city),
                FetchTopStaff(latitude, longitude, city)
              ]);
              console.log("✓ Both APIs called successfully");
            } catch (apiError) {
              console.error("API call error:", apiError);
            }

            setIsDataLoaded(true);
          } catch (error) {
            console.error("Geocoding error:", error);
            setAddress('');
            try {
              await FetchAllSalons(latitude, longitude, "");
            } catch (apiError) {
              console.error("Fallback API call error:", apiError);
            }
            setIsDataLoaded(true);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Location error after enable:", error);
          console.error("Error code:", error.code, "Error message:", error.message);
          
          // Handle mobile-specific errors
          if (error.code === error.PERMISSION_DENIED) {
            console.log("Permission still denied, showing denied screen");
            setLocationDenied(true);
            setIsLoading(false);
          } else if (error.code === error.TIMEOUT) {
            console.log("Location request timed out on mobile, showing denied screen");
            setLocationDenied(true);
            setIsLoading(false);
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.log("Position unavailable on mobile, showing denied screen");
            setLocationDenied(true);
            setIsLoading(false);
          } else {
            // For other errors, try the normal flow
            console.log("Other error, trying normal flow");
            getLocationAndFetch();
          }
        },
        { 
          timeout: timeout, 
          enableHighAccuracy: false,
          maximumAge: 0 // Force fresh location
        }
      );
    } else {
      console.log("Geolocation not supported");
      setLocationDenied(true);
      setIsLoading(false);
    }
  };

  const FetchAllSalons = async (lat: number, lon: number, city: string) => {
    try {
      console.log(`Fetching salons for: lat=${lat}, lon=${lon}, city=${city}`);
      const res = await apiRequest<any[]>(
        `/salons/search?selected_city=${city}&user_latitude=${lat}&user_longitude=${lon}&limit=10`
      );
      console.log("✓ Salons fetched:", res.data?.length || 0);
      setsalons(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("Fetch salons error:", err);
      setsalons([]);
      throw err; // Re-throw so Promise.all knows there was an error
    }
  };

  const FetchTopStaff = async (lat: number, lon: number, selected_city: string = "") => {
    try {
      console.log(`Fetching top staff for: lat=${lat}, lon=${lon}, city=${selected_city}`);
      const url = selected_city 
        ? `/salons/staff/search?selected_city=${selected_city}&user_latitude=${lat}&user_longitude=${lon}&limit=20`
        : `/salons/staff/search?user_latitude=${lat}&user_longitude=${lon}&max_distance_km=30&limit=20`;
      const res = await apiRequest<any[]>(url);
      console.log("✓ Staff fetched:", res.data?.length || 0);
      setStaff(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("Fetch staff error:", err);
      setStaff([]);
      throw err; // Re-throw so Promise.all knows there was an error
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
        const priceRangeStr = salon.priceRange || '';
        // Extract minimum price from string like "₹100 - ₹500" or "₹100"
        const match = priceRangeStr.match(/₹(\d+)/);
        const salonMinPrice = match ? parseInt(match[1]) : 0;
        return salonMinPrice >= minPrice;
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

  if (locationDenied) {
    setIsLocationSelectorOpen(true);
    setLocationDenied(false);
  }

  return (
    <div className="min-h-screen font-sans pb-2 sm:pb-2 relative overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {showOverlay && <GrandEntranceOverlay onComplete={() => {}} />}
      <div className={`fixed inset-0 opacity-[0.04] pointer-events-none transition-all duration-300 ${isSearchOverlayOpen ? 'blur-sm' : ''}`} style={{ backgroundImage: `url('/Background.jpeg')`, backgroundSize: '400px', zIndex: isSearchOverlayOpen ? 40 : -1 }} />

      <div className="relative z-10">
        <header className="text-white rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg relative z-20 pt-safe pb-safe" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
          <div className="max-w-7xl mx-auto p-6 sm:px-8 sm:pt-8 sm:pb-2">
            <div className="flex items-center justify-between mb-8">
              {/* Left: Location */}
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="flex items-center gap-2 max-w-[30%] sm:max-w-[25%] active:scale-95 transition-all cursor-pointer hover:bg-white/10 hover:opacity-90 rounded-lg px-2 py-1"
              >
                <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">
                  {address || t('home.locating')}
                </span>
                <ChevronDown className="w-3 h-3 text-blue-200 shrink-0" />
              </button>
              
              {/* Right: Notification + Profile/Login */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Center - Only show when logged in */}
                {isloggedin && (
                  <NotificationCenter userType="customer" iconColor="#FFFFFF" />
                )}

                {/* Profile/Login */}
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
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold transition-colors"
                  >
                    {t('home.login')}
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className={`mb-4 text-center transition-all duration-800 ${showHeader ? 'header-slide-up' : ''}`}>
                {/* Main Brand Name */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1 overflow-hidden" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.02em' }}>
                  {'Coiffeurr'.split('').map((letter, index) => (
                    <span 
                      key={index} 
                      className={`${showHeader ? 'letter-reveal' : 'opacity-0'} inline-block`}
                      style={{ animationDelay: showHeader ? `${index * 0.05}s` : '0s' }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
                
                {/* Accent - Your Stylist */}
                <p className={`${showUI ? 'ui-fade-in' : 'opacity-0'} text-lg sm:text-xl md:text-2xl font-serif italic mb-3`} style={{ 
                  animationDelay: '0.7s', 
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 25%, #D4AF37 50%, #C9A227 75%, #D4AF37 100%)',
                  backgroundSize: '200% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em',
                  filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
                }}>
                  Your Stylist
                </p>
                
                {/* Value Proposition Tagline - Lighter & Sleeker */}
                <p className={`text-sm sm:text-base font-light text-slate-300 text-center ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                  Skip the <span className="font-medium text-amber-300">Wait</span>, Fix the <span className="font-medium text-amber-300">Date</span>
                </p>
              </div>

              <div className={`flex justify-center ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s', width: '100%', margin: '0 auto' }}>
                <div
                  onClick={() => setIsSearchOverlayOpen(true)}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-white/20 cursor-pointer active:scale-[0.97] transition-all duration-100 w-full ${isScrolled ? 'sticky top-2 z-30 p-2 sm:p-3 backdrop-blur-xl' : ''}`}
                  style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {/* <Search className="w-5 h-5 text-white" /> */}
                    <span className="text-white ml-2 font-bold text-sm sm:text-base bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px', textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}>{ 'Book Your Salon or Parlour'}</span>
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
            <div className={`mt-12 sm:mt-16 mb-2 ${showUI ? 'ui-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between px-1 mb-2">
                <div>
                  <h2 className="text-gray-900 text-lg sm:text-xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{t('home.topArtistsNearYou')}</h2>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mt-0.5">{t('home.precisionLuxury') || 'Precision in every snip. Luxury in every touch.'}</p>
                </div>
                {/* <button onClick={() => navigate('/all-experts')} className="text-[#1E4D8C] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><ChevronRight size={20} /></button> */}
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-snap-x scroll-snap-type-x-mandatory">
                {staff.map((member, index) => (
                  <div key={member.staff_id} onClick={() => navigate(`salon/${member.salon_id}/staff/${member.staff_id}`)} className="flex-shrink-0 w-24 sm:w-28 md:w-32 flex flex-col items-center group cursor-pointer artist-bounce scroll-snap-center active:scale-[0.97] transition-transform duration-100" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative mb-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 artist-image-container" style={{ border: '2px solid #D4AF37' }}>
                        <img
                          key={`${member.staff_id}-${currentImageIndices[member.staff_id] || 0}`}
                          src={member.images?.[currentImageIndices[member.staff_id] || 0] || getDefaultStaffImage(member.staff_id || member.name || '')}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover shadow-inner"
                          style={{
                            animation: 'fadeIn 0.5s ease-in-out'
                          }}
                        />
                        {/* Rating Badge - Top Left */}
                        <div className="absolute top-0 left-0 z-20 bg-white px-2 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-1">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-black text-gray-700">{member.rating?.average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center w-full flex flex-col" style={{ minHeight: '70px' }}>
                      <div style={{ minHeight: '40px' }}>
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm capitalize truncate leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">{member.role || t('home.stylist')}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 mt-0.5">
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
                <button onClick={clearFilters} className="text-xs font-bold text-[#1E4D8C] hover:text-[#1a3d7a] transition-colors">
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
              <div className="flex gap-2 flex-wrap relative">
                {/* Sort By: Distance - Only show if user location is available */}
                {userLat !== null && userLon !== null && (
                  sortBy === 'distance' ? (
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
                  )
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


                {/* Distance Filter with Custom Dropdown - Only show if user location is available */}
                {userLat !== null && userLon !== null && (
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
                )}

              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-3">
                {sortBy !== 'relevant' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1E4D8C]/10 border border-[#1E4D8C]/30 text-xs font-medium text-[#1E4D8C]">
                    {sortBy === 'rating_high_low' ? 'Rating: High-Low' : sortBy === 'rating_low_high' ? 'Rating: Low-High' : sortBy === 'price_high_low' ? 'Cost: High-Low' : sortBy === 'price_low_high' ? 'Cost: Low-High' : 'Nearest'}
                    <button onClick={() => setSortBy('relevant')} className="hover:text-[#1a3d7a] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
                {priceRange !== 'all' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1E4D8C]/10 border border-[#1E4D8C]/30 text-xs font-medium text-[#1E4D8C]">
                    ₹{priceRange}+
                    <button onClick={() => setPriceRange('all')} className="hover:text-[#1a3d7a] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
                {/* Distance Filter - Only show if user location is available */}
                {userLat !== null && userLon !== null && distanceFilter !== 'all' && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1E4D8C]/10 border border-[#1E4D8C]/30 text-xs font-medium text-[#1E4D8C]">
                    {distanceFilter === '2km' ? 'Within 2km' : distanceFilter === '5km' ? 'Within 5km' : distanceFilter === '10km' ? 'Within 10km' : distanceFilter === '15km' ? 'Within 15km' : '20km+'}
                    <button onClick={() => setDistanceFilter('all')} className="hover:text-[#1a3d7a] transition-colors">
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
                    <div className="col-span-full w-full flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-50 animate-in zoom-in duration-500">
                      {hasActiveFilters ? (
                        <>
                          <p className="text-gray-500 font-bold mb-4">No salons match your criteria</p>
                          <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
                          >
                            Reset All Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                            <MapPin className="w-7 h-7 text-[#D4AF37]" />
                          </div>
                          <h3 className="text-gray-900 font-black text-lg mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>We're not in your city yet</h3>
                          <p className="text-gray-500 text-sm text-center max-w-xs mb-1">We're expanding fast! We'll be in your area soon.</p>
                          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-3">Stay tuned for updates</p>
                        </>
                      )}
                    </div>
                  ) : (
                    /* 4. Success state with pagination */
                    <>
                      {filteredSalons.slice(0, displayLimit).map((salon, index) => {
                        const distance = salon.distance ? parseFloat(salon.distance) : 0;
                        const displayDistance = distance < 0.1 ? '< 0.1 km' : `${distance.toFixed(1)} km`;

                        return (
                        <Link to={`/salons/${salon.id}`} key={salon.id} className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden group flex items-stretch gap-4 py-4 px-4 h-auto hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 0.1}s`, borderWidth: '0.5px' }}>
                          {/* Fixed size image wrapper - Increased size */}
                          <div className="relative w-20 h-20 sm:w-36 sm:h-36 shrink-0 rounded-xl overflow-hidden">
                            <img src={salon.logoUrl || getDefaultSalonImage(salon.id || salon.salonName || '')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={salon.salonName} />
                          </div>

                          {/* Text Content - Flex Column with auto margin for button */}
                          <div className="flex-1 flex flex-col justify-start gap-3">
                            {/* Title and Rating - tightly grouped */}
                            <div className="flex flex-col justify-start gap-1">
                              <h3 className="font-light text-lg sm:text-xl text-[#1A1A1A] truncate" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: '300' }}>{salon.salonName}</h3>
                              <div className="flex items-center gap-1">
                                <Star size={10} className="fill-[#C5A059] text-[#C5A059] w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs text-[#757575]">
                                  {salon.rating?.average || "5.0"} {salon.rating?.reviewsCount ? `(${salon.rating.reviewsCount} reviews)` : ''}
                                </span>
                              </div>
                            </div>

                            {/* Badges */}
                            {salon.tags && Array.isArray(salon.tags) && salon.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {salon.tags.map((tag: string, idx: number) => (
                                  <span key={idx} className="text-[8px] font-normal uppercase text-[#757575] bg-transparent border border-[#C5A059] px-1.5 sm:px-2 py-0.5 rounded" style={{ letterSpacing: '2px', borderWidth: '0.5px' }}>
                                    {tag.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Distance - Only show if user location is available */}
                            {userLat !== null && userLon !== null && (
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#757575] font-light">
                                <MapPin size={10} className="text-[#757575]" />
                                {displayDistance}
                              </div>
                            )}

                            {/* Button - Pushed to bottom with mt-auto */}
                            <div className="mt-auto pt-2">
                              <button className="w-full px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-sm" style={{ letterSpacing: '1px' }}>
                                Book Now
                              </button>
                            </div>
                          </div>
                        </Link>
                        );
                      })}

                      {/* See More Button */}
                      {displayLimit < filteredSalons.length && (
                        <div className="col-span-full flex justify-center mt-6">
                          {isLoadingMore ? (
                            <div className="flex items-center gap-2 px-8 py-3 bg-white/80 backdrop-blur-md border border-[#1E4D8C]/30 text-[#1E4D8C] rounded-2xl font-bold text-sm shadow-lg">
                              <div className="w-4 h-4 border-2 border-[#1E4D8C] border-t-transparent rounded-full animate-spin" />
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
                              className="px-8 py-3 bg-white/80 backdrop-blur-md border border-[#1E4D8C]/30 text-[#1E4D8C] rounded-2xl font-bold text-sm shadow-lg hover:bg-white/90 transition-all"
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
      <PromoPopup />
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentCity={address}
      />
      {showCityConfirmation && pendingCityChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowCityConfirmation(false);
              setPendingCityChange(null);
            }}
            aria-label="Close modal"
          />
          <div className="relative bg-[#FDFBF7] rounded-[20px] p-6 sm:p-8 mx-4 max-w-sm w-full border border-[rgba(0,0,0,0.05)] shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_10px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#1a1a1a] tracking-tight mb-2">Confirm City Change</h3>
            <p className="text-[#4b5563] mb-6 leading-relaxed">
              <span className="font-semibold text-[#1a1a1a]">{pendingCityChange.city}</span> is <span className="font-semibold text-[#d4af37]">{Math.round(pendingCityChange.distance)} km</span> away. Continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCityConfirmation(false);
                  setPendingCityChange(null);
                }}
                className="flex-1 px-4 py-3 rounded-[16px] bg-white border border-[rgba(0,0,0,0.06)] text-[#4b5563] font-medium hover:bg-[#fafafa] hover:border-[rgba(0,0,0,0.1)] transition-all duration-300 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmCityChange(pendingCityChange.city, pendingCityChange.lat, pendingCityChange.lon)}
                className="flex-1 px-4 py-3 rounded-[16px] bg-[#d4af37] text-white font-medium hover:bg-[#c9a227] transition-all duration-300 active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;