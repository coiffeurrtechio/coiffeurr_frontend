import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Bell, User, Search, Star, ChevronRight, Home, Scissors, Gift, UserCircle, Loader2, Clock, ArrowLeft, X } from 'lucide-react';
import { Loader } from '../components/ui_components/Loader';

interface SalonCard {
  id: string;
  name: string;
  rating: number;
  distance: string;
  nextAvailable: string;
  image: string;
}

const HomePage: React.FC = () => {

  const [address, setAddress] = useState<string>("Locating you...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const nearbySalons: SalonCard[] = [
    {
      id: '1',
      name: 'GlowUp Salon',
      rating: 4.5,
      distance: '1.2 km',
      nextAvailable: '120 min',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      name: 'Elegance Spa',
      rating: 4.8,
      distance: '2.0 km',
      nextAvailable: '30 min',
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=80'
    }
  ];

  useEffect(() => {
    // 1. Get User Coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // 2. Free Reverse Geocoding API (OpenStreetMap Nominatim)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            // Format a clean address (Suburb/City)
            const city = data.address.city || data.address.town || data.address.village || "";
            const suburb = data.address.suburb || data.address.neighbourhood || "";

            setAddress(`${suburb}${suburb ? ', ' : ''}${city}`);

            // Simulate Blinkit's slight delay for the "premium" loader feel
            setTimeout(() => setIsLoading(false), 1200);
          } catch (error) {
            setAddress("Address Fetch Failed");
            setIsLoading(false);
          }
        },
        () => {
          setAddress("Permission Denied");
          setIsLoading(false);
        }
      );
    }
  }, []);

  if (isLoading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto font-sans pb-24">


      {/* --- MORPHING SEARCH OVERLAY --- */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Header that looks like the search bar moved to top */}
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <button onClick={() => setIsSearchOpen(false)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for services..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-3 w-4 h-4 text-gray-400"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </div>

        {/* Search Results Area (White background below) */}
        <div className="p-4 bg-white min-h-screen">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Searches</h3>
            <button className="text-xs text-blue-600">Clear</button>
          </div>
          <div className="space-y-4">
            {['Haircut near me', 'Facial for men', 'Bridal Package'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-gray-500 py-1">
                <Clock className="w-4 h-4 text-gray-300" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blue Header Section */}
      <div className="bg-[#1E4D8C] p-6 text-white rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-200" />
            <span className="font-medium">{address}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-[#1E4D8C]"></span>
            </div>
            <User className="w-6 h-6 p-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Search Bar Card */}
        <div 
        onClick={() => setIsSearchOpen(true)}
        className="bg-white rounded-2xl p-4 shadow-xl -mb-12 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#1E4D8C]" />
            <span className="text-gray-900 font-bold">Find a Salon Near You</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between border border-gray-100">
              <span className="text-xs text-gray-500">Location • Today • 12 PM</span>
            </div>
            <button className="bg-[#1E4D8C] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Your Bookings Section */}
      <div className="px-4 mt-16 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Your Bookings</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/dummy_logo.png" alt="salon" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h3 className="font-bold text-gray-900">StyleHub Salon</h3>
                <p className="text-xs text-gray-500">Haircut & Beard</p>
              </div>
            </div>
            <button className="text-gray-300">•••</button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</span>
              Today, 6:30 PM
            </div>
            <span className="bg-[#4CAF50] text-white px-3 py-1 rounded-md text-[11px] font-bold">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Nearby Salons Horizontal Scroll */}
      <div className="px-4 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Nearby Salons</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {nearbySalons.map((salon) => (
            <div key={salon.id} className="min-w-[200px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-28">
                <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="font-bold text-sm">{salon.name}</p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-orange-400 fill-orange-400" /> {salon.rating}</span>
                  <span>{salon.distance}</span>
                  <span>Next {salon.nextAvailable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offers Section */}
      <div className="px-4 mb-8">
        <h2 className="text-gray-800 font-bold mb-4">Offers Near You</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-800">20% OFF at StyleHub - Only Today!</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>


    </div>
  );
};

export default HomePage;