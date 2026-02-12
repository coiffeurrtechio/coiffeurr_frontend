import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount (like YouTube)
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    // Redirect to salons page with the city/query as a parameter
    navigate(`/salons?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <button onClick={() => navigate(-1)} className="p-1 active:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="flex-1 relative">
          <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchQuery); }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for salons or cities..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {searchQuery && (
            <X
              className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      {/* Recent Searches */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Searches</h3>
          <button className="text-xs font-bold text-[#1E4D8C]">Clear All</button>
        </div>

        <div className="space-y-6">
          {['Mumbai', 'Haircut near me', 'Facial for men'].map((item) => (
            <div 
              key={item} 
              onClick={() => handleSearchSubmit(item)}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4 text-gray-600">
                <Clock className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-bold group-active:text-[#1E4D8C]">{item}</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-300 rotate-135" /> {/* Diagonal arrow icon */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;