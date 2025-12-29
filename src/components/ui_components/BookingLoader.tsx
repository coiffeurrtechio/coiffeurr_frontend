import { useEffect, useState } from "react"

interface BookingLoaderProps {
  isVisible?: boolean
  salonName?: string
}

const bookingMessages = [
  "Processing your booking request...",
  "Sending to salon...",
  "Confirming availability...",
  "Almost there...",
  "Finalizing your appointment...",
]

export function BookingLoader({ isVisible = false, salonName = "Salon" }: BookingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % bookingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-8 bg-card p-8 rounded-2xl shadow-2xl max-w-sm mx-4">
        {/* Animated Checkmark Circle */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Rotating outer circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#bookingGradient)"
              strokeWidth="2"
              strokeDasharray="70 141"
              className="animate-spin"
              style={{ animationDuration: "2s" }}
            />
            <defs>
              <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pulsing center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 animate-pulse" />
          </div>

          {/* Animated checkmark icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Your Appointment</h2>
          <p className="text-sm text-muted-foreground">at {salonName}</p>
        </div>

        {/* Dynamic message */}
        <div className="relative h-6 overflow-hidden w-full">
          <div
            className="transition-all duration-500 ease-in-out text-center"
            style={{
              transform: `translateY(-${currentMessage * 24}px)`,
            }}
          >
            {bookingMessages.map((message, index) => (
              <div key={index} className="h-6 flex items-center justify-center">
                <span className="text-sm font-medium text-accent">{message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicator with dots */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0s" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Confirming</span>
        </div>

        {/* Subtle info text */}
        <p className="text-xs text-muted-foreground text-center">
          Don't refresh the page. We're processing your request securely.
        </p>
      </div>
    </div>
  )
}


