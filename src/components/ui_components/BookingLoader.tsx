import { useEffect, useState } from "react"
import { ShieldCheck, Loader2, Check } from "lucide-react"
import { motion } from "framer-motion"

interface BookingLoaderProps {
  readonly isVisible?: boolean
  readonly salonName?: string
}

const bookingMessages = [
  "Securing your appointment slot...",
  "Syncing with salon schedule...",
  "Authenticating payment intent...",
  "Finalizing specialist availability...",
  "Almost there, preparing your receipt...",
]

export function BookingLoader({ isVisible = true, salonName = "Salon" }: BookingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % bookingMessages.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Mobile View - Full detailed loader */}
      <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Luxury Backdrop */}
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500" />

        <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/30 overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]" />

          <div className="p-10 flex flex-col items-center gap-8">

            {/* Animated Gold Visual */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border-4 border-white shadow-xl">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center animate-pulse">
                  <Check className="text-white w-8 h-8" />
                </div>
              </div>
              {/* Pulsing Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] animate-ping opacity-20" />
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Processing Booking
              </h2>
              <div className="flex items-center justify-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">
                   @{salonName}
                 </span>
              </div>
            </div>

            {/* Dynamic Message Area */}
            <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200">
               <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="animate-spin text-[#D4AF37]" size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">System Status</span>
               </div>

               <div className="relative h-8 overflow-hidden w-full">
                  <div
                    className="transition-all duration-700 ease-in-out text-center"
                    style={{ transform: `translateY(-${currentMessage * 32}px)` }}
                  >
                    {bookingMessages.map((message, index) => (
                      <div key={index} className="h-8 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-700 italic" style={{ fontFamily: 'Playfair Display, serif' }}>{message}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            {/* Security Assurance */}
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between px-2">
                  <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      <ShieldCheck size={10} /> Secure Encryption
                  </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                Establishing a secure connection with the studio.<br/>
                <span className="font-bold text-slate-300 uppercase tracking-tighter">Please do not refresh this page</span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Desktop View - Compact loader */}
      <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center bg-slate-900/30 backdrop-blur-sm">
        <motion.div
          className="relative bg-white/90 backdrop-blur-lg rounded-2xl px-8 py-6 flex items-center gap-4 shadow-xl border border-white/30"
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
              <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
            </div>
          </div>

          {/* Loading Text */}
          <div className="flex flex-col">
            <motion.p
              className="text-gray-800 font-semibold tracking-wide text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Processing booking at {salonName}
            </motion.p>
            <motion.p
              key={currentMessage}
              className="text-gray-500 text-xs mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {bookingMessages[currentMessage]}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </>
  )
}