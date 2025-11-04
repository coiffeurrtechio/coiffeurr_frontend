import { useEffect, useState } from "react"

interface LoaderProps {
  isVisible?: boolean
}

const phrases = [
  "New Hairstyle",
  "New Salon Experience",
  "Premium Beauty",
  "Expert Artists",
  "Luxury Services",
  "Transform Your Look",
  "Book Your Appointment",
  "Professional Care",
]

export function Loader({ isVisible = true }: LoaderProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-accent">
      <div className="flex flex-col items-center justify-center gap-12">
        {/* Logo and Branding */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            Coiffure
          </h1>
          <p className="text-sm font-medium text-accent">Premium Salon Services</p>
        </div>

        {/* Animated Circular Loader */}
        <div className="relative w-32 h-32">
          <svg
            className="w-full h-full animate-spin"
            style={{ animationDuration: "3s" }}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="70 141"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>

          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: "4s", animationDirection: "reverse" }}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1.5"
              strokeDasharray="50 106"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 animate-pulse shadow-lg shadow-accent/20" />
          </div>

          {/* Center decorative dots */}
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Rotating Phrases */}
        <div className="relative h-8 overflow-hidden">
          <div
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: `translateY(-${currentPhrase * 32}px)`,
            }}
          >
            {phrases.map((phrase, index) => (
              <div key={index} className="h-8 flex items-center justify-center text-lg font-semibold text-center px-4">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {phrase}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Text with Dots Animation */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground">Loading</span>
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
