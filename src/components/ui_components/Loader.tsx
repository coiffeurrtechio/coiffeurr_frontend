import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface LoaderProps {
  readonly isVisible?: boolean
}

const phrases = [
  "Curating your experience...",
  "Finding top-rated artists...",
  "Discovering premium services...",
  "Luxury awaits you...",
  "Defining your new look...",
  "Almost there, gorgeous...",
]

export function Loader({ isVisible = true }: LoaderProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Mobile View - Full-screen glassmorphism */}
      <div className="md:hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-md">
        <motion.div
          className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Rotating Gradient Ring Loader */}
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, #D4AF37)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-2 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              >
                <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-12 h-12 object-contain" />
              </motion.div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4 w-full text-center">
            <motion.h2
              key={currentPhrase}
              className="text-white font-semibold tracking-widest text-sm uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {phrases[currentPhrase]}
            </motion.h2>
          </div>

          {/* Subtle Pulse Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-white/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Desktop View - Compact, subtle loader */}
      <div className="hidden md:flex fixed inset-0 z-[999] items-center justify-center bg-black/5 backdrop-blur-sm">
        <motion.div
          className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl px-8 py-6 flex items-center gap-4 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Compact Rotating Ring */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, #D4AF37)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-1.5 bg-white/90 rounded-full flex items-center justify-center">
              <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-5 h-5 object-contain" />
            </div>
          </div>

          {/* Loading Text */}
          <motion.h2
            key={currentPhrase}
            className="text-gray-800 font-medium tracking-wide text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {phrases[currentPhrase]}
          </motion.h2>
        </motion.div>
      </div>
    </>
  )
}