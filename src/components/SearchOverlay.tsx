import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Config from '../configs/config';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Trending search tags
  const trendingTags = ["Haircut", "Facial", "Spa", "Beard Trim", "Hair Color"];

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

  // Debounced search function
  const searchSalons = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Check if query is a 6-digit pincode
      const isPincode = /^\d{6}$/.test(query.trim());
      
      if (isPincode) {
        params.append('pincode', query.trim());
      } else {
        params.append('query', query.trim());
      }
      
      params.append('limit', '20');

      if (userLocation) {
        params.append('user_latitude', userLocation.latitude.toString());
        params.append('user_longitude', userLocation.longitude.toString());
        params.append('max_distance_km', '30');
      }

      const response = await fetch(`${Config.API_Customers}/salons/super_search?${params}`);
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching salons:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchSalons(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchSalons]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-white"
      style={{
        animation: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Seeking a new signature look?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Trending Search Tags */}
        <div className="mb-4">
          <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">TRENDING SEARCHES</p>
          <p className="text-[9px] italic text-gray-400 mb-3 opacity-60">Search by salon name, area, or 6-digit pincode.</p>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : searchResults.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <Search className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">No salons found</p>
            <p className="text-gray-400 text-sm italic">It seems we haven't reached that area yet. Try searching for a nearby locality or a specific artist.</p>
          </div>
        ) : searchResults.length === 0 && !searchQuery ? (
          <div className="text-center py-12">
            <Search className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Start typing to search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => navigate(`/salons/${result.id}`)}
                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#D4AF37]">
                  <img
                    src={result.logoUrl || '/placeholder-user.png'}
                    alt={result.salonName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Salon Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {result.salonName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500 truncate">{result.address?.city}</span>
                    {result.distance && (
                      <span className="text-[10px] text-gray-400">• {result.distance}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-700">{result.rating?.average?.toFixed(1) || '5.0'}</span>
                    {result.priceRange && (
                      <span className="text-[10px] font-medium text-[#D4AF37] bg-amber-50 px-2 py-0.5 rounded">
                        {result.priceRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/salons/${result.id}`);
                  }}
                  className="px-4 py-2 bg-[#D4AF37] text-[#0f172a] rounded-xl font-bold text-sm hover:bg-[#c9a037] transition-colors flex-shrink-0"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
