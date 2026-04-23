import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeLoaderProps {
  onComplete: () => void;
}

const WelcomeLoader: React.FC<WelcomeLoaderProps> = ({ onComplete }) => {
  console.log('WelcomeLoader rendering');
  const [phase, setPhase] = useState<'namaste' | 'lotus' | 'reveal'>('namaste');

  useEffect(() => {
    // Phase 1: Namaste hands (0 - 2s)
    const namasteTimer = setTimeout(() => {
      setPhase('lotus');
    }, 2000);

    // Phase 2: Lotus bloom (2s - 2.5s)
    const lotusTimer = setTimeout(() => {
      setPhase('reveal');
    }, 2500);

    // Phase 3: Complete (3s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(namasteTimer);
      clearTimeout(lotusTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {phase !== 'reveal' && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ 
            backgroundColor: '#0a0a0a',
            backdropFilter: 'blur(25px)'
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'reveal' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Gradient Pulse */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />


          {/* Royal Text */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase !== 'reveal' ? 1 : 0, y: phase !== 'reveal' ? 0 : -30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.p
              className="text-6xl font-black mb-2"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#D4AF37',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                letterSpacing: '0.1em'
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(212, 175, 55, 0.5)',
                  '0 0 30px rgba(212, 175, 55, 0.8)',
                  '0 0 20px rgba(212, 175, 55, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              नमस्ते मालिक
            </motion.p>
            <motion.p
              className="text-xl font-bold tracking-[0.3em] uppercase mb-4"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#D4AF37',
                opacity: 0.8
              }}
            >
              NAMASTE MALIK
            </motion.p>
            <motion.p
              className="text-lg italic font-medium tracking-wide"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#D4AF37',
                opacity: 0.7
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Welcome to your empire. Your salon is ready for you.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeLoader;
