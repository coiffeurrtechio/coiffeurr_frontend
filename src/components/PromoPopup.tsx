import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'promoPopupDismissed';

const PromoPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay so the homepage loads first, then the popup gracefully appears
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }, 350);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Promotional offer"
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-350 ${isClosing ? 'promo-backdrop-out' : 'promo-backdrop-in'}`}
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup Container */}
      <div
        role="document"
        className={`relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[420px] transition-all duration-350 ${isClosing ? 'promo-popup-out' : 'promo-popup-in'}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-1 rounded-[1.75rem] sm:rounded-[2rem] opacity-40 blur-md bg-gradient-to-br from-[#D4AF37] via-transparent to-[#D4AF37]" />

        {/* Card */}
        <div className="relative rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden shadow-2xl border border-white/10">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-black/60 active:scale-90 transition-all duration-200 shadow-lg"
            aria-label="Close"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Poster Image */}
          <img
            src="/poster.jpg"
            alt="Exclusive Offer"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* Bottom shimmer bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent promo-shimmer" />
        </div>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        .promo-backdrop-in {
          animation: promoFadeIn 0.35s ease-out forwards;
        }
        .promo-backdrop-out {
          animation: promoFadeOut 0.35s ease-in forwards;
        }
        .promo-popup-in {
          animation: promoSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .promo-popup-out {
          animation: promoSlideDown 0.3s ease-in forwards;
        }
        .promo-shimmer {
          animation: promoShimmer 2.5s ease-in-out infinite;
        }

        @keyframes promoFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes promoFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes promoSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes promoSlideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
        }
        @keyframes promoShimmer {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default PromoPopup;
