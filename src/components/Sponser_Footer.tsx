import { Heart, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

function Sponser_Footer({ collapsed }: { collapsed: boolean }) {
    const { t } = useTranslation();
    return (
        <footer className="px-4 py-6 flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md">

                {/* Sponsorship Section */}
                {!collapsed && (
                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-[#D4AF37]" />
                            <p className="text-[10px] font-bold text-[#4b5563] uppercase tracking-[0.3em] text-center" style={{ fontFamily: "Playfair Display, serif" }}>
                                {t('footer.supportedBy')}
                            </p>
                            <Sparkles size={12} className="text-[#D4AF37]" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-5 py-2.5 rounded-full border border-gray-200/30">
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] hover:text-[#1a1a1a] hover:scale-105 transition-all cursor-pointer" style={{ textShadow: "0 1px 2px rgba(212, 175, 55, 0.3)" }}>
                                IIM SHILLONG
                            </span>
                            <span className="text-gray-300 text-[10px] hidden sm:block">•</span>
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] hover:text-[#1a1a1a] hover:scale-105 transition-all cursor-pointer" style={{ textShadow: "0 1px 2px rgba(212, 175, 55, 0.3)" }}>
                                SIDBI
                            </span>
                        </div>
                    </div>
                )}

                {/* Separator Line */}
                {!collapsed && <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1" />}

                {/* Version Info - Hidden when collapsed */}
                {!collapsed && (
                    <div className="flex flex-col items-center justify-center text-center w-full mt-0">
                        <div className="flex items-center justify-center gap-2 text-[9px] text-[#4b5563]/80 font-medium tracking-wide">
                            <span className="px-2 py-0.5 rounded-full border border-gray-200/30">v1.0</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                {t('footer.madeInIndia')}
                                <Heart size={8} className="text-red-500 fill-red-500/20" aria-label="Heart" />
                            </span>
                            <span>•</span>
                            <span>© {new Date().getFullYear()} Coiffeurr</span>
                        </div>
                        <p className="mt-2 text-[8px] text-[#4b5563]/60 italic tracking-wide" style={{ fontFamily: "Playfair Display, serif" }}>
                            {t('footer.tagline')}
                        </p>
                    </div>
                )}

            </div>
        </footer>
    )
}

export default Sponser_Footer