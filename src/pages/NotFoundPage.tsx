import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import Sponser_Footer from '../components/Sponser_Footer';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#0f172a] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Gold Shears Illustration with Animation */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            {/* Animated Glow */}
            <div className="absolute inset-0 bg-[#D4AF37]/20 blur-2xl rounded-full animate-pulse" />
            
            {/* Shears Icon */}
            <div className="relative bg-white rounded-full p-8 shadow-2xl border border-[#D4AF37]/20 animate-float">
              <Scissors 
                size={80} 
                className="text-[#D4AF37] rotate-45"
                style={{ animation: 'scissorSnip 3s ease-in-out infinite' }}
              />
            </div>

            {/* Floating Hair Strands */}
            <div className="absolute -top-4 -right-4 w-3 h-16 bg-gradient-to-b from-[#D4AF37] to-[#B8962E] rounded-full opacity-60 animate-hairFloat" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-2 -left-6 w-2 h-12 bg-gradient-to-b from-[#D4AF37] to-[#B8962E] rounded-full opacity-40 animate-hairFloat" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -right-8 w-2 h-10 bg-gradient-to-b from-[#D4AF37] to-[#B8962E] rounded-full opacity-50 animate-hairFloat" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>

        {/* Large 404 Background */}
        <h1 className="text-[120px] md:text-[180px] font-black text-[#D4AF37]/5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none" style={{ fontFamily: 'Playfair Display, serif' }}>
          404
        </h1>

        {/* Headline with Serif Font */}
        <div className="relative z-20">
          <h2 
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Even your browser has bad hair days.
          </h2>
          
          {/* Body Text */}
          <p className="text-gray-600 max-w-lg mx-auto text-base md:text-lg mb-8 leading-relaxed">
            It looks like this page is suffering from some serious split ends. We couldn't find the style you were looking for, but don't worry—we can still fix your look.
          </p>

          {/* Action Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-[#c9a037] text-white font-bold rounded-2xl shadow-lg shadow-[#D4AF37]/30 transition-all hover:scale-105 hover:shadow-xl"
            >
              Let's go to home page
            </button>
          </div>
        </div>
      </div>

      {/* Sponsor Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <Sponser_Footer collapsed={false} />
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes scissorSnip {
          0%, 100% { transform: rotate(45deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes hairFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-15px) rotate(10deg); opacity: 0.3; }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-hairFloat {
          animation: hairFloat 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;