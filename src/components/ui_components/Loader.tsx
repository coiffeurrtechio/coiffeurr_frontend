// import { Scissors } from "lucide-react"
// import { useEffect, useState } from "react"

// interface LoaderProps {
//   isVisible?: boolean
// }

// const phrases = [
//   "New Hairstyle",
//   "New Salon Experience",
//   "Premium Beauty",
//   "Expert Artists",
//   "Luxury Services",
//   "Transform Your Look",
//   "Book Your Appointment",
//   "Professional Care",
// ]

// export function Loader({ isVisible = true }: LoaderProps) {
//   const [currentPhrase, setCurrentPhrase] = useState(0)

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentPhrase((prev) => (prev + 1) % phrases.length)
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [])

//   if (!isVisible) return null

//   return (
//     <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col items-center justify-center p-6 space-y-4">
//       <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
//         <Scissors className="w-10 h-10 text-[#1E4D8C]" />
//       </div>
//       <div className="w-full space-y-3">
//         <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
//         <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
//       </div>
//     </div>
//   )
// }


import { Scissors } from "lucide-react"
import { useEffect, useState } from "react"

interface LoaderProps {
  isVisible?: boolean
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
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-60" />

      <div className="relative flex flex-col items-center max-w-xs w-full text-center space-y-12">
        
        {/* Animated Icon Container */}
        <div className="relative">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-[#1E4D8C]/10 animate-ping" />
          
          <div className="relative w-24 h-24 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce duration-1000">
            <Scissors className="w-10 h-10 text-[#1E4D8C]" />
          </div>
        </div>

        {/* Loading Progress & Text */}
        <div className="space-y-6 w-full">
          <div className="overflow-hidden">
            <h2 
              key={currentPhrase}
              className="text-lg font-black text-slate-900 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {phrases[currentPhrase]}
            </h2>
          </div>

          {/* Luxury Loading Bar */}
          <div className="relative w-48 mx-auto h-[2px] bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-[#1E4D8C] w-1/2 animate-shimmer rounded-full" 
                 style={{ 
                   animation: 'shimmer 1.5s infinite linear',
                   backgroundImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)' 
                 }} 
            />
          </div>
        </div>

        {/* Minimal Branding */}
        <div className="absolute bottom-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            Coiffeurr Premium
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  )
}