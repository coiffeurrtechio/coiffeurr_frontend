import { LayoutDashboard, Bell, Search, User, Sparkles } from "lucide-react"

interface DashboardLoaderProps {
  isVisible?: boolean
}

export function DashboardLoader({ isVisible = true }: DashboardLoaderProps) {
  if (!isVisible) return null

  return (
    <div className="w-full h-full min-h-screen bg-[#FDFDFF] p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* --- TOP NAV SKELETON (Integrated Feel) --- */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-200/60 rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-200">
            <Bell size={18} />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* --- FEATURED ANALYTICS CARDS (Glassmorphism) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="group relative h-44 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
          >
            {/* Subtle Gradient Spot */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-slate-900/5 rounded-2xl animate-pulse" />
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-slate-200 w-1/3 animate-shimmer" 
                     style={{ animation: 'shimmer 2s infinite linear' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- RECENT ACTIVITY & CHART AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Large Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200/60 rounded-full animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-slate-50 rounded-lg" />
              <div className="h-8 w-16 bg-slate-50 rounded-lg" />
            </div>
          </div>
          
          {/* Mock Graph Waves */}
          <div className="relative h-64 w-full flex items-end gap-3 px-2">
            {[40, 70, 45, 90, 65, 80, 30, 55, 75, 50].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 bg-slate-100 rounded-t-xl animate-pulse" 
                style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }} 
              />
            ))}
          </div>
        </div>

        {/* Side Actions/Activity */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden">
          <Sparkles className="absolute top-6 right-6 text-white/10 w-20 h-20 rotate-12" />
          
          <div className="relative z-10 space-y-6">
            <div className="h-5 w-24 bg-white/20 rounded-full animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded-full" />
                    <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <div className="h-14 w-full bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
                 <div className="h-2 w-20 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}