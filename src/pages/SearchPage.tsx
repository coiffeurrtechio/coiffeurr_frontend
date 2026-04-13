import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, X, Clock, Search, Filter, MapPin, Check, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui_components/button';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
// import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"; // Ensure this path is correct

function SearchPage() {
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
  const [fetchSalonAPI, setFetchSalonAPI] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    city: urlcity || localStorage.getItem("Address") || "",
    limit: urllimit || "10"
  });

  // --- 1. The API Execution Logic ---
  const executeSearch = useCallback(async (name: string, city: string, limit: string) => {
    if (!name.trim()) {
      setSalons([]);
      return;
    }
    setFetchSalonAPI(true);
    try {
      const apiParams = new URLSearchParams();
      if (city?.trim()) apiParams.append("city", city.trim());
      if (name?.trim()) apiParams.append("query", name.trim());
      if (limit) apiParams.append("limit", limit);

      const res = await apiRequest<any[]>(`/salons/search?${apiParams.toString()}`);
      if (res.data) setSalons(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setFetchSalonAPI(false);
    }
  }, [apiRequest]);

  // --- 2. Debounce Implementation ---
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch(searchQuery, tempFilters.city, tempFilters.limit);
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, []);

  const handlechangevalue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear the existing timer if the user is still typing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Start a new timer
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(value, tempFilters.city, tempFilters.limit);
    }, 400);
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
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 active:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 relative">
          {/* The Form handles the "Enter" key automatically */}
          <form onSubmit={handleSearchSubmit}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for salons..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchQuery}
              onChange={handlechangevalue}
            />
          </form>

          {searchQuery && (
            <X
              className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer"
              onClick={() => {
                setSearchQuery("");
                setSalons([]);
              }}
            />
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
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Salons Found</h3>
            {salons.map((salon) => (
              <div
                key={salon.id}
                onClick={() => handleSalonSelect(salon)}
                className="flex items-center gap-4 p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={salon.logoUrl || "/placeholder.png"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">
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
        {!searchQuery && (
          <div className="py-10 text-center">
            <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type to discover salons</p>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Search Settings</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={tempFilters.city}
                    onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none"
                    placeholder="City name..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Limit</label>
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
                className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm uppercase tracking-widest mt-4 shadow-xl"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;