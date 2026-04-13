import React from "react";
import { X, FileText, ShieldCheck, Mail, Phone } from "lucide-react";
import { Button } from "../components/ui_components/button";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1E4D8C]">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">Terms & Conditions</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated: April 1, 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          <section className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <p className="text-sm text-slate-600 leading-relaxed italic">
              Welcome to Coiffeurr. By accessing our platform, you agree to these terms. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <div className="space-y-6">
            <TermSection title="1. Nature of Service" icon={<ShieldCheck size={14}/>}>
              Coiffeurr is an intermediary platform connecting users (“Customers”) with independent salons. We do not own, operate, or control any salon, provide services directly, or guarantee quality.
            </TermSection>

            <TermSection title="2. User Responsibilities">
              You agree to provide accurate information, arrive on time for appointments, and follow salon policies. You are responsible for informing salons about allergies or medical conditions.
            </TermSection>

            <TermSection title="3. No Liability">
              Coiffeurr is not liable for injuries, allergic reactions, health issues, loss, theft, or misconduct by Service Providers. All services are used at your own risk.
            </TermSection>

            <TermSection title="4. Payments & Refunds">
              Payments are processed via third-party gateways. Refunds depend on salon and platform policies and may be denied in case of misuse.
            </TermSection>

            <TermSection title="5. Cancellations">
              Users must follow the cancellation policy at booking. Repeated no-shows may lead to account suspension.
            </TermSection>

            <TermSection title="6. Governing Law">
              These Terms are governed by the laws of India. Disputes are subject to the courts of Assam.
            </TermSection>
          </div>

          {/* Contact Footer Inside Scroll */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Support</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Mail size={16} className="text-[#1E4D8C]" /> mrmrscoiffeurr@gmail.com
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Phone size={16} className="text-[#1E4D8C]" /> +91 7045464907
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-slate-50/50 rounded-b-[2rem]">
          <Button 
            onClick={onClose}
            className="w-full h-14 bg-[#1E4D8C] hover:bg-[#153a6b] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20"
          >
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Sub-component
function TermSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-black text-[#1E4D8C] uppercase tracking-wider flex items-center gap-2">
        {icon} {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {children}
      </p>
    </div>
  );
}