import React, { useEffect, useState } from 'react';

interface GrandEntranceOverlayProps {
  onComplete: () => void;
}

const GrandEntranceOverlay: React.FC<GrandEntranceOverlayProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoPhase, setLogoPhase] = useState<'welcome' | 'center' | 'move' | 'hidden'>('welcome');

  useEffect(() => {
    // Show welcome message first
    const welcomePhase = setTimeout(() => {
      setLogoPhase('center');
    }, 1200);

    // Logo appears in center and glows
    const phase1 = setTimeout(() => {
      setLogoPhase('move');
    }, 2000);

    // Logo moves to navbar position
    const phase2 = setTimeout(() => {
      setLogoPhase('hidden');
    }, 3000);

    // Overlay fades away with silk curtain effect
    const reveal = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(welcomePhase);
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(reveal);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        transition: 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        clipPath: logoPhase === 'hidden' ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)'
      }}
    >
      {/* Welcome Message */}
      {logoPhase === 'welcome' && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Welcome
          </h1>
          <p className="text-white/60 text-sm tracking-widest uppercase">to Coiffeurr</p>
        </div>
      )}

      {/* Logo Signature Animation */}
      {logoPhase !== 'welcome' && (
        <div 
          className="transition-all duration-700 ease-out"
          style={{
            transform: logoPhase === 'center' 
              ? 'scale(1)' 
              : logoPhase === 'move' 
                ? 'scale(0.4) translateY(-200px)' 
                : 'scale(0.4) translateY(-200px)',
            opacity: logoPhase === 'hidden' ? 0 : 1
          }}
        >
          <div className="relative">
            <div 
              className="w-24 h-24 bg-white p-2 rounded-3xl transition-all duration-700"
              style={{
                boxShadow: logoPhase === 'center' 
                  ? '0 0 40px rgba(212, 175, 55, 0.6)' 
                  : '0 0 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              <img 
                src="/Coiffeurr_Logo.png" 
                alt="Coiffeurr" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-xl transition-all duration-700"
              style={{
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                opacity: logoPhase === 'center' ? 1 : 0.5
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandEntranceOverlay;
