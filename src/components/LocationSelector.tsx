import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Clock } from 'lucide-react';
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
              const city = data.address.city || data.address.town || data.address.village || 'Current Location';
              handleCitySelect(city, latitude, longitude);
            } else {
              handleCitySelect('Current Location', latitude, longitude);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            handleCitySelect('Current Location', latitude, longitude);
          }
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get your location. Please try searching for a city instead.');
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Select Location</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Use Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          className="w-full h-14 bg-gradient-to-r from-[#1E4D8C] to-[#2a5fb8] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mb-6 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Navigation size={20} />
          Use My Current Location
        </button>

        {/* Available Cities */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-3">WE ARE AVAILABLE IN FOLLOWING CITY</p>
          {isLoadingCities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E4D8C]"></div>
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name, city.lat, city.lon)}
                  className={`p-4 rounded-2xl font-medium text-sm transition-all active:scale-[0.98] ${
                    currentCity === city.name 
                      ? 'bg-[#1E4D8C] text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No cities available</p>
            </div>
          )}
        </div>

        {/* Recent Locations */}
        {recentLocations.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-2">
              <Clock size={14} />
              RECENT LOCATIONS
            </p>
            <div className="space-y-2">
              {recentLocations.map((location, index) => {
                // Find coordinates for recent location from cities list
                const cityData = cities.find(c => c.name === location);
                if (cityData) {
                  return (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(cityData.name, cityData.lat, cityData.lon)}
                      className="w-full p-4 bg-gray-50 rounded-2xl text-left hover:bg-gray-100 transition-colors active:scale-[0.98] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="font-medium text-sm text-gray-700">{location}</span>
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
