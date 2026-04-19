import { Heart, Sparkles } from "lucide-react";

function Sponser_Footer({ collapsed }: { collapsed: boolean }) {
    return (
        <footer className="px-4 py-6 border-t border-white/10 bg-gradient-to-t from-[#0f172a]/50 to-transparent">
            <div className="flex flex-col gap-4">

                {/* Sponsorship Section */}
                {!collapsed && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-[#D4AF37]" />
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
                                Supported by
                            </p>
                            <Sparkles size={12} className="text-[#D4AF37]" />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                            <span className="text-[10px] font-medium text-gray-400 hover:text-gray-300 hover:scale-105 transition-all cursor-pointer">
                                IIM SHILLONG
                            </span>
                            <span className="text-white/40 text-[10px]">•</span>
                            <span className="text-[10px] font-medium text-gray-400 hover:text-gray-300 hover:scale-105 transition-all cursor-pointer">
                                SIDBI
                            </span>
                        </div>
                    </div>
                )}

                {/* Version Info - Hidden when collapsed */}
                {!collapsed && (
                    <div className="text-center pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-[9px] text-white/60 font-medium tracking-wide">
                            <span className="px-2 py-0.5 bg-white/10 rounded-full border border-white/20">v1.0</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                Made in India
                                <Heart size={8} className="text-[#D4AF37] fill-[#D4AF37]/20" />
                            </span>
                            <span>•</span>
                            <span>© {new Date().getFullYear()} Coiffeurr</span>
                        </div>
                        <p className="mt-3 text-[8px] text-white/40 italic tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Bridging the gap between traditional artistry and modern luxury.
                        </p>
                    </div>
                )}

            </div>
        </footer>
    )
}

export default Sponser_Footer