import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Scissors, Home, ArrowLeft, SearchX } from 'lucide-react';
import { Button } from "../components/ui_components/button";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center border border-gray-100 relative z-10">
          <SearchX size={64} className="text-[#1E4D8C] md:hidden" />
          <SearchX size={80} className="text-[#1E4D8C] hidden md:block" />
        </div>
        {/* Decorative Background Icon */}
        <Scissors 
          className="absolute -top-6 -right-6 text-orange-400 opacity-20 rotate-45" 
          size={100} 
        />
      </div>

      {/* Text Content */}
      <h1 className="text-7xl md:text-9xl font-black text-[#1E4D8C] tracking-tighter opacity-10 absolute select-none">
        404
      </h1>
      
      <div className="relative z-20">
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
          {t('notFound.title')}
        </h2>
        <p className="text-gray-500 max-w-xs md:max-w-md mx-auto text-sm md:text-base font-medium mb-8">
          {t('notFound.message')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="w-full sm:w-auto border-[#1E4D8C] text-[#1E4D8C] font-bold px-8 h-12 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('notFound.goBack')}
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full sm:w-auto bg-[#1E4D8C] hover:bg-[#153a6b] text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-900/20"
          >
            <Home className="mr-2 h-4 w-4" /> {t('notFound.backToHome')}
          </Button>
        </div>
      </div>

      {/* Footer Brand */}
      <div className="mt-16 flex items-center gap-2 opacity-40">
        <Scissors size={18} className="text-gray-400 rotate-45" />
        <span className="text-sm font-black italic tracking-tighter text-gray-400">Coiffeurr</span>
      </div>
    </div>
  );
};

export default NotFoundPage;