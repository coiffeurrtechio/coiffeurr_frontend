import { Heart, Sparkles } from "lucide-react";

function Sponser_Footer({ collapsed }: { collapsed: boolean }) {
    return (
        <footer className="px-4 py-6 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent">
            <div className="flex flex-col gap-4">

                {/* Sponsorship Section */}
                {!collapsed && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-blue-400" />
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
                                Supported by
                            </p>
                            <Sparkles size={12} className="text-blue-400" />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[11px] font-medium text-gray-300 hover:text-white hover:scale-105 transition-all cursor-pointer">
                                IIM SHILLONG
                            </span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <span className="text-[11px] font-medium text-gray-300 hover:text-white hover:scale-105 transition-all cursor-pointer">
                                SIDBI
                            </span>
                        </div>
                    </div>
                )}

                {/* Version Info - Hidden when collapsed */}
                {!collapsed && (
                    <div className="text-center pt-4 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 text-[9px] text-gray-500 font-medium tracking-wide">
                            <span className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10">v1.0</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                Made in India
                                <Heart size={8} className="text-red-400 fill-red-400/20" />
                            </span>
                            <span>•</span>
                            <span>© {new Date().getFullYear()} Coiffeurr</span>
                        </div>
                    </div>
                )}

            </div>
        </footer>
    )
}

export default Sponser_Footer