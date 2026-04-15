import { useEffect, useState } from "react"
import { Scissors, ShieldCheck, Clock, Loader2 } from "lucide-react"

interface BookingLoaderProps {
  isVisible?: boolean
  salonName?: string
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Premium Backdrop matching your Dashboard design */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" />

      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#1E4D8C]" />

        <div className="p-10 flex flex-col items-center gap-8">
          
          {/* Animated Brand Visual */}
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center border-4 border-white shadow-xl rotate-3 animate-pulse">
              <Scissors className="text-[#1E4D8C] w-10 h-10 -rotate-3" />
            </div>
            {/* Pulsing Ring */}
            <div className="absolute inset-0 rounded-[2rem] border-2 border-[#1E4D8C] animate-ping opacity-20" />
            
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white scale-90 animate-bounce">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Processing Booking</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="text-[10px] font-black text-[#1E4D8C] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                 @{salonName}
               </span>
            </div>
          </div>

          {/* Precise Dynamic Message Area */}
          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
             <div className="flex items-center gap-2 mb-2">
                <Loader2 className="animate-spin text-[#1E4D8C]" size={14} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status</span>
             </div>
             
             <div className="relative h-6 overflow-hidden w-full">
                <div
                  className="transition-all duration-700 ease-in-out text-center"
                  style={{ transform: `translateY(-${currentMessage * 24}px)` }}
                >
                  {bookingMessages.map((message, index) => (
                    <div key={index} className="h-6 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700 italic">"{message}"</span>
                    </div>
                  ))}
                </div>
              </div>
          </div>

          {/* Bottom Security Assurance (Precision Styling) */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between px-2">
                <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E4D8C] animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E4D8C] animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E4D8C] animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    <Clock size={10} /> Secure Encryption
                </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              Establishing a secure connection with the studio.<br/> 
              <span className="font-black text-slate-300 uppercase tracking-tighter">Please do not refresh this page</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}