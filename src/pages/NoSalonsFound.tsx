import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPinOff, 
  Search, 
  MapPin, 
  ChevronLeft, 
  PlusCircle, 
  Navigation 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoSalonsFound = ({ currentCity = "your area" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
      
      {/* --- ICON / ILLUSTRATION AREA --- */}
      <div className="relative">
        <div className=" bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center relative z-10">
          <MapPinOff size={48} className="text-slate-400 dark:text-slate-500" />
        </div>
        {/* Animated Rings */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150 opacity-20" />
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse scale-125 opacity-30" />
      </div>

      {/* --- TEXT CONTENT --- */}
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('noSalonsFound.title', { city: currentCity })}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {t('noSalonsFound.message')}
        </p>
      </div>

      


      {/* --- FOOTER NOTIFICATION --- */}
      <div className="mt-12 py-3 px-6 bg-slate-900 dark:bg-white rounded-full flex items-center gap-3">
        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-widest">
          {t('noSalonsFound.comingSoon')}
        </span>
      </div>
    </div>
  );
};

export default NoSalonsFound;