import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, X, Clock, Search, Filter, MapPin, Check, Star, ChevronUp, ChevronDown, Command } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui_components/button';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import Fuse from 'fuse.js';
import { normalizeSearchQuery, getMatchingServices } from '../utils/semanticSearchMapping';

function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiRequest } = useApi();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryParams = new URLSearchParams(location.search);

  const urlSearchQuery = queryParams.get("query");
  const urlcity = queryParams.get("city");
  const urllimit = queryParams.get("limit");

  const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
  const [salons, setSalons] = useState<any[]>([]);
  const [quickResults, setQuickResults] = useState<any[]>([]);
  const [fetchSalonAPI, setFetchSalonAPI] = useState(false);
  const [isQuickLoading, setIsQuickLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    city: urlcity || localStorage.getItem("Address") || "",
    limit: urllimit || "10"
  });

  // Trending search tags
  const trendingTags = ["Haircut", "Beard Trim", "Facial", "Spa", "Hair Color", "Keratin", "Manicure", "Pedicure", "Waxing", "Bridal", "Massage", "Near Me", "Top Rated"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // --- 1. Quick Search for Instant Results ---
  const executeQuickSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setQuickResults([]);
      setShowResults(false);
      return;
    }
    setIsQuickLoading(true);
    setShowResults(true);
    try {
      const normalizedQuery = normalizeSearchQuery(query);
      const apiParams = new URLSearchParams();
      if (normalizedQuery?.trim()) apiParams.append("query", normalizedQuery);
      if (tempFilters.city?.trim()) apiParams.append("city", tempFilters.city.trim());
      apiParams.append("limit", "5"); // Get top 5 results instantly
      if (userLocation) {
        apiParams.append("user_latitude", userLocation.latitude.toString());
        apiParams.append("user_longitude", userLocation.longitude.toString());
        apiParams.append("max_distance_km", "30");
      }

      const res = await apiRequest<any[]>(`/salons/super_search?${apiParams.toString()}`);
      if (res.data) {
        // Apply fuzzy search with Fuse.js
        const fuse = new Fuse(res.data, {
          keys: ['salonName', 'services'],
          threshold: 0.3,
          ignoreLocation: true,
        });
        const fuzzyResults = fuse.search(normalizedQuery);
        setQuickResults(fuzzyResults.map(r => r.item));
      }
    } catch (err) {
      console.error("Quick search failed:", err);
    } finally {
      setIsQuickLoading(false);
    }
  }, [apiRequest, tempFilters.city, userLocation]);

  // --- 2. Full Search for View More ---
  const executeSearch = useCallback(async (name: string, city: string, limit: string) => {
    if (!name.trim()) {
      setSalons([]);
      return;
    }
    setFetchSalonAPI(true);
    try {
      const normalizedQuery = normalizeSearchQuery(name);
      const apiParams = new URLSearchParams();
      if (city?.trim()) apiParams.append("city", city.trim());
      if (normalizedQuery?.trim()) apiParams.append("query", normalizedQuery);
      if (limit) apiParams.append("limit", limit);
      if (userLocation) {
        apiParams.append("user_latitude", userLocation.latitude.toString());
        apiParams.append("user_longitude", userLocation.longitude.toString());
        apiParams.append("max_distance_km", "30");
      }

      const res = await apiRequest<any[]>(`/salons/super_search?${apiParams.toString()}`);
      if (res.data) {
        // Apply fuzzy search with Fuse.js
        const fuse = new Fuse(res.data, {
          keys: ['salonName', 'services'],
          threshold: 0.3,
          ignoreLocation: true,
        });
        const fuzzyResults = fuse.search(normalizedQuery);
        setSalons(fuzzyResults.map(r => r.item));
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setFetchSalonAPI(false);
    }
  }, [apiRequest, userLocation]);

  // --- 3. Keyboard Navigation Handler ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults || quickResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % quickResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + quickResults.length) % quickResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (quickResults[selectedIndex]) {
          handleSalonSelect(quickResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  }, [showResults, quickResults, selectedIndex]);

  // --- 4. Debounced Quick Search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      executeQuickSearch(searchQuery);
    }, 300); // 300ms for instant results

    return () => clearTimeout(handler);
  }, [searchQuery, executeQuickSearch]);

  // --- 5. Debounce Implementation for Full Search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch(searchQuery, tempFilters.city, tempFilters.limit);
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, []);

  const handlechangevalue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(0); // Reset selected index

    // Clear the existing timer if the user is still typing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Start a new timer
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(value, tempFilters.city, tempFilters.limit);
    }, 400);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    executeSearch(tag, tempFilters.city, tempFilters.limit);
  };

  const handleViewMore = () => {
    setShowResults(false);
    executeSearch(searchQuery, tempFilters.city, tempFilters.limit);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // const handleSalonSelect = (salon: any) => {
  //   // Navigates to salon detail and passes salon info via state or query
  //   navigate(`/salons/${salon.id}`, { state: { salonData: salon } });
  // };
  //  const handleSearchSubmit = (query: string) => {
  //   if (!query.trim()) return;
  //   // Redirect with query, city, and limit parameters
  //   navigate(`/salons?query=${encodeURIComponent(query)}&city=${tempFilters.city}&limit=${tempFilters.limit}`);
  // };


  // --- 1. Selection Handler (For clicking a specific result) ---
const handleSalonSelect = (salonId: string) => {
  // Clear the debounce timeout if it's still running
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  // Redirect to the specific salon detail page
  navigate(`/salons/${salonId?.id}`);
};

// --- 2. Submit Handler (For pressing Enter) ---
const handleSearchSubmit = (e?: React.FormEvent) => {
  if (e) e.preventDefault(); // Stop page reload
  
  if (!searchQuery.trim()) return;

  // Clear any pending debounced API calls since we are navigating away
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  // Redirect to the general salons list with current filters
  navigate(`/salons?query=${encodeURIComponent(searchQuery)}&city=${tempFilters.city}&limit=${tempFilters.limit}`);
};

  return (
    <div className="fixed inset-0 z-50 bg-white animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b sticky top-0 z-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <button onClick={() => navigate(-1)} className="p-1 active:bg-white/20 rounded-full">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1 relative">
          {/* The Form handles the "Enter" key automatically */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('search.searchForSalons')}
                className="w-full bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 outline-none text-sm font-medium transition-all text-gray-800 placeholder-gray-400 border-2 shadow-sm"
                style={{
                  borderColor: showResults ? 'rgba(30, 77, 140, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                  boxShadow: showResults ? '0 0 0 3px rgba(30, 77, 140, 0.2), 0 0 20px rgba(30, 77, 140, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                value={searchQuery}
                onChange={handlechangevalue}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <X
                  className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => {
                    setSearchQuery("");
                    setSalons([]);
                    setQuickResults([]);
                    setShowResults(false);
                  }}
                />
              )}
            </div>
          </form>

          {/* Instant Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {isQuickLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : quickResults.length > 0 ? (
                <>
                  <div className="p-2">
                    {quickResults.slice(0, 5).map((salon, index) => (
                      <div
                        key={salon.id}
                        onClick={() => handleSalonSelect(salon)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          index === selectedIndex ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400' : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={salon.logoUrl || "/placeholder.png"}
                            alt={salon.salonName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-800 tracking-tight">
                            {salon.salonName}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold italic">
                            {salon.address?.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          <span className="text-[10px] font-black text-orange-700">{salon.rating?.average}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleViewMore}
                    className="w-full py-3 text-xs font-black text-center tracking-widest transition-colors hover:bg-gray-50 text-blue-600"
                  >
                    VIEW MORE RESULTS
                  </button>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-[9px] text-gray-400 text-center tracking-wider">
                      <span className="font-bold">↑↓</span> Navigate · <span className="font-bold">Enter</span> Select · <span className="font-bold">Esc</span> Close
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-400 tracking-widest">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>

        

        {/* <button
          onClick={() => setIsFilterModalOpen(true)}
          className="p-3 bg-gray-100 rounded-xl text-[#1E4D8C] active:scale-95 transition-transform"
        >
          <Filter size={20} />
        </button> */}
      </div>

      {/* Results Section */}
      <div className="p-4">
        {fetchSalonAPI && searchQuery && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E4D8C]"></div>
          </div>
        )}

        {!fetchSalonAPI && salons.length > 0 && searchQuery && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 tracking-widest ml-1">{t('search.salonsFound')}</h3>
            {salons.map((salon) => (
              <div
                key={salon.id}
                onClick={() => handleSalonSelect(salon)}
                className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={salon.logoUrl || "/placeholder.png"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800 tracking-tight">
                    {salon.salonName}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold italic">
                    {salon.address?.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                  <Star size={10} className="fill-orange-400 text-orange-400" />
                  <span className="text-[10px] font-black text-orange-700">{salon.rating?.average}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State / Recent Searches */}
        {!searchQuery && !showResults && (
          <div className="py-10 text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-xs font-bold text-gray-400 tracking-widest">{t('search.typeToDiscover')}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-gray-300">
              <Command size={12} />
              <span className="tracking-wider">Press</span>
              <span className="font-bold bg-gray-100 px-2 py-1 rounded">K</span>
              <span className="tracking-wider">for quick search</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('search.searchSettings')}</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-widest">{t('search.location')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.city}
                    onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none"
                    placeholder={t('search.cityName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 tracking-widest">{t('search.limit')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {["10", "20", "50"].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTempFilters({ ...tempFilters, limit: num })}
                      className={`h-12 rounded-2xl font-bold text-sm transition-all ${tempFilters.limit === num ? 'bg-[#1E4D8C] text-white' : 'bg-gray-50 text-gray-400'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm tracking-widest mt-4 shadow-xl"
              >
                {t('search.savePreferences')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;