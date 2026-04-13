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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-6 bg-card p-8 rounded-2xl shadow-2xl max-w-sm mx-4">
        {/* Success Icon */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600 fill-green-100" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Request Send Successfully!</h2>
          <p className="text-sm text-muted-foreground">
            Your appointment request has been successfully sent to {salonName}
          </p>
        </div>
      </div>
    </div>
  )
}
