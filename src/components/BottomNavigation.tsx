import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    // <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
    //   <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 px-6 pb-safe pt-2">
    //     <div className="flex items-center justify-around h-16">
    //       {navItems.map((item) => {
    //         const isActive = location.pathname === item.path;
    //         const Icon = item.icon;
    //         return (
    //           <button
    //             key={item.path}
    //             onClick={() => navigate(item.path)}
    //             className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-[0.95] duration-100"
    //           >
    //             <Icon 
    //               size={20} 
    //               className={`transition-colors ${isActive ? 'text-[#0f172a]' : 'text-gray-400'}`}
    //             />
    //             <span 
    //               className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#0f172a]' : 'text-gray-400'}`}
    //             >
    //               {item.label}
    //             </span>
    //           </button>
    //         );
    //       })}
    //     </div>
    //   </div>
    // </nav>
    <></>
  );
};

export default BottomNavigation;
