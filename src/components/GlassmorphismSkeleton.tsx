import React from 'react';

interface GlassmorphismSkeletonProps {
  className?: string;
}

const GlassmorphismSkeleton: React.FC<GlassmorphismSkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  );
};

const ArtistCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-32 sm:w-36 flex flex-col items-center gap-3">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20" />
      <div className="w-full flex flex-col items-center gap-2">
        <div className="w-20 h-4 bg-white/10 rounded" />
        <div className="w-16 h-3 bg-white/10 rounded" />
        <div className="flex flex-col gap-1 mt-2">
          <div className="w-12 h-5 bg-white/10 rounded-lg" />
          <div className="w-16 h-5 bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

const SalonCardSkeleton: React.FC = () => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
      <div className="h-44 sm:h-full bg-white/10 animate-pulse" />
      <div className="p-6 flex flex-col gap-3">
        <div className="w-3/4 h-6 bg-white/10 rounded" />
        <div className="w-1/2 h-4 bg-white/10 rounded" />
        <div className="w-full h-4 bg-white/10 rounded" />
        <div className="mt-auto">
          <div className="w-24 h-10 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export { GlassmorphismSkeleton, ArtistCardSkeleton, SalonCardSkeleton };
