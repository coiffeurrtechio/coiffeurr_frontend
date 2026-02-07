import React, { useState, useCallback } from 'react';
import { 
  Store, User, MapPin, Upload, FileText, 
  Clock, ArrowRight, ArrowLeft, CheckCircle2, 
  Navigation, Scissors, Smartphone
} from 'lucide-react';
import { Button } from '../../components/ui_components/button';

const SalonRegistration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    salonName: '', ownerName: '', address: '',
    gstNumber: '', businessReg: '',
    openingTime: '', closingTime: '', lunchStart: '', lunchEnd: ''
  });

  // Memoized handlers for efficiency
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Mocking address fetch - in production use a reverse geocoding API
        setFormData(prev => ({ ...prev, address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
      });
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#1E4D8C] transition-all cursor-pointer">
                <Upload size={20} />
                <span className="text-[9px] font-black uppercase mt-1">Logo</span>
              </div>
            </div>
            <InputField label="Salon Name" name="salonName" value={formData.salonName} onChange={handleChange} icon={Store} />
            <InputField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} icon={User} />
            <div className="relative">
              <InputField label="Address" name="address" value={formData.address} onChange={handleChange} icon={MapPin} />
              <Button
                onClick={handleCurrentLocation}
                className="absolute right-2 bottom-2 p-1.5 bg-blue-50 text-[#1E4D8C] rounded-lg hover:bg-blue-100 transition-colors"
                title="Use Current Location"
              >
                <Navigation size={14} />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} icon={FileText} placeholder="Optional" />
            <InputField label="Business Registration" name="businessReg" value={formData.businessReg} onChange={handleChange} icon={Smartphone} />
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 mt-4">
              <AlertCircle className="text-orange-500 shrink-0" size={18} />
              <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                Verification takes 24-48 hours. Ensure documents match your PAN details.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Open" name="openingTime" type="time" value={formData.openingTime} onChange={handleChange} icon={Clock} />
              <InputField label="Close" name="closingTime" type="time" value={formData.closingTime} onChange={handleChange} icon={Clock} />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Lunch Break</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="From" name="lunchStart" type="time" value={formData.lunchStart} onChange={handleChange} icon={Scissors} />
                <InputField label="To" name="lunchEnd" type="time" value={formData.lunchEnd} onChange={handleChange} icon={Scissors} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 overflow-hidden flex flex-col">
        
        {/* PROGRESS INDICATOR */}
        <div className="pt-8 px-8 flex items-center justify-between gap-2">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex-1 flex flex-col items-center gap-2">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${step >= num ? 'bg-[#1E4D8C]' : 'bg-gray-100'}`} />
              <span className={`text-[9px] font-black uppercase tracking-tighter ${step >= num ? 'text-[#1E4D8C]' : 'text-gray-300'}`}>
                Step 0{num}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8 md:p-10 flex-1">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Register Salon</h1>
            <p className="text-sm text-gray-500 font-medium">Step {step} of 3</p>
          </header>

          {renderStep()}

          <footer className="mt-10 flex gap-3">
            {step > 1 && (
              <Button 
                onClick={() => setStep(s => s - 1)}
                className="flex-1 h-12 rounded-2xl bg-gray-50 text-gray-400 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>
            )}
            <Button 
              onClick={() => step < 3 ? setStep(s => s + 1) : console.log("Final Submit", formData)}
              className="flex-[2] h-12 rounded-2xl bg-[#1E4D8C] text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#153a6b] transition-all flex items-center justify-center gap-2"
            >
              {step === 3 ? 'Finish' : 'Next Step'} <ArrowRight size={16} />
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: InputField (Pure Function for efficiency) ---
const InputField = React.memo(({ label, name, value, onChange, icon: Icon, type = "text", placeholder }: any) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E4D8C] transition-colors" size={16} />
      <input 
        name={name}
        type={type} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300" 
      />
    </div>
  </div>
));

const AlertCircle = ({ className, size }: { className: string, size: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default SalonRegistration;