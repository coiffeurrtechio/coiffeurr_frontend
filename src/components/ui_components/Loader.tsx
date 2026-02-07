import { Scissors } from "lucide-react"
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
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
        <Scissors className="w-10 h-10 text-[#1E4D8C]" />
      </div>
      <div className="w-full space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  )
}
