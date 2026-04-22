import React from 'react';
import { motion } from 'motion/react';

// Full-Screen Particle System
const ParticleSystem: React.FC = () => {
  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 6,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: 'rgba(30, 77, 140, 0.4)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.3],
            scale: [0, 1, 0.6],
            y: [0, -150, 0],
            x: [0, Math.random() * 60 - 30, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleSystem;
