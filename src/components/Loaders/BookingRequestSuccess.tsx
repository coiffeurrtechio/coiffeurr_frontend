// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import Link from "next/link"
import { CheckCircle } from "lucide-react"

interface BookingSuccessProps {
  isVisible?: boolean
  salonName: string
}

export function BookingRequestSuccess({
  isVisible = false,
  salonName,
}: BookingSuccessProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center gap-8 bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/30 max-w-sm mx-4 animate-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          {/* Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] animate-ping opacity-20" />
        </div>

        {/* Success Message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Booking Request<br />Send Successfully!
          </h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Your appointment request has been successfully sent to the salon
          </p>
        </div>

        {/* Signature Tagline */}
        <p className="text-[10px] text-slate-400 italic text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
          A signature session tailored to your unique aesthetic.
        </p>
      </div>
    </div>
  )
}
