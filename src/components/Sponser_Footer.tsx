import React from 'react'

function Sponser_Footer() {
    return (
        /* mt-auto is the key here if the parent is a flex column */
        <footer className="mt-auto mb-8 px-6 w-full">
            <div className="max-w-xs mx-auto text-center flex flex-col items-center">
                
                {/* 1. Brand Identity & Sponsorship combined vertically */}
                <div className="flex flex-col items-center gap-4 w-full">
                    
                    {/* Logo */}
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center rotate-3 overflow-hidden shrink-0">
                        <img
                            src="/Coiffeurr_Logo.png"
                            alt="Coiffeurr Logo"
                            className="w-7 h-7 object-contain -rotate-3"
                        />
                    </div>

                    {/* Sponsorship Section */}
                    <div className="w-full pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            Supported by
                        </p>
                        <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-500">
                            <span className="hover:text-[#1E4D8C] transition-colors cursor-default">IIM SHILLONG</span>
                            <div className="w-1 h-1 bg-blue-200 rounded-full" />
                            <span className="hover:text-[#1E4D8C] transition-colors cursor-default">SIDBI</span>
                        </div>
                    </div>
                </div>

                {/* 2. Minimal Meta Section */}
                <div className="mt-6 opacity-30">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        v2.0.1 • © {new Date().getFullYear()} Coiffeurr Professional
                    </p>
                </div>

            </div>
        </footer>
    )
}

export default Sponser_Footer