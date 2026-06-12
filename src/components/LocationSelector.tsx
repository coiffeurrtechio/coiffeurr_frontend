import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Config from '../configs/config';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (city: string, lat: number, lon: number) => void;
  currentCity?: string;
}

interface CityData {
  name: string;
  lat: number;
  lon: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentCity
}) => {
  const { t } = useTranslation();
  const [cities, setCities] = useState<CityData[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLocations');
    if (saved) {
      setRecentLocations(JSON.parse(saved));
    }
  }, []);

  // Fetch cities from database when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  const fetchCities = async () => {
    setIsLoadingCities(true);
    try {
      const response = await fetch(`${Config.API_Customers}/salons/cities`);
      const data = await response.json();
      
      if (data.cities && Array.isArray(data.cities)) {
        // Get coordinates for each city using geocoding
        const citiesWithCoords = await Promise.all(
          data.cities.map(async (cityName: string) => {
            try {
              const geoResponse = await fetch(`${Config.API_Customers}/geolocation/geolocation/search-location`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: cityName, limit: 1 })
              });
              
              const geoData = await geoResponse.json();
              if (geoData.success && geoData.results && geoData.results.length > 0) {
                return {
                  name: cityName,
                  lat: geoData.results[0].coordinates.lat,
                  lon: geoData.results[0].coordinates.lon
                };
              }
              return null;
            } catch (error) {
              console.error(`Error getting coordinates for ${cityName}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null values and set cities
        const validCities = citiesWithCoords.filter((city): city is CityData => city !== null);
        setCities(validCities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleCitySelect = (cityName: string, lat: number, lon: number) => {
    // Save to recent locations (keep only last 3)
    const updatedRecent = [cityName, ...recentLocations.filter(loc => loc !== cityName)].slice(0, 3);
    localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));
    
    onLocationSelect(cityName, lat, lon);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get city name from coordinates
          try {
            const response = await fetch(`${Config.API_Customers}/geolocation/geolocation/location-details`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ lat: latitude, lon: longitude, language: 'en' })
            });

            const data = await response.json();
            if (data.success && data.address) {
              const city = data.address.city || data.address.town || data.address.village || t('location.currentLocation');
              handleCitySelect(city, latitude, longitude);
            } else {
              handleCitySelect(t('location.currentLocation'), latitude, longitude);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            handleCitySelect(t('location.currentLocation'), latitude, longitude);
          }
        },
        (error) => {
          console.error('Location error:', error);
          alert(t('location.unableToGetLocation'));
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[20px] p-6 sm:p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto border border-[rgba(0,0,0,0.05)] shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_10px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">{t('location.selectLocation')}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-all duration-200 group"
          >
            <X size={18} className="text-[#6b7280] group-hover:text-[#374151] group-hover:scale-110 transition-all" />
          </button>
        </div>

        {/* Use Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          className="w-full h-14 bg-white text-[#b8860b] rounded-full font-semibold text-sm flex items-center justify-center gap-3 mb-8 border border-[#d4af37]/30 hover:bg-[#faf8f0] hover:border-[#d4af37]/50 transition-all duration-300 active:scale-[0.98]"
        >
          <Navigation size={18} className="text-[#d4af37]" />
          <span>{t('location.useMyCurrentLocation')}</span>
        </button>

        {/* Available Cities */}
        <div className="mb-8">
          <p className="text-[10px] font-bold text-[#9ca3af] tracking-[0.25em] mb-4">{t('location.availableCities')}</p>
          {isLoadingCities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#d4af37]/20 border-t-[#d4af37]"></div>
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => {
                const isActive = currentCity === city.name;
                const activeClasses = 'bg-[#faf6e8] border border-[#d4af37] text-[#1a1a1a] shadow-[inset_0_0_20px_rgba(212,175,55,0.08)]';
                const inactiveClasses = 'bg-white border border-[rgba(0,0,0,0.06)] text-[#4b5563] hover:bg-[#fafafa] hover:border-[rgba(0,0,0,0.1)]';
                
                return (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city.name, city.lat, city.lon)}
                    className={`p-4 rounded-[16px] font-medium text-sm transition-all duration-300 active:scale-[0.98] ${isActive ? activeClasses : inactiveClasses}`}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">{t('location.noCitiesAvailable')}</p>
            </div>
          )}
        </div>

        {/* Recent Locations */}
        {recentLocations.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] tracking-[0.25em] mb-4 flex items-center gap-2">
              <Clock size={12} className="text-[#9ca3af]" />
              {t('location.recentLocations')}
            </p>
            <div className="space-y-2">
              {recentLocations.map((location) => {
                // Find coordinates for recent location from cities list
                const cityData = cities.find(c => c.name === location);
                if (cityData) {
                  return (
                    <button
                      key={location}
                      onClick={() => handleCitySelect(cityData.name, cityData.lat, cityData.lon)}
                      className={`w-full p-4 rounded-[16px] text-left transition-all duration-300 active:scale-[0.98] flex items-center justify-between ${
                        currentCity === location
                          ? 'bg-[#faf6e8] border border-[#d4af37] text-[#1a1a1a] shadow-[inset_0_0_20px_rgba(212,175,55,0.08)]'
                          : 'bg-white border border-[rgba(0,0,0,0.06)] text-[#4b5563] hover:bg-[#fafafa] hover:border-[rgba(0,0,0,0.1)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className={currentCity === location ? 'text-[#d4af37]' : 'text-[#9ca3af]'} />
                        <span className="font-medium text-sm">{location}</span>
                      </div>
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
